-- Crea tabelle payments / invoices e RLS base per cronologia pagamenti/fatture in area utente.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gateway text not null check (gateway in ('paddle', 'xolo', 'stripe')),
  amount_cents bigint not null check (amount_cents >= 0),
  currency text not null default 'EUR',
  status text not null check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  description text,
  external_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_user_created on public.payments(user_id, created_at desc);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  gateway text not null check (gateway in ('paddle', 'xolo', 'stripe')),
  external_id text,
  number text,
  amount_cents bigint not null check (amount_cents >= 0),
  currency text not null default 'EUR',
  status text not null check (status in ('issued', 'paid', 'void', 'refunded')),
  issued_at timestamptz not null default now(),
  due_date timestamptz,
  pdf_url text,
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_invoices_user_issued on public.invoices(user_id, issued_at desc);

alter table public.payments enable row level security;
alter table public.invoices enable row level security;

drop policy if exists "Users view own payments" on public.payments;
create policy "Users view own payments"
  on public.payments for select
  using (user_id = auth.uid());

drop policy if exists "Service role manages payments" on public.payments;
create policy "Service role manages payments"
  on public.payments for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Users view own invoices" on public.invoices;
create policy "Users view own invoices"
  on public.invoices for select
  using (user_id = auth.uid());

drop policy if exists "Service role manages invoices" on public.invoices;
create policy "Service role manages invoices"
  on public.invoices for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


