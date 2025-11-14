-- ============================================
-- MIGRAZIONE: Analisi Requests Enhanced
-- ============================================
-- Aggiunge report_id e migliora workflow
-- ============================================

-- Aggiungi report_id se non esiste
alter table public.analysis_requests 
add column if not exists report_id uuid references public.reports(id) on delete set null;

-- Aggiungi report_slug per accesso diretto
alter table public.analysis_requests 
add column if not exists report_slug text;

-- Aggiungi priorità per gestione coda
alter table public.analysis_requests 
add column if not exists priority int not null default 5 check (priority between 1 and 10);

-- Aggiungi note interne per admin
alter table public.analysis_requests 
add column if not exists admin_notes text;

-- Indici per performance
create index if not exists idx_analysis_requests_report_id 
on public.analysis_requests(report_id) 
where report_id is not null;

create index if not exists idx_analysis_requests_report_slug 
on public.analysis_requests(report_slug) 
where report_slug is not null;

create index if not exists idx_analysis_requests_priority_status 
on public.analysis_requests(priority, status) 
where status in ('pending', 'processing');

-- Funzione per aggiornare status e collegare report
create or replace function complete_analysis_request(
  request_uuid uuid,
  report_uuid uuid,
  report_slug_param text default null
)
returns void as $$
begin
  update public.analysis_requests
  set 
    status = 'completed',
    report_id = report_uuid,
    report_slug = report_slug_param,
    completed_at = now(),
    updated_at = now()
  where id = request_uuid
    and status in ('pending', 'processing');
  
  if not found then
    raise exception 'Analysis request not found or already completed';
  end if;
end;
$$ language plpgsql security definer;

-- Commenti per documentazione
comment on column public.analysis_requests.report_id is 'ID del report generato quando la richiesta è completata';
comment on column public.analysis_requests.report_slug is 'Slug del report per accesso diretto';
comment on column public.analysis_requests.priority is 'Priorità richiesta (1=alta, 10=bassa)';
comment on column public.analysis_requests.admin_notes is 'Note interne per admin/desk';

