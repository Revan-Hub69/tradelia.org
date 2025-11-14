-- ============================================
-- VERIFICA TRIGGER SU auth.users
-- ============================================
-- Esegui questo script in Supabase Dashboard → SQL Editor
-- Verifica se ci sono trigger su auth.users che potrebbero causare errore 500
-- ============================================

-- Verifica trigger su auth.users
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement,
  action_orientation
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- Verifica funzioni che potrebbero essere chiamate da trigger
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'auth'
  AND routine_name LIKE '%user%'
ORDER BY routine_name;

-- Verifica se ci sono trigger su public.user_profiles che referenziano auth.users
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND (action_statement LIKE '%auth.users%' OR action_statement LIKE '%auth.uid%')
ORDER BY trigger_name;

-- Verifica se ci sono trigger su public.user_roles che referenziano auth.users
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN ('user_profiles', 'user_roles')
ORDER BY trigger_name;

-- ============================================
-- DISABILITA TRIGGER PROBLEMATICI (se necessario)
-- ============================================
-- Se trovi trigger che potrebbero causare problemi, disabilitali temporaneamente:

-- Esempio (sostituisci 'nome_trigger' con il nome reale):
-- ALTER TABLE auth.users DISABLE TRIGGER nome_trigger;

-- ============================================
-- VERIFICA CONFIGURAZIONE SMTP
-- ============================================
-- L'errore 500 potrebbe essere causato da SMTP non configurato
-- Vai su Supabase Dashboard → Settings → Auth → SMTP Settings
-- Verifica che SMTP sia configurato OPPURE disabilita email verification

