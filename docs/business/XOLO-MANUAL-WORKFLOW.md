# 📋 Workflow Xolo Manuale

## 🎯 Situazione

**Xolo è completamente manuale** - Non c'è API automatica. Il flusso deve essere:

1. Utente compila dati fatturazione
2. Sistema crea ordine in database (status: `pending_manual`)
3. Admin crea fattura manualmente su Xolo
4. Admin marca ordine come pagato
5. Sistema attiva servizio automaticamente

---

## 🔄 Flusso Completo

### Step 1: Utente Richiede Servizio

```
Utente → Clicca "Acquista Accesso Pro"
  ↓
Frontend → showBillingForm() (raccoglie dati)
  ↓
POST /api/create-order
  {
    order_type: 'access_pro',
    billing_data: { ... }
  }
  ↓
API → Crea ordine in database
  {
    status: 'pending_manual',
    payment_method: 'xolo_manual',
    metadata: { billing_data: { ... } }
  }
  ↓
API → Invia email all'admin con dati fatturazione
  ↓
Utente → Riceve email "Ordine in attesa di fatturazione"
```

### Step 2: Admin Crea Fattura Xolo

```
Admin → Riceve email con dati fatturazione
  ↓
Admin → Vai su Xolo Dashboard
  ↓
Admin → Crea fattura manualmente con dati:
  - Cliente: Dati da email
  - Importo: Da ordine
  - Descrizione: Tipo servizio
  ↓
Admin → Salva invoice_id Xolo
```

### Step 3: Admin Marca Ordine come Pagato

```
Admin → Dashboard Admin → Ordini
  ↓
Admin → Trova ordine (status: pending_manual)
  ↓
Admin → Inserisce invoice_id Xolo
  ↓
Admin → Clicca "Segna come Pagato"
  ↓
POST /api/activate-order
  {
    order_id: '...',
    invoice_id: 'xolo-invoice-id',
    verify_payment: false (manuale, non verifica)
  }
  ↓
API → Aggiorna ordine
  {
    status: 'completed',
    payment_id: 'xolo-invoice-id'
  }
  ↓
API → Crea access_grant o service_delivery
  ↓
API → Invia email conferma all'utente
```

---

## 🛠️ Modifiche Necessarie

### 1. API `create-order.js`

**Modificare:**

- ❌ Rimuovere chiamata `createXoloInvoice()` (non esiste API)
- ✅ Creare ordine con `status: 'pending_manual'`
- ✅ Inviare email all'admin con dati fatturazione
- ✅ Inviare email all'utente "Ordine in attesa"

### 2. API `activate-order.js`

**Modificare:**

- ✅ Supportare `verify_payment: false` (manuale)
- ✅ Permettere inserimento manuale `invoice_id`
- ✅ Attivare servizio senza verifica pagamento

### 3. Admin Dashboard

**Creare pagina:**

- `admin/orders.html` - Lista ordini pending_manual
- Form per inserire `invoice_id` Xolo
- Bottone "Segna come Pagato"

### 4. Email Template

**Creare:**

- `email-templates/order-pending-admin.html` - Email admin con dati fatturazione
- `email-templates/order-pending-user.html` - Email utente "Ordine in attesa"

---

## 📧 Email Admin

**Oggetto:** Nuovo Ordine - Fatturazione Manuale Xolo

**Contenuto:**

```
Nuovo ordine richiede fatturazione manuale su Xolo:

Ordine ID: {order_id}
Tipo: {order_type}
Importo: €{amount}
Utente: {email}

Dati Fatturazione:
- Tipo: {user_type}
- Email: {email}
- Nome: {name}
- Ragione Sociale: {business_name}
- P.IVA: {business_vat}
- Indirizzo: {address}
- Città: {city}
- CAP: {zip}
- Paese: {country}

Crea fattura su Xolo e segna ordine come pagato.
Link: {admin_orders_url}
```

---

## 📊 Database

### Tabella `orders`

**Status possibili:**

- `pending_manual` - In attesa fatturazione manuale
- `pending_payment` - Fattura creata, in attesa pagamento
- `completed` - Pagato e attivato
- `failed` - Fallito

**Campo `payment_id`:**

- Inserito manualmente dall'admin (invoice_id Xolo)
- Opzionale fino a quando admin non crea fattura

---

## ✅ Checklist Implementazione

### API

- [ ] Modificare `create-order.js` (rimuovere Xolo API, aggiungere email admin)
- [ ] Modificare `activate-order.js` (supportare manuale)
- [ ] Creare template email admin
- [ ] Creare template email utente

### Admin Dashboard

- [ ] Creare `admin/orders.html`
- [ ] Lista ordini `pending_manual`
- [ ] Form inserimento `invoice_id`
- [ ] Bottone "Segna come Pagato"

### Frontend

- [ ] Modificare flusso acquisto (rimuovere attesa Xolo)
- [ ] Mostrare messaggio "Ordine in attesa fatturazione"

### Test

- [ ] Test creazione ordine
- [ ] Test email admin
- [ ] Test attivazione manuale
- [ ] Test flusso completo

---

## 🎯 Vantaggi Approccio Manuale

1. ✅ **Controllo completo:** Admin vede ogni ordine
2. ✅ **Flessibilità:** Admin può modificare fattura su Xolo
3. ✅ **Semplicità:** Nessuna integrazione API complessa
4. ✅ **Affidabilità:** Nessun problema con API Xolo

---

## 📝 Note

- **Volume basso:** Approccio manuale OK per pochi ordini/mese
- **Scalabilità:** Se volume cresce, considerare automazione
- **Backup:** Mantenere dati fatturazione in database per riferimento
