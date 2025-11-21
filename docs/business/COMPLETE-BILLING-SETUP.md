# 🏗️ Setup Completo Infrastruttura Fatturazione

## 📋 Riepilogo Componenti

### ✅ File Creati

1. **Database:**
   - `supabase/one-time-services-schema.sql` - Schema servizi una tantum
   - `supabase/add-business-fields.sql` - Campi business per user_profiles

2. **API:**
   - `api/_lib/xolo.js` - Integrazione Xolo Go
   - `api/create-order.js` - Crea ordine e fattura Xolo
   - `api/activate-order.js` - Attiva servizio dopo pagamento
   - `api/save-billing-data.js` - Salva dati fatturazione

3. **Frontend:**
   - `assets/js/dashboard/billing-form.js` - Modale raccolta dati
   - `assets/css/components/billing-form.css` - Stili modale

4. **Documentazione:**
   - `docs/business/PRICING-BEST-PRACTICE.md` - Listino prezzi
   - `docs/business/ONE-TIME-SERVICES-ARCHITECTURE.md` - Architettura servizi
   - `docs/business/BILLING-INFRASTRUCTURE.md` - Infrastruttura fatturazione
   - `docs/business/IMPLEMENTATION-PLAN-XOLO.md` - Piano implementazione

---

## 🚀 Setup Step-by-Step

### Fase 1: Database (Supabase)

#### 1.1 Eseguire Schema Servizi Una Tantum

```sql
-- File: supabase/one-time-services-schema.sql
-- Eseguire in Supabase Dashboard → SQL Editor
```

**Crea:**

- Tabella `orders` (tutti gli ordini)
- Tabella `access_grants` (accessi temporanei)
- Tabella `service_deliveries` (servizi erogati)
- Tabella `usage_tracking` (tracciamento utilizzo)
- Funzioni helper SQL
- RLS policies

#### 1.2 Aggiungere Campi Business

```sql
-- File: supabase/add-business-fields.sql
-- Eseguire in Supabase Dashboard → SQL Editor
```

**Aggiunge a `user_profiles`:**

- Campi business (ragione sociale, P.IVA, indirizzo, ecc.)
- Indici per performance

**Nota:** `ADD COLUMN IF NOT EXISTS` è sicuro, non duplica colonne esistenti

---

### Fase 2: Configurazione Xolo

#### 2.1 Account Xolo Go

1. Crea account: https://www.xolo.io/zz-it/go
2. Completa verifica identità
3. Collega conto bancario
4. Ottieni API Key

#### 2.2 Variabili Ambiente (Vercel)

Aggiungi in Vercel Dashboard → Settings → Environment Variables:

```
XOLO_API_BASE=https://api.xolo.io
XOLO_API_KEY=your_xolo_api_key_here
```

**Nota:** API Key da Xolo Dashboard → Settings → API

---

### Fase 3: Test API

#### 3.1 Test Salvataggio Dati

```bash
curl -X POST https://tuodominio.com/api/save-billing-data \
  -H "Content-Type: application/json" \
  -d '{
    "token": "test-token",
    "billing_data": {
      "user_type": "business",
      "email": "test@esempio.com",
      "business_name": "Test S.r.l.",
      "business_country": "IT",
      "business_vat": "IT12345678901"
    }
  }'
```

#### 3.2 Test Creazione Ordine

```bash
curl -X POST https://tuodominio.com/api/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "token": "test-token",
    "order_type": "access_pro"
  }'
```

**Verifica:**

- Ordine creato in `orders`
- Fattura creata in Xolo
- Email fattura inviata

---

### Fase 4: Frontend Integration

#### 4.1 Aggiungere CSS

In `dashboard.html`:

```html
<link rel="stylesheet" href="/assets/css/components/billing-form.css" />
```

#### 4.2 Importare JS

In `assets/js/dashboard/purchase.js` (da creare):

```javascript
import { showBillingForm } from "./billing-form.js";

async function purchaseService(orderType, amount) {
  // Mostra modale raccolta dati
  const billingData = await showBillingForm(orderType, amount);

  // Crea ordine
  const response = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_type: orderType,
      token: localStorage.getItem("tradelia-access-token-v1"),
      metadata: { billing_data: billingData },
    }),
  });

  const data = await response.json();
  if (data.ok) {
    // Mostra conferma con link fattura
    window.open(data.invoice_url, "_blank");
  }
}
```

---

### Fase 5: Admin Dashboard

#### 5.1 Pagina Gestione Ordini

Creare `admin/orders.html` con:

- Lista tutti gli ordini
- Filtri: status, tipo, data
- Azione: "Attiva Ordine" (chiama `/api/activate-order`)

#### 5.2 Verifica Pagamento Xolo

Admin può:

1. Vedere `payment_id` (invoice_id Xolo)
2. Cliccare link per verificare su Xolo
3. Se pagato → Cliccare "Attiva Ordine"
4. Sistema attiva servizio automaticamente

---

## 🔄 Flusso Completo End-to-End

### Utente Acquista Accesso Pro (€19)

```
1. Utente clicca "Acquista Accesso Pro"
   ↓
2. Frontend → showBillingForm('access_pro', 19)
   ↓
3. Modale → Utente compila dati fatturazione
   - Individual: Email, Nome, Cognome
   - Business: Email, Ragione Sociale, P.IVA, Indirizzo, ecc.
   ↓
4. Submit → POST /api/save-billing-data
   - Salva in user_profiles (se autenticato)
   ↓
5. Promise resolve → billingData
   ↓
6. Frontend → POST /api/create-order
   {
     order_type: 'access_pro',
     token: '...',
     metadata: { billing_data: billingData }
   }
   ↓
7. API → Cerca user_profile (trovato, usa dati business)
   ↓
8. API → Crea ordine in `orders` (status: pending_payment)
   ↓
9. API → createXoloInvoice(invoiceData, billingData)
   - Crea fattura Xolo con dati business completi
   - Ritorna invoice_id e invoice_url
   ↓
10. API → Aggiorna ordine (payment_id: invoice_id)
    ↓
11. API → Invia email fattura all'utente
    ↓
12. Utente riceve email → Clicca link fattura Xolo
    ↓
13. Utente paga su Xolo
    ↓
14. Admin verifica pagamento su Xolo
    ↓
15. Admin → POST /api/activate-order
    {
      order_id: '...',
      token: 'admin-token',
      verify_payment: true
    }
    ↓
16. API → Verifica pagamento Xolo (checkXoloPayment)
    ↓
17. API → Crea access_grant (grant_type: 'pro', expires_at: +30 giorni)
    ↓
18. API → Aggiorna ordine (status: completed)
    ↓
19. API → Invia email conferma all'utente
    ↓
20. Utente riceve email → Accesso attivo per 30 giorni
```

---

## 📊 Struttura Dati

### Ordine (orders)

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "access_token": "token",
  "order_type": "access_pro",
  "amount": 19.0,
  "currency": "EUR",
  "status": "pending_payment",
  "payment_method": "xolo",
  "payment_id": "xolo-invoice-id",
  "metadata": {
    "email": "mario@esempio.com",
    "user_type": "business",
    "business_name": "Azienda S.r.l.",
    "business_vat": "IT12345678901",
    "xolo_invoice_id": "...",
    "xolo_invoice_url": "..."
  }
}
```

### Access Grant (access_grants)

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "order_id": "uuid",
  "grant_type": "pro",
  "status": "active",
  "started_at": "2025-01-01T00:00:00Z",
  "expires_at": "2025-01-31T23:59:59Z"
}
```

### User Profile (user_profiles)

```json
{
  "user_id": "uuid",
  "user_type": "business",
  "business_name": "Azienda S.r.l.",
  "business_country": "IT",
  "business_vat": "IT12345678901",
  "business_address": "Via Roma 1",
  "business_city": "Milano",
  "business_zip": "20100",
  "business_contact_email": "fatturazione@azienda.it",
  "business_contact_firstname": "Mario",
  "business_contact_lastname": "Rossi"
}
```

---

## ✅ Checklist Completa

### Database

- [ ] Eseguire `one-time-services-schema.sql`
- [ ] Eseguire `add-business-fields.sql`
- [ ] Verificare tabelle create
- [ ] Verificare funzioni helper
- [ ] Testare RLS policies

### Xolo

- [ ] Account Xolo creato
- [ ] API Key ottenuta
- [ ] Variabili ambiente configurate in Vercel
- [ ] Test creazione fattura (test mode)

### API

- [ ] Test `save-billing-data`
- [ ] Test `create-order` (individual)
- [ ] Test `create-order` (business)
- [ ] Test `activate-order`
- [ ] Verificare integrazione Xolo

### Frontend

- [ ] CSS importato in dashboard.html
- [ ] JS importato
- [ ] Modale testata (individual)
- [ ] Modale testata (business)
- [ ] Flusso completo testato

### Admin

- [ ] Pagina gestione ordini
- [ ] Verifica pagamento Xolo
- [ ] Attivazione ordini testata

---

## 🔍 Troubleshooting

### Errore: "Xolo API key non configurato"

- Verifica variabile `XOLO_API_KEY` in Vercel
- Verifica che sia presente in ambiente corretto (production/preview)

### Errore: "Dati fatturazione incompleti"

- Verifica che `billingData` contenga almeno `email`
- Per business: verifica `business_name` e `business_country`

### Fattura Xolo non creata

- Verifica API Key Xolo valida
- Verifica formato dati (P.IVA con prefisso paese)
- Controlla log Vercel per errori dettagliati

### Dati business non salvati

- Verifica che utente abbia token valido
- Verifica che `user_profiles` esista e abbia colonne business
- Controlla log Supabase per errori

---

## 📚 Documentazione Completa

- **Listino Prezzi:** `docs/business/PRICING-BEST-PRACTICE.md`
- **Architettura Servizi:** `docs/business/ONE-TIME-SERVICES-ARCHITECTURE.md`
- **Infrastruttura Fatturazione:** `docs/business/BILLING-INFRASTRUCTURE.md`
- **Piano Implementazione:** `docs/business/IMPLEMENTATION-PLAN-XOLO.md`

---

## 🎯 Prossimi Passi

1. **Eseguire script SQL** in Supabase
2. **Configurare Xolo** (account + API key)
3. **Testare API** (save-billing-data, create-order)
4. **Integrare frontend** (modale billing form)
5. **Testare flusso completo** end-to-end
