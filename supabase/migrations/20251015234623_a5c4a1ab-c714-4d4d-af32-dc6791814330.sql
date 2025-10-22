create or replace function public.get_appointments_for_doctor()
returns table (
  id uuid,
  patient_id uuid,
  doctor_id uuid,
  start_time timestamptz,
  end_time timestamptz,
  status public.appointment_status,
  notes text,
  created_at timestamptz,
  patient_full_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select a.id, a.patient_id, a.doctor_id, a.start_time, a.end_time, a.status, a.notes, a.created_at, p.full_name as patient_full_name
  from public.appointments a
  join public.profiles p on p.id = a.patient_id
  where a.doctor_id = auth.uid()
  order by a.start_time asc
$$;

grant execute on function public.get_appointments_for_doctor() to authenticated;