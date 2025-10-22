-- Update get_patients_for_doctor function to return all patient data
DROP FUNCTION IF EXISTS public.get_patients_for_doctor();

CREATE OR REPLACE FUNCTION public.get_patients_for_doctor()
RETURNS TABLE(
  id uuid, 
  full_name text, 
  phone text,
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