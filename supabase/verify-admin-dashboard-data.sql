-- ============================================
-- VERIFICA DATI PER ADMIN DASHBOARD
-- ============================================
-- Esegui questo script in Supabase Dashboard → SQL Editor
-- Verifica che i dati siano presenti e accessibili
-- ============================================

-- 1. Verifica struttura user_roles (controlla se email esiste)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- 2. Verifica user_roles (se email esiste, altrimenti solo user_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_roles' 
      AND column_name = 'email'
  ) THEN
    -- Email esiste
    RAISE NOTICE 'Colonna email trovata in user_roles';
  ELSE
    -- Email non esiste
    RAISE NOTICE 'Colonna email NON trovata in user_roles - esegui add-email-to-user-roles.sql';
  END IF;
END $$;

-- 3. Mostra tutti i user_roles
SELECT 
  user_id,
  role,
  valid_until,
  created_at
FROM public.user_roles
ORDER BY created_at DESC
LIMIT 20;

-- 3. Verifica dashboard_access_tokens
SELECT 
  COUNT(*) as total_tokens,
  COUNT(*) FILTER (WHERE revoked = false) as active_tokens,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(*) FILTER (WHERE email IS NOT NULL) as tokens_with_email
FROM public.dashboard_access_tokens;

-- 4. Mostra tutti i token attivi
SELECT 
  email,
  plan_role,
  valid_until,
  revoked,
  source,
  created_at
FROM public.dashboard_access_tokens
WHERE revoked = false
ORDER BY created_at DESC
LIMIT 20;

-- 5. Verifica subscribers
SELECT 
  COUNT(*) as total_subscribers,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(*) FILTER (WHERE status = 'active') as active_subscribers
FROM public.subscribers;

-- 6. Mostra tutti i subscribers
SELECT 
  email,
  status,
  auth_user_id,
  subscription_id,
  created_at
FROM public.subscribers
ORDER BY created_at DESC
LIMIT 20;

-- 7. Verifica user_profiles
SELECT 
  COUNT(*) as total_profiles,
  COUNT(DISTINCT user_id) as unique_user_ids
FROM public.user_profiles;

-- 8. Verifica admin_emails
SELECT 
  COUNT(*) as total_admin_emails,
  string_agg(email, ', ') as admin_emails_list
FROM public.admin_emails;

-- 9. JOIN: Verifica utenti con ruolo "pro" (come esempio)
SELECT 
  ur.email,
  ur.role,
  ur.valid_until,
  dat.plan_role as token_role,
  dat.valid_until as token_valid_until,
  s.status as subscriber_status
FROM public.user_roles ur
LEFT JOIN public.dashboard_access_tokens dat ON ur.email = dat.email AND dat.revoked = false
LEFT JOIN public.subscribers s ON ur.email = s.email
WHERE ur.role = 'pro'
ORDER BY ur.created_at DESC
LIMIT 10;

-- 10. Verifica RLS policies (solo se hai permessi)
-- SELECT tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
--   AND tablename IN ('user_roles', 'dashboard_access_tokens', 'subscribers', 'user_profiles', 'admin_emails')
-- ORDER BY tablename, policyname;

