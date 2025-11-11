-- Supabase schema for Tradelia report system (CTA 2025 refactor)
-- Execute this in the Supabase SQL editor or via CLI after creating the project.

set check_function_bodies = off;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  status text not null check (status in ('draft','active','archived')),
  report_type text not null check (report_type in ('swing_master_5_0','daily_market_intel_3_1','custom')),
  chart_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.report_modules (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  module_key text not null,
  content jsonb not null,
  order_index int,
  created_at timestamptz not null default now()
);

create index if not exists idx_report_modules_report_id on public.report_modules(report_id);
create unique index if not exists uq_report_module_key_per_report
  on public.report_modules(report_id, module_key);

create extension if not exists moddatetime;
create trigger set_timestamp
before update on public.reports
for each row execute procedure moddatetime(updated_at);

-- Optional helper view to expose active reports with modules ordered.
create or replace view public.active_reports_expanded as
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

-- Example policies (adjust roles as needed).
-- Allow authenticated users full access (admin use-case).
alter table public.reports enable row level security;
alter table public.report_modules enable row level security;

create policy "Authenticated can manage reports"
  on public.reports for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated can manage modules"
  on public.report_modules for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');


