-- Adicionar índice único em session_id para permitir upsert
CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_session_id_key 
ON public.push_subscriptions (session_id);