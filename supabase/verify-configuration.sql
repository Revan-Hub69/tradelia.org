-- ============================================
-- VERIFICA CONFIGURAZIONE COMPLETA SUPABASE
-- ============================================
-- Questo script verifica che tutto sia configurato CORRETTAMENTE
-- Non solo se le tabelle esistono, ma anche struttura, RLS, dati
-- ============================================

-- ===== 1. VERIFICA STRUTTURA TABELLE =====
-- Verifica che le colonne essenziali esistano

-- dashboard_access_tokens
SELECT 
  '🔍 STRUTTURA: dashboard_access_tokens' as verifica,
  column_name as colonna,
  data_type as tipo,
  is_nullable as nullable,
  CASE 
    WHEN column_name IN ('id', 'token_hash', 'plan_role', 'valid_until', 'revoked') 
    THEN '✅ CRITICA'
    ELSE 'ℹ️ Opzionale'
  END as importanza
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'dashboard_access_tokens'
ORDER BY ordinal_position;

-- user_roles
SELECT 
  '🔍 STRUTTURA: user_roles' as verifica,
  column_name as colonna,
  data_type as tipo,
  is_nullable as nullable,
  CASE 
    WHEN column_name IN ('email', 'role', 'valid_until') 
    THEN '✅ CRITICA'
    ELSE 'ℹ️ Opzionale'
  END as importanza
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- education_modules (se esiste)
SELECT 
  '🔍 STRUTTURA: education_modules' as verifica,
  column_name as colonna,
  data_type as tipo,
  is_nullable as nullable,
  CASE 
    WHEN column_name IN ('id', 'title', 'slug', 'is_active', 'order_index') 
    THEN '✅ CRITICA'
    ELSE 'ℹ️ Opzionale'
  END as importanza
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'education_modules'
ORDER BY ordinal_position;

-- ===== 2. VERIFICA RLS POLICIES DETTAGLIATE =====
-- Verifica che le policy RLS siano configurate correttamente

SELECT 
  '🔒 RLS POLICY DETTAGLI' as verifica,
  schemaname || '.' || tablename as tabella,
  policyname as policy,
  permissive as tipo,
  roles as ruoli,
  cmd as comando,
  qual as condizione
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'dashboard_access_tokens',
    'user_roles',
    'education_modules',
    'education_user_progress',
    'asset_proposals',
    'asset_votes'
  )
ORDER BY tablename, policyname;

-- ===== 3. VERIFICA FOREIGN KEYS =====
-- Verifica che le relazioni tra tabelle siano corrette

SELECT 
  '🔗 FOREIGN KEYS' as verifica,
  tc.table_name as tabella,
  kcu.column_name as colonna,
  ccu.table_name AS tabella_riferita,
  ccu.column_name AS colonna_riferita,
  tc.constraint_name as constraint
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
    'education_lessons',
    'education_user_progress',
    'education_tests',
    'education_user_test_attempts',
    'asset_votes'
  )
ORDER BY tc.table_name, kcu.column_name;

-- ===== 4. VERIFICA INDICI CRITICI =====
-- Verifica che gli indici necessari per performance esistano

SELECT 
  '📇 INDICI CRITICI' as verifica,
  tablename as tabella,
  indexname as indice,
  CASE 
    WHEN indexname LIKE '%_pkey' THEN '✅ PRIMARY KEY'
    WHEN indexname LIKE '%_idx' OR indexname LIKE 'idx_%' THEN '✅ INDEX'
    ELSE 'ℹ️ Altro'
  END as tipo,
  indexdef as definizione
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'dashboard_access_tokens',
    'user_roles',
    'education_modules',
    'education_user_progress',
    'asset_proposals',
    'asset_votes'
  )
ORDER BY tablename, indexname;

-- ===== 5. VERIFICA DATI E CONFIGURAZIONE =====
-- Conta record e verifica configurazione

-- Token attivi
SELECT 
  '📊 CONFIG: Token Attivi' as verifica,
  COUNT(*)::text as totale,
  COUNT(CASE WHEN revoked = false AND (valid_until IS NULL OR valid_until > NOW()) THEN 1 END)::text as attivi,
  COUNT(CASE WHEN revoked = true THEN 1 END)::text as revocati,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ CONFIGURATO'
    ELSE '⚠️ NESSUN TOKEN (normale se nuovo setup)'
  END as status
FROM dashboard_access_tokens;

-- Ruoli utente
SELECT 
  '📊 CONFIG: Ruoli Utente' as verifica,
  COUNT(*)::text as totale,
  COUNT(DISTINCT role)::text as ruoli_diversi,
  string_agg(DISTINCT role, ', ') as ruoli_presenti,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ CONFIGURATO'
    ELSE '⚠️ NESSUN RUOLO (normale se non ci sono utenti)'
  END as status
FROM user_roles;

-- Moduli educativi (se esiste)
DO $$
DECLARE
  moduli_totali INTEGER := 0;
  moduli_attivi INTEGER := 0;
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'education_modules'
  ) INTO table_exists;
  
  IF table_exists THEN
    EXECUTE 'SELECT COUNT(*) FROM education_modules' INTO moduli_totali;
    EXECUTE 'SELECT COUNT(*) FROM education_modules WHERE is_active = true' INTO moduli_attivi;
    
    RAISE NOTICE '📊 CONFIG: Moduli Educativi - Totali: % - Attivi: % - Status: %', 
      moduli_totali,
      moduli_attivi,
      CASE 
        WHEN moduli_attivi > 0 THEN '✅ CONFIGURATO'
        WHEN moduli_totali > 0 THEN '⚠️ NESSUN MODULO ATTIVO'
        ELSE '⚠️ NESSUN MODULO'
      END;
  ELSE
    RAISE NOTICE '📊 CONFIG: Moduli Educativi - Tabella NON ESISTE - Esegui add-education-system-schema.sql';
  END IF;
END $$;

-- ===== 6. VERIFICA CONSTRAINTS E VALIDAZIONI =====
-- Verifica che i check constraints siano configurati

SELECT 
  '✅ CONSTRAINTS: Check' as verifica,
  tc.table_name as tabella,
  tc.constraint_name as constraint,
  cc.check_clause as validazione
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'CHECK'
  AND tc.table_name IN (
    'dashboard_access_tokens',
    'user_roles',
    'education_modules'
  )
ORDER BY tc.table_name, tc.constraint_name;

-- ===== 7. VERIFICA TRIGGER FUNZIONANTI =====
-- Verifica che i trigger siano attivi

SELECT 
  '🔄 TRIGGER: Stato' as verifica,
  event_object_table as tabella,
  trigger_name as trigger,
  action_timing as quando,
  event_manipulation as evento,
  action_statement as azione,
  CASE 
    WHEN trigger_name IS NOT NULL THEN '✅ ATTIVO'
    ELSE '❌ MANCANTE'
  END as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN (
    'dashboard_access_tokens',
    'user_roles',
    'education_modules'
  )
ORDER BY event_object_table, trigger_name;

-- ===== 8. VERIFICA SEQUENZE =====
-- Verifica che le sequenze per ID auto-increment siano configurate

SELECT 
  '🔢 SEQUENZE' as verifica,
  sequence_name as sequenza,
  last_value as ultimo_valore,
  CASE 
    WHEN sequence_name IS NOT NULL THEN '✅ CONFIGURATA'
    ELSE '⚠️ NON TROVATA'
  END as status
FROM information_schema.sequences
WHERE sequence_schema = 'public'
  AND sequence_name LIKE '%_id_seq'
ORDER BY sequence_name;

-- ===== 9. RIEPILOGO CONFIGURAZIONE =====
-- Riepilogo completo dello stato

SELECT 
  '📋 RIEPILOGO CONFIGURAZIONE' as verifica,
  'Tabelle critiche' as categoria,
  COUNT(*)::text as esistenti,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✅ TUTTE PRESENTI'
    ELSE '❌ MANCANO ' || (10 - COUNT(*))::text
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

-- RLS attivo
SELECT 
  '📋 RIEPILOGO CONFIGURAZIONE' as verifica,
  'RLS Policies' as categoria,
  COUNT(*)::text as tabelle_con_rls,
  CASE 
    WHEN COUNT(*) >= 6 THEN '✅ RLS ATTIVO'
    ELSE '⚠️ ALCUNE TABELLE SENZA RLS'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
  AND tablename IN (
    'dashboard_access_tokens',
    'user_roles',
    'education_modules',
    'education_user_progress',
    'asset_proposals',
    'asset_votes'
  );

-- ===== 10. CHECKLIST FINALE =====
-- Checklist per verificare manualmente

SELECT 
  '✅ CHECKLIST MANUALE' as verifica,
  '1. Supabase Auth > Settings > Email templates configurati' as item,
  'Verifica in Dashboard' as dove
UNION ALL
SELECT 
  '✅ CHECKLIST MANUALE',
  '2. Supabase Auth > Settings > SMTP configurato (se usi email custom)',
  'Verifica in Dashboard'
UNION ALL
SELECT 
  '✅ CHECKLIST MANUALE',
  '3. Supabase Auth > Settings > Email verification enabled/disabled',
  'Verifica in Dashboard'
UNION ALL
SELECT 
  '✅ CHECKLIST MANUALE',
  '4. Storage buckets creati (se usi file storage)',
  'Verifica in Storage'
UNION ALL
SELECT 
  '✅ CHECKLIST MANUALE',
  '5. Environment variables configurate su Vercel',
  'SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY';
