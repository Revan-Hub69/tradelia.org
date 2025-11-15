-- ============================================
-- FIX: RLS Policy analysis_requests
-- ============================================
-- Permette a tutti gli utenti autenticati di creare richieste
-- I limiti vengono applicati lato backend (crediti, rate limiting)
-- ============================================
-- Esegui questo script in Supabase Dashboard → SQL Editor
-- ============================================

-- Rimuovi policy vecchia (solo institutional)
drop policy if exists "Institutional users can create requests" on public.analysis_requests;

-- Nuova policy: Tutti gli utenti autenticati possono creare richieste
-- I limiti (crediti, rate limiting) vengono applicati lato backend
create policy "Authenticated users can create requests"
  on public.analysis_requests for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
  );

-- Verifica policy
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where tablename = 'analysis_requests'
order by policyname;

-- ============================================
-- NOTA: Le altre policy rimangono invariate
-- ============================================
-- - "Users view own requests" - Utenti vedono solo le proprie richieste ✅
-- - "Users update own pending requests" - Utenti aggiornano solo pending ✅
-- - "Admins manage all requests" - Admins gestiscono tutto ✅
-- - "Service role manages requests" - Service role per webhook ✅

