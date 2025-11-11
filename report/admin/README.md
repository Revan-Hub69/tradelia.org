# Report Admin (Supabase)

Dashboard per gestire i report istituzionali direttamente su Supabase.
Permette di creare/aggiornare i metadati del report, caricare il chart
su Storage e salvare i JSON dei moduli (manifest, header, F1B, ...).

## Requisiti
- Supabase con lo schema definito in supabase/schema.sql
- Bucket Storage (es. eport-charts) privato
- Utente Supabase (Auth) con ruolo uthenticated
- eport/admin/supabase-config.js configurato
- Un semplice static server per servire dashboard.html

## Setup rapido
1. Crea un progetto Supabase e applica lo schema (supabase/schema.sql).
2. Crea il bucket eport-charts (Access: Private) e le policy di read/write
   per utenti autenticati.
3. Crea un utente admin Supabase (email/password) nella sezione Authentication.
4. Copia supabase-config.example.js in supabase-config.js e inserisci
   SUPABASE_URL, SUPABASE_ANON_KEY, REPORTS_BUCKET.
5. Avvia un server statico nella cartella eport/admin, ad esempio:
   `ash
   npx serve report/admin
   `
6. Apri http://localhost:3000/dashboard.html (porta in base al server usato).

## Cosa puoi fare dalla dashboard
- Login / logout tramite Supabase Auth.
- Lista report (eports) con stato, conteggio moduli e chart.
- Creazione/duplicazione report con campi: slug, titolo, stato, note, data pubblicazione.
- Upload chart nel bucket (eport-charts) con preview e link.
- Gestione moduli dinamica: ogni file JSON diventa un modulo (module_key).
  - Aggiungi/rimuovi/duplica moduli.
  - Carica JSON da file o incolla manualmente.
  - Validazione JSON rapida.
- Salvataggio bozza / pubblicazione (status = ctive).
- Eliminazione definitiva del report (con cascade sui moduli).

## Flusso consigliato
1. Effettua login.
2. Premi "Nuovo report" (oppure seleziona uno esistente).
3. Imposta slug e titolo.
4. Carica i moduli (manifest, header, F1B, ...). Ogni modulo è un JSON separato.
5. Carica lo screenshot del chart (opzionale).
6. Salva bozza per mantenere il report in stato draft.
7. Pubblica per impostare status=active (e published_at=now).
8. Il frontend pubblico può leggere da Supabase e renderizzare i moduli.

## Note su frontend/API
- I moduli sono salvati in eport_modules con module_key e content (jsonb).
- Per ottenere un report pubblicato:
  `sql
  select * from reports where slug = '...';
  select * from report_modules where report_id = ... order by order_index;
  `
- chart_path va trasformato in URL pubblico (supabase.storage.getPublicUrl
  o URL firmati).
- RLS attuale: pieno accesso agli utenti autenticati; personalizza se servono ruoli diversi.

## Legacy
- upload-chart.html e upload-chart-server.js restano disponibili solo per
  scopi storici (salvataggio su filesystem locale). Il nuovo flusso è esclusivamente
  basato su Supabase.

