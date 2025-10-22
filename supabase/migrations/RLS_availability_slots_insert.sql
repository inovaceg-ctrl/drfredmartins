create policy "Doctors can insert their own slots"
            on public.availability_slots for insert
            to authenticated
            with check (doctor_id = auth.uid());