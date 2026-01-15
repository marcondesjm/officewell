-- Create employees table for birthdays and basic info
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  birthday DATE,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcements table for company notices
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow public read access (no login required as per user request)
CREATE POLICY "Employees are viewable by everyone" 
ON public.employees FOR SELECT 
USING (true);

CREATE POLICY "Announcements are viewable by everyone" 
ON public.announcements FOR SELECT 
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Insert sample data for demonstration
INSERT INTO public.employees (name, department, birthday, email) VALUES
  ('Maria Silva', 'Marketing', '1990-01-20', 'maria@empresa.com'),
  ('João Santos', 'TI', '1988-01-18', 'joao@empresa.com'),
  ('Ana Costa', 'RH', '1992-01-25', 'ana@empresa.com'),
  ('Pedro Oliveira', 'Financeiro', '1985-02-10', 'pedro@empresa.com'),
  ('Carla Souza', 'Vendas', '1991-01-15', 'carla@empresa.com');

INSERT INTO public.announcements (title, content, priority) VALUES
  ('Reunião Geral', 'Reunião geral da empresa na sexta-feira às 15h no auditório.', 'high'),
  ('Novo Benefício', 'A partir de fevereiro, todos terão acesso ao Gympass. Confirme seu interesse com o RH.', 'normal'),
  ('Manutenção Programada', 'Sistemas ficarão offline no sábado das 22h às 02h para manutenção.', 'normal');