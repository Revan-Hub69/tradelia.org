# API Consolidation Plan
## Riduzione a 12 Serverless Functions

**Data**: 2025-01-XX  
**Obiettivo**: Consolidare tutte le API functions in massimo 12 endpoint

---

## 📊 AUDIT ATTUALE

### API Functions Esistenti (17+)

1. `validate-dashboard-token.js` - Validazione token dashboard
2. `request-dashboard-token.js` - Richiesta token dashboard
3. `create-user-and-token.js` - Creazione utente e token
4. `request-free-token.js` - Richiesta token gratuito
5. `get-user-plan.js` - Ottieni piano utente
6. `send-email.js` - Invio email generico
7. `vote.js` - Gestione votazioni
8. `request-analysis.js` - Richiesta analisi on-demand
9. `create-stripe-checkout.js` - Creazione checkout Stripe
10. `cancel-subscription.js` - Cancellazione abbonamento
11. `save-billing-data.js` - Salvataggio dati billing
12. `create-order.js` - Creazione ordine
13. `activate-order.js` - Attivazione ordine
14. `webhook-stripe.js` - Webhook Stripe
15. `webhook-role-sync.js` - Webhook sync ruoli
16. `push.js` - Push notifications
17. `admin.js` - Admin API (con handlers)

---

## 🎯 PIANO DI CONSOLIDAMENTO

### 1. **auth.js** - Autenticazione e Token (CONSOLIDA 4 → 1)
**Consolida**:
- `validate-dashboard-token.js`
- `request-dashboard-token.js`
- `create-user-and-token.js`
- `request-free-token.js`

**Endpoint**:
- `POST /api/auth/validate` - Valida token
- `POST /api/auth/token` - Richiedi token (con type: dashboard|free)
- `POST /api/auth/create-user` - Crea utente e token

---

### 2. **user.js** - Gestione Utente (CONSOLIDA 1 → 1)
**Mantieni**:
- `get-user-plan.js` → `user.js`

**Endpoint**:
- `GET /api/user/plan` - Ottieni piano utente
- `GET /api/user/profile` - Profilo utente (futuro)
- `PUT /api/user/profile` - Aggiorna profilo (futuro)

---

### 3. **email.js** - Invio Email (MANTIENI 1 → 1)
**Mantieni**:
- `send-email.js` → `email.js`

**Endpoint**:
- `POST /api/email/send` - Invio email generico

---

### 4. **community.js** - Community e Votazioni (MANTIENI 1 → 1)
**Mantieni**:
- `vote.js` → `community.js`

**Endpoint**:
- `POST /api/community/vote` - Vota proposta
- `GET /api/community/proposals` - Lista proposte (futuro)

---

### 5. **analysis.js** - Analisi On-Demand (MANTIENI 1 → 1)
**Mantieni**:
- `request-analysis.js` → `analysis.js`

**Endpoint**:
- `POST /api/analysis/request` - Richiedi analisi
- `GET /api/analysis/status/:id` - Status analisi (futuro)

---

### 6. **billing.js** - Billing e Pagamenti (CONSOLIDA 5 → 1)
**Consolida**:
- `create-stripe-checkout.js`
- `cancel-subscription.js`
- `save-billing-data.js`
- `create-order.js`
- `activate-order.js`

**Endpoint**:
- `POST /api/billing/checkout` - Crea checkout Stripe
- `POST /api/billing/subscription/cancel` - Cancella abbonamento
- `POST /api/billing/data` - Salva dati billing
- `POST /api/billing/order` - Crea ordine
- `POST /api/billing/order/activate` - Attiva ordine

---

### 7. **webhooks.js** - Webhooks (CONSOLIDA 2 → 1)
**Consolida**:
- `webhook-stripe.js`
- `webhook-role-sync.js`

**Endpoint**:
- `POST /api/webhooks/stripe` - Webhook Stripe
- `POST /api/webhooks/role-sync` - Webhook sync ruoli

---

### 8. **notifications.js** - Notifiche (MANTIENI 1 → 1)
**Mantieni**:
- `push.js` → `notifications.js`

**Endpoint**:
- `POST /api/notifications/push` - Push notification

---

### 9. **admin.js** - Admin API (MANTIENI 1 → 1)
**Mantieni**:
- `admin.js` (con handlers interni)

**Endpoint**:
- `GET /api/admin/*` - Tutte le route admin
- Handlers interni: users, templates, reports, payments, credits

---

### 10. **export.js** - Export Dati (NUOVO)
**Crea**:
- Nuovo file per export dati utente

**Endpoint**:
- `GET /api/export/data` - Export dati utente (JSON)
- `GET /api/export/reports` - Export report preferiti (futuro)

---

### 11. **health.js** - Health Check (NUOVO)
**Crea**:
- Health check endpoint

**Endpoint**:
- `GET /api/health` - Health check

---

### 12. **search.js** - Ricerca (NUOVO - OPZIONALE)
**Crea**:
- Endpoint ricerca server-side (opzionale, se necessario)

**Endpoint**:
- `GET /api/search` - Ricerca report/moduli (opzionale)

---

## 📋 RIEPILOGO FINALE

### 12 API Functions Finali:

1. ✅ `auth.js` - Autenticazione e token (4 → 1)
2. ✅ `user.js` - Gestione utente (1 → 1)
3. ✅ `email.js` - Invio email (1 → 1)
4. ✅ `community.js` - Community e votazioni (1 → 1)
5. ✅ `analysis.js` - Analisi on-demand (1 → 1)
6. ✅ `billing.js` - Billing e pagamenti (5 → 1)
7. ✅ `webhooks.js` - Webhooks (2 → 1)
8. ✅ `notifications.js` - Notifiche (1 → 1)
9. ✅ `admin.js` - Admin API (1 → 1)
10. ✅ `export.js` - Export dati (NUOVO)
11. ✅ `health.js` - Health check (NUOVO)
12. ✅ `search.js` - Ricerca (OPZIONALE)

---

## 🔄 MIGRAZIONE

### Step 1: Creare nuovi file consolidati
### Step 2: Aggiornare chiamate client-side
### Step 3: Testare tutti gli endpoint
### Step 4: Rimuovere file vecchi
### Step 5: Aggiornare documentazione

---

## ⚠️ NOTE

- Mantenere backward compatibility durante migrazione
- Usare versioning se necessario (`/api/v1/...`)
- Testare tutti gli endpoint consolidati
- Aggiornare variabili ambiente se necessario

