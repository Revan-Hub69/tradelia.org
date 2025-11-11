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
   - Crea le tabelle `reports` e `report_modules`.
   - Abilita RLS con policy che consentono full access agli utenti autenticati.
   - Aggiunge la view `active_reports_expanded` (opzionale).

## 3. Storage (chart)
1. Dentro Supabase, sezione **Storage** → “Create new bucket”.
   - Nome suggerito: `report-charts`
   - Access: *Private*
2. Imposta una policy per consentire a utenti autenticati di leggere/scrivere.

## 4. Autenticazione
1. Crea un utente admin (email/password) nella sezione **Authentication** → Users.
2. Questo account verrà usato dalla dashboard (login con Supabase Auth).

## 5. Configurazione dashboard
Nella repo esiste `report/admin/supabase-config.example.js`. Copia il file e rinominalo in `supabase-config.js`.

```bash
cp report/admin/supabase-config.example.js report/admin/supabase-config.js
```

Modifica i valori:

```js
export const SUPABASE_URL = "https://<PROJECT>.supabase.co";
export const SUPABASE_ANON_KEY = "<PUBLIC_ANON_KEY>";
export const REPORTS_BUCKET = "report-charts";
```

Il file `supabase-config.js` è nel `.gitignore` (non va in versione).

## 6. Dashboard admin
Apri `report/admin/dashboard.html` in un browser (da un server locale, es. `npx serve report/admin`).  
Effettua login con l’utente creato: la dashboard consente di:

- creare/aggiornare un record `reports`;
- caricare il chart nel bucket `report-charts`;
- gestire i moduli (`manifest`, `header`, `F1B`, …) come singole righe della tabella `report_modules`.

## 7. Frontend pubblico
- Usa il client Supabase (o una edge function) per leggere `reports` + `report_modules`.
- Il campo `chart_path` va convertito in URL pubblico (`supabase.storage.from(REPORTS_BUCKET).getPublicUrl(path)` oppure firmato).
- I moduli sono restituiti uno ad uno: ordina per `order_index` e usa `module_key` per decidere il renderer.

## Note
- Se servono versioni storiche, basta aggiungere una tabella `report_history` che copia i record (lo schema  attuale non lo impedisce).
- Tutte le policy attuali permettono accesso totale a chi è autenticato: se serviranno ruoli più granulari, vanno affinate.


