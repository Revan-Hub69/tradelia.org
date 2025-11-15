# Setup Campi Business per Xolo

Questo script aggiunge tutte le colonne necessarie per supportare la raccolta dati business (Xolo) nella tabella `user_profiles`.

## Istruzioni

1. Vai al **Supabase Dashboard** → **SQL Editor**
2. Copia e incolla il contenuto di `add-business-fields.sql`
3. Esegui lo script
4. Verifica che le colonne siano state create correttamente

## Verifica

Dopo aver eseguito lo script, verifica con questa query:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
  AND column_name LIKE 'business%'
ORDER BY column_name;
```

Dovresti vedere tutte le colonne business create.

## Note

- Le colonne sono tutte opzionali (NULL permesso) tranne quelle già esistenti
- `user_type` può essere 'individual' o 'business'
- `business_invoice_days` ha default 0 (fatturazione immediata)
- `business_language` ha default 'it' (italiano)

## Rollback (se necessario)

Se devi rimuovere le colonne (non raccomandato se ci sono già dati):

```sql
ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS user_type,
DROP COLUMN IF EXISTS business_name,
DROP COLUMN IF EXISTS business_country,
DROP COLUMN IF EXISTS business_language,
DROP COLUMN IF EXISTS business_address,
DROP COLUMN IF EXISTS business_city,
DROP COLUMN IF EXISTS business_zip,
DROP COLUMN IF EXISTS business_vat,
DROP COLUMN IF EXISTS business_tax_id,
DROP COLUMN IF EXISTS business_invoice_days,
DROP COLUMN IF EXISTS business_contact_firstname,
DROP COLUMN IF EXISTS business_contact_lastname,
DROP COLUMN IF EXISTS business_contact_email,
DROP COLUMN IF EXISTS business_comments;
```

