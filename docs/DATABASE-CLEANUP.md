# 🧹 Database Cleanup - Reset Completo

## ⚠️ ATTENZIONE: Operazione Distruttiva

Questa guida ti aiuta a **pulire completamente** il database Supabase e ricominciare da zero con le migrazioni pulite.

## 📊 Situazione Attuale

Hai **76 tabelle** su Supabase, molte duplicate o modificate. Per ricominciare pulito:

## 🎯 Opzione 1: Reset Completo (Raccomandato)

### Passo 1: Elenca Tutte le Tabelle

```bash
node scripts/supabase/list-all-tables.mjs
```

Oppure esegui questo SQL in Supabase Dashboard:

```sql
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### Passo 2: Backup (Opzionale ma Consigliato)

Se hai dati importanti, esportali prima:

1. Vai su Supabase Dashboard → Database → Backups
2. Crea un backup manuale
3. Oppure esporta le tabelle importanti via SQL Editor

### Passo 3: Cleanup Completo

**⚠️ QUESTO CANCELLERÀ TUTTO!**

Esegui questo SQL in Supabase Dashboard SQL Editor:

```sql
-- ⚠️  WARNING: This will DELETE ALL TABLES, SEQUENCES, and FUNCTIONS!
-- Make sure you have a backup!

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables in public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
        RAISE NOTICE 'Dropped table: %', r.tablename;
    END LOOP;

    -- Drop all sequences
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequence_name) || ' CASCADE';
        RAISE NOTICE 'Dropped sequence: %', r.sequence_name;
    END LOOP;

    -- Drop all functions
    FOR r IN (
        SELECT routine_name
        FROM information_schema.routines
        WHERE routine_schema = 'public'
        AND routine_type = 'FUNCTION'
    ) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.routine_name) || ' CASCADE';
        RAISE NOTICE 'Dropped function: %', r.routine_name;
    END LOOP;

    RAISE NOTICE '✅ Cleanup complete! All tables, sequences, and functions dropped.';
END
$$;
```

### Passo 4: Verifica Cleanup

```sql
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';
```

Dovrebbe restituire `0` (o solo tabelle di sistema).

### Passo 5: Applica Migrazioni Pulite

Ora applica le migrazioni in ordine:

1. `001_initial_schema.sql`
2. `002_community_tables.sql`

Vedi `docs/COME-APPLICARE-MIGRAZIONI.md` per i dettagli.

## 🎯 Opzione 2: Cleanup Selettivo

Se vuoi mantenere alcune tabelle, puoi eliminarle selettivamente:

```sql
-- Esempio: elimina solo tabelle specifiche
DROP TABLE IF EXISTS nome_tabella_1 CASCADE;
DROP TABLE IF EXISTS nome_tabella_2 CASCADE;
-- ... etc
```

## 🎯 Opzione 3: Usa Script Automatico

```bash
node scripts/supabase/cleanup-database.mjs
```

Ti fornirà lo SQL da eseguire in Supabase Dashboard.

## ✅ Dopo il Cleanup

1. ✅ Database pulito (0 tabelle custom)
2. ✅ Applica `001_initial_schema.sql`
3. ✅ Applica `002_community_tables.sql`
4. ✅ Verifica con `000_verify_prerequisites.sql`
5. ✅ Aggiungi admin email

## 🔒 Sicurezza

- ⚠️ **NON** eseguire cleanup in produzione senza backup
- ⚠️ **NON** eseguire se hai dati importanti non backupati
- ✅ Crea sempre un backup prima
- ✅ Testa in un ambiente di sviluppo prima

## 📞 Supporto

Se qualcosa va storto:

1. Ripristina dal backup
2. Controlla i log in Supabase Dashboard
3. Verifica le tabelle con `000_verify_prerequisites.sql`

## 🎯 Risultato Atteso

Dopo il cleanup e le migrazioni, dovresti avere solo:

- `user_roles`
- `admin_emails`
- `pdf_customizations`
- `asset_proposals`
- `asset_votes`
- `schema_migrations`

**Totale: 6 tabelle pulite** (invece di 76 confuse!)
