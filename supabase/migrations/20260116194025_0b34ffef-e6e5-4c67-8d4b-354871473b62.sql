-- Criar tabela de parceiros/anúncios
CREATE TABLE public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'building-2',
    gradient TEXT NOT NULL DEFAULT 'from-indigo-600/20 via-violet-600/20 to-purple-600/20',
    border_color TEXT NOT NULL DEFAULT 'border-indigo-500/30',
    icon_bg TEXT NOT NULL DEFAULT 'from-indigo-500 to-violet-600',
    button_gradient TEXT NOT NULL DEFAULT 'from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500',
    shadow_color TEXT NOT NULL DEFAULT 'shadow-violet-500/25',
    text_gradient TEXT NOT NULL DEFAULT 'from-indigo-400 to-violet-400',
    badge TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    impressions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Políticas para visualização pública (apenas parceiros ativos)
CREATE POLICY "Active partners are viewable by everyone"
ON public.partners
FOR SELECT
USING (is_active = true);

-- Políticas para administração (sem autenticação por enquanto, pode ser melhorado depois)
CREATE POLICY "Anyone can insert partners"
ON public.partners
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update partners"
ON public.partners
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete partners"
ON public.partners
FOR DELETE
USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON public.partners
    FOR EACH ROW
    EXECUTE FUNCTION public.update_partners_updated_at();

-- Inserir parceiros iniciais
INSERT INTO public.partners (name, description, url, icon, gradient, border_color, icon_bg, button_gradient, shadow_color, text_gradient, badge, display_order) VALUES
('DoorVII', 'Gestão inteligente de condomínios e portarias digitais', 'https://doorvii.lovable.app', 'building-2', 'from-indigo-600/20 via-violet-600/20 to-purple-600/20', 'border-indigo-500/30', 'from-indigo-500 to-violet-600', 'from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500', 'shadow-violet-500/25', 'from-indigo-400 to-violet-400', 'Novo', 1),
('ShopFlow', 'Marketplace completo para pequenos negócios locais', 'https://shopflow.lovable.app', 'shopping-bag', 'from-emerald-600/20 via-green-600/20 to-teal-600/20', 'border-emerald-500/30', 'from-emerald-500 to-green-600', 'from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500', 'shadow-emerald-500/25', 'from-emerald-400 to-green-400', 'Popular', 2),
('FoodExpress', 'Delivery de comida saudável direto no seu escritório', 'https://foodexpress.lovable.app', 'utensils', 'from-orange-600/20 via-amber-600/20 to-yellow-600/20', 'border-orange-500/30', 'from-orange-500 to-amber-600', 'from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500', 'shadow-orange-500/25', 'from-orange-400 to-amber-400', NULL, 3),
('RideShare', 'Compartilhe caronas com colegas de trabalho', 'https://rideshare.lovable.app', 'car', 'from-blue-600/20 via-cyan-600/20 to-sky-600/20', 'border-blue-500/30', 'from-blue-500 to-cyan-600', 'from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500', 'shadow-blue-500/25', 'from-blue-400 to-cyan-400', 'Eco', 4),
('TaskPro', 'Organize suas tarefas e aumente sua produtividade', 'https://taskpro.lovable.app', 'briefcase', 'from-rose-600/20 via-pink-600/20 to-fuchsia-600/20', 'border-rose-500/30', 'from-rose-500 to-pink-600', 'from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500', 'shadow-rose-500/25', 'from-rose-400 to-pink-400', NULL, 5),
('MindfulMe', 'Meditação e bem-estar mental para profissionais', 'https://mindfulme.lovable.app', 'heart', 'from-purple-600/20 via-violet-600/20 to-indigo-600/20', 'border-purple-500/30', 'from-purple-500 to-violet-600', 'from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500', 'shadow-purple-500/25', 'from-purple-400 to-violet-400', NULL, 6);