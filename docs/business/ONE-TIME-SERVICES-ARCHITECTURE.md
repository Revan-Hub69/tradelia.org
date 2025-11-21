# 🏗️ Architettura Servizi Una Tantum - Best Practice

## 🎯 Modello Business

### Principi Fondamentali

1. **Tutti i servizi sono una tantum** (no subscription ricorrenti)
2. **Accessi temporanei** (30 giorni) = prodotto digitale con scadenza
3. **Servizi immediati** (analisi, PDF) = prodotti digitali istantanei
4. **Pre-pagamento** (best practice per digital goods)
5. **Attivazione automatica** (webhook-based)

---

## 💰 Listino Servizi

### Accessi Temporanei (30 giorni)

| Servizio         | Prezzo | Durata    | Cosa Include                                             |
| ---------------- | ------ | --------- | -------------------------------------------------------- |
| **Accesso Pro**  | €19    | 30 giorni | 1 analisi inclusa, 3 slot extra a €29, PDF a €10         |
| **Accesso Desk** | €149   | 30 giorni | 2 analisi incluse, extra a €49, PDF incluso, white-label |

### Servizi Una Tantum

| Servizio               | Prezzo | Disponibile Per              | Note                                       |
| ---------------------- | ------ | ---------------------------- | ------------------------------------------ |
| **Analisi Standalone** | €49    | Tutti (guest incluso)        | Analisi completa, nessun accesso richiesto |
| **Analisi Extra Pro**  | €29    | Solo con Accesso Pro attivo  | Sconto 41% vs standalone                   |
| **Analisi Extra Desk** | €49    | Solo con Accesso Desk attivo | Prezzo base, nessuno sconto                |
| **PDF Download**       | €10    | Solo con Accesso Pro attivo  | Incluso per Desk                           |

---

## 🗄️ Database Architecture

### 1. Tabella `orders` (Tutti gli ordini una tantum)

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  access_token TEXT, -- Per compatibilità con dashboard tokens
  order_type TEXT NOT NULL CHECK (order_type IN (
    'access_pro',      -- Accesso Pro 30 giorni
    'access_desk',     -- Accesso Desk 30 giorni
    'analysis_standalone', -- Analisi standalone
    'analysis_extra_pro',  -- Analisi extra Pro
    'analysis_extra_desk', -- Analisi extra Desk
    'pdf_download'         -- PDF download
  )),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN (
    'pending_payment',
    'paid',
    'processing',
    'completed',
    'cancelled',
    'refunded',
    'failed'
  )),
  payment_method TEXT, -- 'stripe', 'xolo', 'manual'
  payment_id TEXT, -- Stripe payment intent ID o Xolo invoice ID
  metadata JSONB DEFAULT '{}'::jsonb, -- Dati aggiuntivi (ticker, report_id, ecc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

### 2. Tabella `access_grants` (Accessi temporanei attivi)

```sql
CREATE TABLE access_grants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  access_token TEXT, -- Per compatibilità
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  grant_type TEXT NOT NULL CHECK (grant_type IN ('pro', 'desk')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL, -- started_at + 30 giorni
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Tabella `service_deliveries` (Servizi erogati)

```sql
CREATE TABLE service_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  access_token TEXT,
  service_type TEXT NOT NULL CHECK (service_type IN (
    'analysis',
    'pdf_download'
  )),
  service_data JSONB NOT NULL, -- { ticker, report_id, analysis_id, ecc. }
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed'
  )),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Tabella `usage_tracking` (Tracciamento utilizzo)

```sql
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  access_token TEXT,
  access_grant_id UUID REFERENCES access_grants(id) ON DELETE SET NULL,
  usage_type TEXT NOT NULL CHECK (usage_type IN (
    'analysis_included',  -- Analisi inclusa (Pro: 1, Desk: 2)
    'analysis_extra',     -- Analisi extra (Pro: max 3, Desk: illimitate)
    'pdf_download'        -- PDF scaricato
  )),
  service_delivery_id UUID REFERENCES service_deliveries(id) ON DELETE SET NULL,
  month_year TEXT NOT NULL, -- YYYY-MM per aggregazioni
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔄 Flusso Completo

### Scenario 1: Acquisto Accesso Pro

```
1. Utente clicca "Acquista Accesso Pro" (€19)
2. Crea ordine in `orders` (status: pending_payment)
3. Redirect a Stripe Checkout (one-time payment)
4. Pagamento completato → Webhook Stripe
5. Aggiorna ordine (status: paid)
6. Crea access_grant (grant_type: pro, expires_at: +30 giorni)
7. Aggiorna ordine (status: completed)
8. Email conferma all'utente
```

### Scenario 2: Uso Analisi Inclusa

```
1. Utente con Accesso Pro attivo richiede analisi
2. Verifica access_grant attivo (status: active, expires_at > NOW)
3. Verifica usage_tracking (quante analisi incluse usate)
4. Se < 1 usata → Crea service_delivery (service_type: analysis)
5. Crea usage_tracking (usage_type: analysis_included)
6. Processa analisi
7. Aggiorna service_delivery (status: completed)
```

### Scenario 3: Acquisto Analisi Extra Pro

```
1. Utente con Accesso Pro attivo richiede analisi extra
2. Verifica access_grant attivo
3. Verifica usage_tracking (quante extra usate, max 3)
4. Se < 3 usate → Crea ordine (order_type: analysis_extra_pro, amount: €29)
5. Redirect a Stripe Checkout
6. Pagamento completato → Webhook
7. Crea service_delivery + usage_tracking (usage_type: analysis_extra)
8. Processa analisi
```

### Scenario 4: Scadenza Accesso

```
1. Cron job giornaliero verifica access_grants
2. Se expires_at < NOW AND status = 'active'
3. Aggiorna access_grant (status: expired)
4. Email notifica all'utente (accesso scaduto)
5. Opzione: link per rinnovo (nuovo ordine)
```

---

## 💳 Payment Gateway

### Stripe (Raccomandato)

**Vantaggi:**

- ✅ Attivazione automatica (webhook)
- ✅ UX migliore (checkout integrato)
- ✅ Gestione automatica rimborsi
- ✅ Supporto carte, Apple Pay, Google Pay
- ✅ Compliance PCI automatica

**Setup:**

- Prodotto: "Accesso Pro 30 giorni" - €19 one-time
- Prodotto: "Accesso Desk 30 giorni" - €149 one-time
- Prodotto: "Analisi Standalone" - €49 one-time
- Prodotto: "Analisi Extra Pro" - €29 one-time
- Prodotto: "Analisi Extra Desk" - €49 one-time
- Prodotto: "PDF Download" - €10 one-time

### Xolo Go (Opzionale, per B2B)

**Quando usare:**

- Cliente richiede fattura B2B
- Importi > €500
- Cliente istituzionale

**Flusso:**

- Ordine → Crea fattura Xolo → Email fattura → Attesa pagamento → Attivazione manuale

---

## 🎯 Best Practice Implementation

### 1. Priorità Servizi

```javascript
// Logica priorità
function canUseIncludedAnalysis(user) {
  const grant = getActiveAccessGrant(user);
  if (!grant) return false;

  const used = getUsageCount(user, "analysis_included");
  const max = grant.grant_type === "pro" ? 1 : 2;
  return used < max;
}

function canUseExtraAnalysis(user) {
  const grant = getActiveAccessGrant(user);
  if (!grant) return false;

  const used = getUsageCount(user, "analysis_extra");
  const max = grant.grant_type === "pro" ? 3 : Infinity; // Desk: illimitate
  return used < max;
}

function getAnalysisPrice(user) {
  const grant = getActiveAccessGrant(user);

  if (canUseIncludedAnalysis(user)) return 0; // Gratis
  if (canUseExtraAnalysis(user)) {
    return grant.grant_type === "pro" ? 29 : 49;
  }
  return 49; // Standalone
}
```

### 2. Validazione Ordini

```javascript
// Validazione prima di creare ordine
function validateOrder(user, orderType) {
  // Verifica disponibilità servizio
  if (orderType === "analysis_extra_pro" || orderType === "analysis_extra_desk") {
    const grant = getActiveAccessGrant(user);
    if (!grant) throw new Error("Accesso richiesto");

    if (orderType === "analysis_extra_pro" && grant.grant_type !== "pro") {
      throw new Error("Accesso Pro richiesto");
    }
    if (orderType === "analysis_extra_desk" && grant.grant_type !== "desk") {
      throw new Error("Accesso Desk richiesto");
    }
  }

  // Verifica limiti usage
  if (orderType === "analysis_extra_pro") {
    const used = getUsageCount(user, "analysis_extra");
    if (used >= 3) throw new Error("Limite analisi extra raggiunto");
  }

  return true;
}
```

### 3. Webhook Stripe

```javascript
// Webhook handler
async function handleStripeWebhook(event) {
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.order_id;

    // Aggiorna ordine
    await updateOrder(orderId, {
      status: "paid",
      paid_at: new Date(),
      payment_id: paymentIntent.id,
    });

    // Attiva servizio
    await activateService(orderId);
  }
}

async function activateService(orderId) {
  const order = await getOrder(orderId);

  if (order.order_type === "access_pro" || order.order_type === "access_desk") {
    // Crea access grant
    const grantType = order.order_type === "access_pro" ? "pro" : "desk";
    await createAccessGrant({
      user_id: order.user_id,
      order_id: orderId,
      grant_type: grantType,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 giorni
    });
  }

  // Aggiorna ordine
  await updateOrder(orderId, { status: "completed", completed_at: new Date() });

  // Email conferma
  await sendConfirmationEmail(order.user_id, order);
}
```

### 4. Cron Job Scadenze

```javascript
// Cron job giornaliero (Vercel Cron o Supabase Edge Function)
async function expireAccessGrants() {
  const expired = await db
    .from("access_grants")
    .select("*")
    .eq("status", "active")
    .lt("expires_at", new Date());

  for (const grant of expired) {
    await db.from("access_grants").update({ status: "expired" }).eq("id", grant.id);

    // Email notifica
    await sendExpirationEmail(grant.user_id, grant);
  }
}
```

---

## 📊 Reporting & Analytics

### Metriche Chiave

1. **Revenue per tipo servizio**
2. **Conversion rate** (guest → Pro → Desk)
3. **Usage rate** (quante analisi incluse vengono usate)
4. **Renewal rate** (quanti rinnovano accesso dopo 30 giorni)
5. **Churn** (quanti non rinnovano)

### Query Esempio

```sql
-- Revenue mensile per tipo servizio
SELECT
  DATE_TRUNC('month', created_at) as month,
  order_type,
  SUM(amount) as revenue,
  COUNT(*) as orders
FROM orders
WHERE status = 'completed'
GROUP BY month, order_type
ORDER BY month DESC;

-- Usage rate analisi incluse
SELECT
  grant_type,
  COUNT(DISTINCT access_grant_id) as total_grants,
  COUNT(DISTINCT CASE WHEN usage_type = 'analysis_included' THEN id END) as used_included,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN usage_type = 'analysis_included' THEN id END) /
        COUNT(DISTINCT access_grant_id), 2) as usage_rate
FROM access_grants ag
LEFT JOIN usage_tracking ut ON ut.access_grant_id = ag.id
WHERE ag.status = 'active'
GROUP BY grant_type;
```

---

## ✅ Checklist Implementazione

### Database

- [ ] Creare tabella `orders`
- [ ] Creare tabella `access_grants`
- [ ] Creare tabella `service_deliveries`
- [ ] Creare tabella `usage_tracking`
- [ ] Creare indici per performance
- [ ] Setup RLS policies

### Stripe

- [ ] Creare prodotti (6 prodotti one-time)
- [ ] Configurare webhook endpoint
- [ ] Testare pagamenti
- [ ] Testare webhook

### API

- [ ] Endpoint creazione ordine
- [ ] Endpoint webhook Stripe
- [ ] Endpoint validazione accesso
- [ ] Endpoint usage tracking
- [ ] Endpoint cron scadenze

### Frontend

- [ ] UI acquisto accesso
- [ ] UI richiesta analisi (con priorità)
- [ ] UI gestione ordini
- [ ] UI notifiche scadenza

---

## 🎯 Conclusione

Questo modello è:

- ✅ **Scalabile**: Gestisce migliaia di ordini
- ✅ **Automatizzato**: Webhook-based, minimo intervento manuale
- ✅ **Trasparente**: Prezzi chiari, nessuna sorpresa
- ✅ **Flessibile**: Facile aggiungere nuovi servizi
- ✅ **Compliant**: Tracciamento completo per audit
