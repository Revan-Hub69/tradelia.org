-- Fix SECURITY DEFINER issue on active_reports_expanded view
-- Execute this in Supabase SQL Editor

-- Drop the existing view
drop view if exists public.active_reports_expanded;

-- Recreate with SECURITY INVOKER (default, safer)
-- SECURITY INVOKER means the view runs with the permissions of the querying user
-- This respects RLS policies correctly
create view public.active_reports_expanded
with (security_invoker = true) as
select
  r.id,
  r.slug,
  r.title,
  r.status,
  r.report_type,
  r.chart_path,
  r.notes,
  r.created_at,
  r.updated_at,
  r.published_at,
  rm.module_key,
  rm.content,
  rm.order_index,
  row_number() over (partition by r.id order by coalesce(rm.order_index, 9999), rm.module_key) as module_position
from public.reports r
left join public.report_modules rm on rm.report_id = r.id
where r.status = 'active';

-- Grant appropriate permissions
grant select on public.active_reports_expanded to authenticated;
grant select on public.active_reports_expanded to anon;

