-- Create table for daily reports sent to HR
CREATE TABLE public.daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id text NOT NULL,
  display_name text NOT NULL,
  report_date date NOT NULL DEFAULT CURRENT_DATE,
  water_breaks integer NOT NULL DEFAULT 0,
  stretch_breaks integer NOT NULL DEFAULT 0,
  eye_breaks integer NOT NULL DEFAULT 0,
  total_breaks integer NOT NULL DEFAULT 0,
  points_earned integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, report_date)
);

-- Enable RLS
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
ON public.daily_reports FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own reports
CREATE POLICY "Users can insert their own reports"
ON public.daily_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reports (if they want to resend)
CREATE POLICY "Users can update their own reports"
ON public.daily_reports FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
ON public.daily_reports FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));