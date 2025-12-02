-- Verification Script
-- Verifica che tutte le tabelle necessarie siano state create correttamente
-- Version: 003
-- Date: 2025-01-27
--
-- Run this AFTER migrations 001 and 002 to verify everything is correct

-- Check required tables
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as user_roles,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_emails') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as admin_emails,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pdf_customizations') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as pdf_customizations,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'asset_proposals') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as asset_proposals,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'asset_votes') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as asset_votes,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schema_migrations') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as schema_migrations;

-- Count total tables (should be 6 or more if you have other tables)
SELECT 
  COUNT(*) as total_tables,
  CASE 
    WHEN COUNT(*) <= 10 THEN '✅ Clean database'
    WHEN COUNT(*) <= 20 THEN '⚠️  Some extra tables'
    ELSE '⚠️  Many tables - consider cleanup'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';

-- List all current tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

