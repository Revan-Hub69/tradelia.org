-- ============================================
-- VERIFICA COMPLETA SUPABASE - Tradelia
-- ============================================
-- Esegui questo script in Supabase Dashboard → SQL Editor
-- Verifica: tabelle, RLS, funzioni, dati, configurazione
-- ============================================

-- ===== 1. VERIFICA TABELLE RICHIESTE =====
SELECT 
  '📋 TABELLE RICHIESTE' as sezione,
  table_name as tabella,
  CASE 
    WHEN table_name IN (
      'dashboard_access_tokens',
      'dashboard_refresh_tokens',
      'user_roles',
      'education_modules',
      'education_lessons',
      'education_user_progress',
      'education_tests',
      'education_user_test_attempts',
      'asset_proposals',
      'asset_votes'
    ) THEN '✅ ESISTE'
    ELSE '❌ MANCANTE'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'dashboard_access_tokens',
    'dashboard_refresh_tokens',
    'user_roles',
    'education_modules',
    'education_lessons',
    'education_user_progress',
    'education_tests',
    'education_user_test_attempts',
    'asset_proposals',
    'asset_votes'
  )
ORDER BY table_name;

-- ===== 2. VERIFICA TABELLE OPZIONALI =====
SELECT 
  '📋 TABELLE OPZIONALI' as sezione,
  table_name as tabella,
  CASE 
    WHEN table_name IN (
      'subscribers',
      'admin_emails',
      'credits_log',
      'payments',
      'invoices'
    ) THEN '✅ ESISTE'
    ELSE '⚠️ NON TROVATA (opzionale)'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'subscribers',
    'admin_emails',
    'credits_log',
    'payments',
    'invoices'
  )
ORDER BY table_name;

-- ===== 3. VERIFICA RLS (Row Level Security) =====
SELECT 
  '🔒 RLS POLICIES' as sezione,
  schemaname || '.' || tablename as tabella,
  CASE 
    WHEN rowsecurity THEN '✅ RLS ATTIVO'
    ELSE '❌ RLS DISATTIVATO'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'dashboard_access_tokens',
    'user_roles',
    'education_modules',
    'education_user_progress',
    'asset_proposals',
    'asset_votes'
  )
ORDER BY tablename;

-- ===== 4. VERIFICA FUNZIONI DATABASE =====
SELECT 
  '⚙️ FUNZIONI DATABASE' as sezione,
  routine_name as funzione,
  routine_type as tipo,
  CASE 
    WHEN routine_name IN (
      'notify_analysis_completed',
      'get_user_emails'
    ) THEN '✅ ESISTE'
    ELSE '⚠️ NON TROVATA'
  END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'notify_analysis_completed',
    'get_user_emails'
  )
ORDER BY routine_name;

-- ===== 5. VERIFICA DATI ESEMPIO =====
-- Moduli educativi attivi (solo se la tabella esiste)
DO $$
DECLARE
  moduli_count INTEGER := 0;
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'education_modules'
  ) INTO table_exists;
  
  IF table_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM education_modules WHERE is_active = true' INTO moduli_count;
  END IF;
  
  RAISE NOTICE '📊 DATI: Moduli Educativi - Tabella: % - Moduli attivi: %', 
    CASE WHEN table_exists THEN 'ESISTE' ELSE 'NON ESISTE' END,
    moduli_count;
END $$;

-- Ruoli utente (solo se la tabella esiste)
DO $$
DECLARE
  ruoli_count INTEGER := 0;
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_roles'
  ) INTO table_exists;
  
  IF table_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM user_roles' INTO ruoli_count;
  END IF;
  
  RAISE NOTICE '📊 DATI: Ruoli Utente - Tabella: % - Ruoli totali: %', 
    CASE WHEN table_exists THEN 'ESISTE' ELSE 'NON ESISTE' END,
    ruoli_count;
END $$;

-- Token attivi (solo se la tabella esiste)
DO $$
DECLARE
  token_count INTEGER := 0;
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'dashboard_access_tokens'
  ) INTO table_exists;
  
  IF table_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM dashboard_access_tokens WHERE revoked = false AND (valid_until IS NULL OR valid_until > NOW())' INTO token_count;
  END IF;
  
  RAISE NOTICE '📊 DATI: Token Attivi - Tabella: % - Token attivi: %', 
    CASE WHEN table_exists THEN 'ESISTE' ELSE 'NON ESISTE' END,
    token_count;
END $$;

-- ===== 6. VERIFICA INDICI =====
-- Solo per tabelle che esistono
SELECT 
  '📇 INDICI' as sezione,
  tablename as tabella,
  indexname as indice,
  indexdef as definizione
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN (
        'dashboard_access_tokens',
        'education_modules',
        'education_user_progress',
        'asset_proposals'
      )
  )
ORDER BY tablename, indexname;

-- ===== 7. VERIFICA TRIGGER =====
-- Solo per tabelle che esistono
SELECT 
  '🔄 TRIGGER' as sezione,
  event_object_table as tabella,
  trigger_name as trigger,
  action_timing as timing,
  event_manipulation as evento
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN (
        'dashboard_access_tokens',
        'education_modules',
        'user_roles'
      )
  )
ORDER BY event_object_table, trigger_name;

-- ===== 8. VERIFICA CONSTRAINTS =====
-- Solo per tabelle che esistono
SELECT 
  '🔗 CONSTRAINTS' as sezione,
  table_name as tabella,
  constraint_name as constraint,
  constraint_type as tipo
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name IN (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN (
        'dashboard_access_tokens',
        'user_roles',
        'education_modules'
      )
  )
  AND constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'CHECK', 'UNIQUE')
ORDER BY table_name, constraint_type;

-- ===== 9. RIEPILOGO FINALE =====
SELECT 
  '📈 RIEPILOGO' as sezione,
  'Tabelle richieste' as categoria,
  COUNT(*)::text as totale,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✅ COMPLETE'
    ELSE '❌ MANCANO ' || (10 - COUNT(*))::text || ' TABELLE'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'dashboard_access_tokens',
    'dashboard_refresh_tokens',
    'user_roles',
    'education_modules',
    'education_lessons',
    'education_user_progress',
    'education_tests',
    'education_user_test_attempts',
    'asset_proposals',
    'asset_votes'
  );

-- ===== 10. VERIFICA CONFIGURAZIONE AUTH =====
-- Nota: Questa verifica richiede accesso admin
-- Verifica manualmente in Supabase Dashboard > Authentication > Settings:
-- - Email templates configurati
-- - SMTP settings (se usato)
-- - Email verification enabled/disabled

SELECT 
  '🔐 AUTH CONFIG' as sezione,
  'Verifica manuale richiesta' as nota,
  'Vai su Dashboard > Authentication > Settings' as istruzioni;
