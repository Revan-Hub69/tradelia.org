# Script di Verifica Supabase

## Utilizzo

### Via npm script
```bash
npm run verify-supabase
```

### Direttamente
```bash
node scripts/verify-supabase.js
```

## Requisiti

Lo script richiede le seguenti variabili d'ambiente:

- `SUPABASE_URL` - URL del progetto Supabase (obbligatorio)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (obbligatorio)
- `SUPABASE_ANON_KEY` - Anon key (opzionale, per client-side)

## Cosa Verifica

Lo script esegue le seguenti verifiche:

### 1. Variabili d'Ambiente
- Verifica presenza di `SUPABASE_URL`
- Verifica presenza di `SUPABASE_SERVICE_ROLE_KEY`
- Verifica opzionale di `SUPABASE_ANON_KEY`

### 2. Test Connessione
- Verifica che la connessione a Supabase funzioni
- Testa accesso a una tabella base

### 3. Tabelle Richieste
Verifica esistenza delle tabelle critiche:
- `dashboard_access_tokens`
- `dashboard_refresh_tokens`
- `user_roles`
- `education_modules`
- `education_lessons`
- `education_user_progress`
- `education_tests`
- `education_user_test_attempts`
- `asset_proposals`
- `asset_votes`

Tabelle opzionali:
- `subscribers`
- `admin_emails`
- `credits_log`
- `payments`
- `invoices`

### 4. RLS Policies
- Verifica presenza di RLS policies (se possibile)
- Suggerisce verifica manuale in Dashboard

### 5. Funzioni Database
Verifica funzioni richieste:
- `notify_analysis_completed`
- `get_user_emails`

### 6. Dati di Esempio
- Conta moduli educativi attivi
- Conta ruoli utente
- Conta token attivi

### 7. Configurazione Auth
- Verifica accesso Auth Admin
- Conta utenti registrati
- Suggerisce verifiche manuali

### 8. Storage Buckets
- Elenca storage buckets configurati
- Verifica permessi pubblici/privati

## Output

Lo script produce un report colorato con:
- ✓ Verifiche passate (verde)
- ✗ Errori critici (rosso)
- ⚠ Warning (giallo)
- ℹ Informazioni (cyan)

## Risoluzione Problemi

### Tabelle Mancanti
Se lo script segnala tabelle mancanti:
1. Vai in Supabase Dashboard > SQL Editor
2. Esegui gli script in `supabase/` in ordine:
   - `schema.sql` o `schema_v2.sql`
   - `migration-*.sql` (se necessario)
   - `add-*.sql` (per funzionalità specifiche)

### Funzioni Mancanti
Se le funzioni non esistono:
1. Esegui `supabase/function-*.sql`
2. Verifica in Dashboard > Database > Functions

### RLS Policies
Se RLS non funziona:
1. Vai in Supabase Dashboard > Authentication > Policies
2. Verifica che le policy siano attive
3. Controlla che `SUPABASE_SERVICE_ROLE_KEY` abbia permessi admin

### Errori di Connessione
1. Verifica `SUPABASE_URL` (deve essere completo, es: `https://xxx.supabase.co`)
2. Verifica `SUPABASE_SERVICE_ROLE_KEY` (non deve essere anon key)
3. Controlla che il progetto Supabase sia attivo

## Integrazione CI/CD

Puoi usare lo script in CI/CD:

```yaml
# .github/workflows/verify.yml
- name: Verify Supabase
  run: npm run verify-supabase
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## Exit Codes

- `0` - Tutte le verifiche critiche passate
- `1` - Una o più verifiche critiche fallite
