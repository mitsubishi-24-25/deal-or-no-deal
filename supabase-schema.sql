-- Run this once in the Supabase SQL Editor.
create table if not exists public.game_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

-- The Node server uses the service-role key, so client-side access is not needed.
alter table public.game_state enable row level security;
