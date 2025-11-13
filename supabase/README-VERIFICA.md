# 🔍 Verifica Allineamento Supabase

## 📋 Come verificare che Supabase sia allineato

### 1. **Esegui lo script di verifica**

Apri Supabase Dashboard → SQL Editor e esegui:

```sql
-- File: supabase/verify-schema.sql
```

Questo script verificherà:
- ✅ Esistenza di tutte le tabelle necessarie
- ✅ Colonne corrette per ogni tabella
- ✅ RLS (Row Level Security) abilitato
- ✅ Trigger configurati
- ✅ Indici creati
- ✅ Conteggio record

### 2. **Verifica tabelle mancanti**

Se lo script mostra tabelle mancanti, esegui le migrazioni in ordine:

#### Migrazione base (se non ancora eseguita):
```sql
-- File: supabase/schema.sql
```

#### Migrazione tabelle User Area:
```sql
-- File: supabase/migration-new-tables.sql
```

#### Migrazione tabella analysis_requests (NUOVA):
```sql
-- File: supabase/migration-analysis-requests.sql
```

### 3. **Tabelle richieste**

#### Tabelle principali:
- ✅ `admin_users`
- ✅ `user_roles`
- ✅ `user_profiles`
- ✅ `reports`
- ✅ `report_modules`
- ✅ `report_comments`

#### Tabelle User Area:
- ✅ `asset_proposals` - Proposte community (Trial/Pro)
- ✅ `asset_votes` - Voti sulle proposte
- ✅ `desk_public_links` - Link pubblici profilo (Desk)
- ✅ `user_analysis_credits` - Crediti analisi on-demand
- ✅ `analysis_requests` - **NUOVA** - Richieste analisi on-demand

### 4. **Verifica manuale rapida**

Esegui questa query per vedere tutte le tabelle:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 5. **Problemi comuni**

#### ❌ Tabella `analysis_requests` non esiste
**Soluzione**: Esegui `supabase/migration-analysis-requests.sql`

#### ❌ Errore "permission denied" su `user_analysis_credits`
**Soluzione**: Verifica che le RLS policies siano corrette. Gli utenti devono poter leggere i propri crediti.

#### ❌ Trigger non funziona per `vote_count`
**Soluzione**: Verifica che il trigger `trigger_update_vote_count` esista su `asset_votes`.

### 6. **Test funzionalità**

Dopo le migrazioni, testa:

1. **Crediti**: Verifica che il contatore crediti appaia nella sezione "Analisi on demand"
2. **Richieste**: Prova a inviare una richiesta come utente institutional (deve scalare un credito)
3. **Proposte**: Prova a proporre un asset come utente Trial/Pro (non deve scalare crediti)
4. **Voti**: Prova a votare una proposta (deve aggiornare il contatore)

### 7. **Note importanti**

- La tabella `analysis_requests` è **nuova** e deve essere creata
- Gli utenti institutional possono creare richieste solo se hanno crediti > 0
- I crediti vengono scalati automaticamente quando si crea una richiesta
- Le richieste hanno stati: `pending`, `processing`, `completed`, `cancelled`

