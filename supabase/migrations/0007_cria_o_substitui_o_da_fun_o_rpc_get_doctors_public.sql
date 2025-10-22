CREATE OR REPLACE FUNCTION public.get_doctors_public()
 RETURNS SETOF public.profiles
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM public.profiles p
  WHERE p.is_doctor = TRUE AND p.is_public = TRUE; -- Certifique-se de que 'is_public' existe e é TRUE para doutores visíveis
END;
$function$;