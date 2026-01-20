-- Adicionar colunas extras à tabela push_subscriptions existente
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS device_name text,
ADD COLUMN IF NOT EXISTS device_token text UNIQUE,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS last_push_received_at timestamptz,
ADD COLUMN IF NOT EXISTS last_push_title text;

-- Criar índice para device_token
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_device_token ON public.push_subscriptions(device_token);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_is_active ON public.push_subscriptions(is_active);

-- Tabela de histórico de notificações enviadas
CREATE TABLE IF NOT EXISTS public.push_notification_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  icon_url text,
  click_url text,
  target_type text DEFAULT 'all',
  target_session_ids text[],
  sent_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  sent_by text,
  sent_at timestamptz DEFAULT now()
);

-- Tabela de notificações agendadas
CREATE TABLE IF NOT EXISTS public.scheduled_push_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  icon_url text,
  click_url text,
  target_type text DEFAULT 'all',
  target_session_ids text[],
  scheduled_for timestamptz NOT NULL,
  next_run_at timestamptz,
  status text DEFAULT 'pending',
  sent_at timestamptz,
  last_sent_at timestamptz,
  sent_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  error_message text,
  recurrence_type text,
  recurrence_end_date date,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de preferências de notificação
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  notification_type text NOT NULL,
  is_enabled boolean DEFAULT true,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_id, notification_type)
);

-- Enable RLS
ALTER TABLE public.push_notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies para push_notification_history (todos podem ver e inserir para este app sem auth)
CREATE POLICY "Anyone can view push notification history"
ON public.push_notification_history FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert push notification history"
ON public.push_notification_history FOR INSERT
WITH CHECK (true);

-- RLS Policies para scheduled_push_notifications
CREATE POLICY "Anyone can view scheduled notifications"
ON public.scheduled_push_notifications FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert scheduled notifications"
ON public.scheduled_push_notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update scheduled notifications"
ON public.scheduled_push_notifications FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete scheduled notifications"
ON public.scheduled_push_notifications FOR DELETE
USING (true);

-- RLS Policies para notification_preferences
CREATE POLICY "Anyone can view notification preferences"
ON public.notification_preferences FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert notification preferences"
ON public.notification_preferences FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update notification preferences"
ON public.notification_preferences FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete notification preferences"
ON public.notification_preferences FOR DELETE
USING (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status ON public.scheduled_push_notifications(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_for ON public.scheduled_push_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_session_id ON public.notification_preferences(session_id);