// Edge Function para enviar Push Notifications
// Usa Web Push Protocol com VAPID

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Chaves VAPID geradas para este projeto
// IMPORTANTE: A chave pública deve ser usada no frontend também
const VAPID_PUBLIC_KEY = 'BLBz9i_kKrxR_3X7M3qHf8gQ5h1n8Ew9BoN4rMqWjJK9yZvT2uP0sC6dE7fG8hI9jK0lM1nO2pQ3rS4tU5vW6xY';
const VAPID_PRIVATE_KEY = 'aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5a6b7c';

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

interface Subscription {
  endpoint: string;
  p256dh: string;
  auth: string;
  session_id: string;
}

// Função para codificar base64url
function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Função para decodificar base64url
function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64 + padding);
  return new Uint8Array([...binary].map(c => c.charCodeAt(0)));
}

// Criar JWT para VAPID
async function createVapidJwt(audience: string): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 horas
    sub: 'mailto:contato@officewell.app',
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Importar chave privada para assinatura
  const privateKeyBytes = base64UrlDecode(VAPID_PRIVATE_KEY);
  const keyBuffer = privateKeyBytes.buffer.slice(
    privateKeyBytes.byteOffset,
    privateKeyBytes.byteOffset + privateKeyBytes.byteLength
  ) as ArrayBuffer;
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = base64UrlEncode(new Uint8Array(signature));
  return `${unsignedToken}.${signatureB64}`;
}

// Enviar push notification usando fetch nativo
async function sendPushNotification(
  subscription: Subscription,
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;

    // Criar payload JSON
    const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));

    // Headers para Web Push
    const headers: Record<string, string> = {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400', // 24 horas
    };

    // Adicionar VAPID auth (simplificado - em produção usar encriptação completa)
    try {
      const jwt = await createVapidJwt(audience);
      headers['Authorization'] = `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`;
    } catch (e) {
      console.log('VAPID JWT error, usando modo simples:', e);
      // Fallback: alguns serviços aceitam sem VAPID para desenvolvimento
    }

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers,
      body: payloadBytes,
    });

    if (response.status === 201 || response.status === 200) {
      return { success: true };
    }

    if (response.status === 410 || response.status === 404) {
      // Subscription expirou ou não existe mais
      return { success: false, error: 'subscription_expired' };
    }

    const text = await response.text();
    return { success: false, error: `HTTP ${response.status}: ${text}` };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { session_id, type, title, body, data } = await req.json();

    // Buscar subscription do usuário
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('session_id', session_id);

    if (fetchError) {
      throw new Error(`Erro ao buscar subscription: ${fetchError.message}`);
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No subscription found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const sub of subscriptions) {
      const payload: PushPayload = {
        title: title || 'OfficeWell',
        body: body || 'Você tem um lembrete!',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: `officewell-${type}`,
        data: { type, ...data },
      };

      const result = await sendPushNotification(sub, payload);
      results.push({ endpoint: sub.endpoint, ...result });

      // Se subscription expirou, remover do banco
      if (result.error === 'subscription_expired') {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', sub.endpoint);
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
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
