-- Fix the security definer view issue by making it a regular view
-- The view doesn't need SECURITY DEFINER as it only exposes public doctor info
DROP VIEW IF EXISTS public.doctor_profiles_public;

CREATE VIEW public.doctor_profiles_public 
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.full_name,
  p.created_at
FROM public.profiles p
INNER JOIN public.user_roles ur ON ur.user_id = p.id
WHERE ur.role = 'doctor'::app_role;

-- Grant access to the view
GRANT SELECT ON public.doctor_profiles_public TO authenticated;