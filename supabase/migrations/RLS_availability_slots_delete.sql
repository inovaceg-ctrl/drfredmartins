create policy "Doctors can delete their own slots"
            on public.availability_slots for delete
            to authenticated
            using (doctor_id = auth.uid());