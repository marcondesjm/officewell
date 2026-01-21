// Edge Function para verificar timers e enviar notificações
// Esta função deve ser executada periodicamente via cron job

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NOTIFICATION_MESSAGES = {
  eye: {
    title: '👁️ Descanso Visual',
    body: 'Olhe para longe por 20 segundos. Seus olhos agradecem!',
  },
  stretch: {
    title: '🤸 Hora de Alongar',
    body: 'Levante-se e movimente seu corpo. Você merece essa pausa!',
  },
  water: {
    title: '💧 Hidrate-se',
    body: 'Beba um copo de água agora. Mantenha-se saudável!',
  },
};

// Cooldown mínimo entre notificações do mesmo tipo (em ms)
const NOTIFICATION_COOLDOWN = 5 * 60 * 1000; // 5 minutos

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = Date.now();
    const notificationsSent: Array<{ session_id: string; type: string }> = [];

    // Buscar todos os timer states que estão rodando
    const { data: timerStates, error: timerError } = await supabase
      .from('timer_states')
      .select('*')
      .eq('is_running', true);

    if (timerError) {
      throw new Error(`Erro ao buscar timer states: ${timerError.message}`);
    }

    if (!timerStates || timerStates.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Nenhum timer ativo', notifications: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Para cada timer state, verificar se algum timer expirou
    for (const state of timerStates) {
      const timersToNotify: string[] = [];
      const updates: Record<string, number> = {};

      // Verificar timer de olhos
      if (state.eye_end_time && state.eye_end_time <= now) {
        const lastNotified = state.last_notified_eye || 0;
        if (now - lastNotified >= NOTIFICATION_COOLDOWN) {
          timersToNotify.push('eye');
          updates.last_notified_eye = now;
        }
      }

      // Verificar timer de alongamento
      if (state.stretch_end_time && state.stretch_end_time <= now) {
        const lastNotified = state.last_notified_stretch || 0;
        if (now - lastNotified >= NOTIFICATION_COOLDOWN) {
          timersToNotify.push('stretch');
          updates.last_notified_stretch = now;
        }
      }

      // Verificar timer de água
      if (state.water_end_time && state.water_end_time <= now) {
        const lastNotified = state.last_notified_water || 0;
        if (now - lastNotified >= NOTIFICATION_COOLDOWN) {
          timersToNotify.push('water');
          updates.last_notified_water = now;
        }
      }

      // Se há timers para notificar, buscar subscription e enviar
      if (timersToNotify.length > 0) {
        // Buscar push subscription para este session_id
        const { data: subscriptions } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('session_id', state.session_id)
          .eq('is_active', true);

        if (subscriptions && subscriptions.length > 0) {
          // Enviar notificação para cada timer expirado
          for (const type of timersToNotify) {
            const message = NOTIFICATION_MESSAGES[type as keyof typeof NOTIFICATION_MESSAGES];
            
            // Chamar função send-push-to-device (mais robusta)
            try {
              const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push-to-device`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                },
                body: JSON.stringify({
                  session_id: state.session_id,
                  title: message.title,
                  body: message.body,
                  url: '/',
                  data: { type, source: 'timer-check' },
                }),
              });

              if (pushResponse.ok) {
                const result = await pushResponse.json();
                if (result.success) {
                  notificationsSent.push({ session_id: state.session_id, type });
                  console.log(`✅ Push enviado para ${state.session_id}: ${type}`);
                } else {
                  console.error(`❌ Push falhou para ${state.session_id}:`, result.error);
                }
              } else {
                console.error(`❌ HTTP ${pushResponse.status} ao enviar push`);
              }
            } catch (pushError) {
              console.error(`Erro ao enviar push para ${state.session_id}:`, pushError);
            }
          }
        } else {
          console.log(`⚠️ Nenhuma subscription ativa para session_id ${state.session_id}`);
        }

        // Atualizar last_notified no banco
        if (Object.keys(updates).length > 0) {
          await supabase
            .from('timer_states')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('session_id', state.session_id);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        checked: timerStates.length,
        notifications: notificationsSent.length,
        details: notificationsSent,
      }),
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
