-- RPC to list public doctor profiles (bypassing RLS safely)
create or replace function public.get_doctors_public()
returns table (
  id uuid,
  full_name text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.created_at
  from public.profiles p
  inner join public.user_roles ur on ur.user_id = p.id
  where ur.role = 'doctor'::app_role
  order by p.full_name asc
$$;

-- RPC to fetch public doctor profiles by ids (for appointment mapping)
create or replace function public.get_doctor_profiles_by_ids(_ids uuid[])
returns table (
  id uuid,
  full_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.full_name
  from public.profiles p
  inner join public.user_roles ur on ur.user_id = p.id
  where ur.role = 'doctor'::app_role
    and p.id = any(_ids)
$$;

-- RPC to list patients for the current doctor (only basic info)
create or replace function public.get_patients_for_doctor()
returns table (
  id uuid,
  full_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select distinct p.id, p.full_name
  from public.profiles p
  where exists (
    select 1
    from public.appointments a
    where a.patient_id = p.id
      and a.doctor_id = auth.uid()
  )
  order by p.full_name asc
$$;

-- Ensure authenticated users can execute these functions
grant execute on function public.get_doctors_public() to authenticated;
grant execute on function public.get_doctor_profiles_by_ids(uuid[]) to authenticated;
grant execute on function public.get_patients_for_doctor() to authenticated;