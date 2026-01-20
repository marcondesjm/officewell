-- Create a view for public leaderboard data (limited fields only)
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  id,
  display_name,
  avatar_url,
  points,
  current_plan,
  updated_at
FROM public.profiles
ORDER BY points DESC;

-- Add RLS policy to allow viewing leaderboard data
CREATE POLICY "Anyone can view leaderboard data"
ON public.profiles
FOR SELECT
USING (true);

-- Note: This creates a permissive policy for SELECT that allows viewing profiles for the leaderboard
-- The existing restrictive policies for UPDATE remain in place