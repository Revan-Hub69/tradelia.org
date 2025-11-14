-- Migration: Aggiunge ruolo 'guest' allo schema user_roles
-- Data: 2025-01-XX
-- Descrizione: Aggiunge 'guest' come ruolo valido per nuovi utenti registrati

-- Modifica constraint per includere 'guest'
ALTER TABLE public.user_roles 
  DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles 
  ADD CONSTRAINT user_roles_role_check 
  CHECK (role IN ('guest', 'trial', 'pro', 'institutional'));

-- Commento per documentazione
COMMENT ON COLUMN public.user_roles.role IS 'Ruolo utente: guest (nuovo utente), trial (prova gratuita), pro (abbonato Pro), institutional (Desk Professionale)';

