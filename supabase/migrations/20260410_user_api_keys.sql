-- LLM API keys per user
create table if not exists public.user_api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('openai', 'anthropic', 'google')),
  api_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

alter table public.user_api_keys enable row level security;

create policy "Users manage own keys"
  on public.user_api_keys
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
