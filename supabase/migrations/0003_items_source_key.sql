-- Optional idempotency key for device imports; unique per user
alter table public.items add column if not exists source_key text;

-- Partial unique index: only enforce uniqueness when source_key is not null
create unique index if not exists items_user_source_unique
on public.items (user_id, source_key)
where source_key is not null;

