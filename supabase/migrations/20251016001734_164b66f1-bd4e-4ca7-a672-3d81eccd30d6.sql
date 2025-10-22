-- Add policy to allow doctors to view their patients' profiles
CREATE POLICY "Doctors can view their patients profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.appointments
    WHERE patient_id = profiles.id
    AND doctor_id = auth.uid()
  )
);