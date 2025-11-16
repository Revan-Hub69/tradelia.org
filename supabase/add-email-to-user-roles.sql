-- ============================================
-- AGGIUNGE COLONNA EMAIL A USER_ROLES
-- ============================================
-- Esegui questo script in Supabase Dashboard → SQL Editor
-- Aggiunge la colonna email a user_roles per supportare utenti senza user_id
-- ============================================

-- 1. Aggiungi colonna email se non esiste
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS email text;

-- 2. Crea indice per ricerca veloce per email
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON public.user_roles(email);

-- 3. (Opzionale) Popola email da dashboard_access_tokens se user_id corrisponde
-- Questo è solo un esempio - adatta in base ai tuoi dati
UPDATE public.user_roles ur
SET email = dat.email
FROM public.dashboard_access_tokens dat
WHERE ur.user_id = dat.user_id 
  AND ur.email IS NULL 
  AND dat.email IS NOT NULL
  AND dat.revoked = false;

-- 4. (Opzionale) Popola email da subscribers se user_id corrisponde
UPDATE public.user_roles ur
SET email = s.email
FROM public.subscribers s
WHERE ur.user_id = s.auth_user_id 
  AND ur.email IS NULL 
  AND s.email IS NOT NULL;

-- 5. Verifica risultato
SELECT 
  COUNT(*) as total_roles,
  COUNT(DISTINCT user_id) as roles_with_user_id,
  COUNT(DISTINCT email) as roles_with_email,
  COUNT(*) FILTER (WHERE email IS NOT NULL) as roles_with_email_not_null
FROM public.user_roles;

-- 6. Mostra alcuni esempi
SELECT 
  user_id,
  email,
  role,
  valid_until
FROM public.user_roles
ORDER BY created_at DESC
LIMIT 10;

