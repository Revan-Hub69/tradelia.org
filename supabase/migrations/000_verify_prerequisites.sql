-- Prerequisites Verification
-- Run this BEFORE other migrations to check if tables already exist
-- Version: 000
-- Date: 2025-01-27
--
-- This is a read-only check script - safe to run anytime

-- Check if user_roles table exists (required for migration 002)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles'
  ) THEN
    RAISE NOTICE '✅ Table user_roles exists - migration 001 already applied or partially applied';
  ELSE
    RAISE NOTICE '⚠️  Table user_roles does NOT exist - you MUST run 001_initial_schema.sql first';
  END IF;
END $$;

-- List all existing tables that will be created by migrations
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
  END as asset_votes;

