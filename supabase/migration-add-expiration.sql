-- ============================================
-- MIGRAZIONE: Aggiunge scadenza piano
-- ============================================
-- Esegui questo script in Supabase Dashboard → SQL Editor
-- Aggiunge campo valid_until per gestire scadenza piani
-- ============================================

-- Aggiungi colonna valid_until a user_roles
alter table public.user_roles 
add column if not exists valid_until timestamptz;

-- Indice per query efficienti su scadenze
create index if not exists idx_user_roles_valid_until 
on public.user_roles(valid_until) 
where valid_until is not null;

-- Funzione per verificare se un piano è valido
create or replace function is_plan_valid(user_uuid uuid)
returns boolean as $$
declare
  role_record record;
begin
  select role, valid_until into role_record
  from public.user_roles
  where user_id = user_uuid;
  
  if not found then
    return false;
  end if;
  
  -- Se valid_until è null, piano è permanente (admin/manuale)
  if role_record.valid_until is null then
    return true;
  end if;
  
  -- Verifica se la scadenza è passata
  return role_record.valid_until > now();
end;
$$ language plpgsql security definer;

-- Commento per documentazione
comment on column public.user_roles.valid_until is 'Data di scadenza del piano. NULL = permanente (admin/manuale)';

