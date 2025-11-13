-- ============================================
-- MIGRAZIONE: Nuove tabelle per User Area
-- ============================================
-- Esegui questo script in Supabase Dashboard → SQL Editor
-- Aggiunge: asset_proposals, asset_votes, desk_public_links, user_analysis_credits
-- ============================================

-- ===== TABELLA PROPOSTE ASSET (COMMUNITY) =====
create table if not exists public.asset_proposals (
  id uuid primary key default gen_random_uuid(),
  asset_ticker text not null,
  proposed_by uuid not null references auth.users(id) on delete cascade,
  vote_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_asset_proposals_active on public.asset_proposals(is_active, vote_count desc);
create index if not exists idx_asset_proposals_proposed_by on public.asset_proposals(proposed_by);

-- ===== TABELLA VOTI ASSET =====
create table if not exists public.asset_votes (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.asset_proposals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(proposal_id, user_id)
);

create index if not exists idx_asset_votes_proposal on public.asset_votes(proposal_id);
create index if not exists idx_asset_votes_user on public.asset_votes(user_id);

-- ===== TABELLA LINK PUBBLICI DESK =====
create table if not exists public.desk_public_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  link_url text not null,
  link_label text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (display_order >= 0 and display_order <= 2)
);

create index if not exists idx_desk_links_user on public.desk_public_links(user_id, display_order);

-- ===== TABELLA CREDITI ANALISI ON-DEMAND =====
create table if not exists public.user_analysis_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credits_balance int not null default 0,
  total_purchased int not null default 0,
  total_used int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create index if not exists idx_analysis_credits_user on public.user_analysis_credits(user_id);

-- ===== TRIGGER PER AGGIORNAMENTO VOTE_COUNT =====
create or replace function update_proposal_vote_count()
returns trigger as $$
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
$$ language plpgsql;

drop trigger if exists trigger_update_vote_count on public.asset_votes;
create trigger trigger_update_vote_count
after insert or delete on public.asset_votes
for each row execute function update_proposal_vote_count();

-- ===== TRIGGER UPDATED_AT PER NUOVE TABELLE =====
drop trigger if exists asset_proposals_set_timestamp on public.asset_proposals;
create trigger asset_proposals_set_timestamp
before update on public.asset_proposals
for each row execute procedure moddatetime(updated_at);

drop trigger if exists desk_links_set_timestamp on public.desk_public_links;
create trigger desk_links_set_timestamp
before update on public.desk_public_links
for each row execute procedure moddatetime(updated_at);

drop trigger if exists analysis_credits_set_timestamp on public.user_analysis_credits;
create trigger analysis_credits_set_timestamp
before update on public.user_analysis_credits
for each row execute procedure moddatetime(updated_at);

-- ===== RLS PER ASSET_PROPOSALS =====
alter table public.asset_proposals enable row level security;

drop policy if exists "Everyone can view active proposals" on public.asset_proposals;
create policy "Everyone can view active proposals"
  on public.asset_proposals for select
  using (is_active = true);

drop policy if exists "Trial/Pro can propose" on public.asset_proposals;
create policy "Trial/Pro can propose"
  on public.asset_proposals for insert
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('trial', 'pro')
    )
    and proposed_by = auth.uid()
  );

drop policy if exists "Admins can delete proposals" on public.asset_proposals;
create policy "Admins can delete proposals"
  on public.asset_proposals for delete
  using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

-- ===== RLS PER ASSET_VOTES =====
alter table public.asset_votes enable row level security;

drop policy if exists "Everyone can view votes" on public.asset_votes;
create policy "Everyone can view votes"
  on public.asset_votes for select
  using (true);

drop policy if exists "Trial/Pro can vote" on public.asset_votes;
create policy "Trial/Pro can vote"
  on public.asset_votes for insert
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('trial', 'pro')
    )
    and user_id = auth.uid()
  );

drop policy if exists "Users can remove own vote" on public.asset_votes;
create policy "Users can remove own vote"
  on public.asset_votes for delete
  using (user_id = auth.uid());

-- ===== RLS PER DESK_PUBLIC_LINKS =====
alter table public.desk_public_links enable row level security;

drop policy if exists "Everyone can view desk links" on public.desk_public_links;
create policy "Everyone can view desk links"
  on public.desk_public_links for select
  using (true);

drop policy if exists "Desk users manage own links" on public.desk_public_links;
create policy "Desk users manage own links"
  on public.desk_public_links for all
  using (
    (
      exists (
        select 1 from public.user_roles ur
        where ur.user_id = auth.uid()
          and ur.role = 'institutional'
      )
      or exists (
        select 1 from public.admin_users au
        where au.user_id = auth.uid()
      )
    )
    and user_id = auth.uid()
  )
  with check (
    (
      exists (
        select 1 from public.user_roles ur
        where ur.user_id = auth.uid()
          and ur.role = 'institutional'
      )
      or exists (
        select 1 from public.admin_users au
        where au.user_id = auth.uid()
      )
    )
    and user_id = auth.uid()
  );

-- ===== RLS PER USER_ANALYSIS_CREDITS =====
alter table public.user_analysis_credits enable row level security;

drop policy if exists "Users view own credits" on public.user_analysis_credits;
create policy "Users view own credits"
  on public.user_analysis_credits for select
  using (user_id = auth.uid());

drop policy if exists "Service role manages credits" on public.user_analysis_credits;
create policy "Service role manages credits"
  on public.user_analysis_credits for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

