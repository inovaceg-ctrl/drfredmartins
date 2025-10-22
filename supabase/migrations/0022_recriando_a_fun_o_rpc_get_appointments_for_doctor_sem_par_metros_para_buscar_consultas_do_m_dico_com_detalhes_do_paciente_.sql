CREATE OR REPLACE FUNCTION public.get_appointments_for_doctor()
 RETURNS TABLE(
    id uuid,
    patient_id uuid,
    doctor_id uuid,
    slot_id uuid,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    status text,
    notes text,
    video_room_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    patient_full_name text,
    patient_whatsapp text,
    patient_street text,
    patient_street_number text,
    patient_neighborhood text,
    patient_city text,
    patient_state text,
    patient_zip_code text
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.patient_id,
    a.doctor_id,
    a.slot_id,
    a.start_time,
    a.end_time,
    a.status,
    a.notes,
    a.video_room_id,
    a.created_at,
    a.updated_at,
    p.full_name AS patient_full_name,
    p.whatsapp AS patient_whatsapp,
    p.street AS patient_street,
    p.street_number AS patient_street_number,
    p.neighborhood AS patient_neighborhood,
    p.city AS patient_city,
    p.state AS patient_state,
    p.zip_code AS patient_zip_code
  FROM public.appointments a
  JOIN public.profiles p ON a.patient_id = p.id
  WHERE a.doctor_id = auth.uid()
  ORDER BY a.start_time DESC;
END;
$function$;