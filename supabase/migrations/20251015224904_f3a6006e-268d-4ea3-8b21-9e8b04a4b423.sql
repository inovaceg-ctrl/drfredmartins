-- Fix 1: Create a view for public doctor profiles that excludes phone numbers
CREATE OR REPLACE VIEW public.doctor_profiles_public AS
SELECT 
  p.id,
  p.full_name,
  p.created_at
FROM public.profiles p
INNER JOIN public.user_roles ur ON ur.user_id = p.id
WHERE ur.role = 'doctor'::app_role;

-- Drop the problematic policy that exposes phone numbers
DROP POLICY IF EXISTS "Users can view doctor profiles" ON public.profiles;

-- Create a new policy that only allows viewing own profile (which includes phone)
-- The public doctor list will be accessed through the view instead
CREATE POLICY "Authenticated users can view own profile with phone"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Grant access to the public doctor view
GRANT SELECT ON public.doctor_profiles_public TO authenticated;

-- Fix 2: Create owners_access table for proper authentication
CREATE TABLE IF NOT EXISTS public.owners_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id),
  UNIQUE(user_id)
);

-- Enable RLS on owners_access
ALTER TABLE public.owners_access ENABLE ROW LEVEL SECURITY;

-- Users can view their own owner access status
CREATE POLICY "Users can view their own owner access"
ON public.owners_access
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only admins can grant owner access (will be used later)
CREATE POLICY "Admins can grant owner access"
ON public.owners_access
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Fix 3: Update handle_new_user trigger to prevent admin self-assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role app_role;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário')
  );

  -- SECURITY FIX: Only allow patient and doctor roles from self-registration
  -- Admin role can ONLY be assigned by existing admins through secure backend processes
  IF NEW.raw_user_meta_data->>'role' = 'doctor' THEN
    _role := 'doctor';
  ELSE
    -- Default to patient for any other value (including 'admin' attempts)
    _role := 'patient';
  END IF;

  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  RETURN NEW;
END;
$$;