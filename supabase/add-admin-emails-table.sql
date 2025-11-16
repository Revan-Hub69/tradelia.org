-- Crea tabella admin_emails per gestire admin via email (senza dipendere da auth.users)
-- Utile quando non si usa Supabase Auth ma solo token

create table if not exists public.admin_emails (
  email text primary key,
  created_at timestamptz not null default now(),
  notes text
);

-- Indice per lookup veloce
create index if not exists idx_admin_emails_email on public.admin_emails(email);

-- RLS: solo service_role può gestire, ma tutti possono leggere (per verifiche)
alter table public.admin_emails enable row level security;

drop policy if exists "Anyone can read admin emails" on public.admin_emails;
create policy "Anyone can read admin emails"
  on public.admin_emails for select
  using (true);

drop policy if exists "Service role manages admin emails" on public.admin_emails;
create policy "Service role manages admin emails"
  on public.admin_emails for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Inserisci email admin di default (modifica con le tue email)
insert into public.admin_emails (email, notes)
values 
  ('amministrazione@tradelia.org', 'Email principale amministrazione'),
  ('info@tradelia.org', 'Email info'),
  ('support@tradelia.org', 'Email supporto')
on conflict (email) do nothing;

