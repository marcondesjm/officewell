-- Add trial_ends_at column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Update existing demo users to have trial end date (7 days from now for existing, or keep null for non-demo)
UPDATE public.profiles 
SET trial_ends_at = created_at + INTERVAL '7 days'
WHERE current_plan = 'demo' AND trial_ends_at IS NULL;

-- Create function to automatically migrate expired trials to free plan
CREATE OR REPLACE FUNCTION public.migrate_expired_trials()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.profiles
  SET current_plan = 'free', trial_ends_at = NULL
  WHERE current_plan = 'demo' 
    AND trial_ends_at IS NOT NULL 
    AND trial_ends_at < NOW();
END;
$function$;

-- Create function to check and migrate single user's trial on login
CREATE OR REPLACE FUNCTION public.check_trial_expiration(user_uuid UUID)
RETURNS TABLE(expired BOOLEAN, plan TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_trial_ends_at TIMESTAMP WITH TIME ZONE;
  v_current_plan TEXT;
BEGIN
  -- Get current trial info
  SELECT p.trial_ends_at, p.current_plan::TEXT INTO v_trial_ends_at, v_current_plan
  FROM public.profiles p
  WHERE p.user_id = user_uuid;
  
  -- Check if trial expired
  IF v_current_plan = 'demo' AND v_trial_ends_at IS NOT NULL AND v_trial_ends_at < NOW() THEN
    -- Migrate to free plan
    UPDATE public.profiles
    SET current_plan = 'free', trial_ends_at = NULL
    WHERE user_id = user_uuid;
    
    RETURN QUERY SELECT TRUE, 'free'::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE, v_current_plan;
  END IF;
END;
$function$;

-- Update handle_new_user to set trial_ends_at for demo plans
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_selected_plan subscription_plan;
  v_trial_ends_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get selected plan, default to demo
  v_selected_plan := COALESCE((NEW.raw_user_meta_data->>'selected_plan')::subscription_plan, 'demo');
  
  -- Set trial end date only for demo plan (7 days from now)
  IF v_selected_plan = 'demo' THEN
    v_trial_ends_at := NOW() + INTERVAL '7 days';
  ELSE
    v_trial_ends_at := NULL;
  END IF;
  
  INSERT INTO public.profiles (user_id, display_name, whatsapp, current_plan, trial_ends_at)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'whatsapp',
    v_selected_plan,
    v_trial_ends_at
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;