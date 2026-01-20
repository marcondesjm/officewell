-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can insert awards" ON public.monthly_awards;
DROP POLICY IF EXISTS "Admins can update awards" ON public.monthly_awards;
DROP POLICY IF EXISTS "Admins can delete awards" ON public.monthly_awards;

-- Create new permissive policies (matching other tables in the app that don't require auth)
CREATE POLICY "Anyone can insert awards" 
ON public.monthly_awards 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update awards" 
ON public.monthly_awards 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete awards" 
ON public.monthly_awards 
FOR DELETE 
USING (true);