-- Add display_time column to birthday_settings
ALTER TABLE public.birthday_settings 
ADD COLUMN display_time TIME DEFAULT '09:00:00';