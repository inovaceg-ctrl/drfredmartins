create policy "Doctors can update their own slots"
            on public.availability_slots for update
            to authenticated
            using (doctor_id = auth.uid())
            with check (doctor_id = auth.uid());