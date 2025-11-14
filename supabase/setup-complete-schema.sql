-- ============================================
-- SETUP COMPLETO SCHEMA TRADELIA
-- ============================================
-- Esegui questo script in Supabase Dashboard → SQL Editor
-- Questo script crea/aggiorna tutte le tabelle necessarie per il sistema
-- ============================================

-- ===== ESTENSIONI =====
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS moddatetime;

-- ===== TABELLA USER_PROFILES =====
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  bio text,
  preferences jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger per updated_at
DROP TRIGGER IF EXISTS user_profiles_set_timestamp ON public.user_profiles;
CREATE TRIGGER user_profiles_set_timestamp
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

-- ===== TABELLA USER_ROLES =====
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz
);

-- Aggiungi valid_until se non esiste
ALTER TABLE public.user_roles 
  ADD COLUMN IF NOT EXISTS valid_until timestamptz;

-- Aggiorna constraint per includere 'guest'
ALTER TABLE public.user_roles 
  DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles 
  ADD CONSTRAINT user_roles_role_check 
  CHECK (role IN ('guest', 'trial', 'pro', 'institutional'));

-- Indice per valid_until
CREATE INDEX IF NOT EXISTS idx_user_roles_valid_until 
  ON public.user_roles(valid_until) 
  WHERE valid_until IS NOT NULL;

-- ===== TABELLA ADMIN_USERS =====
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== ROW LEVEL SECURITY =====
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ===== RLS POLICIES USER_PROFILES =====
-- Rimuovi policy esistenti
DROP POLICY IF EXISTS "Users manage own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins manage profiles" ON public.user_profiles;

-- Policy: Utenti possono gestire il proprio profilo (SELECT, INSERT, UPDATE)
CREATE POLICY "Users manage own profile"
  ON public.user_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admin possono gestire tutti i profili
CREATE POLICY "Admins manage profiles"
  ON public.user_profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()));

-- Policy: Service role può gestire tutto
CREATE POLICY "Service role manages profiles"
  ON public.user_profiles FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ===== RLS POLICIES USER_ROLES =====
-- Rimuovi policy esistenti
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role during signup" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage user roles" ON public.user_roles;

-- Policy: Utenti possono leggere il proprio ruolo
CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Utenti possono inserire il proprio ruolo durante signup
CREATE POLICY "Users can insert own role during signup"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admin possono gestire tutti i ruoli
CREATE POLICY "Admins manage user roles"
  ON public.user_roles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()));

-- Policy: Service role può gestire tutto
CREATE POLICY "Service role manages user roles"
  ON public.user_roles FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ===== RLS POLICIES ADMIN_USERS =====
DROP POLICY IF EXISTS "Admins can read admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Service role can manage admin_users" ON public.admin_users;

CREATE POLICY "Admins can read admin_users"
  ON public.admin_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages admin_users"
  ON public.admin_users FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ===== VERIFICA FINALE =====
-- Esegui questa query per verificare che tutto sia a posto:
SELECT 
  'user_profiles' as table_name,
  COUNT(*) as policy_count,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_profiles') as column_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'user_profiles'
UNION ALL
SELECT 
  'user_roles' as table_name,
  COUNT(*) as policy_count,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_roles') as column_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'user_roles'
UNION ALL
SELECT 
  'admin_users' as table_name,
  COUNT(*) as policy_count,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admin_users') as column_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'admin_users';

-- Verifica constraint user_roles
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'public'
  AND constraint_name LIKE '%user_roles%role%';

-- Dovresti vedere:
-- user_profiles: 3 policies, 6 columns
-- user_roles: 4 policies, 4 columns (user_id, role, assigned_at, valid_until)
-- admin_users: 2 policies, 2 columns
-- Constraint user_roles_role_check con ('guest', 'trial', 'pro', 'institutional')

