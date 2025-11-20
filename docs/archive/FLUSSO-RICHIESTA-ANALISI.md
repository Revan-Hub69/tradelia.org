# Flusso Richiesta Analisi - Tradelia.org

## 📋 Panoramica

Quando un utente compila e invia il form di richiesta analisi, ecco cosa succede step-by-step.

---

## 🔄 Flusso Completo

### 1. **Frontend - Form Submission** (`analisi-su-richiesta.html`)

**Trigger:** Utente compila il form e clicca "Invia richiesta"

**Validazione Frontend:**
- ✅ Nome (minimo 2 caratteri)
- ✅ Email (formato valido)
- ✅ Tipologia cliente (privato/azienda)
- ✅ Tipo analisi (selezionato)
- ✅ Dettagli richiesta (minimo 10 caratteri)
- ✅ Consenso GDPR (obbligatorio)

**Dati inviati:**
```javascript
{
  tipo: 'analisi-su-richiesta',
  nome: string,
  email: string,
  tipologia: 'privato' | 'azienda',
  codiceFiscale?: string,
  ragioneSociale?: string,
  piva?: string,
  indirizzo: string,
  tipoAnalisi: string,
  dettagli: string,
  consensoGDPR: boolean,
  timestamp: ISO string
}
```

**Endpoint chiamato:** `POST /api/request-analysis`

---

### 2. **Backend - API Handler** (`api/request-analysis.js`)

#### 2.1 Validazione Input

**Validazioni base:**
- ✅ Nome: string, minimo 2 caratteri
- ✅ Email: string, contiene '@'
- ✅ Consenso GDPR: presente

**Validazioni specifiche per `analisi-su-richiesta`:**
- ✅ Tipologia: 'privato' o 'azienda'
- ✅ Tipo analisi: string non vuoto
- ✅ Dettagli: string, minimo 10 caratteri

**Validazioni specifiche per `piano-desk`:**
- ✅ Ragione sociale: string, minimo 2 caratteri
- ✅ Partita IVA: formato IT + 11 cifre
- ✅ Indirizzo: string, minimo 5 caratteri

#### 2.2 Sanitizzazione Dati

Tutti i campi vengono sanitizzati:
- Trim degli spazi
- Email lowercase
- Codice fiscale/Partita IVA uppercase
- Rimozione caratteri pericolosi

#### 2.3 Salvataggio in Supabase

**Tabella:** `on_demand_requests`

**Dati salvati:**
```sql
{
  tipo_richiesta: 'analisi-su-richiesta' | 'piano-desk',
  nome: string,
  email: string,
  tipologia: 'privato' | 'azienda' | null,
  codice_fiscale: string | null,
  ragione_sociale: string | null,
  piva: string | null,
  indirizzo: string | null,
  telefono: string | null,
  note: string | null,
  tipo_analisi: string | null,
  dettagli: string | null,
  consenso_gdpr: true,
  status: 'pending',
  created_at: timestamptz,
  updated_at: timestamptz
}
```

**Status iniziale:** `pending`

**Possibili status:**
- `pending` - Richiesta ricevuta, in attesa di elaborazione
- `processing` - Richiesta in elaborazione
- `completed` - Richiesta completata
- `cancelled` - Richiesta cancellata

#### 2.4 Notifica Email Admin (Non Bloccante)

**Se `BREVO_API_KEY` è configurato:**

**Destinatario:** `amministrazione@tradelia.org`

**Oggetto:**
- `📊 Nuova richiesta analisi - [Nome]` (per analisi)
- `💼 Nuova richiesta Piano Desk - [Ragione Sociale]` (per desk)

**Contenuto Email:**
- Dati anagrafici completi
- Dettagli richiesta (tipo analisi + dettagli)
- ID richiesta
- Timestamp
- Status

**Nota:** Se l'invio email fallisce, la richiesta è comunque salvata (non blocca il processo).

#### 2.5 Email Conferma Utente (Non Bloccante)

**Se `BREVO_API_KEY` è configurato:**

**Destinatario:** Email dell'utente che ha inviato la richiesta

**Oggetto:**
- `Richiesta analisi ricevuta - Tradelia AI` (per analisi)
- `Richiesta Piano Desk ricevuta - Tradelia AI` (per desk)

**Contenuto Email:**
- Messaggio di conferma
- Dettagli richiesta
- Promessa di contatto entro 24 ore
- ID richiesta per riferimento
- Link support: `support@tradelia.org`

**Nota:** Se l'invio email fallisce, la richiesta è comunque salvata.

#### 2.6 Risposta API

**Successo (200):**
```json
{
  "ok": true,
  "message": "Richiesta salvata con successo. Ti contatteremo via email entro 24 ore.",
  "request_id": "uuid"
}
```

**Errori possibili:**
- `400` - Validazione fallita
- `500` - Errore database o configurazione

---

### 3. **Frontend - Gestione Risposta**

**Successo:**
- ✅ Mostra messaggio di successo
- ✅ Reset form
- ✅ Chiude modal dopo 3 secondi

**Errore:**
- ❌ Mostra messaggio di errore
- ❌ Mantiene dati nel form (utente può correggere)
- ❌ Non chiude modal

---

## 📊 Database Schema

### Tabella: `on_demand_requests`

```sql
CREATE TABLE public.on_demand_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_richiesta text NOT NULL CHECK (tipo_richiesta IN ('analisi-su-richiesta', 'piano-desk')),
  nome text NOT NULL,
  email text NOT NULL,
  tipologia text CHECK (tipologia IN ('privato', 'azienda')),
  codice_fiscale text,
  ragione_sociale text,
  piva text,
  indirizzo text,
  telefono text,
  note text,
  tipo_analisi text,
  dettagli text,
  consenso_gdpr boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
```

**Indici:**
- `idx_on_demand_requests_email` - Ricerca per email
- `idx_on_demand_requests_status` - Filtro per status
- `idx_on_demand_requests_tipo` - Filtro per tipo
- `idx_on_demand_requests_created_at` - Ordinamento per data

**RLS (Row Level Security):**
- Service role: accesso completo (per API)
- Admins: accesso in lettura (via `admin_emails`)

---

## 🔐 Variabili d'Ambiente Richieste

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# Brevo (opzionale, per email)
BREVO_API_KEY=xxx
```

**Nota:** Se `BREVO_API_KEY` non è configurato:
- ✅ La richiesta viene comunque salvata in Supabase
- ⚠️ Le email (admin e utente) non vengono inviate
- ⚠️ Viene loggato un warning

---

## 📧 Template Email

### Email Admin

**HTML Template:**
- Header con tipo richiesta
- Sezione dati anagrafici
- Sezione dettagli analisi (se applicabile)
- Sezione note (se presente)
- Footer con ID richiesta, timestamp, status

**Text Template:**
- Versione plain text per client email che non supportano HTML

### Email Utente

**HTML Template:**
- Header personalizzato con nome
- Messaggio di conferma
- Dettagli richiesta (se applicabile)
- Promessa di contatto entro 24 ore
- Link support
- Footer con ID richiesta e timestamp

**Text Template:**
- Versione plain text

---

## 🔄 Workflow Post-Salvataggio

### Per Admin:

1. **Riceve email** con tutti i dettagli della richiesta
2. **Accede a dashboard admin** (se disponibile) per vedere tutte le richieste
3. **Cambia status** da `pending` → `processing` quando inizia a lavorare
4. **Completa richiesta** cambiando status a `completed`
5. **Contatta utente** via email entro 24 ore (come promesso)

### Per Utente:

1. **Riceve email di conferma** immediatamente
2. **Attende contatto** entro 24 ore
3. **Può contattare support** se ha domande urgenti

---

## ⚠️ Gestione Errori

### Errori Bloccanti (API ritorna errore):

- ❌ Validazione fallita → 400 Bad Request
- ❌ Tabella Supabase non esiste → 500 con istruzioni
- ❌ Errore inserimento Supabase → 500 con dettagli

### Errori Non Bloccanti (Richiesta salvata comunque):

- ⚠️ Email admin non inviata → Log warning, richiesta salvata
- ⚠️ Email utente non inviata → Log warning, richiesta salvata
- ⚠️ `BREVO_API_KEY` non configurato → Nessuna email, richiesta salvata

---

## 📝 Checklist Implementazione

- [x] Form frontend con validazione
- [x] API endpoint `/api/request-analysis`
- [x] Validazione input backend
- [x] Sanitizzazione dati
- [x] Salvataggio in Supabase (`on_demand_requests`)
- [x] Email notifica admin
- [x] Email conferma utente
- [x] Gestione errori completa
- [x] RLS configurato in Supabase
- [x] Indici database per performance
- [ ] Dashboard admin per gestione richieste (opzionale)
- [ ] Webhook per notifiche real-time (opzionale)

---

## 🔗 File Correlati

- **Frontend:** `analisi-su-richiesta.html`
- **Backend:** `api/request-analysis.js`
- **Database:** `supabase/create-on-demand-analysis-table.sql`
- **Email:** `api/send-email.js` (per altri tipi di email)
- **Documentazione API:** `API-ATTIVE-ANALISI.md`

---

## 📚 Note Aggiuntive

1. **Privacy GDPR:** Tutti i dati sono salvati solo con consenso esplicito
2. **Backup:** Le richieste sono salvate in Supabase (backup automatico)
3. **Scalabilità:** Indici ottimizzati per query veloci anche con migliaia di richieste
4. **Affidabilità:** Salvataggio database prioritario rispetto a email (non blocca se email fallisce)

