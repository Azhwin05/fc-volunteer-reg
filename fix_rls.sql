-- Allow Authenticated Users (Admins) to VIEW all data
create policy "Enable read access for authenticated users" on volunteers
  for select
  to authenticated
  using (true);

-- Allow Authenticated Users (Admins) to UPDATE data (for assigning roles)
create policy "Enable update access for authenticated users" on volunteers
  for update
  to authenticated
  using (true)
  with check (true);
