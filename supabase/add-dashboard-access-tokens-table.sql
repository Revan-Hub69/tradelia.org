-- Crea tabella dashboard_access_tokens per gestione codici accesso dashboard
-- Collegata a user_roles e subscribers per validazione completa

create table if not exists public.dashboard_access_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text, -- Se non abbiamo user_id (utenti non registrati con solo email)
  token_hash text not null unique, -- Hash SHA-256 del token (non il token in chiaro)
  plan_role text not null check (plan_role in ('trial', 'pro', 'institutional')),
  created_at timestamptz not null default now(),
  valid_from timestamptz not null default now(),
  valid_until timestamptz not null, -- Scadenza token (allineata a user_roles.valid_until o subscribers.current_period_end)
  revoked boolean not null default false,
  revoked_at timestamptz,
  last_used_at timestamptz,
  usage_count int not null default 0,
  source text check (source in ('paddle', 'xolo', 'stripe', 'lemonsqueezy', 'manual', 'trial')),
  metadata jsonb default '{}'::jsonb
);

-- Indici per performance
create index if not exists idx_dashboard_tokens_hash on public.dashboard_access_tokens(token_hash);
create index if not exists idx_dashboard_tokens_user on public.dashboard_access_tokens(user_id) where user_id is not null;
create index if not exists idx_dashboard_tokens_email on public.dashboard_access_tokens(email) where email is not null;
create index if not exists idx_dashboard_tokens_valid on public.dashboard_access_tokens(valid_until, revoked) where revoked = false;

-- RLS policies
alter table public.dashboard_access_tokens enable row level security;

-- Service role può gestire tutto (per webhook e API)
drop policy if exists "Service role manages tokens" on public.dashboard_access_tokens;
create policy "Service role manages tokens"
  on public.dashboard_access_tokens for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Utenti non possono leggere i token (solo validazione via API)
-- Non serve policy SELECT per utenti normali

-- Funzione helper per generare hash token (da usare in API, non in SQL)
-- Nota: l'hash viene calcolato lato API con crypto.createHash('sha256')

