// Edge Function para registrar recebimento de push notification
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { device_token, session_id, received_at, title } = await req.json();

    if (!device_token && !session_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'device_token or session_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Atualizar última recepção de push
    let query = supabase.from('push_subscriptions').update({
      last_push_received_at: received_at || new Date().toISOString(),
      last_push_title: title || null,
      updated_at: new Date().toISOString(),
    });

    if (device_token) {
      query = query.eq('device_token', device_token);
    } else {
      query = query.eq('session_id', session_id);
    }

    const { error } = await query;

    if (error) {
      throw new Error(`Erro ao atualizar telemetria: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
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
