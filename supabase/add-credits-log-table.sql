-- Crea tabella log movimenti crediti e trigger su user_analysis_credits

create table if not exists public.user_analysis_credits_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta int not null,
  reason text,
  source text,
  old_balance int,
  new_balance int,
  created_at timestamptz not null default now(),
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_credits_log_user_created on public.user_analysis_credits_log(user_id, created_at desc);

create or replace function log_user_analysis_credits_change()
returns trigger as $$
declare
  v_delta int;
  v_source text;
begin
  v_delta := coalesce(new.credits_balance, 0) - coalesce(old.credits_balance, 0);
  if v_delta = 0 then
    return new;
  end if;

  if exists (select 1 from public.admin_users au where au.user_id = auth.uid()) then
    v_source := 'admin';
  elsif auth.role() = 'service_role' then
    v_source := 'system';
  else
    v_source := 'user';
  end if;

  insert into public.user_analysis_credits_log (
    user_id,
    delta,
    reason,
    source,
    old_balance,
    new_balance,
    metadata
  ) values (
    new.user_id,
    v_delta,
    case 
      when v_source = 'admin' then 'admin_adjust'
      when v_delta < 0 then 'desk_request'
      else 'system_update'
    end,
    v_source,
    old.credits_balance,
    new.credits_balance,
    jsonb_build_object(
      'total_purchased', new.total_purchased,
      'total_used', new.total_used
    )
  );

  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_log_user_analysis_credits_change on public.user_analysis_credits;
create trigger trigger_log_user_analysis_credits_change
after update on public.user_analysis_credits
for each row
execute function log_user_analysis_credits_change();

alter table public.user_analysis_credits_log enable row level security;

drop policy if exists "Users view own credits log" on public.user_analysis_credits_log;
create policy "Users view own credits log"
  on public.user_analysis_credits_log for select
  using (user_id = auth.uid());

drop policy if exists "Service role manages credits log" on public.user_analysis_credits_log;
create policy "Service role manages credits log"
  on public.user_analysis_credits_log for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


