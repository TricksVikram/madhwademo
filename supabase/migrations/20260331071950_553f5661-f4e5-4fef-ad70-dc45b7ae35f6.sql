
-- 1. Recreate profiles_public view with security_barrier for optimizer attack prevention
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public
WITH (security_invoker = on, security_barrier = true) AS
  SELECT id, user_id, display_name, avatar_url, created_at, updated_at
  FROM public.profiles;

-- 2. Harden has_role to only return true when checking caller's own roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  ) AND _user_id = auth.uid()
$$;
