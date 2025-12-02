# 🚀 Come Applicare le Migrazioni Supabase (Senza Terminale)

## ⚠️ IMPORTANTE: Ordine di Esecuzione

**DEVI applicare le migrazioni nell'ordine corretto:**

1. **OPZIONALE** `000_verify_prerequisites.sql` - Verifica stato attuale (solo lettura)
2. **PRIMA** `001_initial_schema.sql` - Crea tabelle base
3. **POI** `002_community_tables.sql` - Crea tabelle community

**Le migrazioni sono IDEMPOTENTI** - puoi rieseguirle anche se le tabelle esistono già!

Se salti la prima, la seconda fallirà perché fa riferimento alle tabelle create nella prima!

## 📋 Guida Passo-Passo

### Passo 1: Accedi a Supabase Dashboard

1. Vai su [https://app.supabase.com](https://app.supabase.com)
2. Fai login con il tuo account
3. Seleziona il progetto **Tradelia**

### Passo 2: Apri SQL Editor

1. Nel menu laterale, clicca su **SQL Editor**
2. Clicca su **New query**

### Passo 2.5: (OPZIONALE) Verifica Stato Attuale

Se vuoi verificare cosa esiste già prima di applicare le migrazioni:

1. Apri il file `supabase/migrations/000_verify_prerequisites.sql`
2. Copia TUTTO il contenuto
3. Incolla nel SQL Editor
4. Clicca su **Run**
5. Vedrai quali tabelle esistono già e quali mancano

### Passo 3: Applica PRIMA Migrazione (001_initial_schema.sql)

1. Apri il file `supabase/migrations/001_initial_schema.sql` dal progetto
2. **Copia TUTTO il contenuto** del file (dalla prima riga all'ultima)
3. Incolla nel SQL Editor di Supabase
4. Clicca su **Run** (o premi `Ctrl+Enter`)
5. Attendi il messaggio di successo ✅
6. **VERIFICA** che non ci siano errori

**Se vedi errori tipo "relation already exists"**, va bene! Significa che alcune tabelle esistono già.

### Passo 4: Applica SECONDA Migrazione (002_community_tables.sql)

**⚠️ IMPORTANTE: Applica questa SOLO dopo che la prima è completata con successo!**

1. Nel SQL Editor, clicca su **New query** (nuova query)
2. Apri il file `supabase/migrations/002_community_tables.sql` dal progetto
3. **Copia TUTTO il contenuto** del file
4. Incolla nel SQL Editor di Supabase
5. Clicca su **Run**
6. Attendi il messaggio di successo ✅

### Passo 5: Aggiungi Email Admin

Dopo aver applicato ENTRAMBE le migrazioni, aggiungi la tua email come admin:

1. Nel SQL Editor, clicca su **New query**
2. Scrivi:

```sql
INSERT INTO admin_emails (email) VALUES ('tua-email@esempio.com');
```

3. Sostituisci `tua-email@esempio.com` con la tua email reale
4. Clicca su **Run**

### Passo 6: Verifica

Esegui questa query per verificare che tutto sia stato creato:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_roles', 'admin_emails', 'pdf_customizations', 'asset_proposals', 'asset_votes')
ORDER BY table_name;
```

Dovresti vedere 5 tabelle elencate:

- `admin_emails`
- `asset_proposals`
- `asset_votes`
- `pdf_customizations`
- `user_roles`

## ✅ Fatto!

Ora il database è configurato e pronto. Le tabelle sono create e protette con Row Level Security.

## 🔄 Quando Applicare Nuove Migrazioni?

Se in futuro vengono aggiunte nuove migrazioni (003*\*.sql, 004*\*.sql, ecc.):

1. Vai su Supabase Dashboard → SQL Editor
2. Copia il contenuto della nuova migrazione
3. Esegui la query
4. Fatto!

## ❓ Risoluzione Problemi

### Errore: "column user_id does not exist"

**Causa:** Stai cercando di eseguire la migrazione 002 prima della 001, oppure la 001 non è stata completata correttamente.

**Soluzione:**

1. Assicurati di aver eseguito `001_initial_schema.sql` PRIMA
2. Verifica che la tabella `user_roles` esista:
   ```sql
   SELECT * FROM user_roles LIMIT 1;
   ```
3. Se la tabella non esiste, esegui di nuovo `001_initial_schema.sql`

### Errore: "relation already exists" o "trigger already exists"

- ✅ **Va bene!** Significa che l'oggetto esiste già
- Le migrazioni sono **IDEMPOTENTI** - puoi rieseguirle senza problemi
- Usano `CREATE TABLE IF NOT EXISTS`, `DROP TRIGGER IF EXISTS`, ecc.
- Se vedi questo errore, significa che quella parte è già stata applicata

### Errore: "permission denied"

- Verifica di essere loggato come owner del progetto
- Verifica che stai usando il progetto corretto

### Errore: "syntax error"

- Controlla di aver copiato TUTTO il contenuto del file
- Assicurati che non ci siano caratteri strani
- Verifica di aver copiato anche le righe vuote alla fine

### Errore: "foreign key constraint"

- Verifica che la tabella `auth.users` esista (dovrebbe esistere di default in Supabase)
- Se non esiste, potrebbe essere un problema di configurazione del progetto Supabase

## 📞 Supporto

Se hai problemi, controlla:

- `docs/SUPABASE-MIGRATIONS.md` per dettagli tecnici
- Supabase Dashboard → Database → Tables per vedere le tabelle create
- Supabase Dashboard → Database → Policies per vedere le RLS policies

## 🔍 Verifica Dettagliata

Per verificare che tutto sia configurato correttamente:

```sql
-- Verifica tabelle
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_roles', 'admin_emails', 'pdf_customizations', 'asset_proposals', 'asset_votes');

-- Verifica colonne di user_roles
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_roles';

-- Verifica RLS abilitato
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_roles', 'admin_emails', 'pdf_customizations', 'asset_proposals', 'asset_votes');
```
