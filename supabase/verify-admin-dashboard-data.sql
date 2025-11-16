-- ============================================
-- VERIFICA DATI PER ADMIN DASHBOARD
-- ============================================
-- Esegui questo script in Supabase Dashboard → SQL Editor
-- Verifica che i dati siano presenti e accessibili
-- ============================================

-- 1. Verifica struttura user_roles (controlla colonne esistenti)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- 2. Verifica se email esiste in user_roles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_roles' 
      AND column_name = 'email'
  ) THEN
    RAISE NOTICE 'Colonna email trovata in user_roles';
  ELSE
    RAISE NOTICE 'Colonna email NON trovata - esegui add-email-to-user-roles.sql';
  END IF;
END $$;

-- 3. Mostra tutti i user_roles (usa solo colonne base)
SELECT 
  user_id,
  role,
  valid_until
FROM public.user_roles
ORDER BY role, user_id
LIMIT 20;

-- 4. Verifica dashboard_access_tokens
SELECT 
  COUNT(*) as total_tokens,
  COUNT(*) FILTER (WHERE revoked = false) as active_tokens,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(*) FILTER (WHERE email IS NOT NULL) as tokens_with_email
FROM public.dashboard_access_tokens;

-- 5. Mostra tutti i token attivi
SELECT 
  email,
  plan_role,
  valid_until,
  revoked,
  source
FROM public.dashboard_access_tokens
WHERE revoked = false
ORDER BY valid_until DESC
LIMIT 20;

-- 6. Verifica subscribers
SELECT 
  COUNT(*) as total_subscribers,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(*) FILTER (WHERE status = 'active') as active_subscribers
FROM public.subscribers;

-- 7. Mostra tutti i subscribers
SELECT 
  email,
  status,
  auth_user_id,
  subscription_id
FROM public.subscribers
ORDER BY email
LIMIT 20;

-- 8. Verifica user_profiles
SELECT 
  COUNT(*) as total_profiles,
  COUNT(DISTINCT user_id) as unique_user_ids
FROM public.user_profiles;

-- 9. Verifica admin_emails
SELECT 
  COUNT(*) as total_admin_emails,
  string_agg(email, ', ') as admin_emails_list
FROM public.admin_emails;

-- 10. JOIN: Verifica utenti con ruolo "pro" (se email esiste in user_roles)
-- Questo query funziona solo DOPO aver aggiunto la colonna email
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_roles' 
      AND column_name = 'email'
  ) THEN
    RAISE NOTICE 'Eseguendo JOIN con email...';
  ELSE
    RAISE NOTICE 'Skipping JOIN - email non esiste ancora';
  END IF;
END $$;
