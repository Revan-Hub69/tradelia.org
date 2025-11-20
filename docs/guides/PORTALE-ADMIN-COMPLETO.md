# 🎯 Portale Admin Completo - Tradelia.org

## ✅ Struttura Finale

Il portale admin (`/admin/index.html`) serve **3 aree principali**:

1. **🔑 Gestione Token** → `/admin/tokens.html`
2. **📋 Richieste Analisi & Desk** → `/admin/requests.html`
3. **📊 Report Studio** → `/admin/reports.html`

---

## 🔑 1. Gestione Token (`/admin/tokens.html`)

**Funzionalità:**
- ✅ Visualizza tutti i token dashboard
- ✅ Filtra per email, ruolo (trial/pro/desk), status (attivo/revocato/scaduto)
- ✅ Statistiche (attivi, revocati, scaduti, totale)
- ✅ Dettagli token completi
- ✅ Modifica token (ruolo, scadenza, revoca)
- ✅ Revoca token

**API:** `/api/admin?resource=tokens`

**Metodi:**
- `GET` - Recupera token con filtri
- `PATCH` - Modifica token
- `DELETE` - Revoca token

**Dati gestiti:**
- Email, User ID
- Ruolo (trial/pro/desk)
- Validità (valid_until)
- Status (attivo/revocato/scaduto)
- Source (trial/manual)
- Metadata

---

## 📋 2. Richieste Analisi & Desk (`/admin/requests.html`)

**Funzionalità:**
- ✅ Visualizza tutte le richieste (analisi e desk)
- ✅ Filtra per status, tipo, ricerca
- ✅ Statistiche (pending, processing, completed, total)
- ✅ Dettagli richiesta completa
- ✅ Modifica status (pending → processing → completed)
- ✅ Note admin per ogni richiesta
- ✅ Email cliccabili per contattare clienti

**API:** `/api/admin?resource=requests`

**Metodi:**
- `GET` - Recupera richieste con filtri
- `PATCH` - Aggiorna status e note

**Dati gestiti:**
- Tipo richiesta (analisi-su-richiesta / piano-desk)
- Dati anagrafici completi
- Dettagli richiesta
- Status (pending/processing/completed/cancelled)
- Note admin

**Email Admin:** ✅ Continua ad arrivare a `amministrazione@tradelia.org`

---

## 📊 3. Report Studio (`/admin/reports.html`)

**Funzionalità:**
- ✅ **Crea report** - Nuovo report con slug, titolo, tipo
- ✅ **Modifica report** - Modifica tutti i campi
- ✅ **Cancella report** - Elimina report definitivamente
- ✅ **Aggiungi immagine** - Upload chart/screenshot (drag & drop, clipboard)
- ✅ **Gestione moduli** - Aggiungi, rimuovi, modifica, duplica moduli JSON
- ✅ **Titoli** - Campo titolo report
- ✅ **Sottotitoli** - Nei moduli JSON (rows con parts)
- ✅ **Variabili** - Nei moduli JSON (metricsPanel, parts con kind: "metric")
- ✅ **Pubblica/Salva bozza** - Pubblicazione immediata o salvataggio bozza
- ✅ **Duplica report** - Crea copia di un report esistente

**Struttura Report:**
```
report/
├── {slug}/
│   ├── header.json    ← Titoli, sottotitoli, variabili (rows, metricsPanel)
│   ├── f1b.json      ← Modulo F1B
│   ├── f2.json        ← Modulo F2
│   ├── f3.json        ← Modulo F3
│   ├── manifest.json  ← Ordine moduli, metadata
│   └── chart.png      ← Immagine chart (opzionale)
```

**Moduli JSON:**
- Ogni modulo è un file JSON (header.json, f1b.json, ecc.)
- Contiene titoli, sottotitoli, variabili, dati
- Modificabile tramite editor JSON nella dashboard

**Variabili:**
- Definite in `metricsPanel` (header.json)
- Usate in `rows` con `kind: "metric"`
- Esempio: `{ "key": "Price", "value": 123.45, "tone": "ok" }`

**Titoli e Sottotitoli:**
- Titolo principale: Campo `title` nel report
- Sottotitoli: In `rows` dei moduli JSON (es. header.json)
- Ogni row può contenere testo e metriche

**Immagini:**
- Upload tramite drag & drop
- Supporto clipboard (Ctrl+V da TradingView/Exante)
- Salvataggio in Supabase Storage
- Path salvato in `chart_path` del report

---

## 🧭 Navigazione

### Portale Admin (`/admin/index.html`)

**3 Card principali:**
1. 🔑 Gestione Token → `/admin/tokens.html`
2. 📋 Richieste Analisi & Desk → `/admin/requests.html`
3. 📊 Report Studio → `/admin/reports.html`

### Dopo Login (`/accesso.html`)

**Se admin:**
- ✅ Bottone **"Portale Admin"** → `/admin/index.html`
- ✅ Link a tutte le 3 dashboard

### Navigazione tra Dashboard

Ogni dashboard ha una **nav bar** in alto con link a:
- 🏠 Portale Admin → `/admin/index.html`
- 🔑 Token → `/admin/tokens.html`
- 📋 Richieste → `/admin/requests.html`
- 📊 Report → `/admin/reports.html`

---

## 🔌 API Admin Unificata

**Endpoint:** `/api/admin`

**Autenticazione:**
- Header: `X-Admin-Token: <token>`
- Token da localStorage (`tradelia-access-token-v1`)

**Risorse:**
- `resource=tokens` - Gestione token
- `resource=requests` - Gestione richieste
- `resource=reports` - Gestione report (gestita da altro endpoint)

**Metodi supportati:**
- `GET` - Recupera dati
- `PATCH` / `PUT` - Aggiorna dati
- `DELETE` - Elimina/revoca

---

## 📊 Database

### Token (`dashboard_access_tokens`)
- `id`, `email`, `user_id`
- `token_hash`, `plan_role`, `valid_until`
- `revoked`, `revoked_at`, `source`
- `metadata`, `created_at`

### Richieste (`on_demand_requests`)
- `id`, `tipo_richiesta`, `nome`, `email`
- `status`, `dettagli`, `note`
- `created_at`, `updated_at`, `completed_at`

### Report (Supabase Storage + JSON)
- File JSON in `/report/reports/{slug}/`
- Metadata in Supabase (se configurato)

---

## ✅ Checklist Funzionalità

### Gestione Token ✅
- [x] Visualizza token
- [x] Filtra token
- [x] Statistiche
- [x] Dettagli token
- [x] Modifica token
- [x] Revoca token

### Richieste Analisi/Desk ✅
- [x] Visualizza richieste
- [x] Filtra richieste
- [x] Statistiche
- [x] Dettagli richiesta
- [x] Modifica status
- [x] Note admin
- [x] Email admin (continua ad arrivare)

### Report Studio ✅
- [x] Crea report
- [x] Modifica report
- [x] Cancella report
- [x] Aggiungi immagine/chart
- [x] Gestione moduli (aggiungi, rimuovi, modifica, duplica)
- [x] Titoli (campo titolo)
- [x] Sottotitoli (nei moduli JSON)
- [x] Variabili (nei moduli JSON - metricsPanel, parts)
- [x] Pubblica/Salva bozza
- [x] Duplica report

---

## 🎨 Design

**Coerenza:**
- ✅ Design system accademico 2025
- ✅ Nav bar uniforme in tutte le dashboard
- ✅ Stile coerente (light theme)
- ✅ Responsive (mobile-friendly)

**Portale Admin:**
- Dark theme con glassmorphism
- Card con gradient buttons
- Grid responsive (3 colonne desktop, 1 mobile)

---

## 🔗 File Correlati

- **Portale:** `/admin/index.html`
- **Token:** `/admin/tokens.html`
- **Richieste:** `/admin/requests.html`
- **Report:** `/admin/reports.html`
- **API:** `/api/admin.js`
- **Accesso:** `/accesso.html`

---

## 📝 Note

1. **Email Admin:** Le email continuano ad arrivare normalmente a `amministrazione@tradelia.org`
2. **Report:** I titoli, sottotitoli e variabili sono gestiti nei moduli JSON (header.json, f1b.json, ecc.)
3. **Token:** I token non vengono eliminati fisicamente, solo revocati (soft delete)
4. **Navigazione:** Ogni dashboard ha una nav bar per navigare facilmente tra le aree

---

## 🚀 Come Usare

1. **Login** → `/accesso.html` con codice admin
2. **Portale Admin** → Clic "Portale Admin" → `/admin/index.html`
3. **Scegli area:**
   - 🔑 **Token** → Gestisci token dashboard
   - 📋 **Richieste** → Gestisci richieste analisi/desk
   - 📊 **Report** → Crea/modifica report con moduli, immagini, variabili
4. **Naviga** → Usa la nav bar in alto per spostarti tra dashboard

