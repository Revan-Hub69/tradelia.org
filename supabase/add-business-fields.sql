-- Aggiungi colonne business a user_profiles per supportare dati Xolo
-- Eseguire in Supabase Dashboard → SQL Editor

-- Aggiungi colonne se non esistono
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('individual', 'business')),
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_country TEXT,
ADD COLUMN IF NOT EXISTS business_language TEXT DEFAULT 'it',
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS business_city TEXT,
ADD COLUMN IF NOT EXISTS business_zip TEXT,
ADD COLUMN IF NOT EXISTS business_vat TEXT,
ADD COLUMN IF NOT EXISTS business_tax_id TEXT,
ADD COLUMN IF NOT EXISTS business_invoice_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS business_contact_firstname TEXT,
ADD COLUMN IF NOT EXISTS business_contact_lastname TEXT,
ADD COLUMN IF NOT EXISTS business_contact_email TEXT,
ADD COLUMN IF NOT EXISTS business_comments TEXT;

-- Aggiungi valid_until a user_roles se non esiste (per trial expiry)
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ;

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON public.user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_country ON public.user_profiles(business_country);
CREATE INDEX IF NOT EXISTS idx_user_roles_valid_until ON public.user_roles(valid_until);

-- Commenti per documentazione
COMMENT ON COLUMN public.user_profiles.user_type IS 'Tipo utente: individual o business';
COMMENT ON COLUMN public.user_profiles.business_name IS 'Ragione sociale o nome azienda';
COMMENT ON COLUMN public.user_profiles.business_country IS 'Codice paese ISO (es. IT, FR, DE)';
COMMENT ON COLUMN public.user_profiles.business_language IS 'Lingua preferita per fatturazione';
COMMENT ON COLUMN public.user_profiles.business_address IS 'Indirizzo completo';
COMMENT ON COLUMN public.user_profiles.business_city IS 'Città';
COMMENT ON COLUMN public.user_profiles.business_zip IS 'CAP';
COMMENT ON COLUMN public.user_profiles.business_vat IS 'Partita IVA con prefisso paese';
COMMENT ON COLUMN public.user_profiles.business_tax_id IS 'Codice fiscale (se diverso da P.IVA)';
COMMENT ON COLUMN public.user_profiles.business_invoice_days IS 'Giorni di scadenza fattura (0=immediata)';
COMMENT ON COLUMN public.user_profiles.business_contact_firstname IS 'Nome referente aziendale';
COMMENT ON COLUMN public.user_profiles.business_contact_lastname IS 'Cognome referente aziendale';
COMMENT ON COLUMN public.user_profiles.business_contact_email IS 'Email referente per fatture';
COMMENT ON COLUMN public.user_profiles.business_comments IS 'Note aggiuntive per fatturazione';
COMMENT ON COLUMN public.user_roles.valid_until IS 'Data scadenza trial/abbonamento';

