-- Add Admin Users Migration
-- Aggiunge email admin e crea utenti admin
-- Version: 011
-- Date: 2025-01-27
--
-- IMPORTANT: This migration adds admin emails to admin_emails table
-- For creating users with passwords, use Supabase Dashboard or API
--
-- Set search_path for security
SET search_path = public;

-- Prerequisite check
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_emails') THEN
        RAISE EXCEPTION 'Migration 001_initial_schema.sql must be run first!';
    END IF;
END
$$;

-- ============================================================================
-- ADD ADMIN EMAILS
-- Aggiungi qui le email admin che vuoi autorizzare
-- ============================================================================

-- Inserisci email admin reali
-- Le email vengono inserite solo se non esistono già (idempotent)
INSERT INTO admin_emails (email, created_at)
VALUES 
    ('amministrazione@tradelia.org', NOW()),
    ('info@tradelia.org', NOW()),
    ('support@tradelia.org', NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- FUNCTION: assign_admin_roles
-- Assegna ruolo admin agli utenti esistenti basandosi su admin_emails
-- ============================================================================
CREATE OR REPLACE FUNCTION assign_admin_roles()
RETURNS TABLE(
    result_email TEXT,
    result_user_id UUID,
    result_status TEXT,
    result_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_email TEXT;
    v_user_id UUID;
BEGIN
    -- Itera su tutte le email in admin_emails (qualifica la colonna)
    FOR v_email IN SELECT admin_emails.email FROM admin_emails
    LOOP
        -- Verifica se utente esiste
        SELECT id INTO v_user_id
        FROM auth.users
        WHERE auth.users.email = v_email;
        
        IF v_user_id IS NOT NULL THEN
            -- Utente esiste, assegna ruolo admin
            INSERT INTO user_roles (user_id, role)
            VALUES (v_user_id, 'admin')
            ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
            
            result_email := v_email;
            result_user_id := v_user_id;
            result_status := 'role_assigned';
            result_message := 'Admin role assigned to existing user';
            RETURN NEXT;
        ELSE
            -- Utente non esiste
            result_email := v_email;
            result_user_id := NULL;
            result_status := 'user_not_found';
            result_message := 'User does not exist - create via Dashboard or API';
            RETURN NEXT;
        END IF;
    END LOOP;
    
    RETURN;
END;
$$;

-- ============================================================================
-- Esegui assegnazione ruoli admin agli utenti esistenti
-- ============================================================================
-- Assegna ruolo admin a tutti gli utenti che corrispondono alle email in admin_emails
SELECT * FROM assign_admin_roles();

-- ============================================================================
-- REPORT: Stato utenti admin
-- ============================================================================
-- Mostra stato completo degli utenti admin
SELECT 
    ae.email,
    ae.created_at as email_added_at,
    CASE 
        WHEN au.id IS NOT NULL THEN '✅ User exists'
        ELSE '⚠️  User not created yet'
    END as user_status,
    au.id as user_id,
    ur.role as current_role,
    CASE 
        WHEN au.id IS NOT NULL AND ur.role = 'admin' THEN '✅ Admin role assigned'
        WHEN au.id IS NOT NULL THEN '⚠️  User exists but no admin role'
        ELSE '❌ Create user first'
    END as role_status
FROM admin_emails ae
LEFT JOIN auth.users au ON au.email = ae.email
LEFT JOIN user_roles ur ON ur.user_id = au.id
ORDER BY ae.created_at DESC;

-- ============================================================================
-- ISTRUZIONI: Come creare utenti con password
-- ============================================================================
-- IMPORTANT: Supabase non permette di creare utenti con password via SQL
-- Devi usare uno di questi metodi:
--
-- METODO 1: Supabase Dashboard (più semplice)
--   1. Vai su https://supabase.com/dashboard
--   2. Seleziona il tuo progetto
--   3. Vai su Authentication > Users
--   4. Clicca "Add User"
--   5. Inserisci email e password: "AmoreMioDeb69!"
--   6. Clicca "Create User"
--   7. Ripeti per tutte le email: amministrazione@tradelia.org, info@tradelia.org, support@tradelia.org
--
-- METODO 2: API Route (già configurata)
--   POST /api/admin/create-admin-users
--   Body: { "password": "AmoreMioDeb69!" }
--   Oppure usa il pulsante "Crea Utenti Admin" nella sezione Supabase dell'admin dashboard
--
-- METODO 3: Script Node.js
--   node scripts/create-admin-users.mjs
--   (richiede .env.local con NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY)
--
-- Dopo aver creato gli utenti, esegui:
--   SELECT * FROM assign_admin_roles();
--   per assegnare automaticamente i ruoli admin
-- ============================================================================

