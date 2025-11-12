# Supabase Setup – Tradelia Report System

Questa cartella contiene gli step minimi per configurare Supabase e ospitare i report (manifest, header, moduli e chart).

## 1. Creazione progetto
1. Crea un progetto Supabase → <https://supabase.com>
2. Prendi nota di:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` (verrà usata dal client admin)

## 2. Schema
1. Apri il pannello SQL di Supabase.
2. Incolla il contenuto di [`schema.sql`](./schema.sql) e lancialo.
   - Crea le tabelle `admin_users`, `user_roles`, `reports` e `report_modules`.
   - `admin_users` contiene l’elenco degli UID autorizzati (ruolo admin).
   - `user_roles` mappa ogni utente Supabase ad uno dei ruoli applicativi (`trial`, `pro`, `institutional`).
   - Aggiunge il campo `report_type` (per ora supportiamo `swing_master_5_0`, `daily_market_intel_3_1`, `custom`).
   - Abilita RLS con policy granulari:
     - gli admin (o il service role) possono gestire tabelle e ruoli;
     - ogni utente autenticato può leggere solamente il proprio record in `user_roles`.
   - Aggiunge la view `active_reports_expanded` (opzionale).

## 3. Storage (chart)
1. Dentro Supabase, sezione **Storage** → “Create new bucket”.
   - Nome suggerito: `report-charts`
   - Access: *Private*
2. Imposta una policy per consentire a utenti autenticati di leggere/scrivere.

## 4. Autenticazione
1. Crea un utente (email/password) nella sezione **Authentication** → Users.
2. Recupera l'`id` (UUID) dell'utente e aggiungilo alla tabella `admin_users`:
   ```sql
   insert into public.admin_users (user_id) values ('<UUID-UTENTE>');
   ```
   Solo gli utenti presenti in `admin_users` potranno usare la dashboard.
3. Assegna il ruolo applicativo (trial/pro/institutional) nella tabella `user_roles`:
   ```sql
   insert into public.user_roles (user_id, role)
   values ('<UUID-UTENTE>', 'pro');
   ```
   Gli utenti possono leggere solo il proprio ruolo; gli admin o il service role possono aggiornarlo.
   Lo script SQL elimina e ricrea automaticamente trigger e policy se già presenti, quindi puoi rilanciarlo senza errori.

## 5. Configurazione dashboard
Nel repository è presente `report/admin/supabase-config.example.js`. Copialo in `supabase-config.js` (o crea direttamente quest’ultimo) e imposta:

```js
export const SUPABASE_URL = "https://<PROJECT>.supabase.co";
export const SUPABASE_ANON_KEY = "<PUBLIC_ANON_KEY>";
export const REPORTS_BUCKET = "report-charts";
```

Se il progetto è deployato (es. Vercel) conviene generare questo file in fase di build usando le env `SUPABASE_URL` / `SUPABASE_ANON_KEY`, altrimenti puoi tenerlo versionato come avviene adesso.

## 6. Dashboard admin
Apri `report/admin/dashboard.html` in un browser (da un server locale, es. `npx serve report/admin`).  
Effettua login con l’utente creato: la dashboard consente di:

- creare/aggiornare un record `reports`;
- caricare il chart nel bucket `report-charts`;
- gestire i moduli (per ora il template Swing Master 5.0 popola automaticamente `header`, `f1`, `f2`, `f3o`, `f3`, `f4`, `f5`, `f5o`, `f5lt`) come righe della tabella `report_modules`.
  È possibile incollare rapidamente i JSON o trascinare/incollare direttamente lo screenshot nella sezione chart.

## 7. Frontend pubblico
- Usa il client Supabase (o una edge function) per leggere `reports` + `report_modules`.
- Il campo `chart_path` va convertito in URL pubblico (`supabase.storage.from(REPORTS_BUCKET).getPublicUrl(path)` oppure firmato).
- I moduli sono restituiti uno ad uno: ordina per `order_index` e usa `module_key` per decidere il renderer.

## Note
- Se servono versioni storiche, basta aggiungere una tabella `report_history` che copia i record (lo schema  attuale non lo impedisce).
- Tutte le policy attuali permettono accesso totale a chi è autenticato: se serviranno ruoli più granulari, vanno affinate.


