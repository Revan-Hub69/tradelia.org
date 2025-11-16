-- ============================================
-- INSERISCI TOKEN ADMIN - Script SQL
-- ============================================
-- Esegui questo script in Supabase Dashboard → SQL Editor
-- Token già generato per: amministrazione@tradelia.org
-- ============================================

-- Token in chiaro (per riferimento, non salvato in DB):
-- adc51b9d333f47a95fc8a40ae8629401
-- 
-- ⚠️ IMPORTANTE: Copia questo token ORA! Non verrà mostrato di nuovo!
-- Per usarlo: vai su /accesso.html e inserisci: adc51b9d333f47a95fc8a40ae8629401

DO $$
DECLARE
  v_email text := 'amministrazione@tradelia.org';
  v_token_hash text := '1b644453d91010cd4d4b2ce54402f49e2758d879cec71b0889653def5bb0912c';
  v_user_id uuid;
  v_valid_until timestamptz;
BEGIN
  -- 1. Verifica che l'email sia admin
  IF NOT EXISTS (SELECT 1 FROM public.admin_emails WHERE email = v_email) THEN
    RAISE EXCEPTION '❌ Email non è admin: %. Esegui prima supabase/add-admin-emails-table.sql', v_email;
  END IF;
  
  RAISE NOTICE '✅ Email admin verificata: %', v_email;
  
  -- 2. Cerca user_id se esiste (opzionale)
  BEGIN
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = v_email 
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;
  
  -- 3. Calcola scadenza (1 anno da oggi)
  v_valid_until := now() + interval '1 year';
  
  -- 4. Revoca token vecchi per questa email/user_id
  UPDATE public.dashboard_access_tokens
  SET 
    revoked = true, 
    revoked_at = now()
  WHERE (
    email = v_email 
    OR (v_user_id IS NOT NULL AND user_id = v_user_id)
  )
  AND revoked = false;
  
  RAISE NOTICE '✅ Token vecchi revocati';
  
  -- 5. Inserisci nuovo token
  INSERT INTO public.dashboard_access_tokens (
    user_id,
    email,
    token_hash,
    plan_role,
    valid_until,
    source,
    metadata
  ) VALUES (
    v_user_id,
    v_email,
    v_token_hash,
    'institutional', -- Admin ha sempre ruolo institutional
    v_valid_until,
    'admin_manual_sql',
    jsonb_build_object(
      'is_admin', true,
      'generated_at', now(),
      'generated_by', 'SQL script - pre-generated'
    )
  );
  
  RAISE NOTICE '✅ Token admin inserito con successo!';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '🔐 TOKEN ADMIN PRONTO';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Email: %', v_email;
  RAISE NOTICE 'Token: adc51b9d333f47a95fc8a40ae8629401';
  RAISE NOTICE 'Scadenza: %', v_valid_until;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Copia questo token ORA!';
  RAISE NOTICE '    Non verrà mostrato di nuovo!';
  RAISE NOTICE '';
  RAISE NOTICE 'Per usarlo: vai su /accesso.html e inserisci il token';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  
END $$;

