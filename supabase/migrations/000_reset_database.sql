-- Database Reset Script
-- ⚠️ ATTENZIONE: Questo script ELIMINA tutte le tabelle pubbliche!
-- Usa SOLO per reset completo del database
-- Version: 000
-- Date: 2025-01-27
--
-- IMPORTANT: Questo script è DESTRUCTIVE - eseguire solo se necessario
-- Backup del database PRIMA di eseguire questo script!

-- Set search_path for security
SET search_path = public;

-- Disabilita RLS temporaneamente per cleanup
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Disabilita RLS su tutte le tabelle
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', r.tablename);
    END LOOP;
END
$$;

-- Elimina tutte le tabelle pubbliche (eccetto auth.*)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
    ) LOOP
        EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', r.tablename);
        RAISE NOTICE 'Dropped table: %', r.tablename;
    END LOOP;
END
$$;

-- Elimina tutte le viste
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I CASCADE', r.viewname);
        RAISE NOTICE 'Dropped view: %', r.viewname;
    END LOOP;
END
$$;

-- Elimina tutte le funzioni pubbliche (eccetto quelle di sistema)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT proname, oidvectortypes(proargtypes) as args
        FROM pg_proc
        WHERE pronamespace = 'public'::regnamespace
        AND proname NOT LIKE 'pg_%'
    ) LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I(%s) CASCADE', r.proname, r.args);
        RAISE NOTICE 'Dropped function: %(%)', r.proname, r.args;
    END LOOP;
END
$$;

-- Elimina tutte le sequenze (eccetto quelle di sistema)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS %I CASCADE', r.sequencename);
        RAISE NOTICE 'Dropped sequence: %', r.sequencename;
    END LOOP;
END
$$;

-- Elimina tutti i tipi custom (eccetto quelli di sistema)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT typname 
        FROM pg_type 
        WHERE typnamespace = 'public'::regnamespace
        AND typname NOT LIKE 'pg_%'
        AND typtype = 'c' -- composite types
    ) LOOP
        EXECUTE format('DROP TYPE IF EXISTS %I CASCADE', r.typname);
        RAISE NOTICE 'Dropped type: %', r.typname;
    END LOOP;
END
$$;

-- Verifica cleanup
SELECT 
    COUNT(*) as remaining_tables,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Database completamente pulito'
        ELSE '⚠️  Rimangono ' || COUNT(*) || ' tabelle'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%';

-- Lista eventuali tabelle rimanenti
SELECT 
    tablename as remaining_table
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;

