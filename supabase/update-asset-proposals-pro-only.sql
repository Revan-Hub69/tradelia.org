-- Aggiorna le policy per asset_proposals / asset_votes:
-- solo utenti con ruolo 'pro' possono proporre e votare.

-- ===== RLS PER ASSET_PROPOSALS =====
alter table public.asset_proposals enable row level security;

drop policy if exists "Trial/Pro can propose" on public.asset_proposals;
create policy "Trial/Pro can propose"
  on public.asset_proposals for insert
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'pro'
    )
    and proposed_by = auth.uid()
    -- Limite: massimo 1 proposta nelle ultime 24 ore per utente
    and not exists (
      select 1
      from public.asset_proposals p
      where p.proposed_by = auth.uid()
        and p.created_at >= (now() - interval '1 day')
    )
  );

-- ===== RLS PER ASSET_VOTES =====
alter table public.asset_votes enable row level security;

drop policy if exists "Trial/Pro can vote" on public.asset_votes;
create policy "Trial/Pro can vote"
  on public.asset_votes for insert
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'pro'
    )
    and user_id = auth.uid()
    -- Limite: massimo 1 voto nelle ultime 24 ore per utente
    and not exists (
      select 1
      from public.asset_votes v
      where v.user_id = auth.uid()
        and v.created_at >= (now() - interval '1 day')
    )
  );


