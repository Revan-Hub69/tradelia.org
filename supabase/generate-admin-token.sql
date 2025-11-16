-- ============================================
-- GENERA TOKEN ADMIN - Script SQL
-- ============================================
-- Esegui questo script in Supabase Dashboard → SQL Editor
-- Sostituisci 'tua-email@example.com' con la tua email admin
-- ============================================

DO $$
DECLARE
  v_email text := 'amministrazione@tradelia.org'; -- ⚠️ CAMBIA QUESTA EMAIL!
  v_token text;
  v_token_hash text;
  v_user_id uuid;
  v_valid_until timestamptz;
BEGIN
  -- 1. Verifica che l'email sia admin
  IF NOT EXISTS (SELECT 1 FROM public.admin_emails WHERE email = v_email) THEN
    RAISE EXCEPTION '❌ Email non è admin: %. Aggiungi prima l''email in admin_emails.', v_email;
  END IF;
  
  RAISE NOTICE '✅ Email admin verificata: %', v_email;
  
  -- 2. Genera token random (32 caratteri hex)
  v_token := encode(gen_random_bytes(16), 'hex');
  v_token_hash := encode(digest(v_token, 'sha256'), 'hex');
  
  RAISE NOTICE '✅ Token generato';
  
  -- 3. Cerca user_id se esiste (opzionale, per retrocompatibilità)
  BEGIN
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = v_email 
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;
  
  -- 4. Calcola scadenza (1 anno da oggi)
  v_valid_until := now() + interval '1 year';
  
  -- 5. Revoca token vecchi per questa email/user_id
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
  
  -- 6. Inserisci nuovo token
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
      'generated_by', 'SQL script'
    )
  );
  
  RAISE NOTICE '✅ Token salvato in database';
  
  -- 7. ⚠️ MOSTRA IL TOKEN (COPIALO SUBITO!)
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '🔐 TOKEN ADMIN GENERATO';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Email: %', v_email;
  RAISE NOTICE 'Token: %', v_token;
  RAISE NOTICE 'Scadenza: %', v_valid_until;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Copia questo token ORA!';
  RAISE NOTICE '    Non verrà mostrato di nuovo!';
  RAISE NOTICE '';
  RAISE NOTICE 'Per usarlo: vai su /accesso.html e inserisci il token';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  
END $$;

