-- ============================================
-- VERIFICA SCHEMA SUPABASE - Tradelia
-- ============================================
-- Esegui questo script in Supabase Dashboard → SQL Editor
-- per verificare che tutte le tabelle siano allineate
-- ============================================

-- Verifica esistenza tabelle principali
SELECT 
  'Tabelle principali' as categoria,
  table_name,
  CASE 
    WHEN table_name IN (
      'admin_users',
      'user_roles', 
      'user_profiles',
      'reports',
      'report_modules',
      'report_comments'
    ) THEN '✅'
    ELSE '⚠️'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'admin_users',
    'user_roles',
    'user_profiles',
    'reports',
    'report_modules',
    'report_comments'
  )
ORDER BY table_name;

-- Verifica tabelle User Area
SELECT 
  'User Area' as categoria,
  table_name,
  CASE 
    WHEN table_name IN (
      'asset_proposals',
      'asset_votes',
      'desk_public_links',
      'user_analysis_credits',
      'analysis_requests'
    ) THEN '✅'
    ELSE '⚠️'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'asset_proposals',
    'asset_votes',
    'desk_public_links',
    'user_analysis_credits',
    'analysis_requests'
  )
ORDER BY table_name;

-- Verifica colonne user_analysis_credits
SELECT 
  'Colonne user_analysis_credits' as categoria,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_analysis_credits'
ORDER BY ordinal_position;

-- Verifica colonne analysis_requests (se esiste)
SELECT 
  'Colonne analysis_requests' as categoria,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'analysis_requests'
ORDER BY ordinal_position;

-- Verifica RLS (Row Level Security) abilitato
SELECT 
  'RLS Status' as categoria,
  tablename as table_name,
  CASE 
    WHEN rowsecurity THEN '✅ Abilitato'
    ELSE '❌ Disabilitato'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'asset_proposals',
    'asset_votes',
    'desk_public_links',
    'user_analysis_credits',
    'analysis_requests'
  )
ORDER BY tablename;

-- Verifica trigger
SELECT 
  'Trigger' as categoria,
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN (
    'asset_proposals',
    'asset_votes',
    'desk_public_links',
    'user_analysis_credits',
    'analysis_requests'
  )
ORDER BY event_object_table, trigger_name;

-- Verifica indici
SELECT 
  'Indici' as categoria,
  tablename as table_name,
  indexname as index_name,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'asset_proposals',
    'asset_votes',
    'desk_public_links',
    'user_analysis_credits',
    'analysis_requests'
  )
ORDER BY tablename, indexname;

-- Riepilogo: conta record per tabella
SELECT 
  'Record count' as categoria,
  'asset_proposals' as table_name,
  COUNT(*)::text as count
FROM public.asset_proposals
UNION ALL
SELECT 
  'Record count',
  'asset_votes',
  COUNT(*)::text
FROM public.asset_votes
UNION ALL
SELECT 
  'Record count',
  'desk_public_links',
  COUNT(*)::text
FROM public.desk_public_links
UNION ALL
SELECT 
  'Record count',
  'user_analysis_credits',
  COUNT(*)::text
FROM public.user_analysis_credits
UNION ALL
SELECT 
  'Record count',
  'analysis_requests',
  COUNT(*)::text
FROM public.analysis_requests
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'analysis_requests'
);

