-- WARNING: This script drops existing public tables/sequences/views and recreates schema v2.
-- Run only in an environment you can wipe (e.g., staging/test) or after a backup.

-- Drop all public tables (excluding auth.*)
do $$
declare
  rec record;
begin
  for rec in (
    select tablename
    from pg_tables
    where schemaname = 'public'
  ) loop
    execute format('drop table if exists public.%I cascade;', rec.tablename);
  end loop;

  for rec in (
    select sequencename
    from pg_sequences
    where schemaname = 'public'
  ) loop
    execute format('drop sequence if exists public.%I cascade;', rec.sequencename);
  end loop;

  for rec in (
    select viewname
    from pg_views
    where schemaname = 'public'
  ) loop
    execute format('drop view if exists public.%I cascade;', rec.viewname);
  end loop;
end $$;

-- Recreate schema
\i 'supabase/schema_v2.sql'

