// Edge Function para enviar push notification para um dispositivo específico
// Usando web-push encryption para garantir compatibilidade com todos os navegadores
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

// ==================== CRYPTO HELPERS ====================

// Função para codificar base64url
function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Função para decodificar base64url
function base64UrlDecode(str: string): Uint8Array {
  const padding = '='.repeat((4 - str.length % 4) % 4);
  const base64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  return new Uint8Array([...binary].map(c => c.charCodeAt(0)));
}

// Gerar salt aleatório
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

// Derivar chave usando HKDF
async function hkdf(
  ikm: Uint8Array,
  salt: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const ikmKey = await crypto.subtle.importKey(
    'raw',
    ikm.buffer as ArrayBuffer,
    { name: 'HKDF' },
    false,
    ['deriveBits']
  );
  
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: salt.buffer as ArrayBuffer,
      info: info.buffer as ArrayBuffer,
    },
    ikmKey,
    length * 8
  );
  
  return new Uint8Array(derived);
}

// Criar info para HKDF
function createInfo(type: string, context: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const info = new Uint8Array(typeBytes.length + 1 + context.length);
  info.set(typeBytes, 0);
  info[typeBytes.length] = 0;
  info.set(context, typeBytes.length + 1);
  return info;
}

// ==================== WEB PUSH ENCRYPTION ====================

async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  // Decodificar chaves do cliente
  const clientPublicKey = base64UrlDecode(p256dhKey);
  const clientAuth = base64UrlDecode(authSecret);
  
  // Gerar par de chaves ECDH do servidor
  const serverKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );
  
  // Exportar chave pública do servidor
  const serverPublicKeyRaw = await crypto.subtle.exportKey('raw', serverKeyPair.publicKey);
  const serverPublicKey = new Uint8Array(serverPublicKeyRaw);
  
  // Importar chave pública do cliente
  const clientKey = await crypto.subtle.importKey(
    'raw',
    clientPublicKey.buffer as ArrayBuffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );
  
  // Derivar shared secret
  const sharedSecretBuffer = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: clientKey },
    serverKeyPair.privateKey,
    256
  );
  const sharedSecret = new Uint8Array(sharedSecretBuffer);
  
  // Gerar salt
  const salt = generateSalt();
  
  // Criar contexto para HKDF (RFC 8291)
  const context = new Uint8Array(1 + 2 + clientPublicKey.length + 2 + serverPublicKey.length);
  let offset = 0;
  context[offset++] = 0; // Null byte
  context[offset++] = 0;
  context[offset++] = clientPublicKey.length;
  context.set(clientPublicKey, offset);
  offset += clientPublicKey.length;
  context[offset++] = 0;
  context[offset++] = serverPublicKey.length;
  context.set(serverPublicKey, offset);
  
  // Derivar PRK usando auth secret
  const authInfo = new TextEncoder().encode('Content-Encoding: auth\0');
  const prk = await hkdf(sharedSecret, clientAuth, authInfo, 32);
  
  // Derivar CEK (Content Encryption Key)
  const cekInfo = createInfo('Content-Encoding: aes128gcm', context);
  const cek = await hkdf(prk, salt, cekInfo, 16);
  
  // Derivar nonce
  const nonceInfo = createInfo('Content-Encoding: nonce', context);
  const nonce = await hkdf(prk, salt, nonceInfo, 12);
  
  // Preparar payload com padding (RFC 8291)
  const payloadBytes = new TextEncoder().encode(payload);
  const paddingLength = 0;
  const record = new Uint8Array(payloadBytes.length + 1 + paddingLength);
  record.set(payloadBytes, 0);
  record[payloadBytes.length] = 2; // Delimiter
  // Padding bytes são zeros (já inicializados)
  
  // Encriptar com AES-GCM
  const key = await crypto.subtle.importKey(
    'raw',
    cek.buffer as ArrayBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce.buffer as ArrayBuffer },
    key,
    record.buffer as ArrayBuffer
  );
  
  return {
    ciphertext: new Uint8Array(encryptedBuffer),
    salt,
    serverPublicKey,
  };
}

// Construir body com header aes128gcm
function buildEncryptedBody(
  ciphertext: Uint8Array,
  salt: Uint8Array,
  serverPublicKey: Uint8Array,
  recordSize: number = 4096
): Uint8Array {
  // Header: salt (16) + rs (4) + idlen (1) + keyid (65)
  const header = new Uint8Array(16 + 4 + 1 + serverPublicKey.length);
  let offset = 0;
  
  // Salt
  header.set(salt, offset);
  offset += 16;
  
  // Record size (big-endian 4 bytes)
  const rsView = new DataView(header.buffer, offset, 4);
  rsView.setUint32(0, recordSize, false);
  offset += 4;
  
  // ID length
  header[offset++] = serverPublicKey.length;
  
  // Server public key
  header.set(serverPublicKey, offset);
  
  // Combinar header + ciphertext
  const body = new Uint8Array(header.length + ciphertext.length);
  body.set(header, 0);
  body.set(ciphertext, header.length);
  
  return body;
}

// ==================== VAPID JWT ====================

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

  const signatureBuffer = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = base64UrlEncode(new Uint8Array(signatureBuffer));
  return `${unsignedToken}.${signatureB64}`;
}

// ==================== SEND PUSH ====================

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

    // Criar JWT VAPID
    const jwt = await createVapidJwt(audience);

    // Encriptar payload
    const payloadString = JSON.stringify(payload);
    const { ciphertext, salt, serverPublicKey } = await encryptPayload(
      payloadString,
      p256dh,
      auth
    );

    // Construir body encriptado
    const encryptedBody = buildEncryptedBody(ciphertext, salt, serverPublicKey);

    console.log('[send-push] Sending encrypted payload to:', endpoint.substring(0, 50) + '...');
    console.log('[send-push] Payload size:', encryptedBody.length, 'bytes');

    const headers: Record<string, string> = {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400',
      'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: encryptedBody.buffer as ArrayBuffer,
    });

    console.log('[send-push] Response status:', response.status);

    if (response.status === 201 || response.status === 200) {
      return { success: true, statusCode: response.status };
    }

    if (response.status === 410 || response.status === 404) {
      return { success: false, error: 'subscription_expired', statusCode: response.status };
    }

    const text = await response.text();
    console.error('[send-push] Error response:', text);
    return { success: false, error: `HTTP ${response.status}: ${text}`, statusCode: response.status };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[send-push] Exception:', message);
    return { success: false, error: message };
  }
}

// ==================== MAIN HANDLER ====================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { device_token, session_id, title, body, url, icon, data } = await req.json();

    console.log('[send-push] Request received:', { device_token, session_id, title });

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
      console.error('[send-push] DB error:', fetchError);
      throw new Error(`Erro ao buscar subscription: ${fetchError.message}`);
    }

    console.log('[send-push] Found subscriptions:', subscriptions?.length || 0);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No active subscription found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sub = subscriptions[0];
    const pushPayload: PushPayload = {
      title: title || 'OfficeWell',
      body: body || 'Você tem uma nova notificação!',
      icon: icon || '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: `officewell-${Date.now()}`,
      url: url || '/',
      data: data || {},
    };

    console.log('[send-push] Sending to endpoint:', sub.endpoint.substring(0, 60) + '...');

    const result = await sendPushNotification(sub.endpoint, sub.p256dh, sub.auth, pushPayload);

    console.log('[send-push] Result:', result);

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
    console.error('[send-push] Fatal error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
