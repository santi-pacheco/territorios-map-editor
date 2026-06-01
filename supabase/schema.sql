-- TerritoriosMapEditor — run once in Supabase SQL editor.

-- 1. Single-row data table.
create table if not exists public.app_data (
  id integer primary key default 1,
  data jsonb not null default '{"version":1,"territories":[],"schedule":{"days":[]}}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint app_data_singleton check (id = 1)
);

insert into public.app_data (id) values (1) on conflict (id) do nothing;

-- 2. Enable Row Level Security.
alter table public.app_data enable row level security;

-- 3. Anyone (anon) may READ.
create policy "public read" on public.app_data
  for select using (true);

-- 4. Only authenticated (the manager account) may WRITE.
create policy "auth update" on public.app_data
  for update to authenticated using (true) with check (true);

-- 5. Realtime: broadcast row changes to subscribers.
alter publication supabase_realtime add table public.app_data;

-- 6. MANAGER ACCOUNT:
--    Create it in Supabase Dashboard → Authentication → Users → "Add user":
--      email: manager@territorios.local   (fixed; never shown to viewers)
--      password: <YOUR SHARED PASSCODE>
--    Set this same email as VITE_MANAGER_EMAIL and the password is the passcode
--    managers type into the app. (Disable "Confirm email" for this user.)
