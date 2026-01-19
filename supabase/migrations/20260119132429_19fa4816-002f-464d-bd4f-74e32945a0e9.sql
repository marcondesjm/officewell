-- Tabela para armazenar push subscriptions
CREATE TABLE public.push_subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    device_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (público pois não temos auth, mas identificamos por session_id)
CREATE POLICY "Anyone can insert push subscriptions"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view push subscriptions"
ON public.push_subscriptions
FOR SELECT
USING (true);

CREATE POLICY "Anyone can update their push subscription"
ON public.push_subscriptions
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete their push subscription"
ON public.push_subscriptions
FOR DELETE
USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_partners_updated_at();

-- Tabela para armazenar estado dos timers (para o backend verificar)
CREATE TABLE public.timer_states (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,
    eye_end_time BIGINT,
    stretch_end_time BIGINT,
    water_end_time BIGINT,
    is_running BOOLEAN DEFAULT false,
    last_notified_eye BIGINT DEFAULT 0,
    last_notified_stretch BIGINT DEFAULT 0,
    last_notified_water BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.timer_states ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can manage timer states"
ON public.timer_states
FOR ALL
USING (true)
WITH CHECK (true);