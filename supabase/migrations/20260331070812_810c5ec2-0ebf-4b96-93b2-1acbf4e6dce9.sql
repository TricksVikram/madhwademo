
-- Create a public view excluding email
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
  SELECT id, user_id, display_name, avatar_url, created_at, updated_at
  FROM public.profiles;

-- Drop the overly permissive SELECT policy
DROP POLICY "Users can view all profiles" ON public.profiles;

-- Owner-only SELECT on base table
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
