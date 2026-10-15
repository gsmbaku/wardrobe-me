-- Enable extensions for UUID generation if not already present
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Items table
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  color text not null,
  seasons text[] not null,
  image_id text not null,
  brand text,
  purchase_date date,
  price numeric,
  notes text,
  storage_space_id text,
  size text,
  tags text[],
  fit text,
  for_sale boolean default false,
  sale_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.items enable row level security;

-- RLS policies: users can CRUD only their own rows
drop policy if exists "Allow read own items" on public.items;
create policy "Allow read own items"
on public.items for select
using (auth.uid() = user_id);

drop policy if exists "Allow insert own items" on public.items;
create policy "Allow insert own items"
on public.items for insert
with check (auth.uid() = user_id);

drop policy if exists "Allow update own items" on public.items;
create policy "Allow update own items"
on public.items for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Allow delete own items" on public.items;
create policy "Allow delete own items"
on public.items for delete
using (auth.uid() = user_id);

-- Helper trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_items_set_updated_at on public.items;
create trigger trg_items_set_updated_at
before update on public.items
for each row execute function public.set_updated_at();

