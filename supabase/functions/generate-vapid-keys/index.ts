// Edge Function para gerar chaves VAPID
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Gerar par de chaves ECDSA P-256
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"]
    );

    // Exportar chave pública em formato raw (65 bytes)
    const publicKeyRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);
    const publicKeyBase64Url = base64UrlEncode(new Uint8Array(publicKeyRaw));

    // Exportar chave privada em formato JWK
    const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

    return new Response(
      JSON.stringify({
        success: true,
        keys: {
          VAPID_PUBLIC_KEY: publicKeyBase64Url,
          VAPID_PRIVATE_KEY: JSON.stringify(privateKeyJwk),
          VAPID_SUBJECT: "mailto:contato@officewell.app",
        },
        instructions: [
          "Adicione estas secrets no projeto Lovable:",
          `VAPID_PUBLIC_KEY: ${publicKeyBase64Url}`,
          `VAPID_PRIVATE_KEY: ${JSON.stringify(privateKeyJwk)}`,
          "VAPID_SUBJECT: mailto:contato@officewell.app",
        ],
      }, null, 2),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
