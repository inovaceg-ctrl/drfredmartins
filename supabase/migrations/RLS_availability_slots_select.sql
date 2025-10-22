create policy "Enable read access for all authenticated users"
            on public.availability_slots for select
            to authenticated
            using (is_available = true);