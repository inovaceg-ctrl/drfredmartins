-- Add additional fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS whatsapp text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS birth_date date;

-- Create doctor_notes table for medical observations
CREATE TABLE IF NOT EXISTS public.doctor_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on doctor_notes
ALTER TABLE public.doctor_notes ENABLE ROW LEVEL SECURITY;

-- Doctors can create notes for their patients
CREATE POLICY "Doctors can create notes for their patients"
ON public.doctor_notes
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = doctor_id
  AND EXISTS (
    SELECT 1 FROM public.appointments
    WHERE patient_id = doctor_notes.patient_id
    AND doctor_id = auth.uid()
  )
);

-- Doctors can view notes they created
CREATE POLICY "Doctors can view their notes"
ON public.doctor_notes
FOR SELECT
TO authenticated
USING (auth.uid() = doctor_id);

-- Doctors can update their notes
CREATE POLICY "Doctors can update their notes"
ON public.doctor_notes
FOR UPDATE
TO authenticated
USING (auth.uid() = doctor_id);

-- Doctors can delete their notes
CREATE POLICY "Doctors can delete their notes"
ON public.doctor_notes
FOR DELETE
TO authenticated
USING (auth.uid() = doctor_id);

-- Trigger to update updated_at
CREATE TRIGGER update_doctor_notes_updated_at
BEFORE UPDATE ON public.doctor_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update get_patients_for_doctor function to include new fields
DROP FUNCTION IF EXISTS public.get_patients_for_doctor();

CREATE OR REPLACE FUNCTION public.get_patients_for_doctor()
RETURNS TABLE(
  id uuid, 
  full_name text, 
  phone text,
  whatsapp text,
  address text,
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
    p.address,
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

-- Allow doctors to update patient profiles they have appointments with
CREATE POLICY "Doctors can update their patients profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.appointments
    WHERE patient_id = profiles.id
    AND doctor_id = auth.uid()
  )
);