-- Create table for birthday celebration settings
CREATE TABLE public.birthday_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL DEFAULT 'Desejamos um dia repleto de alegrias, realizações e muita felicidade!',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.birthday_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (HR can manage)
CREATE POLICY "Birthday settings are viewable by everyone" 
ON public.birthday_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert birthday settings" 
ON public.birthday_settings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update birthday settings" 
ON public.birthday_settings 
FOR UPDATE 
USING (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_birthday_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_birthday_settings_updated_at
BEFORE UPDATE ON public.birthday_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_birthday_settings_updated_at();

-- Insert default settings
INSERT INTO public.birthday_settings (message) 
VALUES ('Desejamos um dia repleto de alegrias, realizações e muita felicidade!');

-- Create storage bucket for birthday images
INSERT INTO storage.buckets (id, name, public) VALUES ('birthday-images', 'birthday-images', true);

-- Create storage policies
CREATE POLICY "Birthday images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'birthday-images');

CREATE POLICY "Anyone can upload birthday images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'birthday-images');

CREATE POLICY "Anyone can update birthday images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'birthday-images');

CREATE POLICY "Anyone can delete birthday images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'birthday-images');