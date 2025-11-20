# 🚀 Guida Completa Xolo Go - Integrazione B2C/B2B

## 🎯 Perché Xolo Go per Tradelia AI?

✅ **Funziona senza Partita IVA**: Puoi iniziare subito come privato  
✅ **Vendite B2C e B2B**: Supporta entrambi i modelli  
✅ **Fatturazione automatica**: Xolo emette fatture conformi per te  
✅ **Compliance fiscale completa**: Xolo gestisce tutto il lato fiscale  
✅ **Intermediario fiscale**: Xolo funge da intermediario, usa la loro azienda  
✅ **Supporto e-commerce**: Supporta vendite online e abbonamenti  
✅ **Ricevi pagamenti diretti**: Pagamenti arrivano sul tuo conto bancario personale

---

## 📋 Come Funziona Xolo Go

### Architettura

```
Cliente → Pagamento (Stripe/PayPal/etc.) → Xolo Go → Tuo Conto Bancario
                ↓
         Xolo emette Fattura
         (compliance fiscale gestita)
```

**Xolo Go funziona come intermediario:**
1. Tu vendi prodotti/servizi ai clienti
2. I clienti pagano tramite gateway (Stripe, PayPal, etc.)
3. Xolo emette fatture conformi per conto tuo
4. I pagamenti arrivano sul tuo conto bancario personale
5. Xolo gestisce compliance fiscale, IVA, reporting

---

## 🚀 Setup Passo-Passo

### **Passo 1: Crea Account Xolo Go**

1. Vai su https://www.xolo.io/zz-it/go
2. Clicca su **"Get Started"** o **"Sign Up"**
3. Completa registrazione:
   - Email
   - Password
   - Nome completo
   - Paese di residenza

### **Passo 2: Completa Verifica Identità**

1. **Verifica Email**: Controlla email e clicca link di verifica
2. **Verifica Identità**:
   - Documento d'identità (carta d'identità o passaporto)
   - Selfie per verifica facciale
   - Indirizzo di residenza
3. **Collega Conto Bancario**:
   - IBAN del tuo conto personale
   - Xolo userà questo conto per inviarti i pagamenti

### **Passo 3: Configura Business Profile**

1. **Business Details**:
   - Nome business (puoi usare il tuo nome personale)
   - Descrizione attività
   - Settore (SaaS, Software, etc.)
2. **Fatturazione**:
   - Xolo configura automaticamente la fatturazione
   - Template fatture pre-configurati
   - Numerazione automatica

### **Passo 4: Collega Gateway di Pagamento**

Xolo Go supporta vari gateway:
- **Stripe** (raccomandato)
- **PayPal**
- Altri gateway supportati

**Per Stripe:**
1. Vai su **Settings** → **Payment Methods**
2. Clicca **"Connect Stripe"**
3. Autorizza Xolo ad accedere al tuo account Stripe
4. Xolo gestirà i pagamenti tramite Stripe

**Nota**: Xolo può anche gestire i pagamenti direttamente, oppure puoi usare Stripe e Xolo solo per fatturazione.

---

## 💻 Integrazione Tecnica

### **Opzione A: Xolo come Intermediario Completo**

Xolo gestisce pagamenti + fatturazione:

```javascript
// Xolo fornisce API per creare transazioni
// I pagamenti passano attraverso Xolo
const xolo = require('@xolo/api');

const transaction = await xolo.transactions.create({
  amount: 9900, // €99.00 in centesimi
  currency: 'EUR',
  description: 'Pro Plan - Abbonamento mensile',
  customerEmail: 'customer@example.com',
  customerName: 'Nome Cliente',
  // Xolo emetterà fattura automaticamente
});
```

### **Opzione B: Stripe + Xolo (Raccomandato)**

Usa Stripe per pagamenti, Xolo per fatturazione:

1. **Stripe gestisce pagamenti** (già implementato ✅)
2. **Xolo emette fatture** basate su transazioni Stripe

**Flusso:**
```
Cliente → Stripe Checkout → Pagamento → Webhook Stripe
                                           ↓
                                    Xolo API (crea fattura)
                                           ↓
                                    Fattura emessa automaticamente
```

### **Integrazione Webhook Stripe → Xolo**

```javascript
// /api/webhook-stripe-xolo.js
// Dopo che Stripe processa il pagamento, crea fattura in Xolo

import { syncUserRoleFromSubscription } from './webhook-role-sync.js';

export default async function handler(req, res) {
  // ... verifica webhook Stripe ...
  
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;
    
    // 1. Sincronizza ruolo in Supabase (già fatto)
    await syncUserRoleFromSubscription(/* ... */);
    
    // 2. Crea fattura in Xolo
    await createXoloInvoice({
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      customerEmail: invoice.customer_email,
      customerName: invoice.customer_name,
      description: invoice.description || 'Abbonamento Tradelia AI',
      stripeInvoiceId: invoice.id,
      date: new Date(invoice.created * 1000)
    });
  }
}

async function createXoloInvoice(data) {
  const XOLO_API_KEY = process.env.XOLO_API_KEY;
  const XOLO_API_URL = 'https://api.xolo.io/v1';
  
  const response = await fetch(`${XOLO_API_URL}/invoices`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${XOLO_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      customer_email: data.customerEmail,
      customer_name: data.customerName,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      date: data.date.toISOString().split('T')[0],
      // Metadata per tracking
      metadata: {
        stripe_invoice_id: data.stripeInvoiceId,
        source: 'tradelia_ai'
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`Xolo API error: ${response.statusText}`);
  }
  
  const invoice = await response.json();
  console.log('[Xolo] Fattura creata:', invoice.id);
  return invoice;
}
```

---

## 🔑 Configurazione Variabili Ambiente

Aggiungi a `.env` o Vercel Environment Variables:

```bash
# Xolo Go API
XOLO_API_KEY=your_xolo_api_key
XOLO_API_URL=https://api.xolo.io/v1

# Stripe (già configurato)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase (già configurato)
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 📊 Flusso Completo B2C/B2B

### **B2C (Consumatori Finali)**

1. Cliente seleziona piano (es: Pro €29/mese)
2. Checkout Stripe → Pagamento
3. Webhook Stripe → Sincronizza ruolo in Supabase
4. Webhook Stripe → Crea fattura in Xolo
5. Xolo emette **Receipt** (per B2C)
6. Cliente riceve receipt via email
7. Tu ricevi pagamento sul conto bancario

### **B2B (Aziende)**

1. Cliente business seleziona piano (es: Desk €99/mese)
2. Checkout Stripe → Pagamento
3. Webhook Stripe → Sincronizza ruolo in Supabase
4. Webhook Stripe → Crea fattura in Xolo
5. Xolo emette **Invoice** con Partita IVA cliente (se fornita)
6. Xolo gestisce reverse charge se necessario
7. Cliente riceve invoice via email
8. Tu ricevi pagamento sul conto bancario

---

## 🎯 Vantaggi Xolo Go

### **Compliance Fiscale**
- ✅ Fatturazione conforme in 164+ paesi
- ✅ Gestione IVA automatica
- ✅ Reverse charge per B2B
- ✅ Reporting fiscale automatico
- ✅ Supporto e-invoicing dove richiesto

### **Semplicità**
- ✅ Nessuna Partita IVA richiesta
- ✅ Setup in pochi minuti
- ✅ Gestione automatica compliance
- ✅ Supporto clienti disponibile

### **Flessibilità**
- ✅ Supporta B2C e B2B
- ✅ Abbonamenti ricorrenti
- ✅ Pagamenti una tantum
- ✅ Multi-valuta

---

## ⚠️ Considerazioni

### **Costi**
- **Xolo Go**: Commissione mensile + commissione per fattura
- **Stripe**: 2.9% + €0.30 per transazione
- **Totale**: Xolo fee + Stripe fee

**Esempio per transazione €99:**
- Stripe: €2.87 + €0.30 = €3.17
- Xolo: ~€2-5 per fattura (dipende dal piano)
- **Totale**: ~€5-8 per transazione

### **Limitazioni**
- ⚠️ Xolo funge da intermediario (meno controllo diretto)
- ⚠️ Tempi di pagamento: I pagamenti possono richiedere 1-3 giorni lavorativi
- ⚠️ Alcune restrizioni su tipi di attività (verifica con Xolo)

---

## 📝 Checklist Setup

### **Account Xolo**
- [ ] Account Xolo Go creato
- [ ] Verifica identità completata
- [ ] Conto bancario collegato
- [ ] Business profile configurato
- [ ] API Key ottenuta

### **Integrazione**
- [ ] Gateway di pagamento collegato (Stripe/PayPal)
- [ ] Webhook handler creato (`/api/webhook-stripe-xolo.js`)
- [ ] Variabili ambiente configurate
- [ ] Testato flusso B2C
- [ ] Testato flusso B2B

### **Produzione**
- [ ] Testato con transazione reale
- [ ] Verificato che fatture vengano emesse
- [ ] Verificato che pagamenti arrivino sul conto
- [ ] Configurato reporting fiscale

---

## 🔗 Risorse

- **Xolo Go**: https://www.xolo.io/zz-it/go
- **Documentazione API**: https://xolo.io/docs (verifica URL esatto)
- **Supporto**: support@xolo.io o chat in-app
- **Pricing**: Verifica su sito Xolo (piani variabili)

---

## 🚀 Prossimi Passi

1. **Crea account Xolo Go** e completa verifica
2. **Collega Stripe** (o altro gateway)
3. **Ottieni API Key** da Xolo
4. **Crea webhook handler** per integrare Stripe → Xolo
5. **Testa flusso completo** in modalità test
6. **Passa a produzione** quando tutto funziona

---

## 💡 Nota Importante

Xolo Go è perfetto se:
- ✅ Non hai Partita IVA
- ✅ Vuoi vendere B2C e B2B
- ✅ Vuoi che qualcun altro gestisca compliance fiscale
- ✅ Preferisci soluzione "tutto incluso"

**Alternativa**: Se vuoi più controllo, considera **Stripe diretto** (già implementato) e gestisci fatturazione manualmente o con servizio separato.

