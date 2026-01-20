-- Create a table for daily tips
CREATE TABLE public.daily_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Geral',
  emoji TEXT DEFAULT '💡',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;

-- Create policies for access
CREATE POLICY "Active tips are viewable by everyone" 
ON public.daily_tips 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Anyone can insert tips" 
ON public.daily_tips 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update tips" 
ON public.daily_tips 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete tips" 
ON public.daily_tips 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_tips_updated_at
BEFORE UPDATE ON public.daily_tips
FOR EACH ROW
EXECUTE FUNCTION public.update_partners_updated_at();

-- Insert default tips
INSERT INTO public.daily_tips (title, content, category, emoji) VALUES
('Menos cafeína, mais energia', 'Limite o café a 2 xícaras antes das 14h. Prefira descafeinado à tarde para manter o sono saudável e energia estável.', 'Alimentação', '☕'),
('Regra 20-20-20', 'A cada 20 minutos, olhe para algo a 20 metros por 20 segundos. Seus olhos agradecem!', 'Visão', '👀'),
('Respire fundo', 'Inspire 4s, segure 4s, expire 4s. Três ciclos reduzem o estresse imediatamente.', 'Mental', '🧘'),
('Hidratação constante', 'Não espere sentir sede. Beba água a cada hora para manter o foco e evitar dores de cabeça.', 'Hidratação', '💧'),
('Postura correta', 'Pés no chão, costas retas, tela na altura dos olhos. Previna dores crônicas com pequenos ajustes.', 'Postura', '🪑'),
('Levante-se!', 'A cada 45 minutos, caminhe por 2 minutos. Ativa a circulação e aumenta a produtividade.', 'Movimento', '🚶'),
('Contato com a natureza', 'Plantas no ambiente de trabalho reduzem estresse e melhoram a qualidade do ar.', 'Ambiente', '🌿'),
('Lanches inteligentes', 'Troque doces por frutas e castanhas. Energia estável o dia todo sem picos de açúcar.', 'Alimentação', '🍎'),
('Durma bem', '7-8 horas de sono. Evite telas 1h antes de dormir. Seu desempenho amanhã depende disso.', 'Sono', '😴'),
('Uma tarefa por vez', 'Multitarefa reduz produtividade em 40%. Foque em uma coisa, termine, depois passe para a próxima.', 'Produtividade', '🎯');