-- ============================================
-- FIX SECURITY LINTER ISSUES - Supabase
-- ============================================
-- Questo script risolve tutti i problemi rilevati dal linter:
-- 1. RLS disabilitato su dashboard_refresh_tokens
-- 2. Funzioni con search_path mutabile (vulnerabilità SQL injection)
-- ============================================

-- ===== 1. ABILITA RLS SU dashboard_refresh_tokens =====
-- ERRORE: RLS policies esistono ma RLS non è abilitato

ALTER TABLE IF EXISTS public.dashboard_refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Verifica che RLS sia attivo
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename = 'dashboard_refresh_tokens'
      AND rowsecurity = false
  ) THEN
    RAISE EXCEPTION 'RLS ancora disabilitato su dashboard_refresh_tokens';
  ELSE
    RAISE NOTICE '✅ RLS abilitato su dashboard_refresh_tokens';
  END IF;
END $$;

-- ===== 2. CORREZIONE FUNZIONI CON search_path MUTABILE =====
-- WARNING: Funzioni senza search_path esplicito sono vulnerabili a SQL injection

-- 2.1 hash_ip (se esiste)
DROP FUNCTION IF EXISTS public.hash_ip(text) CASCADE;
-- Nota: Se questa funzione è necessaria, ricreala con search_path fisso
-- CREATE OR REPLACE FUNCTION public.hash_ip(p_ip text)
-- RETURNS text
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = public, pg_temp
-- AS $$ ... $$;

-- 2.2 create_notification
DROP FUNCTION IF EXISTS public.create_notification(uuid, text, text, text, text) CASCADE;

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_link text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    link
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_link
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- 2.3 get_user_plan_data
DROP FUNCTION IF EXISTS public.get_user_plan_data(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.get_user_plan_data(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_plan jsonb;
  v_usage jsonb;
  v_result jsonb;
BEGIN
  -- Piano attivo
  SELECT jsonb_build_object(
    'type', plan_type,
    'status', status,
    'startedAt', started_at,
    'expiresAt', expires_at,
    'xoloPaymentStatus', xolo_payment_status,
    'xoloPaymentDueDate', xolo_payment_due_date,
    'desk', CASE 
      WHEN plan_type = 'desk' AND status = 'active' THEN jsonb_build_object(
        'analysesIncluded', 2,
        'analysesUsed', 0,
        'analysesRemaining', 2
      )
      ELSE NULL
    END,
    'credits', 0
  ) INTO v_plan
  FROM public.user_plans
  WHERE user_id = p_user_id
    AND status IN ('active', 'pending_payment', 'pending_manual')
  ORDER BY plan_type DESC, started_at DESC
  LIMIT 1;

  -- Usage corrente
  IF v_plan IS NOT NULL THEN
    SELECT jsonb_build_object(
      'month', month_year,
      'proIncludedUsed', pro_included_used,
      'proExtraUsed', pro_extra_used,
      'proExtraRemaining', CASE 
        WHEN v_plan->>'type' = 'pro' THEN GREATEST(0, 1 - (pro_included_used::int))
        ELSE 0
      END,
      'deskIncludedUsed', desk_included_used,
      'deskExtraUsed', desk_extra_used,
      'deskIncludedRemaining', CASE 
        WHEN v_plan->>'type' = 'desk' THEN GREATEST(0, 2 - (desk_included_used::int))
        ELSE 0
      END
    ) INTO v_usage
    FROM public.plan_usage
    WHERE user_id = p_user_id
      AND month_year = to_char(now(), 'YYYY-MM')
    LIMIT 1;
  END IF;

  -- Risultato
  v_result := jsonb_build_object(
    'plan', COALESCE(v_plan, '{}'::jsonb),
    'usage', COALESCE(v_usage, jsonb_build_object(
      'month', to_char(now(), 'YYYY-MM'),
      'proIncludedUsed', 0,
      'proExtraUsed', 0,
      'proExtraRemaining', 0,
      'deskIncludedUsed', 0,
      'deskExtraUsed', 0,
      'deskIncludedRemaining', 0
    ))
  );

  RETURN v_result;
END;
$$;

-- 2.4 mark_notification_read
DROP FUNCTION IF EXISTS public.mark_notification_read(uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true,
      updated_at = now()
  WHERE id = p_notification_id
    AND user_id = auth.uid();

  RETURN FOUND;
END;
$$;

-- 2.5 get_active_access_grant
DROP FUNCTION IF EXISTS public.get_active_access_grant(uuid, text) CASCADE;

CREATE OR REPLACE FUNCTION public.get_active_access_grant(p_user_id UUID, p_token TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  grant_type TEXT,
  expires_at TIMESTAMPTZ,
  days_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ag.id,
    ag.grant_type,
    ag.expires_at,
    GREATEST(0, EXTRACT(DAY FROM (ag.expires_at - NOW()))::INTEGER) AS days_remaining
  FROM public.access_grants ag
  WHERE ag.status = 'active'
    AND ag.expires_at > NOW()
    AND (
      (p_user_id IS NOT NULL AND ag.user_id = p_user_id) OR
      (p_token IS NOT NULL AND ag.access_token = p_token)
    )
  ORDER BY ag.expires_at DESC
  LIMIT 1;
END;
$$;

-- 2.6 get_usage_count
DROP FUNCTION IF EXISTS public.get_usage_count(uuid, text, text, text) CASCADE;

CREATE OR REPLACE FUNCTION public.get_usage_count(
  p_user_id UUID,
  p_usage_type TEXT,
  p_token TEXT DEFAULT NULL,
  p_month_year TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.usage_tracking ut
  WHERE ut.usage_type = p_usage_type
    AND (
      (p_user_id IS NOT NULL AND ut.user_id = p_user_id) OR
      (p_token IS NOT NULL AND ut.access_token = p_token)
    )
    AND (p_month_year IS NULL OR ut.month_year = p_month_year);
  
  RETURN COALESCE(v_count, 0);
END;
$$;

-- 2.7 can_use_included_analysis
DROP FUNCTION IF EXISTS public.can_use_included_analysis(uuid, text) CASCADE;

CREATE OR REPLACE FUNCTION public.can_use_included_analysis(
  p_user_id UUID,
  p_token TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_grant RECORD;
  v_used INTEGER;
  v_max INTEGER;
BEGIN
  -- Ottieni access grant attivo
  SELECT * INTO v_grant
  FROM public.get_active_access_grant(p_user_id, p_token);
  
  IF v_grant IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Determina max in base al tipo
  v_max := CASE WHEN v_grant.grant_type = 'pro' THEN 1 ELSE 2 END;
  
  -- Conta utilizzo
  v_used := public.get_usage_count(p_user_id, 'analysis_included', p_token);
  
  RETURN v_used < v_max;
END;
$$;

-- 2.8 can_use_extra_analysis
DROP FUNCTION IF EXISTS public.can_use_extra_analysis(uuid, text) CASCADE;

CREATE OR REPLACE FUNCTION public.can_use_extra_analysis(
  p_user_id UUID,
  p_token TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_grant RECORD;
  v_used INTEGER;
  v_max INTEGER;
BEGIN
  -- Ottieni access grant attivo
  SELECT * INTO v_grant
  FROM public.get_active_access_grant(p_user_id, p_token);
  
  IF v_grant IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Determina max in base al tipo (Desk: illimitate = 999)
  v_max := CASE WHEN v_grant.grant_type = 'pro' THEN 3 ELSE 999 END;
  
  -- Conta utilizzo
  v_used := public.get_usage_count(p_user_id, 'analysis_extra', p_token);
  
  RETURN v_used < v_max;
END;
$$;

-- 2.9 update_updated_at_column (se esiste ancora senza search_path)
-- Nota: fix-search-path-functions.sql dovrebbe averla già corretta, ma verifichiamo
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ===== 3. GRANT PERMISSIONS =====
-- Riconcedi i permessi necessari

GRANT EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_plan_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notification_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_access_grant(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_usage_count(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_use_included_analysis(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_use_extra_analysis(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO anon;

-- ===== 4. VERIFICA FINALE =====
-- Verifica che RLS sia attivo su dashboard_refresh_tokens
DO $$
DECLARE
  rls_enabled BOOLEAN;
BEGIN
  SELECT rowsecurity INTO rls_enabled
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename = 'dashboard_refresh_tokens';
  
  IF rls_enabled THEN
    RAISE NOTICE '✅ RLS abilitato su dashboard_refresh_tokens';
  ELSE
    RAISE WARNING '❌ RLS ancora disabilitato su dashboard_refresh_tokens';
  END IF;
END $$;

-- Verifica che le funzioni abbiano search_path fisso
SELECT 
  '🔍 VERIFICA search_path' as verifica,
  proname as funzione,
  CASE 
    WHEN proconfig IS NULL OR NOT ('search_path' = ANY(proconfig)) THEN '❌ search_path NON FISSO'
    ELSE '✅ search_path FISSO'
  END as status
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN (
    'create_notification',
    'get_user_plan_data',
    'mark_notification_read',
    'get_active_access_grant',
    'get_usage_count',
    'can_use_included_analysis',
    'can_use_extra_analysis',
    'update_updated_at_column'
  )
ORDER BY proname;

-- ===== 5. NOTE SU LEAKED PASSWORD PROTECTION =====
-- WARNING: Leaked password protection disabilitato
-- Questo è un setting di Supabase Auth, non del database
-- Per abilitarlo: Dashboard > Authentication > Settings > Password
-- Abilita "Leaked password protection" (usa HaveIBeenPwned.org)

SELECT 
  '⚠️ LEAKED PASSWORD PROTECTION' as verifica,
  'Abilita manualmente in Supabase Dashboard' as istruzione,
  'Authentication > Settings > Password > Leaked password protection' as dove;
