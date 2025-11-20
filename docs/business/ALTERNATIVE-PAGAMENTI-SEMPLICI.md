# 💳 Alternative ai Payment Gateway con Fatturazione Automatica

## 🎯 Situazione Attuale

- ❌ **Paddle**: Rifiutati (gestiva fatturazione automatica)
- ⚠️ **LemonSqueezy**: Problemi con integrazione Stripe
- ✅ **Stripe diretto**: Webhook già implementato, ora integrato con sincronizzazione ruoli
- 🎯 **Requisito**: Gateway che gestisca **fatturazione automatica** (IVA/VAT, compliance fiscale)
- ⚠️ **Importante**: **Nessuna Partita IVA** - serve soluzione che funzioni senza Partita IVA

---

## ✅ **OPZIONE 1: Stripe + Stripe Tax + Stripe Invoicing (RACCOMANDATO - FUNZIONA SENZA PARTITA IVA)**

### Perché è la migliore per fatturazione?

✅ **Già implementato**: Webhook già presente, ora integrato con `webhook-role-sync.js`  
✅ **Funziona senza Partita IVA**: Stripe può emettere receipts/invoices anche senza Partita IVA  
✅ **Stripe Tax**: Gestione IVA/VAT automatica per 140+ paesi (opzionale se non hai Partita IVA)  
✅ **Stripe Invoicing**: Fatture/receipts automatiche, invio email automatico  
✅ **Nessun intermediario**: Integrazione diretta, controllo completo  
✅ **Documentazione eccellente**: API chiare e ben documentate  
✅ **Supporto globale**: Accettato in tutto il mondo  
✅ **Flessibile**: Puoi emettere receipts per privati, invoices per business

### Setup

1. **Crea account Stripe**: https://stripe.com
2. **Ottieni API Keys**:
   - `STRIPE_SECRET_KEY` (sk_test_... o sk_live_...)
   - `STRIPE_WEBHOOK_SECRET` (whsec_...)
3. **Configura Business Details** (Dashboard → Settings → Business):
   - **Senza Partita IVA**: Inserisci solo nome, indirizzo, email
   - Stripe accetta account anche senza Partita IVA/VAT number
   - Puoi aggiungere Partita IVA in seguito se necessario
4. **Attiva Stripe Invoicing** (Dashboard → Invoicing):
   - Configura template receipts/invoices
   - **Senza Partita IVA**: Stripe emette "Receipts" invece di "Invoices" (conforme)
   - Abilita invio automatico email
   - Personalizza branding
5. **Stripe Tax (Opzionale)** (Dashboard → Tax):
   - **Senza Partita IVA**: Non necessario se vendi a consumatori finali
   - Se vendi a business, Stripe gestisce comunque la tax calculation
   - Puoi attivarlo in seguito quando avrai Partita IVA
6. **Crea Products & Prices** in Stripe Dashboard:
   - Pro: €X/mese
   - Desk: €Y/mese
7. **Configura Webhook**:
   - URL: `https://tuodominio.com/api/webhook-stripe`
   - Eventi: `customer.subscription.*`, `checkout.session.completed`, `invoice.*`, `invoice.finalized`

### Integrazione Frontend

```javascript
// Esempio: Stripe Checkout
async function openStripeCheckout(priceId) {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId, userEmail: userEmail })
  });
  
  const { sessionId } = await response.json();
  
  // Reindirizza a Stripe Checkout
  const stripe = Stripe('pk_test_...');
  await stripe.redirectToCheckout({ sessionId });
}
```

### Costi

- **Stripe Payments**: 2.9% + €0.30 per transazione (Europa)
- **Stripe Tax**: 0.5% aggiuntivo su transazioni con tax (solo se applicata)
- **Stripe Invoicing**: Gratuito per prime 25 fatture/mese, poi €0.25/fattura

### Vantaggi

- ✅ **Funziona senza Partita IVA**: Puoi iniziare subito, anche come privato
- ✅ **Fatturazione automatica**: Receipts/Invoices generate e inviate automaticamente
- ✅ **IVA automatica (opzionale)**: Stripe Tax calcola IVA quando necessario
- ✅ **Compliance fiscale**: Receipts conformi per vendite a consumatori finali
- ✅ **Zero intermediari**: Controllo completo
- ✅ **Customer Portal**: Gestione abbonamenti integrata
- ✅ **PDF automatici**: Generazione automatica PDF receipts/invoices
- ✅ **Flessibile**: Puoi aggiungere Partita IVA in seguito senza cambiare integrazione

### Svantaggi

- ⚠️ **Stripe Tax (opzionale)**: Se attivi, costa 0.5% extra (non necessario senza Partita IVA)
- ⚠️ **Receipts vs Invoices**: Senza Partita IVA emetti "Receipts" (perfetto per B2C)
- ⚠️ **Limitazioni B2B**: Per vendite B2B potrebbe servire Partita IVA (dipende dal paese)

---

## 🟡 **OPZIONE 2: PayFacile (ITALIANA - RICHIEDE PARTITA IVA)**

### ⚠️ **NOTA**: PayFacile richiede Partita IVA per la fatturazione elettronica

### Perché è ottima per fatturazione?

✅ **Made in Italy**: Soluzione italiana, perfetta per compliance italiana  
✅ **Fatturazione automatica**: Fatture elettroniche (XML) conformi  
✅ **Gestione IVA automatica**: Calcolo e applicazione IVA automatica  
✅ **Setup semplice**: Interfaccia intuitiva, supporto in italiano  
✅ **Pagamenti multipli**: Carte, bonifici, PayPal  
✅ **Checkout personalizzabile**: Pagine di pagamento personalizzate

### Setup

1. **Crea account**: https://www.payfacile.it
2. **Completa verifica business**: **Partita IVA richiesta**, documenti
3. **Configura fatturazione**: Template, numerazione automatica
4. **Ottieni API Key**: Per integrazione

### ⚠️ **Limitazione**

- ❌ **Richiede Partita IVA**: Non adatto se non hai Partita IVA

### Integrazione

```javascript
// Esempio: PayFacile Checkout
// PayFacile fornisce SDK JavaScript
PayFacile.init({
  apiKey: 'your_api_key',
  environment: 'production'
});

PayFacile.createSubscription({
  planId: 'pro_monthly',
  customerEmail: userEmail,
  successUrl: '/success',
  cancelUrl: '/cancel'
});
```

### Vantaggi

- ✅ **Compliance italiana**: Fatturazione elettronica (XML) automatica
- ✅ **IVA automatica**: Gestione completa IVA italiana
- ✅ **Supporto italiano**: Team e documentazione in italiano
- ✅ **Commissioni competitive**: ~2.5% + €0.25

### Svantaggi

- ⚠️ **Principalmente Italia**: Meno globale di Stripe
- ⚠️ **Documentazione**: Meno estesa di Stripe (ma in italiano)

---

## 🟢 **OPZIONE 3: Xolo Go (SENZA PARTITA IVA - RACCOMANDATA)**

### Perché è ottima se non hai Partita IVA?

✅ **Funziona senza Partita IVA**: Xolo funge da intermediario, usa la loro azienda  
✅ **Fatturazione automatica**: Fatture conformi emesse da Xolo  
✅ **Gestione fiscale**: Xolo gestisce compliance fiscale per te  
✅ **Ricevi pagamenti**: Pagamenti arrivano sul tuo conto bancario personale  
✅ **Setup semplice**: Account personale, nessuna società richiesta  
✅ **Supporto globale**: Funziona in molti paesi

### Setup

1. **Crea account**: https://www.xolo.io/zz-it/go
2. **Completa verifica identità**: Documenti personali (no Partita IVA)
3. **Collega conto bancario**: Ricevi pagamenti sul tuo conto
4. **Configura fatturazione**: Xolo emette fatture per te
5. **Integra gateway**: Xolo supporta vari gateway di pagamento

### Vantaggi

- ✅ **Zero Partita IVA**: Funziona completamente senza Partita IVA
- ✅ **Fatturazione automatica**: Xolo emette fatture conformi per te
- ✅ **Compliance gestita**: Xolo si occupa di compliance fiscale
- ✅ **Perfetto per freelance**: Ideale per attività occasionali o freelance

### Svantaggi

- ⚠️ **Costo**: Commissione Xolo + commissioni gateway
- ⚠️ **Intermediario**: Meno controllo diretto rispetto a Stripe
- ⚠️ **Limitazioni**: Alcune restrizioni su tipi di attività

---

## 🟡 **OPZIONE 4: Recurly (PROFESSIONALE)**

### Perché è ottima per fatturazione?

✅ **Piattaforma dedicata**: Specializzata in abbonamenti e fatturazione  
✅ **Fatturazione avanzata**: Template personalizzabili, multi-lingua  
✅ **Gestione fiscale**: Tax calculation integrato  
✅ **Dunning management**: Gestione automatica pagamenti falliti  
✅ **Revenue recognition**: Gestione revenue automatica (GAAP compliant)  
✅ **Multi-gateway**: Supporta Stripe, PayPal, Braintree, etc.

### Setup

1. **Crea account**: https://recurly.com
2. **Configura gateway**: Collega Stripe o altro gateway
3. **Setup invoicing**: Template, tax rules, dunning
4. **Ottieni API Key**: Per integrazione

### Vantaggi

- ✅ **Fatturazione professionale**: Template avanzati, multi-lingua
- ✅ **Revenue recognition**: Gestione revenue automatica
- ✅ **Dunning management**: Gestione automatica pagamenti falliti
- ✅ **Multi-gateway**: Flessibilità nella scelta gateway

### Svantaggi

- ⚠️ **Costo**: Pricing basato su revenue (da $0 a $500+/mese)
- ⚠️ **Complessità**: Più complesso di soluzioni semplici
- ⚠️ **Overkill**: Potrebbe essere troppo per startup piccole

---

## 🟡 **OPZIONE 5: PayPal**

### Perché è semplice?

✅ **Setup velocissimo**: Account PayPal + API keys  
✅ **Familiare agli utenti**: Tutti conoscono PayPal  
✅ **Nessuna verifica complessa**: Account business facile da ottenere  
✅ **Checkout integrato**: PayPal Checkout è molto semplice

### Setup

1. **Crea Business Account**: https://www.paypal.com/business
2. **Ottieni API Credentials**:
   - Client ID
   - Client Secret
3. **Integra PayPal SDK**:
   ```html
   <script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&vault=true&intent=subscription"></script>
   ```

### Integrazione Frontend

```javascript
// Esempio: PayPal Subscription
paypal.Buttons({
  createSubscription: function(data, actions) {
    return actions.subscription.create({
      plan_id: 'P-XXX' // Plan ID da PayPal
    });
  },
  onApprove: function(data, actions) {
    // Subscription creata
    console.log('Subscription ID:', data.subscriptionID);
  }
}).render('#paypal-button-container');
```

### Vantaggi

- ✅ **Setup velocissimo**: 10 minuti
- ✅ **Familiare**: Utenti si fidano di PayPal
- ✅ **Nessuna carta richiesta**: PayPal balance o conto collegato

### Svantaggi

- ⚠️ **Commissioni alte**: 3.4% + €0.35 (Europa)
- ⚠️ **Webhook meno affidabili**: A volte ritardati
- ⚠️ **Fatturazione limitata**: Nessuna gestione automatica IVA/fatture
- ⚠️ **UX meno moderna**: Checkout meno moderno di Stripe

---

## 🟡 **OPZIONE 6: Mollie**

### Perché è semplice?

✅ **Europa-focused**: Perfetto per mercato europeo  
✅ **Setup semplice**: API chiare e documentazione buona  
✅ **Multi-metodo**: Supporta carte, iDEAL, Bancontact, etc.  
✅ **Gestione fiscale**: Supporto IVA per alcuni paesi

### Setup

1. **Crea account**: https://www.mollie.com
2. **Ottieni API Key**: `live_...` o `test_...`
3. **Crea Profiles** per abbonamenti ricorrenti

### Integrazione

```javascript
// Esempio: Mollie Subscription
const mollie = require('@mollie/api-client');
const mollieClient = mollie({ apiKey: 'live_...' });

const subscription = await mollieClient.customers_subscriptions.create({
  customerId: 'cst_...',
  amount: { value: '29.00', currency: 'EUR' },
  interval: '1 month',
  description: 'Pro Plan'
});
```

### Vantaggi

- ✅ **Europa-focused**: Ottimo per mercato italiano/europeo
- ✅ **Multi-metodo**: iDEAL, Bancontact, etc.
- ✅ **Commissioni competitive**: 1.8% + €0.29 (carte), 0.8% (iDEAL)

### Svantaggi

- ⚠️ **Meno globale**: Principalmente Europa
- ⚠️ **Documentazione meno completa**: Rispetto a Stripe
- ⚠️ **Webhook meno testati**: Meno community rispetto a Stripe

---

## 📊 **Confronto Rapido - Focus Fatturazione SENZA PARTITA IVA**

| Caratteristica | Stripe | Xolo Go | PayFacile | Recurly | PayPal | Mollie |
|---------------|--------|---------|-----------|---------|--------|--------|
| **Funziona senza Partita IVA** | ✅ Sì | ✅ Sì | ❌ No | ✅ Sì | ✅ Sì | ✅ Sì |
| **Fatturazione automatica** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| **IVA automatica** | ⭐⭐⭐⭐ (opz.) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ | ⭐⭐⭐ |
| **Compliance fiscale** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Semplicità setup** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Documentazione** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Commissioni** | 2.9% + €0.30 | Variabile | ~2.5% + €0.25 | Variabile | 3.4% + €0.35 | 1.8% + €0.29 |
| **Webhook affidabilità** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Supporto Italia** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Costo totale** | Medio | Medio-Alto | Basso | Alto | Medio | Basso |

---

## 🎯 **Raccomandazione - Fatturazione Automatica SENZA PARTITA IVA**

### **OPZIONE A: Xolo Go + Stripe** (MIGLIORE PER B2C/B2B CON INTERMEDIARIO) ⭐⭐

**Perché:**
1. ✅ **Funziona senza Partita IVA**: Xolo funge da intermediario fiscale
2. ✅ **Vendite B2C e B2B**: Supporta entrambi i modelli perfettamente
3. ✅ **Fatturazione automatica**: Xolo emette fatture/receipts conformi per te
4. ✅ **Compliance fiscale completa**: Xolo gestisce IVA, reverse charge, e-invoicing
5. ✅ **Intermediario fiscale**: Xolo usa la loro azienda, tu ricevi pagamenti sul conto personale
6. ✅ **Supporto e-commerce**: Perfetto per SaaS e abbonamenti
7. ✅ **Stripe integrato**: Usa Stripe per pagamenti (già implementato) + Xolo per fatturazione

**Costo totale**: 
- Stripe: 2.9% + €0.30 per transazione
- Xolo: ~€2-5 per fattura (dipende dal piano)
- **Totale**: ~€5-8 per transazione €99

**Setup:**
- Crea account Xolo Go (verifica identità, collega conto bancario)
- Collega Stripe a Xolo (o usa Xolo direttamente per pagamenti)
- Webhook Stripe → Xolo già implementato (`/api/webhook-stripe-xolo.js`)
- Xolo emette fatture automaticamente per ogni pagamento

**Perfetto per:**
- ✅ Vendite B2C (consumatori finali) → Xolo emette Receipts
- ✅ Vendite B2B (aziende) → Xolo emette Invoices con Partita IVA
- ✅ Compliance fiscale completa senza Partita IVA
- ✅ Intermediario che gestisce tutto il lato fiscale

📖 **Guida completa**: Vedi `GUIDA-XOLO-GO.md`

---

### **OPZIONE B: Stripe + Stripe Invoicing** (DIRETTO - GIÀ IMPLEMENTATO) ⭐

**Perché:**
1. ✅ **Già implementato**: Webhook già presente, ora integrato
2. ✅ **Funziona senza Partita IVA**: Puoi iniziare subito come privato
3. ✅ **Fatturazione automatica**: Receipts generate e inviate automaticamente
4. ✅ **Supporto globale**: Accettato in tutto il mondo
5. ✅ **Scalabile**: Funziona da startup a enterprise
6. ✅ **Documentazione eccellente**: Supporto e community enormi
7. ✅ **Flessibile**: Puoi aggiungere Partita IVA in seguito senza cambiare integrazione

**Costo totale**: 2.9% + €0.30 per transazione (Stripe Tax opzionale, non necessario senza Partita IVA)

**Setup senza Partita IVA:**
- Configura business details (nome, indirizzo, email)
- Attiva Stripe Invoicing (emette "Receipts" invece di "Invoices")
- Perfetto per vendite B2C (consumatori finali)

**Limitazioni:**
- ⚠️ Compliance fiscale gestita manualmente (o con Stripe Tax)
- ⚠️ Meno supporto per B2B complesso senza Partita IVA

---

### **OPZIONE C: PayFacile** (SOLO SE HAI PARTITA IVA)

⚠️ **NON ADATTO**: Richiede Partita IVA per la fatturazione elettronica

---

### **Se Stripe non va**, prova:

1. **Xolo Go**: Se vuoi compliance fiscale completa senza Partita IVA
2. **PayPal**: Solo se fatturazione non è critica (fatturazione limitata)
3. **Mollie**: Se target principale è Europa (fatturazione limitata)

---

## 🚀 **Prossimi Passi**

### Per Stripe + Stripe Tax + Invoicing:

1. ✅ Webhook già integrato con `webhook-role-sync.js`
2. ✅ Endpoint `/api/create-checkout-session.js` creato
3. ✅ Endpoint `/api/cancel-subscription.js` creato
4. ⏳ Attiva Stripe Tax in Dashboard
5. ⏳ Configura Stripe Invoicing (template, branding)
6. ⏳ Aggiungi Stripe.js nel frontend
7. ⏳ Crea Products & Prices in Stripe Dashboard
8. ⏳ Testa con Stripe Test Mode

### Per PayFacile:

1. ⏳ Crea account PayFacile
2. ⏳ Completa verifica business
3. ⏳ Configura fatturazione elettronica
4. ⏳ Crea webhook handler `/api/webhook-payfacile.js`
5. ⏳ Integra PayFacile SDK nel frontend

### File già creati:

- ✅ `/api/webhook-stripe.js` - Webhook Stripe con sync ruoli
- ✅ `/api/create-checkout-session.js` - Crea session Stripe Checkout
- ✅ `/api/cancel-subscription.js` - Cancella subscription Stripe

---

## 📝 **Note**

- **Stripe Tax**: Opzionale, gestisce IVA automaticamente (costo aggiuntivo ~0.5%)
- **Compliance**: Con Stripe, sei responsabile di GDPR/PCI DSS (ma Stripe aiuta)
- **Testing**: Usa sempre Stripe Test Mode prima di andare live

---

## ✅ **Checklist Stripe + Fatturazione**

### Setup Base
- [ ] Account Stripe creato
- [ ] API Keys configurate (test e live)
- [ ] Products & Prices creati in Stripe Dashboard
- [ ] Webhook configurato (già fatto ✅)
- [ ] Endpoint `/api/create-checkout-session.js` creato ✅
- [ ] Endpoint `/api/cancel-subscription.js` creato ✅

### Fatturazione Automatica (SENZA PARTITA IVA)
- [ ] **Business details configurati** (Dashboard → Settings → Business)
  - [ ] Nome business/personale
  - [ ] Indirizzo
  - [ ] Email
  - [ ] ⚠️ **NON serve Partita IVA** - puoi aggiungerla in seguito
- [ ] **Stripe Invoicing attivato** (Dashboard → Invoicing)
  - [ ] Template receipts configurato (senza Partita IVA emetti "Receipts")
  - [ ] Branding personalizzato (logo, colori)
  - [ ] Invio email automatico abilitato
- [ ] **Stripe Tax (OPZIONALE)** (Dashboard → Tax)
  - [ ] ⚠️ **Non necessario senza Partita IVA** per vendite B2C
  - [ ] Puoi attivarlo in seguito quando avrai Partita IVA
- [ ] Testato invio receipts in Test Mode

### Frontend
- [ ] Frontend integrato con Stripe.js
- [ ] Checkout testato in Test Mode
- [ ] Verificato che fatture vengano generate automaticamente
- [ ] Testato flusso completo: checkout → pagamento → fattura

### Produzione
- [ ] Passato a Live Mode
- [ ] Verificato fatture generate correttamente
- [ ] Testato con transazione reale
- [ ] Verificato compliance fiscale

---

## ✅ **Checklist PayFacile**

- [ ] Account PayFacile creato
- [ ] Verifica business completata
- [ ] Fatturazione elettronica configurata
- [ ] API Key ottenuta
- [ ] Webhook handler creato
- [ ] Frontend integrato con PayFacile SDK
- [ ] Testato flusso completo
- [ ] Verificato generazione fatture XML

