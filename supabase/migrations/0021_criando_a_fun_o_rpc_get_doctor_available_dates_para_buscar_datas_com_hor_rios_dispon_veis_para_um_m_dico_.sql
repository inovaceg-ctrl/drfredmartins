CREATE OR REPLACE FUNCTION public.get_doctor_available_dates(_doctor_id uuid)
RETURNS SETOF date
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT DISTINCT DATE(start_time)
  FROM public.availability_slots
  WHERE doctor_id = _doctor_id AND is_available = TRUE AND start_time >= NOW()
  ORDER BY DATE(start_time);
END;
$function$;