-- ============================================
-- RPC FUNCTION: Ottiene email utenti per admin
-- ============================================
-- Esegui questo script in Supabase Dashboard → SQL Editor
-- Crea una funzione RPC per ottenere email degli utenti (solo per admin)
-- ============================================

create or replace function get_user_emails_for_admin()
returns table (
  user_id uuid,
  email text,
  created_at timestamptz
) 
language plpgsql
security definer
as $$
begin
  -- Verifica che l'utente sia admin
  if not exists (
    select 1 from public.admin_users 
    where user_id = auth.uid()
  ) then
    raise exception 'Access denied: admin only';
  end if;
  
  -- Ritorna email da auth.users (solo per admin)
  return query
  select 
    au.id as user_id,
    au.email,
    au.created_at
  from auth.users au
  order by au.created_at desc;
end;
$$;

-- Commento per documentazione
comment on function get_user_emails_for_admin() is 'RPC function per ottenere email utenti. Solo admin.';

