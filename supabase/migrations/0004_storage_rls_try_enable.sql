-- Some Supabase projects already have RLS enabled on storage.objects and do not permit altering it.
-- This block attempts to enable RLS but ignores insufficient_privilege errors.
do $$
begin
  begin
    execute 'alter table storage.objects enable row level security';
  exception
    when insufficient_privilege then
      -- Ignore; proceed with policies only
      null;
  end;
end $$;

