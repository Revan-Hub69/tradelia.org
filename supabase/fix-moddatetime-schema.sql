-- Fix moddatetime extension schema issue
-- Execute this in Supabase SQL Editor
--
-- Problem: Extension moddatetime is installed in public schema
-- Solution: Move it to extensions schema (Supabase best practice)

-- Step 1: Create extensions schema if it doesn't exist
create schema if not exists extensions;

-- Step 2: Grant usage on extensions schema to public
grant usage on schema extensions to public;

-- Step 3: Drop ALL triggers that use moddatetime FIRST
-- This is required before we can move the extension
drop trigger if exists set_timestamp on public.reports;
drop trigger if exists user_profiles_set_timestamp on public.user_profiles;
drop trigger if exists report_comments_set_timestamp on public.report_comments;
drop trigger if exists asset_proposals_set_timestamp on public.asset_proposals;
drop trigger if exists desk_links_set_timestamp on public.desk_public_links;
drop trigger if exists analysis_credits_set_timestamp on public.user_analysis_credits;
drop trigger if exists analysis_requests_set_timestamp on public.analysis_requests;

-- Step 4: Now we can drop and recreate the extension in extensions schema
drop extension if exists moddatetime cascade;

-- Step 5: Install moddatetime in extensions schema
create extension if not exists moddatetime
with schema extensions;

-- Step 6: Verify the extension is now in extensions schema
select 
  extname as extension_name,
  n.nspname as schema_name
from pg_extension e
join pg_namespace n on e.extnamespace = n.oid
where extname = 'moddatetime';

-- Step 7: Recreate triggers to explicitly reference extensions.moddatetime
-- This ensures they work even if search_path changes

-- Update trigger on reports table
drop trigger if exists set_timestamp on public.reports;
create trigger set_timestamp
before update on public.reports
for each row execute procedure extensions.moddatetime(updated_at);

-- Update trigger on user_profiles table
drop trigger if exists user_profiles_set_timestamp on public.user_profiles;
create trigger user_profiles_set_timestamp
before update on public.user_profiles
for each row execute procedure extensions.moddatetime(updated_at);

-- Update trigger on report_comments table
drop trigger if exists report_comments_set_timestamp on public.report_comments;
create trigger report_comments_set_timestamp
before update on public.report_comments
for each row execute procedure extensions.moddatetime(updated_at);

-- Update trigger on asset_proposals table
drop trigger if exists asset_proposals_set_timestamp on public.asset_proposals;
create trigger asset_proposals_set_timestamp
before update on public.asset_proposals
for each row execute procedure extensions.moddatetime(updated_at);

-- Update trigger on desk_public_links table
drop trigger if exists desk_links_set_timestamp on public.desk_public_links;
create trigger desk_links_set_timestamp
before update on public.desk_public_links
for each row execute procedure extensions.moddatetime(updated_at);

-- Update trigger on user_analysis_credits table
drop trigger if exists analysis_credits_set_timestamp on public.user_analysis_credits;
create trigger analysis_credits_set_timestamp
before update on public.user_analysis_credits
for each row execute procedure extensions.moddatetime(updated_at);

-- Update trigger on analysis_requests table
drop trigger if exists analysis_requests_set_timestamp on public.analysis_requests;
create trigger analysis_requests_set_timestamp
before update on public.analysis_requests
for each row execute procedure extensions.moddatetime(updated_at);

-- Verify all triggers are working
select 
  trigger_name,
  event_object_table,
  action_statement
from information_schema.triggers
where trigger_schema = 'public'
  and action_statement like '%moddatetime%'
order by event_object_table, trigger_name;

