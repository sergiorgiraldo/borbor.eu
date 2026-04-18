-- Custom user profiles (survives OAuth re-login which overwrites auth.users metadata)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users manage own profile"
  on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
