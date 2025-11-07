# Problemi Critici Identificati - Tradelia AI

## 🔴 Problemi di Sicurezza

### 1. **Credenziali Hardcoded nei File API**

**Gravità:** ALTA  
**File Coinvolti:**
- `/api/vote.js`
- `/api/check-subscription.js`
- `/api/webhook-stripe.js`
- `/api/webhook-paddle.js`
- `/api/webhook-lemonsqueezy.js`
- `/api/send-push.js`
- `/archivio/assets/js/supabase-config.js`

**Problema:**
```javascript
// ❌ ATTUALMENTE (INSICURO)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://higkhlfjfhlecbtfnznx.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// ✅ DOVREBBE ESSERE (SICURO)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase credentials non configurate');
}
```

**Rischio:**
- Credenziali esposte nel repository
- Possibile compromissione database
- Violazione best practices sicurezza

**Soluzione:**
- Rimuovere tutti i fallback hardcoded
- Usare solo variabili ambiente
- Aggiungere validazione obbligatoria

---

### 2. **VAPID Public Key Hardcoded**

**Gravità:** MEDIA  
**File:** `/api/send-push.js`

**Problema:**
```javascript
const VAPID_PUBLIC_KEY = process.env.FIREBASE_VAPID_PUBLIC_KEY || 'BGUfdP2IYXrvOwDYEqmRwhZqodiQB1CKeaLd1-oILrVCfgTW7n_mjCe3WQYzYXQw1dqgOtIRTOEfBHu6gj22Uc0';
```

**Nota:** La public key può essere esposta, ma è meglio usare env variables per consistenza.

---

### 3. **API Key Default Insecure**

**Gravità:** MEDIA  
**File:** `/api/send-push.js`

**Problema:**
```javascript
const apiKey = process.env.PUSH_API_KEY || 'your-secret-api-key';
```

**Rischio:**
- Se env variable non è configurata, usa valore di default debole
- Possibile accesso non autorizzato

**Soluzione:**
```javascript
const apiKey = process.env.PUSH_API_KEY;
if (!apiKey) {
  throw new Error('PUSH_API_KEY non configurata');
}
```

---

## 🟡 Problemi Funzionali

### 4. **Endpoint push-subscribe.js Non Implementato**

**Gravità:** MEDIA  
**File:** `/api/push-subscribe.js`

**Problema:**
```javascript
// TODO: Salva subscription in database (Supabase o Vercel KV)
// Per ora placeholder
```

**Impatto:**
- Le subscription push non vengono salvate
- Le notifiche non possono essere inviate
- Funzionalità push notifications non funzionante

**Soluzione:**
Implementare salvataggio in Supabase `push_subscriptions` table.

---

### 5. **Mancanza Validazione Input**

**Gravità:** MEDIA  
**File:** Vari endpoint API

**Problema:**
- Alcuni endpoint non validano completamente l'input
- Possibile SQL injection (sebbene Supabase protegga)
- Possibile XSS se dati non sanitizzati

**Esempio:**
```javascript
// ❌ ATTUALMENTE
const { ticker, votes } = req.body;
// Nessuna validazione tipo, formato, lunghezza

// ✅ DOVREBBE ESSERE
const { ticker, votes } = req.body;

if (!ticker || typeof ticker !== 'string' || ticker.length > 10) {
  return res.status(400).json({ error: 'Ticker non valido' });
}

if (!Number.isInteger(votes) || votes < 1 || votes > 10) {
  return res.status(400).json({ error: 'Voti devono essere tra 1 e 10' });
}
```

---

### 6. **Error Handling Inconsistente**

**Gravità:** BASSA  
**File:** Tutti gli endpoint API

**Problema:**
- Alcuni endpoint hanno error handling robusto
- Altri hanno error handling minimo
- Messaggi di errore non sempre informativi

**Soluzione:**
Standardizzare error handling con:
- Logging strutturato
- Messaggi di errore user-friendly
- Error codes consistenti

---

## 🟢 Miglioramenti Consigliati

### 7. **Rate Limiting Mancante**

**Gravità:** MEDIA  
**Problema:**
- Nessun rate limiting sugli endpoint API
- Possibile abuso/DDoS

**Soluzione:**
Implementare rate limiting con Vercel Edge Config o middleware.

---

### 8. **Logging Non Strutturato**

**Gravità:** BASSA  
**Problema:**
- Logging inconsistente tra file
- Difficile debugging in produzione

**Soluzione:**
Usare logger strutturato (es. `Logger.js` già presente) ovunque.

---

### 9. **Mancanza Test Suite**

**Gravità:** MEDIA  
**Problema:**
- Nessun test automatizzato visibile
- Difficile garantire qualità codice

**Soluzione:**
Aggiungere:
- Unit tests per funzioni utility
- Integration tests per API endpoints
- E2E tests per flussi critici

---

### 10. **Documentazione API Mancante**

**Gravità:** BASSA  
**Problema:**
- Nessuna documentazione API formale
- Difficile integrazione per sviluppatori esterni

**Soluzione:**
Creare documentazione OpenAPI/Swagger per tutti gli endpoint.

---

## 📋 Checklist Risoluzione Problemi

### Priorità ALTA (Sicurezza)
- [ ] Rimuovere credenziali hardcoded da tutti i file API
- [ ] Rimuovere credenziali hardcoded da `supabase-config.js`
- [ ] Aggiungere validazione obbligatoria per env variables
- [ ] Rimuovere API key default insecure

### Priorità MEDIA (Funzionalità)
- [ ] Implementare `push-subscribe.js` completamente
- [ ] Aggiungere validazione input robusta
- [ ] Implementare rate limiting
- [ ] Aggiungere test suite base

### Priorità BASSA (Miglioramenti)
- [ ] Standardizzare error handling
- [ ] Migliorare logging strutturato
- [ ] Creare documentazione API
- [ ] Aggiungere monitoring/analytics

---

## 🔧 File da Modificare

### Sicurezza Critica:
1. `/api/vote.js` - Rimuovere fallback hardcoded
2. `/api/check-subscription.js` - Rimuovere fallback hardcoded
3. `/api/webhook-stripe.js` - Rimuovere fallback hardcoded
4. `/api/webhook-paddle.js` - Rimuovere fallback hardcoded
5. `/api/webhook-lemonsqueezy.js` - Rimuovere fallback hardcoded
6. `/api/send-push.js` - Rimuovere fallback hardcoded e default API key
7. `/archivio/assets/js/supabase-config.js` - Usare env variables

### Funzionalità:
8. `/api/push-subscribe.js` - Implementare salvataggio subscription

---

## 📝 Note

- Le credenziali hardcoded sono un rischio di sicurezza significativo
- Anche se sono "anon keys" di Supabase, è meglio non esporle nel codice
- Le env variables dovrebbero essere l'unica fonte di configurazione
- Considerare l'uso di un secret manager per produzione

---

**Data Analisi:** 2025-01-27  
**Priorità:** Risolvere problemi ALTA priorità immediatamente
