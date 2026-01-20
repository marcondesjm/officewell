-- Create table for monthly awards
CREATE TABLE public.monthly_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year text NOT NULL, -- Format: YYYY-MM
  position integer NOT NULL CHECK (position BETWEEN 1 AND 3),
  user_id uuid NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  points integer NOT NULL DEFAULT 0,
  prize_title text NOT NULL,
  prize_description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(month_year, position)
);

-- Enable RLS
ALTER TABLE public.monthly_awards ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view awards (public leaderboard)
CREATE POLICY "Anyone can view monthly awards"
ON public.monthly_awards
FOR SELECT
USING (true);

-- Only admins can manage awards
CREATE POLICY "Admins can insert awards"
ON public.monthly_awards
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update awards"
ON public.monthly_awards
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete awards"
ON public.monthly_awards
FOR DELETE
USING (has_role(auth.uid(), 'admin'));