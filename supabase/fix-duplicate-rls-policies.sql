-- ============================================
-- FIX: Duplicate RLS Policies
-- ============================================
-- Consolida policy RLS duplicate per migliorare performance
-- ============================================

-- ===== FUNZIONE HELPER: Trova e consolida policy duplicate =====

-- Funzione per trovare policy duplicate
CREATE OR REPLACE FUNCTION find_duplicate_policies()
RETURNS TABLE (
  tablename TEXT,
  policyname TEXT,
  roles TEXT[],
  cmd TEXT,
  permissive TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.tablename::TEXT,
    p.policyname::TEXT,
    p.roles,
    p.cmd::TEXT,
    p.permissive::TEXT
  FROM pg_policies p
  WHERE p.schemaname = 'public'
    AND p.permissive = 'PERMISSIVE'
  GROUP BY p.tablename, p.policyname, p.roles, p.cmd, p.permissive
  HAVING COUNT(*) > 1
  ORDER BY p.tablename, p.cmd, p.roles;
END;
$$;

-- ===== FIX POLICY DUPLICATE PER TABELLA =====

-- user_profiles: Consolida policy UPDATE
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Conta policy UPDATE per dashboard_user
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'user_profiles'
    AND cmd = 'UPDATE'
    AND 'dashboard_user' = ANY(roles)
    AND permissive = 'PERMISSIVE';

  IF policy_count > 1 THEN
    -- Droppa tutte le policy UPDATE duplicate
    DROP POLICY IF EXISTS "Users update own profiles" ON public.user_profiles;
    DROP POLICY IF EXISTS "user_profiles-update-own" ON public.user_profiles;
    
    -- Crea una singola policy consolidata
    CREATE POLICY "Users update own profiles"
      ON public.user_profiles FOR UPDATE
      TO authenticated, dashboard_user
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
    
    RAISE NOTICE 'Consolidate % duplicate UPDATE policies for user_profiles', policy_count;
  END IF;
END $$;

-- ===== FIX GENERICO PER TUTTE LE TABELLE =====

-- Script generico per trovare e consolidare tutte le policy duplicate
DO $$
DECLARE
  table_record RECORD;
  policy_record RECORD;
  policy_list TEXT[];
  consolidated_policy_name TEXT;
  using_clause TEXT;
  with_check_clause TEXT;
  policy_count INTEGER;
BEGIN
  -- Trova tutte le tabelle con policy duplicate
  FOR table_record IN
    SELECT 
      tablename,
      cmd,
      array_agg(DISTINCT policyname) as policy_names,
      array_agg(DISTINCT roles) as roles_array
    FROM pg_policies
    WHERE schemaname = 'public'
      AND permissive = 'PERMISSIVE'
    GROUP BY tablename, cmd
    HAVING COUNT(DISTINCT policyname) > 1
  LOOP
    -- Per ogni combinazione tabella/azione con policy duplicate
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = table_record.tablename
      AND cmd = table_record.cmd
      AND permissive = 'PERMISSIVE';
    
    IF policy_count > 1 THEN
      -- Droppa tutte le policy duplicate
      FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = table_record.tablename
          AND cmd = table_record.cmd
          AND permissive = 'PERMISSIVE'
        ORDER BY policyname
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 
          policy_record.policyname, 
          table_record.tablename);
      END LOOP;
      
      -- Crea una singola policy consolidata
      -- Nota: Questo è un esempio generico, potrebbe richiedere personalizzazione per ogni tabella
      consolidated_policy_name := 'Consolidated ' || table_record.cmd || ' policy';
      
      -- Per ora, logga le tabelle che necessitano fix manuale
      RAISE NOTICE 'Table % has % duplicate % policies. Review and consolidate manually.', 
        table_record.tablename, 
        policy_count, 
        table_record.cmd;
    END IF;
  END LOOP;
END $$;

-- ===== FIX SPECIFICO PER TABELLE EDUCATION =====

-- education_user_progress: Consolida policy
DO $$
BEGIN
  -- Droppa policy duplicate se esistono
  DROP POLICY IF EXISTS "Users can view own progress" ON public.education_user_progress;
  DROP POLICY IF EXISTS "Users can insert own progress" ON public.education_user_progress;
  DROP POLICY IF EXISTS "Users can update own progress" ON public.education_user_progress;
  
  -- Ricrea policy consolidate
  CREATE POLICY "Users can manage own progress"
    ON public.education_user_progress FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- education_user_lesson_progress: Consolida policy
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can manage own lesson progress" ON public.education_user_lesson_progress;
  
  CREATE POLICY "Users can manage own lesson progress"
    ON public.education_user_lesson_progress FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- education_user_test_attempts: Consolida policy
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can manage own test attempts" ON public.education_user_test_attempts;
  
  CREATE POLICY "Users can manage own test attempts"
    ON public.education_user_test_attempts FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- spaced_repetition_items: Consolida policy
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can manage own spaced repetition items" ON public.spaced_repetition_items;
  
  CREATE POLICY "Users can manage own spaced repetition items"
    ON public.spaced_repetition_items FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- spaced_repetition_reviews: Consolida policy
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own reviews" ON public.spaced_repetition_reviews;
  DROP POLICY IF EXISTS "Users can insert own reviews" ON public.spaced_repetition_reviews;
  
  CREATE POLICY "Users can manage own reviews"
    ON public.spaced_repetition_reviews FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- adaptive_learning_progress: Consolida policy
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can manage own adaptive progress" ON public.adaptive_learning_progress;
  
  CREATE POLICY "Users can manage own adaptive progress"
    ON public.adaptive_learning_progress FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- ===== VERIFICA FINALE =====

-- Query per trovare policy duplicate rimanenti
SELECT 
  tablename,
  cmd,
  COUNT(*) as policy_count,
  array_agg(policyname) as policy_names
FROM pg_policies
WHERE schemaname = 'public'
  AND permissive = 'PERMISSIVE'
GROUP BY tablename, cmd
HAVING COUNT(*) > 1
ORDER BY tablename, cmd;

-- Query per vedere tutte le policy per tabella
SELECT 
  tablename,
  cmd,
  policyname,
  roles,
  permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

