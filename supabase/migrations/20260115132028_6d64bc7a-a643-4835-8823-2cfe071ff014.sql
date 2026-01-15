-- Add insert, update, delete policies for employees (public access as no login required)
CREATE POLICY "Anyone can insert employees" 
ON public.employees FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update employees" 
ON public.employees FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete employees" 
ON public.employees FOR DELETE 
USING (true);

-- Add insert, update, delete policies for announcements
CREATE POLICY "Anyone can insert announcements" 
ON public.announcements FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update announcements" 
ON public.announcements FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete announcements" 
ON public.announcements FOR DELETE 
USING (true);