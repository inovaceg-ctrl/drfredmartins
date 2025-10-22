-- Remove a função existente para permitir a recriação com um novo tipo de retorno
DROP FUNCTION IF EXISTS public.get_patients_for_doctor();

-- Recria a função para buscar todos os dados do perfil do paciente
CREATE OR REPLACE FUNCTION public.get_patients_for_doctor()
 RETURNS TABLE(
    id UUID,
    full_name TEXT,
    email TEXT,
    date_of_birth DATE,
    whatsapp TEXT,
    state TEXT,
    city TEXT,
    street TEXT,
    street_number TEXT,
    neighborhood TEXT,
    zip_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    phone TEXT,
    is_doctor BOOLEAN,
    is_public BOOLEAN,
    birth_date DATE,
    mental_health_history TEXT,
    main_complaints TEXT,
    previous_diagnoses TEXT,
    current_medications TEXT,
    past_sessions_history TEXT,
    therapist_id UUID,
    consent_status BOOLEAN,
    consent_date TIMESTAMP WITH TIME ZONE
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.email,
    p.date_of_birth,
    p.whatsapp,
    p.state,
    p.city,
    p.street,
    p.street_number,
    p.neighborhood,
    p.zip_code,
    p.created_at,
    p.phone,
    p.is_doctor,
    p.is_public,
    p.birth_date,
    p.mental_health_history,
    p.main_complaints,
    p.previous_diagnoses,
    p.current_medications,
    p.past_sessions_history,
    p.therapist_id,
    p.consent_status,
    p.consent_date
  FROM public.profiles p
  JOIN public.user_roles ur ON p.id = ur.user_id
  WHERE ur.role = 'patient'::public.app_role;
END;
$function$;