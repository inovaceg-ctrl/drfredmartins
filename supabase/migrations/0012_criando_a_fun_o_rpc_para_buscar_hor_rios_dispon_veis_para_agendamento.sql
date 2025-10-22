CREATE OR REPLACE FUNCTION public.get_truly_available_slots(
    _doctor_id UUID,
    _start_time_gte TIMESTAMP WITH TIME ZONE
)
RETURNS SETOF public.availability_slots
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    id,
    doctor_id,
    start_time,
    end_time,
    is_available,
    created_at,
    updated_at
  FROM public.availability_slots
  WHERE
    doctor_id = _doctor_id AND
    is_available = TRUE AND
    start_time >= _start_time_gte
  ORDER BY start_time;
END;
$$;