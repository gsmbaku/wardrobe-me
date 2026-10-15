-- Create private bucket for item photos
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', false)
on conflict (id) do nothing;

-- RLS on storage.objects for the bucket
alter table storage.objects enable row level security;

-- Allow users to manage objects under their own UID folder: `${uid}/...`
drop policy if exists "item-photos read own" on storage.objects;
create policy "item-photos read own"
on storage.objects for select
using (
  bucket_id = 'item-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "item-photos write own" on storage.objects;
create policy "item-photos write own"
on storage.objects for insert
with check (
  bucket_id = 'item-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "item-photos update own" on storage.objects;
create policy "item-photos update own"
on storage.objects for update
using (
  bucket_id = 'item-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'item-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "item-photos delete own" on storage.objects;
create policy "item-photos delete own"
on storage.objects for delete
using (
  bucket_id = 'item-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

