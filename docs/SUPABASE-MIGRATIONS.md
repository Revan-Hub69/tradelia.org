# Supabase Migrations - Guida Completa

## 📋 Panoramica

Sistema di migrazioni per Supabase che verifica lo stato attuale del database e applica le modifiche necessarie.

## 🚀 Setup Iniziale

### 1. Verifica Credenziali

Assicurati di avere nel file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Test Connessione

```bash
node scripts/supabase/setup.mjs
```

Questo script:

- ✅ Verifica la connessione a Supabase
- ✅ Lista le migrazioni disponibili
- ✅ Fornisce istruzioni per applicarle

## 📊 Verifica Schema Attuale

### Check Schema

```bash
node scripts/supabase/check-schema.mjs
```

Questo script mostra:

- 📊 Tabelle esistenti
- 📋 Colonne per ogni tabella
- ✅/❌ Tabelle richieste (user_roles, admin_emails, pdf_customizations, ecc.)

## 🔄 Applicare Migrazioni

### Opzione 1: Supabase Dashboard (Raccomandato)

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Vai su **SQL Editor**
4. Copia il contenuto di `supabase/migrations/001_initial_schema.sql`
5. Incolla ed esegui
6. Ripeti per `002_community_tables.sql`

### Opzione 2: Supabase CLI

```bash
# Installa Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al progetto
supabase link --project-ref your-project-ref

# Applica migrazioni
supabase db push
```

### Opzione 3: Script Automatico (In Sviluppo)

```bash
node scripts/supabase/migrate.mjs --all
```

**Nota**: Richiede una funzione RPC `exec_sql` configurata in Supabase.

## 📁 Struttura Migrazioni

```
supabase/
  migrations/
    001_initial_schema.sql      # Tabelle base (user_roles, admin_emails, pdf_customizations)
    002_community_tables.sql     # Tabelle community (asset_proposals, asset_votes)
```

## 🗄️ Tabelle Create

### 1. `user_roles`

Stores user subscription roles.

```sql
- id: UUID
- user_id: UUID (FK to auth.users)
- role: VARCHAR ('trial', 'pro', 'desk', 'admin')
- valid_until: TIMESTAMPTZ
- created_at, updated_at
```

### 2. `admin_emails`

Whitelist of admin email addresses.

```sql
- id: UUID
- email: VARCHAR (UNIQUE)
- created_at
- created_by: UUID (FK to auth.users)
```

### 3. `pdf_customizations` (Desk only)

PDF customization settings.

```sql
- id: UUID
- user_id: UUID (FK to auth.users, UNIQUE)
- template: VARCHAR ('default', 'minimal', 'detailed')
- logo_url: TEXT
- primary_color: VARCHAR
- secondary_color: VARCHAR
- font_family: VARCHAR
- header_text: VARCHAR
- footer_text: VARCHAR
- watermark_enabled: BOOLEAN
- watermark_text: VARCHAR
- created_at, updated_at
```

### 4. `asset_proposals` (Pro only)

Community proposals for new assets.

```sql
- id: UUID
- user_id: UUID (FK to auth.users)
- title: VARCHAR
- description: TEXT
- asset_symbol: VARCHAR
- asset_name: VARCHAR
- category: VARCHAR
- status: VARCHAR ('pending', 'approved', 'rejected', 'implemented')
- votes_count: INTEGER
- created_at, updated_at
```

### 5. `asset_votes` (Pro only)

Votes on asset proposals.

```sql
- id: UUID
- proposal_id: UUID (FK to asset_proposals)
- user_id: UUID (FK to auth.users)
- vote_type: VARCHAR ('up', 'down')
- created_at
- UNIQUE(proposal_id, user_id)
```

## 🔒 Row Level Security (RLS)

Tutte le tabelle hanno RLS abilitato con policy appropriate:

- **user_roles**: Utenti vedono solo il proprio ruolo
- **admin_emails**: Solo admin possono leggere
- **pdf_customizations**: Utenti gestiscono solo le proprie
- **asset_proposals**: Pro users possono leggere/creare
- **asset_votes**: Pro users possono votare

## 🛠️ Funzioni e Trigger

### `update_updated_at_column()`

Aggiorna automaticamente `updated_at` su UPDATE.

### `update_proposal_votes_count()`

Aggiorna automaticamente il conteggio voti quando si vota.

## 📝 Aggiungere Nuove Migrazioni

1. Crea un nuovo file in `supabase/migrations/`:

   ```
   003_new_feature.sql
   ```

2. Numera sequenzialmente (001, 002, 003, ...)

3. Usa `CREATE TABLE IF NOT EXISTS` per idempotenza

4. Aggiungi RLS policies

5. Documenta nella migrazione

## ✅ Verifica Post-Migrazione

Dopo aver applicato le migrazioni:

```bash
node scripts/supabase/check-schema.mjs
```

Dovresti vedere tutte le tabelle richieste con ✅.

## 🔍 Troubleshooting

### Errore: "relation does not exist"

- La migrazione non è stata applicata
- Verifica con `check-schema.mjs`
- Applica manualmente via Dashboard

### Errore: "permission denied"

- Verifica `SUPABASE_SERVICE_ROLE_KEY`
- Assicurati di usare Service Role Key (non anon key)

### Errore: "duplicate key"

- La tabella esiste già
- Usa `CREATE TABLE IF NOT EXISTS` (già incluso)

## 📚 Riferimenti

- [Supabase SQL Editor](https://app.supabase.com/project/_/sql)
- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🎯 Prossimi Passi

1. ✅ Applica migrazioni via Dashboard
2. ✅ Verifica con `check-schema.mjs`
3. ✅ Aggiungi admin email: `INSERT INTO admin_emails (email) VALUES ('your@email.com');`
4. ✅ Testa funzionalità (admin, PDF customization, community)
