# Setup Tabella Dashboard Access Tokens in Supabase

## 📋 Cosa fare

Per abilitare il sistema di token dashboard, devi eseguire lo script SQL in Supabase per creare la tabella `dashboard_access_tokens`.

## 🔧 Passi

1. **Vai su Supabase Dashboard**
   - Accedi al tuo progetto Supabase
   - Vai su **SQL Editor** (menu laterale)

2. **Esegui lo script SQL**
   - Apri il file `supabase/add-dashboard-access-tokens-table.sql`
   - Copia tutto il contenuto
   - Incollalo nell'SQL Editor di Supabase
   - Clicca su **Run** (o premi `Ctrl+Enter`)

3. **Verifica**
   - Vai su **Table Editor** in Supabase
   - Dovresti vedere la nuova tabella `dashboard_access_tokens` nella lista

## 📝 Cosa crea lo script

- Tabella `dashboard_access_tokens` con:
  - `id` (UUID)
  - `user_id` (FK a auth.users, opzionale)
  - `email` (per utenti non registrati)
  - `token_hash` (SHA-256 hash del token, non il token in chiaro)
  - `plan_role` (trial/pro/institutional)
  - `valid_until` (scadenza token)
  - `revoked` (boolean)
  - `last_used_at`, `usage_count`, `source`, `metadata`

- Indici per performance
- RLS policies (solo service_role può gestire i token)

## ⚠️ Importante

- **Non eseguire lo script due volte**: usa `CREATE TABLE IF NOT EXISTS` quindi è sicuro
- **I token vengono generati automaticamente** quando:
  - Un utente paga su LemonSqueezy/Paddle (webhook)
  - Un admin registra un pagamento Xolo manuale
  - Un utente richiede un nuovo token tramite "Ho perso il codice"

## 🔐 Sicurezza

- I token vengono salvati come **hash SHA-256** (non in chiaro)
- Solo il **service_role** può leggere/scrivere i token
- Gli utenti normali non possono vedere i token (validazione solo via API)

