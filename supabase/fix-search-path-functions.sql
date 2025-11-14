-- Fix mutable search_path issue on functions
-- Execute this in Supabase SQL Editor
-- 
-- Problem: Functions without explicit search_path are vulnerable to SQL injection
-- Solution: Set search_path explicitly in function definition

-- Fix handle_updated_at function (if it exists)
drop function if exists public.handle_updated_at() cascade;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Fix update_proposal_vote_count function
drop function if exists public.update_proposal_vote_count() cascade;

create or replace function public.update_proposal_vote_count()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    update public.asset_proposals
    set vote_count = vote_count + 1, updated_at = now()
    where id = new.proposal_id;
  elsif tg_op = 'DELETE' then
    update public.asset_proposals
    set vote_count = greatest(0, vote_count - 1), updated_at = now()
    where id = old.proposal_id;
  end if;
  return coalesce(new, old);
end;
$$;

-- Fix update_updated_at_column function (from archivio setup)
drop function if exists public.update_updated_at_column() cascade;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Fix get_user_emails_for_admin function
drop function if exists public.get_user_emails_for_admin() cascade;

create or replace function public.get_user_emails_for_admin()
returns table (
  user_id uuid,
  email text,
  created_at timestamptz
) 
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Verifica che l'utente sia admin
  if not exists (
    select 1 from public.admin_users 
    where user_id = auth.uid()
  ) then
    raise exception 'Access denied: admin only';
  end if;
  
  -- Ritorna email da auth.users (solo per admin)
  return query
  select 
    au.id as user_id,
    au.email,
    au.created_at
  from auth.users au
  order by au.created_at desc;
end;
$$;

-- Grant execute permissions
grant execute on function public.handle_updated_at() to authenticated;
grant execute on function public.handle_updated_at() to anon;
grant execute on function public.update_proposal_vote_count() to authenticated;
grant execute on function public.update_proposal_vote_count() to anon;
grant execute on function public.update_updated_at_column() to authenticated;
grant execute on function public.update_updated_at_column() to anon;
grant execute on function public.get_user_emails_for_admin() to authenticated;

