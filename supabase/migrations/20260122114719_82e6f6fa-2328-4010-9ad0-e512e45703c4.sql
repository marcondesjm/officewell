-- Update the handle_new_user function to set trial to 3 months instead of 7 days
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_selected_plan subscription_plan;
  v_trial_ends_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get selected plan, default to demo
  v_selected_plan := COALESCE((NEW.raw_user_meta_data->>'selected_plan')::subscription_plan, 'demo');
  
  -- Set trial end date only for demo plan (3 months from now)
  IF v_selected_plan = 'demo' THEN
    v_trial_ends_at := NOW() + INTERVAL '3 months';
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