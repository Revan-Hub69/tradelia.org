# 📋 Dashboard Admin Richieste - Tradelia.org

## ✅ Completato

Dashboard admin per gestire tutte le richieste analisi e piano desk, con **email che continuano ad arrivare** come prima.

---

## 🎯 Funzionalità

### Dashboard (`/admin/requests.html`)

**Accesso:**
1. Vai su `/accesso.html` e inserisci il tuo codice admin
2. Vai su `/admin/requests.html`

**Funzionalità:**
- ✅ **Statistiche** - Conta richieste per status (pending, processing, completed, total)
- ✅ **Filtri** - Cerca per nome/email, filtra per status e tipo
- ✅ **Tabella Richieste** - Vista completa con tutte le informazioni
- ✅ **Dettagli Richiesta** - Modal con tutti i dati della richiesta
- ✅ **Modifica Status** - Cambia status (pending → processing → completed)
- ✅ **Note Admin** - Aggiungi note interne per ogni richiesta

**Colonne Tabella:**
- Data/Ora creazione
- Tipo (Analisi / Desk)
- Nome richiedente
- Email (cliccabile per inviare email)
- Dettagli (tipo analisi o ragione sociale)
- Status (badge colorato)
- Azioni (Dettagli, Modifica)

---

## 📧 Email Admin

**Le email continuano ad arrivare normalmente!** ✅

**Destinatario:** `amministrazione@tradelia.org`

**Quando viene inviata:**
- ✅ Ogni nuova richiesta analisi
- ✅ Ogni nuova richiesta piano desk
- ✅ Ogni nuovo token gratuito generato
- ✅ Ogni richiesta "ho perso il codice"

**Nessuna modifica** alle email esistenti - funzionano esattamente come prima.

---

## 🔌 API Admin

### Endpoint: `/api/admin`

**Autenticazione:**
- Header: `X-Admin-Token: <token>`
- Token recuperato da localStorage (`tradelia-access-token-v1`)

**Risorse disponibili:**

#### 1. `GET /api/admin?resource=requests`

Recupera tutte le richieste on-demand.

**Query params:**
- `status` (opzionale) - Filtra per status
- `tipo` (opzionale) - Filtra per tipo (`analisi-su-richiesta` | `piano-desk`)
- `limit` (opzionale, default: 100) - Limite risultati
- `offset` (opzionale, default: 0) - Offset per paginazione

**Risposta:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "uuid",
      "tipo_richiesta": "analisi-su-richiesta",
      "nome": "Mario Rossi",
      "email": "mario@example.com",
      "status": "pending",
      "created_at": "2025-01-27T10:00:00Z",
      ...
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 100,
    "offset": 0
  }
}
```

#### 2. `PATCH /api/admin?resource=requests&id=<uuid>`

Aggiorna una richiesta.

**Body:**
```json
{
  "status": "processing",  // pending | processing | completed | cancelled
  "note": "Note admin opzionali"
}
```

**Risposta:**
```json
{
  "ok": true,
  "data": {
    "id": "uuid",
    "status": "processing",
    ...
  }
}
```

---

## 🗄️ Database

**Tabella:** `on_demand_requests` (Supabase)

**Campi principali:**
- `id` - UUID
- `tipo_richiesta` - 'analisi-su-richiesta' | 'piano-desk'
- `nome`, `email`, `telefono`
- `tipologia` - 'privato' | 'azienda'
- `codice_fiscale`, `ragione_sociale`, `piva`, `indirizzo`
- `tipo_analisi`, `dettagli` (per analisi)
- `note` (per note admin)
- `status` - 'pending' | 'processing' | 'completed' | 'cancelled'
- `created_at`, `updated_at`, `completed_at`

---

## 🔐 Sicurezza

**Autenticazione:**
1. Token admin da localStorage
2. Verifica token tramite Supabase (`dashboard_access_tokens`)
3. Verifica email in `admin_emails` (RLS)

**RLS (Row Level Security):**
- Service role: accesso completo (per API)
- Admin (via `admin_emails`): accesso in lettura/scrittura
- Utenti pubblici: nessun accesso

---

## 📱 Interfaccia

**Design:**
- ✅ Design system accademico 2025
- ✅ Responsive (mobile-friendly)
- ✅ Dark/Light theme support
- ✅ Badge colorati per status
- ✅ Modal per dettagli e modifica

**Navigazione:**
- Link a `/admin/users.html` (Utenti)
- Link a `/admin/requests.html` (Richieste) - attivo
- Link a `/admin/reports.html` (Report)

---

## 🔄 Workflow

### Per l'Admin:

1. **Riceve email** → `amministrazione@tradelia.org` (notifica immediata)
2. **Apre dashboard** → `/admin/requests.html`
3. **Vede tutte le richieste** → Tabella con filtri
4. **Clicca "Dettagli"** → Vede tutti i dati completi
5. **Clicca "Modifica"** → Cambia status e aggiunge note
6. **Contatta utente** → Via email (cliccando sull'email nella tabella)
7. **Aggiorna status** → pending → processing → completed

---

## 📊 Statistiche Dashboard

**Card statistiche:**
- **In Attesa** - Richieste con status `pending`
- **In Elaborazione** - Richieste con status `processing`
- **Completate** - Richieste con status `completed`
- **Totale** - Tutte le richieste visibili (dopo filtri)

---

## 🎨 Status Badge

**Colori:**
- 🟡 **Pending** - Giallo (in attesa)
- 🔵 **Processing** - Blu (in elaborazione)
- 🟢 **Completed** - Verde (completata)
- 🔴 **Cancelled** - Rosso (cancellata)

---

## 🔗 File Correlati

- **Dashboard:** `/admin/requests.html`
- **API:** `/api/admin.js`
- **Database:** `supabase/create-on-demand-analysis-table.sql`
- **Email:** `api/request-analysis.js` (email admin)
- **Documentazione:** `DOVE-VANNO-LE-RICHIESTE.md`

---

## ✅ Checklist

- [x] API admin creata (`/api/admin.js`)
- [x] Dashboard HTML creata (`/admin/requests.html`)
- [x] JavaScript per gestione richieste
- [x] Filtri e ricerca
- [x] Statistiche
- [x] Modal dettagli
- [x] Modal modifica status
- [x] Email admin continuano ad arrivare ✅
- [x] Design responsive
- [x] Autenticazione admin
- [x] RLS configurato

---

## 🚀 Come Usare

1. **Accedi** → `/accesso.html` con token admin
2. **Vai alla dashboard** → `/admin/requests.html`
3. **Visualizza richieste** → Tabella con tutte le richieste
4. **Filtra** → Usa i filtri per trovare richieste specifiche
5. **Gestisci** → Clicca "Dettagli" o "Modifica" per gestire ogni richiesta
6. **Contatta utente** → Clicca sull'email per inviare email direttamente

---

## 📝 Note

- **Le email continuano ad arrivare** come prima - nessuna modifica
- La dashboard è **solo per admin** (richiede autenticazione)
- Le richieste sono **sempre salvate** in Supabase, anche se l'email fallisce
- La dashboard è **opzionale** - puoi continuare a usare solo le email se preferisci

