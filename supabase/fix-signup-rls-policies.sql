-- ============================================
-- FIX: RLS Policies per permettere signup
-- ============================================
-- Esegui questo script in Supabase Dashboard → SQL Editor
-- Questo script aggiunge le policy necessarie per permettere
-- agli utenti di creare il proprio profilo e ruolo durante signup
-- ============================================

-- ===== FIX USER_PROFILES: Permetti INSERT durante signup =====
-- La policy esistente "Users manage own profile" dovrebbe già permettere INSERT
-- ma verifichiamo che esista e sia corretta

-- Rimuovi policy esistente se c'è un problema
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON public.user_profiles;

-- Aggiungi policy esplicita per INSERT durante signup
CREATE POLICY "Users can insert own profile during signup"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Verifica che la policy "Users manage own profile" permetta INSERT
-- Se non esiste, creala
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Users manage own profile'
  ) THEN
    CREATE POLICY "Users manage own profile"
      ON public.user_profiles FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ===== FIX USER_ROLES: Permetti INSERT durante signup =====
-- Il problema è che le policy esistenti richiedono admin o service_role
-- Dobbiamo permettere agli utenti di inserire il proprio ruolo durante signup

-- Rimuovi policy esistenti che bloccano INSERT per utenti normali
DROP POLICY IF EXISTS "Users can insert own role during signup" ON public.user_roles;

-- Aggiungi policy per permettere INSERT durante signup
CREATE POLICY "Users can insert own role during signup"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Verifica che la policy "Users can read own role" esista
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname = 'Users can read own role'
  ) THEN
    CREATE POLICY "Users can read own role"
      ON public.user_roles FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ===== VERIFICA CHE LE TABELLE ESISTANO =====
-- Se le tabelle non esistono, creale

-- Crea user_profiles se non esiste
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  bio text,
  preferences jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Crea user_roles se non esiste
-- NOTA: Assicurati che il ruolo 'guest' sia nel CHECK constraint
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('guest', 'trial', 'pro', 'institutional')),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz
);

-- Se la tabella esiste ma il constraint non include 'guest', aggiornalo
DO $$
BEGIN
  -- Verifica se il constraint esiste e non include 'guest'
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
    WHERE tc.table_schema = 'public'
    AND tc.table_name = 'user_roles'
    AND tc.constraint_type = 'CHECK'
    AND cc.check_clause NOT LIKE '%guest%'
  ) THEN
    -- Rimuovi constraint vecchio
    ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
    -- Aggiungi constraint nuovo con 'guest'
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
      CHECK (role IN ('guest', 'trial', 'pro', 'institutional'));
  END IF;
END $$;

-- Abilita RLS se non già abilitato
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ===== CREA TRIGGER UPDATED_AT SE NON ESISTE =====
CREATE EXTENSION IF NOT EXISTS moddatetime;

DROP TRIGGER IF EXISTS user_profiles_set_timestamp ON public.user_profiles;
CREATE TRIGGER user_profiles_set_timestamp
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

-- ===== VERIFICA FINALE =====
-- Esegui questa query per verificare che tutto sia a posto:
SELECT 
  'user_profiles' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'user_profiles'
UNION ALL
SELECT 
  'user_roles' as table_name,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'user_roles';

-- Dovresti vedere almeno 2-3 policy per user_profiles e 2-3 per user_roles

