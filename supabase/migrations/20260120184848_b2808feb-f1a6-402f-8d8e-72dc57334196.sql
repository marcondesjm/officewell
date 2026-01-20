-- Add new profile fields for user customization
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS exercise_type TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS exercise_hours_per_week NUMERIC(4,1) DEFAULT 0;

-- Add check constraint for exercise_type
ALTER TABLE public.profiles 
ADD CONSTRAINT check_exercise_type 
CHECK (exercise_type IN ('none', 'light', 'moderate', 'intense'));

-- Create storage bucket for user profile avatars if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user avatars
CREATE POLICY "Users can view all avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);