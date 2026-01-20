// Edge Function para processar notificações agendadas (chamada por cron)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função auxiliar para calcular próxima execução
function calculateNextRun(
  currentDate: Date, 
  recurrenceType: string, 
  endDate?: string
): Date | null {
  const next = new Date(currentDate);
  
  switch (recurrenceType) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      return null;
  }

  // Verificar se passou da data limite
  if (endDate && next > new Date(endDate)) {
    return null;
  }

  return next;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();

    // Buscar notificações agendadas que estão prontas para envio
    const { data: scheduledNotifications, error: fetchError } = await supabase
      .from('scheduled_push_notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now.toISOString())
      .order('scheduled_for', { ascending: true });

    if (fetchError) {
      throw new Error(`Erro ao buscar notificações: ${fetchError.message}`);
    }

    if (!scheduledNotifications || scheduledNotifications.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No pending notifications' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const notification of scheduledNotifications) {
      try {
        // Buscar subscriptions ativas
        let query = supabase
          .from('push_subscriptions')
          .select('*')
          .eq('is_active', true);

        // Aplicar filtro por target
        if (notification.target_type === 'specific' && notification.target_session_ids) {
          query = query.in('session_id', notification.target_session_ids);
        }

        const { data: subscriptions, error: subError } = await query;

        if (subError) {
          throw new Error(subError.message);
        }

        let sentCount = 0;
        let failedCount = 0;

        // Enviar para cada subscription usando a função send-push-to-device
        for (const sub of subscriptions || []) {
          try {
            const { error: sendError } = await supabase.functions.invoke('send-push-to-device', {
              body: {
                session_id: sub.session_id,
                title: notification.title,
                body: notification.message,
                url: notification.click_url || '/',
                icon: notification.icon_url,
              },
            });

            if (sendError) {
              failedCount++;
            } else {
              sentCount++;
            }
          } catch {
            failedCount++;
          }
        }

        // Determinar próximo status e próxima execução
        let newStatus = 'sent';
        let nextRunAt: Date | null = null;

        if (notification.recurrence_type) {
          nextRunAt = calculateNextRun(
            new Date(notification.scheduled_for),
            notification.recurrence_type,
            notification.recurrence_end_date
          );

          if (nextRunAt) {
            newStatus = 'pending';
          } else {
            newStatus = 'completed';
          }
        }

        // Atualizar status da notificação
        await supabase
          .from('scheduled_push_notifications')
          .update({
            status: newStatus,
            sent_at: notification.sent_at || now.toISOString(),
            last_sent_at: now.toISOString(),
            sent_count: (notification.sent_count || 0) + sentCount,
            failed_count: (notification.failed_count || 0) + failedCount,
            next_run_at: nextRunAt?.toISOString() || null,
            scheduled_for: nextRunAt?.toISOString() || notification.scheduled_for,
            updated_at: now.toISOString(),
          })
          .eq('id', notification.id);

        // Registrar no histórico
        await supabase.from('push_notification_history').insert({
          title: notification.title,
          message: notification.message,
          icon_url: notification.icon_url,
          click_url: notification.click_url,
          target_type: notification.target_type,
          target_session_ids: notification.target_session_ids,
          sent_count: sentCount,
          failed_count: failedCount,
          sent_by: notification.created_by || 'system',
          sent_at: now.toISOString(),
        });

        results.push({
          id: notification.id,
          title: notification.title,
          sent: sentCount,
          failed: failedCount,
          status: newStatus,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        
        // Marcar como erro
        await supabase
          .from('scheduled_push_notifications')
          .update({
            status: 'error',
            error_message: message,
            updated_at: now.toISOString(),
          })
          .eq('id', notification.id);

        results.push({
          id: notification.id,
          error: message,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
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
