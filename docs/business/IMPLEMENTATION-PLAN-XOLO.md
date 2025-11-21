# 🚀 Piano Implementazione - Servizi Una Tantum (Xolo)

## 📋 Flusso Completo

### Scenario: Utente Acquista Accesso Pro

```
1. Utente clicca "Acquista Accesso Pro" (€19)
2. Frontend → API: POST /api/create-order
3. API crea ordine in `orders` (status: pending_payment)
4. API crea fattura Xolo → ottiene invoice_id
5. API aggiorna ordine (xolo_invoice_id, status: pending_manual)
6. Email fattura all'utente (via Xolo o nostro sistema)
7. Utente paga fattura Xolo
8. Admin verifica pagamento → API: POST /api/activate-order
9. API attiva access_grant (30 giorni)
10. API aggiorna ordine (status: completed)
11. Email conferma all'utente
```

---

## 🔧 Componenti da Implementare

### 1. API Endpoints

#### `POST /api/create-order`

- Crea ordine in database
- Crea fattura Xolo
- Invia email fattura
- Ritorna order_id e invoice_id

#### `POST /api/activate-order`

- Attiva servizio dopo pagamento verificato
- Crea access_grant (se accesso)
- Crea service_delivery (se analisi/PDF)
- Aggiorna ordine a "completed"

#### `GET /api/orders`

- Lista ordini utente (con RLS)
- Filtri: status, order_type, date range

#### `GET /api/order/:id`

- Dettaglio singolo ordine
- Include invoice link, status, delivery info

#### `GET /api/usage`

- Utilizzo corrente utente
- Analisi incluse usate/rimanenti
- Analisi extra usate/rimanenti

### 2. Integrazione Xolo

#### Funzione: `createXoloInvoice(order)`

- Crea fattura in Xolo Go
- Ritorna invoice_id e invoice_url
- Gestisce errori e retry

#### Funzione: `checkXoloPayment(invoice_id)`

- Verifica stato pagamento fattura
- Ritorna: pending, paid, overdue

### 3. Frontend Components

#### Component: `PurchaseButton`

- Bottone acquisto per ogni servizio
- Mostra prezzo e cosa include
- Redirect a checkout o modale

#### Component: `OrderHistory`

- Lista ordini utente
- Status, data, importo
- Link fattura se disponibile

#### Component: `UsageDisplay`

- Mostra utilizzo corrente
- Analisi incluse: X/Y usate
- Analisi extra: X/Y usate
- Progress bar visiva

#### Component: `ServiceRequest`

- Form richiesta analisi
- Validazione: può usare inclusa? extra? standalone?
- Mostra prezzo dinamico
- Submit → crea ordine

### 4. Admin Dashboard

#### Pagina: `Orders Management`

- Lista tutti gli ordini
- Filtri: status, tipo, data
- Azioni: attiva, cancella, rimborsa
- Verifica pagamento Xolo

#### Pagina: `Usage Analytics`

- Statistiche utilizzo
- Revenue per tipo servizio
- Conversion rate tier
- Churn analysis

---

## 📝 File da Creare

### API

- `api/create-order.js` - Crea ordine e fattura Xolo
- `api/activate-order.js` - Attiva servizio dopo pagamento
- `api/get-orders.js` - Lista ordini utente
- `api/get-order.js` - Dettaglio ordine
- `api/get-usage.js` - Utilizzo corrente
- `api/_lib/xolo.js` - Integrazione Xolo Go

### Frontend

- `assets/js/dashboard/purchase.js` - Logica acquisto
- `assets/js/dashboard/orders.js` - Gestione ordini
- `assets/js/dashboard/usage.js` - Display utilizzo
- `assets/js/dashboard/service-request.js` - Richiesta servizi

### Admin

- `admin/orders.html` - Gestione ordini
- `assets/js/admin/orders.js` - Logica admin ordini

---

## 🔄 Flusso Dettagliato

### 1. Creazione Ordine

```javascript
// Frontend: assets/js/dashboard/purchase.js
async function purchaseService(orderType) {
  const response = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_type: orderType, // 'access_pro', 'analysis_standalone', ecc.
      token: localStorage.getItem("tradelia-access-token-v1"),
    }),
  });

  const data = await response.json();

  if (data.ok) {
    // Mostra conferma con link fattura
    showInvoiceModal(data.order_id, data.invoice_url);
  }
}
```

### 2. Creazione Fattura Xolo

```javascript
// API: api/_lib/xolo.js
async function createXoloInvoice(order) {
  const invoiceData = {
    customer_email: order.email,
    amount: order.amount,
    currency: order.currency,
    description: getServiceDescription(order.order_type),
    due_date: getDueDate(14), // 14 giorni
    metadata: {
      order_id: order.id,
      order_type: order.order_type,
    },
  };

  // Chiamata API Xolo Go
  const response = await fetch("https://api.xolo.io/invoices", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.XOLO_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(invoiceData),
  });

  return await response.json();
}
```

### 3. Attivazione Servizio

```javascript
// API: api/activate-order.js
async function activateOrder(orderId) {
  const order = await getOrder(orderId);

  if (order.status !== "paid") {
    throw new Error("Ordine non pagato");
  }

  if (order.order_type === "access_pro" || order.order_type === "access_desk") {
    // Crea access grant
    const grantType = order.order_type === "access_pro" ? "pro" : "desk";
    await createAccessGrant({
      user_id: order.user_id,
      order_id: orderId,
      grant_type: grantType,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  }

  // Aggiorna ordine
  await updateOrder(orderId, {
    status: "completed",
    completed_at: new Date(),
  });

  // Email conferma
  await sendConfirmationEmail(order.user_id, order);
}
```

---

## 🎯 Priorità Implementazione

### Fase 1: Core (Settimana 1)

- [ ] Schema database (già fatto)
- [ ] API create-order
- [ ] Integrazione Xolo base
- [ ] Frontend purchase button
- [ ] Email fattura

### Fase 2: Attivazione (Settimana 2)

- [ ] API activate-order
- [ ] Admin dashboard ordini
- [ ] Verifica pagamento Xolo
- [ ] Email conferma

### Fase 3: Utilizzo (Settimana 3)

- [ ] API get-usage
- [ ] Frontend usage display
- [ ] Service request form
- [ ] Validazione priorità (inclusa → extra → standalone)

### Fase 4: Analytics (Settimana 4)

- [ ] Dashboard analytics
- [ ] Reporting revenue
- [ ] Conversion tracking
- [ ] Churn analysis

---

## 📧 Email Templates

### Email Fattura

```
Oggetto: Fattura Tradelia AI - [Tipo Servizio]

Ciao [Nome],

Hai richiesto: [Tipo Servizio] - €[Importo]

Fattura disponibile: [Link Fattura Xolo]

Pagamento entro: [Data Scadenza]

Dopo il pagamento, il servizio sarà attivato automaticamente.

Grazie,
Tradelia AI
```

### Email Conferma

```
Oggetto: Servizio Attivato - Tradelia AI

Ciao [Nome],

Il tuo servizio è stato attivato!

[Tipo Servizio] attivo fino a: [Data Scadenza]

[Se accesso]: Puoi ora accedere a [Dashboard/Features]
[Se analisi]: La tua analisi sarà pronta entro 24-48 ore

Grazie,
Tradelia AI
```

---

## 🔐 Sicurezza

- RLS policies su tutte le tabelle
- Validazione input su tutti gli endpoint
- Rate limiting su create-order
- Logging tutte le operazioni
- Audit trail per ordini

---

## ✅ Checklist Finale

### Database

- [x] Schema completo
- [ ] Migrazione eseguita
- [ ] RLS policies testate
- [ ] Funzioni helper testate

### API

- [ ] create-order implementato
- [ ] activate-order implementato
- [ ] get-orders implementato
- [ ] get-usage implementato
- [ ] Xolo integration testata

### Frontend

- [ ] Purchase buttons
- [ ] Order history
- [ ] Usage display
- [ ] Service request form

### Admin

- [ ] Orders management
- [ ] Payment verification
- [ ] Analytics dashboard

### Email

- [ ] Template fattura
- [ ] Template conferma
- [ ] Template scadenza
