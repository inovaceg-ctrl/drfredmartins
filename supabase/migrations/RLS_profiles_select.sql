create policy "Enable read access for all authenticated users"
        on public.profiles for select
        to authenticated
        using (true);