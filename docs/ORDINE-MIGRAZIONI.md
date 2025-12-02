# ⚠️ ORDINE CRITICO DELLE MIGRAZIONI

## 🚨 IMPORTANTE: Ordine di Esecuzione OBBLIGATORIO

Le migrazioni **DEVONO** essere eseguite in questo ordine esatto:

1. **PRIMA**: `001_initial_schema.sql`
   - Crea `user_roles`, `admin_emails`, `pdf_customizations`
   - **DEVE** essere eseguita per prima!

2. **POI**: `002_community_tables.sql`
   - Crea `asset_proposals`, `asset_votes`
   - **RICHIEDE** che `user_roles` esista già
   - Contiene un controllo che **BLOCCA** l'esecuzione se `user_roles` non esiste

## ❌ Cosa Succede se Sbagli Ordine?

Se provi a eseguire `002_community_tables.sql` prima di `001_initial_schema.sql`:

```
ERROR: Migration 001_initial_schema.sql must be run first!
       Table user_roles does not exist.
```

**Il sistema ti bloccherà automaticamente** per evitare errori!

## ✅ Ordine Corretto

### Passo 1: Verifica (Opzionale)

```sql
-- Esegui questo per vedere cosa esiste già
-- File: 000_verify_prerequisites.sql
```

### Passo 2: Prima Migrazione (OBBLIGATORIA)

```sql
-- Esegui questo PRIMA
-- File: 001_initial_schema.sql
```

### Passo 3: Seconda Migrazione (Dopo la prima)

```sql
-- Esegui questo DOPO la prima
-- File: 002_community_tables.sql
```

## 🔍 Verifica Dipendenze

La migrazione 002 contiene questo controllo automatico:

```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'user_roles'
  ) THEN
    RAISE EXCEPTION 'Migration 001_initial_schema.sql must be run first!';
  END IF;
END $$;
```

Se `user_roles` non esiste, la migrazione **NON** verrà eseguita e riceverai un errore chiaro.

## 📋 Checklist Pre-Migrazione

Prima di eseguire le migrazioni, verifica:

- [ ] Ho accesso al Supabase Dashboard
- [ ] Sono loggato come owner del progetto
- [ ] Ho aperto SQL Editor
- [ ] Ho il file `001_initial_schema.sql` pronto
- [ ] Ho il file `002_community_tables.sql` pronto
- [ ] Capisco che devo eseguire 001 PRIMA di 002

## 🎯 Dopo le Migrazioni

Dopo aver eseguito entrambe le migrazioni, verifica:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_roles', 'admin_emails', 'pdf_customizations', 'asset_proposals', 'asset_votes')
ORDER BY table_name;
```

Dovresti vedere tutte e 5 le tabelle.

## 💡 Suggerimento

Se non sei sicuro dell'ordine, usa sempre lo script di verifica:

```sql
-- Esegui prima questo
-- File: 000_verify_prerequisites.sql
```

Ti dirà esattamente cosa esiste già e cosa manca!
