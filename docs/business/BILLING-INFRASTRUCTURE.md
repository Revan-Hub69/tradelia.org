# 🏗️ Infrastruttura Raccolta Dati Fatturazione

## 📋 Panoramica

Sistema completo per raccogliere, salvare e utilizzare dati fatturazione (individual o business) per integrazione con Xolo Go.

---

## 🗄️ Database

### Tabella `user_profiles`

**Schema:** `supabase/add-business-fields.sql`

**Campi Business:**

- `user_type` - 'individual' o 'business'
- `business_name` - Ragione sociale
- `business_country` - Codice paese ISO (IT, FR, DE, ecc.)
- `business_language` - Lingua fatturazione (default: 'it')
- `business_address` - Indirizzo completo
- `business_city` - Città
- `business_zip` - CAP
- `business_vat` - Partita IVA (con prefisso paese, es. IT12345678901)
- `business_tax_id` - Codice fiscale
- `business_invoice_days` - Giorni scadenza fattura (default: 0 = immediata)
- `business_contact_firstname` - Nome referente
- `business_contact_lastname` - Cognome referente
- `business_contact_email` - Email referente

**Setup:**

```sql
-- Eseguire in Supabase Dashboard → SQL Editor
-- File: supabase/add-business-fields.sql
```

---

## 🔌 API Endpoints

### 1. `POST /api/save-billing-data`

**Scopo:** Salva dati fatturazione in `user_profiles`

**Request:**

```json
{
  "token": "dashboard-token",
  "billing_data": {
    "user_type": "individual" | "business",
    "email": "email@esempio.com",
    // Individual
    "business_contact_firstname": "Mario",
    "business_contact_lastname": "Rossi",
    // Business
    "business_name": "Azienda S.r.l.",
    "business_country": "IT",
    "business_vat": "IT12345678901",
    "business_address": "Via Roma 1",
    "business_city": "Milano",
    "business_zip": "20100",
    "business_contact_firstname": "Mario",
    "business_contact_lastname": "Rossi",
    "business_contact_email": "mario@azienda.it"
  }
}
```

**Response:**

```json
{
  "ok": true,
  "profile": { ... },
  "message": "Dati fatturazione salvati con successo"
}
```

### 2. `POST /api/create-order` (Modificato)

**Nuovo comportamento:**

- Cerca dati fatturazione in `user_profiles` (se utente autenticato)
- Se non trovati, usa dati individual di default
- Passa dati fatturazione a `createXoloInvoice()`

**Flusso:**

```
1. Valida token → ottiene userId
2. Cerca user_profile per userId
3. Se trovato → usa dati business/individual
4. Se non trovato → usa dati individual di default (solo email)
5. Crea ordine
6. Crea fattura Xolo con dati fatturazione completi
```

### 3. `POST /api/activate-order` (Già creato)

**Comportamento:** Attiva servizio dopo pagamento verificato

---

## 🎨 Frontend

### Component: `billing-form.js`

**Funzione principale:**

```javascript
import { showBillingForm } from "./billing-form.js";

// Mostra modale raccolta dati
const billingData = await showBillingForm("access_pro", 19);
// billingData contiene tutti i dati raccolti
```

**Features:**

- Modale responsive
- Toggle Individual/Business
- Validazione form
- Salvataggio automatico (se utente autenticato)
- Return Promise con dati raccolti

**Campi Individual:**

- Email (obbligatorio)
- Nome (opzionale)
- Cognome (opzionale)

**Campi Business:**

- Email (obbligatorio)
- Ragione Sociale (obbligatorio)
- Paese (obbligatorio)
- Partita IVA (opzionale ma consigliata)
- Indirizzo, Città, CAP (opzionali)
- Referente (opzionale)

### CSS: `billing-form.css`

**Stili:**

- Modale overlay
- Form responsive
- Radio buttons eleganti
- Input focus states
- Error messages

---

## 🔄 Flusso Completo

### Scenario 1: Utente Autenticato (Prima Volta)

```
1. Utente clicca "Acquista Accesso Pro"
2. Frontend → showBillingForm()
3. Modale raccolta dati → Utente compila form
4. Submit → POST /api/save-billing-data (salva in user_profiles)
5. Promise resolve → billingData
6. Frontend → POST /api/create-order (con billingData in metadata)
7. API → Cerca user_profile (trovato, usa dati)
8. API → Crea fattura Xolo con dati business completi
9. Email fattura all'utente
```

### Scenario 2: Utente Autenticato (Dati Già Salvati)

```
1. Utente clicca "Acquista Analisi Extra"
2. Frontend → POST /api/create-order (senza modale)
3. API → Cerca user_profile (trovato, usa dati salvati)
4. API → Crea fattura Xolo con dati business completi
5. Email fattura all'utente
```

### Scenario 3: Guest (Analisi Standalone)

```
1. Guest clicca "Richiedi Analisi Standalone"
2. Frontend → showBillingForm() (modale obbligatoria)
3. Utente compila form (individual o business)
4. Submit → billingData (NON salvato, guest non ha user_id)
5. Frontend → POST /api/create-order (con billingData in metadata)
6. API → Crea fattura Xolo con dati forniti
7. Email fattura all'utente
```

---

## 🔧 Integrazione Xolo

### Funzione: `createXoloInvoice(invoiceData, billingData)`

**Dati Individual:**

```javascript
{
  email: "mario@esempio.com",
  name: "Mario Rossi" // o email se nome non disponibile
}
```

**Dati Business:**

```javascript
{
  email: "fatturazione@azienda.it",
  name: "Azienda S.r.l.",
  country: "IT",
  address: "Via Roma 1",
  city: "Milano",
  zip: "20100",
  vat_number: "IT12345678901", // P.IVA con prefisso paese
  tax_id: "CF12345678901",
  contact_email: "mario@azienda.it",
  contact_name: "Mario Rossi"
}
```

**Xolo API Payload:**

```javascript
{
  customer: {
    email: "...",
    name: "...",
    country: "...",
    address: "...",
    city: "...",
    zip: "...",
    vat_number: "...", // Solo se business
    tax_id: "...", // Solo se business
    contact_email: "...",
    contact_name: "..."
  },
  amount: 19.00,
  currency: "EUR",
  description: "...",
  due_date: "2025-01-15",
  metadata: { ... }
}
```

---

## 📝 Validazione Dati

### Individual

- ✅ Email obbligatoria
- ⚠️ Nome/Cognome opzionali (ma consigliati)

### Business

- ✅ Email obbligatoria
- ✅ Ragione Sociale obbligatoria
- ✅ Paese obbligatorio
- ⚠️ Partita IVA opzionale (ma consigliata per B2B)
- ⚠️ Indirizzo/Città/CAP opzionali
- ⚠️ Referente opzionale

### P.IVA Format

- **Formato:** `[PAESE][NUMERO]` (es. `IT12345678901`)
- **Validazione:** Regex base (non validazione reale)
- **Nota:** Xolo valida P.IVA reale

---

## 🎯 Best Practice

### 1. Raccolta Dati

- **Prima volta:** Mostra sempre modale (anche se dati salvati, permette modifica)
- **Dati salvati:** Usa dati salvati, ma permetti modifica
- **Guest:** Modale sempre obbligatoria

### 2. Salvataggio

- **Autenticato:** Salva sempre in `user_profiles` (per riuso futuro)
- **Guest:** Non salva (non ha user_id), passa solo in metadata ordine

### 3. Xolo Integration

- **Individual:** Solo email e nome (minimo necessario)
- **Business:** Tutti i dati disponibili (per fatturazione corretta)

### 4. UX

- **Modale non invasiva:** Design elegante, non blocca
- **Validazione real-time:** Mostra errori mentre utente compila
- **Salvataggio automatico:** Salva quando possibile (non blocca checkout)

---

## ✅ Checklist Implementazione

### Database

- [x] Schema `add-business-fields.sql` creato
- [ ] Eseguire script in Supabase
- [ ] Verificare colonne create
- [ ] Testare inserimento/aggiornamento

### API

- [x] `save-billing-data.js` creato
- [x] `create-order.js` modificato (usa dati business)
- [x] `xolo.js` modificato (passa dati business)
- [ ] Testare salvataggio dati
- [ ] Testare creazione fattura Xolo con dati business

### Frontend

- [x] `billing-form.js` creato
- [x] `billing-form.css` creato
- [ ] Importare CSS in dashboard.html
- [ ] Integrare modale nel flusso acquisto
- [ ] Testare modale individual
- [ ] Testare modale business
- [ ] Testare validazione

### Integrazione

- [ ] Testare flusso completo: modale → salvataggio → ordine → fattura Xolo
- [ ] Verificare fattura Xolo contiene dati corretti
- [ ] Testare con P.IVA italiana
- [ ] Testare con P.IVA estera
- [ ] Testare guest (analisi standalone)

---

## 🔍 Debug

### Verifica Dati Salvati

```sql
-- Verifica profilo utente
SELECT * FROM user_profiles WHERE user_id = 'uuid-utente';

-- Verifica ordini con dati fatturazione
SELECT
  o.id,
  o.order_type,
  o.amount,
  o.metadata->>'email' as email,
  o.metadata->>'user_type' as user_type,
  o.metadata->>'business_name' as business_name
FROM orders o
WHERE o.user_id = 'uuid-utente'
ORDER BY o.created_at DESC;
```

### Log Xolo

```javascript
// In api/_lib/xolo.js, aggiungi logging
console.log("[Xolo] Creating invoice with customer data:", customerData);
console.log("[Xolo] Full payload:", payload);
```

---

## 📚 Riferimenti

- `supabase/add-business-fields.sql` - Schema database
- `api/save-billing-data.js` - API salvataggio dati
- `api/create-order.js` - API creazione ordine
- `api/_lib/xolo.js` - Integrazione Xolo
- `assets/js/dashboard/billing-form.js` - Frontend modale
- `assets/css/components/billing-form.css` - Stili modale
