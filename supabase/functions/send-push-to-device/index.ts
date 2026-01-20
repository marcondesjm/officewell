// Edge Function para enviar push notification para um dispositivo específico
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  data?: Record<string, unknown>;
}

// Função para codificar base64url
function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Função para decodificar base64
function base64Decode(str: string): Uint8Array {
  // Adicionar padding se necessário
  const padding = '='.repeat((4 - str.length % 4) % 4);
  const base64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  return new Uint8Array([...binary].map(c => c.charCodeAt(0)));
}

// Criar JWT para VAPID usando JWK
async function createVapidJwt(audience: string): Promise<string> {
  const vapidPrivateKeyJwk = Deno.env.get('VAPID_PRIVATE_KEY');
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:contato@officewell.app';
  
  if (!vapidPrivateKeyJwk) {
    throw new Error('VAPID_PRIVATE_KEY not configured');
  }

  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60,
    sub: vapidSubject,
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Importar chave privada JWK
  let jwk: JsonWebKey;
  try {
    jwk = JSON.parse(vapidPrivateKeyJwk);
  } catch {
    throw new Error('Invalid VAPID_PRIVATE_KEY format - must be valid JWK JSON');
  }

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  // Converter assinatura de DER para raw format (r||s, 64 bytes)
  const sigArray = new Uint8Array(signature);
  let r: Uint8Array, s: Uint8Array;
  
  if (sigArray.length === 64) {
    // Já está em formato raw
    r = sigArray.slice(0, 32);
    s = sigArray.slice(32);
  } else {
    // Formato raw esperado pelo Web Push
    r = sigArray.slice(0, 32);
    s = sigArray.slice(32, 64);
  }

  const rawSignature = new Uint8Array(64);
  rawSignature.set(r.length > 32 ? r.slice(-32) : r, 32 - r.length);
  rawSignature.set(s.length > 32 ? s.slice(-32) : s, 64 - s.length);

  const signatureB64 = base64UrlEncode(new Uint8Array(signature));
  return `${unsignedToken}.${signatureB64}`;
}

// Enviar push notification
async function sendPushNotification(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: PushPayload
): Promise<{ success: boolean; error?: string; statusCode?: number }> {
  try {
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    if (!vapidPublicKey) {
      throw new Error('VAPID_PUBLIC_KEY not configured');
    }

    const url = new URL(endpoint);
    const audience = `${url.protocol}//${url.host}`;

    const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));

    // Criar JWT VAPID
    const jwt = await createVapidJwt(audience);

    const headers: Record<string, string> = {
      'Content-Type': 'application/octet-stream',
      'TTL': '86400',
      'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: payloadBytes,
    });

    if (response.status === 201 || response.status === 200) {
      return { success: true, statusCode: response.status };
    }

    if (response.status === 410 || response.status === 404) {
      return { success: false, error: 'subscription_expired', statusCode: response.status };
    }

    const text = await response.text();
    return { success: false, error: `HTTP ${response.status}: ${text}`, statusCode: response.status };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { device_token, session_id, title, body, url, icon, data } = await req.json();

    if (!device_token && !session_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'device_token or session_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar subscription
    let query = supabase.from('push_subscriptions').select('*').eq('is_active', true);
    
    if (device_token) {
      query = query.eq('device_token', device_token);
    } else {
      query = query.eq('session_id', session_id);
    }

    const { data: subscriptions, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Erro ao buscar subscription: ${fetchError.message}`);
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No active subscription found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sub = subscriptions[0];
    const payload: PushPayload = {
      title: title || 'OfficeWell',
      body: body || 'Você tem uma nova notificação!',
      icon: icon || '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: `officewell-${Date.now()}`,
      url: url || '/',
      data: data || {},
    };

    const result = await sendPushNotification(sub.endpoint, sub.p256dh, sub.auth, payload);

    // Atualizar telemetria se enviou com sucesso
    if (result.success) {
      await supabase
        .from('push_subscriptions')
        .update({
          last_push_received_at: new Date().toISOString(),
          last_push_title: title,
        })
        .eq('id', sub.id);
    }

    // Se subscription expirou, marcar como inativa
    if (result.error === 'subscription_expired') {
      await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('id', sub.id);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Erro:', error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
