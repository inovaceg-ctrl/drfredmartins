-- Update profiles table to have separate address fields
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS address;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS street text,
ADD COLUMN IF NOT EXISTS street_number text,
ADD COLUMN IF NOT EXISTS neighborhood text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip_code text;

-- Update get_patients_for_doctor function to include new address fields
DROP FUNCTION IF EXISTS public.get_patients_for_doctor();

CREATE OR REPLACE FUNCTION public.get_patients_for_doctor()
RETURNS TABLE(
  id uuid, 
  full_name text, 
  phone text,
  whatsapp text,
  street text,
  street_number text,
  neighborhood text,
  city text,
  state text,
  zip_code text,
  birth_date date,
  email text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT 
    p.id, 
    p.full_name, 
    p.phone,
    p.whatsapp,
    p.street,
    p.street_number,
    p.neighborhood,
    p.city,
    p.state,
    p.zip_code,
    p.birth_date,
    au.email,
    p.created_at
  FROM public.profiles p
  LEFT JOIN auth.users au ON au.id = p.id
  WHERE EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.patient_id = p.id
      AND a.doctor_id = auth.uid()
  )
  ORDER BY p.full_name ASC
$$;