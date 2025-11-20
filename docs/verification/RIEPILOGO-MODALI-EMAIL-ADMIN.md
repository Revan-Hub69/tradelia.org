# Riepilogo Modali e Email Admin - Tradelia.org

## 📋 Panoramica

Tutti i modali che inviano richieste ora inviano email di notifica a **`amministrazione@tradelia.org`** per informare l'admin di nuove richieste.

---

## ✅ Modali Completati

### 1. **Modal Analisi su Richiesta** ✅

**File Frontend:** `analisi-su-richiesta.html`, `pricing.html`  
**API:** `/api/request-analysis` (tipo: `analisi-su-richiesta`)  
**File Backend:** `api/request-analysis.js`

**Funzionalità:**
- ✅ Salva richiesta in Supabase (`on_demand_requests`)
- ✅ Invia email all'admin (`amministrazione@tradelia.org`)
- ✅ Invia email conferma all'utente
- ✅ Template HTML professionale

**Dati inviati all'admin:**
- Nome, email, telefono
- Tipologia cliente (privato/azienda)
- Codice fiscale / Partita IVA
- Tipo analisi richiesta
- Dettagli richiesta
- ID richiesta, timestamp, status

---

### 2. **Modal Piano Desk** ✅

**File Frontend:** `pricing.html`, `desk.html`  
**API:** `/api/request-analysis` (tipo: `piano-desk`)  
**File Backend:** `api/request-analysis.js`

**Funzionalità:**
- ✅ Salva richiesta in Supabase (`on_demand_requests`)
- ✅ Invia email all'admin (`amministrazione@tradelia.org`)
- ✅ Invia email conferma all'utente
- ✅ Template HTML professionale

**Dati inviati all'admin:**
- Nome, email, telefono
- Ragione sociale
- Partita IVA
- Indirizzo
- Note aggiuntive
- ID richiesta, timestamp, status

---

### 3. **Modal Token Gratuito** ✅

**File Frontend:** `pricing.html`  
**API:** `/api/request-free-token`  
**File Backend:** `api/request-free-token.js`

**Funzionalità:**
- ✅ Genera token trial (30 giorni)
- ✅ Salva in Supabase (`dashboard_access_tokens`)
- ✅ Invia email con token all'utente
- ✅ Invia email notifica all'admin (`amministrazione@tradelia.org`)
- ✅ Template HTML professionale

**Dati inviati all'admin:**
- Nome, email
- Profilo (privato/desk/media)
- Organizzazione (se presente)
- Uso dichiarato del token
- Data generazione, validità

---

### 4. **Modal "Ho Perso il Codice" (Dashboard Token)** ✅

**File Frontend:** `accesso.html`, `user/assets/js/admin.js`  
**API:** `/api/request-dashboard-token`  
**File Backend:** `api/request-dashboard-token.js`

**Funzionalità:**
- ✅ Verifica piano attivo
- ✅ Genera nuovo token
- ✅ Revoca token precedenti
- ✅ Invia email con token all'utente
- ✅ Invia email notifica all'admin (`amministrazione@tradelia.org`)
- ✅ Template HTML professionale

**Dati inviati all'admin:**
- Email utente
- Piano (trial/pro/desk)
- Validità piano
- User ID (se disponibile)
- Data generazione token
- Motivo: "Ho perso il codice"

---

### 5. **Modal Webinar Exante** ✅

**File Frontend:** `Exante.html`  
**API:** `/api/send-email` (tipo: `Richiesta Webinar Exante`)  
**File Backend:** `api/send-email.js`

**Funzionalità:**
- ✅ Invia email all'admin (`amministrazione@tradelia.org`)
- ✅ Template HTML semplice

**Dati inviati all'admin:**
- Numero WhatsApp
- Account Manager (Giuseppe Olivero)
- Timestamp

---

### 6. **Modal Richiesta Servizio (Skilling)** ✅

**File Frontend:** `Skilling.html`  
**API:** `/api/send-email` (tipo: `richiesta-servizio`)  
**File Backend:** `api/send-email.js`

**Funzionalità:**
- ✅ Invia email all'admin (`amministrazione@tradelia.org`)
- ✅ Template HTML semplice

**Dati inviati all'admin:**
- Nome, email, telefono
- Tipo servizio richiesto
- Dettagli richiesta
- Timestamp

---

## 📧 Destinatari Email

### Email Admin (Notifiche)
**Destinatario:** `amministrazione@tradelia.org`

**Quando viene inviata:**
- ✅ Ogni nuova richiesta analisi
- ✅ Ogni nuova richiesta piano desk
- ✅ Ogni nuovo token gratuito generato
- ✅ Ogni richiesta "ho perso il codice"
- ✅ Ogni richiesta webinar Exante
- ✅ Ogni richiesta servizio Skilling

### Email Utente (Conferme)
**Destinatario:** Email dell'utente che ha inviato la richiesta

**Quando viene inviata:**
- ✅ Conferma richiesta analisi
- ✅ Conferma richiesta piano desk
- ✅ Invio token gratuito
- ✅ Invio nuovo token dashboard

---

## 🔄 Flusso Completo

### Per Richieste Analisi/Desk:

1. **Utente compila form** → Frontend
2. **Validazione frontend** → JavaScript
3. **Invio a API** → `/api/request-analysis`
4. **Validazione backend** → API
5. **Salvataggio Supabase** → Database
6. **Email admin** → `amministrazione@tradelia.org` (non bloccante)
7. **Email utente** → Conferma (non bloccante)
8. **Risposta API** → Success/Error

### Per Token:

1. **Utente compila form** → Frontend
2. **Validazione frontend** → JavaScript
3. **Invio a API** → `/api/request-free-token` o `/api/request-dashboard-token`
4. **Validazione backend** → API
5. **Generazione token** → Crypto
6. **Salvataggio Supabase** → Database
7. **Email utente** → Token (bloccante - se fallisce, errore)
8. **Email admin** → Notifica (non bloccante)
9. **Risposta API** → Success/Error

---

## ⚠️ Gestione Errori

### Errori Bloccanti:
- ❌ Validazione fallita → 400 Bad Request
- ❌ Errore database → 500 Internal Server Error
- ❌ Errore invio email token (solo per token) → 500 (token creato ma email fallita)

### Errori Non Bloccanti:
- ⚠️ Email admin non inviata → Log warning, richiesta salvata comunque
- ⚠️ Email utente non inviata → Log warning, richiesta salvata comunque
- ⚠️ `BREVO_API_KEY` non configurato → Nessuna email, richiesta salvata

**Nota:** Per i token, l'email all'utente è **bloccante** (se fallisce, l'API ritorna errore) perché il token deve essere comunicato all'utente. L'email all'admin è sempre non bloccante.

---

## 📊 Tabella Riepilogativa

| Modal | API | Email Admin | Email Utente | Salvataggio DB | Status |
|-------|-----|-------------|--------------|----------------|--------|
| Analisi | `/api/request-analysis` | ✅ | ✅ | ✅ | ✅ Completo |
| Desk | `/api/request-analysis` | ✅ | ✅ | ✅ | ✅ Completo |
| Token Gratuito | `/api/request-free-token` | ✅ | ✅ | ✅ | ✅ Completo |
| Token Dashboard | `/api/request-dashboard-token` | ✅ | ✅ | ✅ | ✅ Completo |
| Webinar Exante | `/api/send-email` | ✅ | ❌ | ❌ | ✅ Completo |
| Servizio Skilling | `/api/send-email` | ✅ | ❌ | ❌ | ✅ Completo |

**Legenda:**
- ✅ = Implementato e funzionante
- ❌ = Non necessario per questo tipo di richiesta

---

## 🔐 Variabili d'Ambiente

Tutte le API richiedono:

```env
# Supabase (obbligatorio per analisi/desk/token)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# Brevo (opzionale, per email)
BREVO_API_KEY=xxx
```

**Nota:** Se `BREVO_API_KEY` non è configurato:
- ✅ Le richieste vengono comunque salvate in Supabase (se applicabile)
- ⚠️ Le email non vengono inviate
- ⚠️ Viene loggato un warning

---

## 📝 Template Email

Tutti i template email sono:
- ✅ HTML responsive
- ✅ Plain text fallback
- ✅ Branding Tradelia AI
- ✅ Informazioni complete
- ✅ Timestamp e ID richiesta

---

## ✅ Checklist Finale

- [x] Modal Analisi → Email admin ✅
- [x] Modal Desk → Email admin ✅
- [x] Modal Token Gratuito → Email admin ✅
- [x] Modal Token Dashboard → Email admin ✅
- [x] Modal Webinar Exante → Email admin ✅
- [x] Modal Servizio Skilling → Email admin ✅
- [x] Tutte le email usano `amministrazione@tradelia.org` ✅
- [x] Template HTML professionale ✅
- [x] Gestione errori non bloccante ✅
- [x] Documentazione completa ✅

---

## 🔗 File Correlati

- **API Analisi/Desk:** `api/request-analysis.js`
- **API Token Gratuito:** `api/request-free-token.js`
- **API Token Dashboard:** `api/request-dashboard-token.js`
- **API Email Generica:** `api/send-email.js`
- **Documentazione Flusso Analisi:** `FLUSSO-RICHIESTA-ANALISI.md`
- **Documentazione API:** `API-ATTIVE-ANALISI.md`

---

## 📚 Note Aggiuntive

1. **Priorità:** Salvataggio database > Email admin > Email utente
2. **Affidabilità:** Le richieste sono sempre salvate, anche se le email falliscono
3. **Privacy:** Tutti i dati sono trattati secondo GDPR
4. **Scalabilità:** Tutte le email sono asincrone e non bloccanti (tranne token utente)

