-- ============================================
-- FIX: Errore 500 durante Signup
-- ============================================
-- Esegui questo script in Supabase Dashboard → SQL Editor
-- Questo script verifica e risolve problemi comuni che causano errore 500
-- ============================================

-- ===== STEP 1: Verifica che le tabelle esistano =====
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles') THEN
    RAISE NOTICE 'Tabella user_profiles non esiste - creala con setup-complete-schema.sql';
  ELSE
    RAISE NOTICE 'Tabella user_profiles esiste ✓';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
    RAISE NOTICE 'Tabella user_roles non esiste - creala con setup-complete-schema.sql';
  ELSE
    RAISE NOTICE 'Tabella user_roles esiste ✓';
  END IF;
END $$;

-- ===== STEP 2: Verifica RLS Policies =====
-- Verifica che ci siano policy per INSERT durante signup
SELECT 
  'user_profiles' as table_name,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'user_profiles'
  AND cmd = 'INSERT'
UNION ALL
SELECT 
  'user_roles' as table_name,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'user_roles'
  AND cmd = 'INSERT';

-- Se non ci sono policy INSERT, creale:
DO $$
BEGIN
  -- Policy per user_profiles INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Users can insert own profile during signup'
  ) THEN
    CREATE POLICY "Users can insert own profile during signup"
      ON public.user_profiles FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    RAISE NOTICE 'Policy INSERT creata per user_profiles ✓';
  END IF;
  
  -- Policy per user_roles INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname = 'Users can insert own role during signup'
  ) THEN
    CREATE POLICY "Users can insert own role during signup"
      ON public.user_roles FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    RAISE NOTICE 'Policy INSERT creata per user_roles ✓';
  END IF;
END $$;

-- ===== STEP 3: Verifica constraint user_roles =====
-- Verifica che 'guest' sia nel constraint
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'public'
  AND constraint_name LIKE '%user_roles%role%';

-- Se 'guest' non è nel constraint, aggiornalo:
DO $$
BEGIN
  -- Verifica se il constraint esiste e include 'guest'
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_schema = 'public'
    AND constraint_name LIKE '%user_roles%role%'
    AND check_clause NOT LIKE '%guest%'
  ) THEN
    ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
      CHECK (role IN ('guest', 'trial', 'pro', 'institutional'));
    RAISE NOTICE 'Constraint aggiornato per includere guest ✓';
  END IF;
END $$;

-- ===== STEP 4: Verifica che valid_until esista =====
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles' 
    AND column_name = 'valid_until'
  ) THEN
    ALTER TABLE public.user_roles ADD COLUMN valid_until timestamptz;
    RAISE NOTICE 'Colonna valid_until aggiunta a user_roles ✓';
  ELSE
    RAISE NOTICE 'Colonna valid_until esiste già ✓';
  END IF;
END $$;

-- ===== STEP 5: Verifica trigger problematici =====
-- Lista tutti i trigger su auth.users
SELECT 
  'Trigger su auth.users' as info,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- Se ci sono trigger che potrebbero causare problemi, disabilitali temporaneamente
-- (Sostituisci 'nome_trigger' con il nome reale se necessario)
-- ALTER TABLE auth.users DISABLE TRIGGER nome_trigger;

-- ===== STEP 6: Verifica funzioni che potrebbero fallire =====
-- Lista funzioni che potrebbero essere chiamate durante signup
SELECT 
  'Funzioni auth' as info,
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'auth'
  AND (routine_name LIKE '%user%' OR routine_name LIKE '%signup%')
ORDER BY routine_name;

-- ===== MESSAGGIO FINALE =====
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICA COMPLETATA';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Se l''errore 500 persiste:';
  RAISE NOTICE '1. Disabilita email verification in Supabase Dashboard → Auth → Settings';
  RAISE NOTICE '2. Verifica configurazione SMTP in Supabase Dashboard → Settings → Auth → SMTP';
  RAISE NOTICE '3. Controlla Logs → Postgres Logs per errori specifici';
  RAISE NOTICE '========================================';
END $$;

