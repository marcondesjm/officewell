-- Tabela para registrar o humor/mood dos usuários
CREATE TABLE public.mood_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

-- Política para visualizar registros da própria sessão
CREATE POLICY "Users can view their own mood logs"
ON public.mood_logs
FOR SELECT
USING (true);

-- Política para inserir registros
CREATE POLICY "Users can insert mood logs"
ON public.mood_logs
FOR INSERT
WITH CHECK (true);

-- Política para deletar registros da própria sessão
CREATE POLICY "Users can delete their own mood logs"
ON public.mood_logs
FOR DELETE
USING (true);

-- Index para busca por sessão e data
CREATE INDEX idx_mood_logs_session_date ON public.mood_logs(session_id, created_at DESC);