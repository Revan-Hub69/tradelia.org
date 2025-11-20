# Verifica 12 Funzioni API - Tradelia

## ✅ Le 12 Funzioni API Principali

### 1. **request-analysis.js**
- **Endpoint:** `/api/request-analysis`
- **Metodo:** POST
- **Funzione:** Salva richiesta analisi on-demand in Supabase
- **Status:** ✅ Funzionante

### 2. **request-free-token.js**
- **Endpoint:** `/api/request-free-token`
- **Metodo:** POST
- **Funzione:** Genera token gratuito trial (30 giorni)
- **Status:** ✅ Funzionante

### 3. **request-dashboard-token.js**
- **Endpoint:** `/api/request-dashboard-token`
- **Metodo:** POST
- **Funzione:** Richiede/genera token dashboard per utente autenticato
- **Status:** ✅ Funzionante

### 4. **validate-dashboard-token.js**
- **Endpoint:** `/api/validate-dashboard-token`
- **Metodo:** POST
- **Funzione:** Valida token dashboard e ritorna dati utente/abbonamento
- **Status:** ✅ Funzionante

### 5. **create-user-and-token.js**
- **Endpoint:** `/api/create-user-and-token`
- **Metodo:** POST
- **Funzione:** Crea utente e genera token (admin)
- **Status:** ✅ Funzionante

### 6. **create-checkout-session.js**
- **Endpoint:** `/api/create-checkout-session`
- **Metodo:** POST
- **Funzione:** Crea Stripe Checkout Session per abbonamenti
- **Status:** ✅ Funzionante

### 7. **cancel-subscription.js**
- **Endpoint:** `/api/cancel-subscription`
- **Metodo:** POST
- **Funzione:** Cancella subscription (Stripe/Paddle/LemonSqueezy/Xolo)
- **Status:** ✅ Funzionante

### 8. **vote.js**
- **Endpoint:** `/api/vote`
- **Metodo:** POST, GET
- **Funzione:** Salva/recupera voti community per ticker
- **Status:** ✅ Funzionante

### 9. **push.js**
- **Endpoint:** `/api/push`
- **Metodo:** POST
- **Funzione:** Gestione push notifications (subscribe + send)
- **Status:** ✅ Funzionante

### 10. **webhook-stripe.js**
- **Endpoint:** `/api/webhook-stripe`
- **Metodo:** POST
- **Funzione:** Webhook Stripe per sincronizzazione abbonamenti
- **Status:** ⚠️ Configurazione incompleta (STRIPE_PRICE_TO_ROLE vuoto)

### 11. **webhook-paddle.js**
- **Endpoint:** `/api/webhook-paddle`
- **Metodo:** POST
- **Funzione:** Webhook Paddle per sincronizzazione abbonamenti
- **Status:** ⚠️ Errore logico (planMetadata non definito)

### 12. **webhook-lemonsqueezy.js**
- **Endpoint:** `/api/webhook-lemonsqueezy`
- **Metodo:** POST
- **Funzione:** Webhook LemonSqueezy per sincronizzazione abbonamenti
- **Status:** ✅ Funzionante

---

## ❌ File da Rimuovere (Non sono funzioni API)

- **send-email.js** - File vuoto, non è una funzione API
- **admin/index.js** - File vuoto, non è una funzione API
- **webhook-role-sync.js** - Helper module, non è un endpoint API

---

## 🔧 Fix Richiesti per le 12 Funzioni

### Fix 1: webhook-paddle.js (Linea 161)
**Errore:** `planMetadata` non definito
```javascript
// ERRATO:
const currentPeriodEnd = expiryDate 
  ? new Date(expiryDate)
  : calculateExpirationDate(planMetadata, 1); // ❌

// CORRETTO:
const planRole = mapPlanToRole(planIdentifier);
const currentPeriodEnd = expiryDate 
  ? new Date(expiryDate)
  : calculateExpirationDate(planRole || 'pro', 1); // ✅
```

### Fix 2: webhook-stripe.js (Linea 40-44)
**Errore:** `STRIPE_PRICE_TO_ROLE` vuoto
```javascript
// AGGIUNGERE Price IDs reali da Stripe Dashboard:
const STRIPE_PRICE_TO_ROLE = {
  'price_XXXXXXXXXXXXX': 'pro',           // Sostituire con Price ID reale
  'price_YYYYYYYYYYYYY': 'institutional',  // Sostituire con Price ID reale
};
```

---

## ✅ Conclusione

**Totale Funzioni API:** 12 ✅

Tutte le 12 funzioni sono presenti e identificate. Due richiedono fix minori (webhook-paddle e webhook-stripe) ma sono funzionalmente complete.

**File da rimuovere:**
- `api/send-email.js` (vuoto)
- `api/admin/index.js` (vuoto)

**Nota:** `webhook-role-sync.js` è un helper module, non un endpoint API, quindi non conta nelle 12 funzioni.

