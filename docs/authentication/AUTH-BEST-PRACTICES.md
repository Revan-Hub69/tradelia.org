# Best Practices - Autenticazione e Gestione Account

## 📋 Panoramica

Questo documento descrive le best practice implementate per la gestione di autenticazione, account e pagamenti in Tradelia.

## 🎯 Principi Fondamentali

### 1. Separazione Autenticazione/Dashboard

- **Dashboard**: Solo per contenuti e funzionalità
- **accesso.html**: Punto centrale per autenticazione, gestione account e pagamenti
- **Best Practice**: La dashboard non gestisce login/account, solo reindirizza a `accesso.html`

### 2. Flusso Autenticazione

```
Utente → Dashboard
  ↓
Verifica Token (checkAuthentication)
  ↓
Token Valido? → SÌ → Mostra Dashboard
  ↓
Token Invalido/Mancante? → NO → Reindirizza a accesso.html
  ↓
accesso.html → Valida Token → Mostra Modale se necessario
  ↓
Token Valido → Reindirizza a Dashboard
```

### 3. Gestione Modali

Le modali in `accesso.html` gestiscono:

- **Account**: Dettagli piano, upgrade, rinnovo
- **Payment**: Pagamenti in attesa, scadenze, fatturazione
- **Subscription**: Gestione abbonamenti, cancellazione

## 🔐 Controllo Autenticazione

### Dashboard (`app.js`)

```javascript
// BEST PRACTICE: Verifica autenticazione PRIMA di inizializzare
const authCheck = await checkAuthentication();
if (!authCheck.authenticated) {
  const reason = authCheck.reason || "missing_token";
  window.location.href = `/accesso.html?reason=${reason}&redirect=${encodeURIComponent(window.location.pathname)}`;
  return;
}
```

### Motivi di Reindirizzamento

- `missing_token`: Nessun token presente
- `invalid_token`: Token non valido o malformato
- `expired_token`: Token scaduto
- `revoked_token`: Token revocato
- `payment_required`: Pagamento in attesa
- `auth_error`: Errore durante verifica

## 💳 Gestione Pagamenti

### Modale Pagamento Automatica

Quando un utente ha:

- **Pagamento in attesa** (`pending_payment` o `pending_manual`)
- **Scadenza imminente** (entro 7 giorni)

Viene automaticamente mostrata una modale in `accesso.html` con:

- Dettagli pagamento
- Giorni rimanenti
- Link contatto supporto
- Pulsante "Vedi Dettagli Account"

### Trigger Modale

```javascript
// In accesso.html dopo validazione token
if (data.status === "pending_payment" || data.status === "pending_manual") {
  showPaymentModal(data);
}
```

## 🔄 Flusso Completo

### Scenario 1: Utente non autenticato

1. Utente accede a `/dashboard.html`
2. `checkAuthentication()` verifica token
3. Token mancante → Reindirizza a `/accesso.html?reason=missing_token`
4. Utente inserisce codice in `accesso.html`
5. Token validato → Reindirizza a `/dashboard.html`

### Scenario 2: Token scaduto

1. Utente accede a `/dashboard.html`
2. `checkAuthentication()` verifica token
3. Token scaduto → Reindirizza a `/accesso.html?reason=expired_token`
4. Utente inserisce nuovo codice
5. Token validato → Reindirizza a `/dashboard.html`

### Scenario 3: Pagamento in attesa

1. Utente accede a `/dashboard.html`
2. `checkAuthentication()` verifica token
3. Token valido ma `status: pending_payment` → Reindirizza a `/accesso.html?reason=payment_required&modal=payment`
4. `accesso.html` mostra modale pagamento automaticamente
5. Utente gestisce pagamento
6. Dopo pagamento → Reindirizza a `/dashboard.html`

### Scenario 4: Scadenza imminente

1. Utente accede a `/dashboard.html`
2. `checkAuthentication()` verifica token
3. Token valido ma scade tra < 7 giorni → Mostra warning (non blocca)
4. Utente clicca "Gestisci Account" → Reindirizza a `/accesso.html?modal=account`
5. Modale account mostra dettagli e opzioni rinnovo

## 📝 Parametri URL accesso.html

### Parametri Supportati

- `reason`: Motivo del redirect
  - `missing_token`: Token mancante
  - `invalid_token`: Token non valido
  - `expired_token`: Token scaduto
  - `revoked_token`: Token revocato
  - `payment_required`: Pagamento richiesto
  - `login_required`: Login richiesto
  - `logout`: Logout effettuato
  - `auth_error`: Errore autenticazione

- `modal`: Tipo modale da aprire
  - `account`: Modale gestione account
  - `payment`: Modale pagamento
  - `subscription`: Modale abbonamento

- `redirect`: URL di ritorno dopo login
  - Es: `/dashboard.html#reports`
  - Dopo login valido, reindirizza a questo URL

- `action`: Azione specifica nella modale
  - `upgrade-desk`: Upgrade a Desk
  - `renew`: Rinnovo abbonamento
  - `cancel`: Cancellazione abbonamento

### Esempi

```
/accesso.html?reason=missing_token&redirect=/dashboard.html
/accesso.html?reason=payment_required&modal=payment
/accesso.html?modal=account&action=upgrade-desk
```

## ✅ Best Practice Checklist

- [x] Separazione autenticazione/dashboard
- [x] Verifica token prima di inizializzare dashboard
- [x] Reindirizzamento a accesso.html per gestione account
- [x] Modali per pagamenti e account in accesso.html
- [x] Gestione errori completa (scaduto, revocato, invalid)
- [x] Redirect dopo login per tornare alla pagina originale
- [x] Supporto modali automatiche per pagamenti in attesa
- [x] Warning per scadenze imminenti

## 🔍 Verifica Implementazione

### Test Scenari

1. **Token mancante**: Accedi a `/dashboard.html` senza token → Dovrebbe reindirizzare a `accesso.html`
2. **Token scaduto**: Usa token scaduto → Dovrebbe reindirizzare con `reason=expired_token`
3. **Pagamento in attesa**: Token valido ma `pending_payment` → Dovrebbe mostrare modale pagamento
4. **Scadenza imminente**: Token valido ma scade tra 5 giorni → Dovrebbe mostrare warning
5. **Redirect**: Dopo login da `/dashboard.html#reports` → Dovrebbe tornare a quella sezione

## 📚 Riferimenti

- `assets/js/dashboard/app.js` - Controllo autenticazione
- `assets/js/dashboard/auth.js` - Gestione ruoli e logout
- `accesso.html` - Pagina autenticazione e modali
- `api/validate-dashboard-token.js` - Validazione token
- `api/get-user-plan.js` - Dati piano utente
