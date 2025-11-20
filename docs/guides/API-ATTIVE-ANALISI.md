# Analisi API Attive - Tradelia.org

**Data:** 2025-01-27  
**Obiettivo:** Identificare API effettivamente usate nel frontend e rimuovere codice morto

---

## ✅ API ATTIVE (Usate nel Frontend)

### 1. `/api/request-analysis` ✅
**File:** `api/request-analysis.js`  
**Usata in:**
- `analisi-su-richiesta.html:1032`
- `pricing.html:1709, 1815`
- `desk.html:870`

**Funzionalità:**
- Salva richiesta analisi o piano desk in Supabase (`on_demand_requests`)
- Invia email notifica all'admin (`amministrazione@tradelia.org`)
- Invia email conferma all'utente
- Gestione errori non bloccante (richiesta salvata anche se email fallisce)

**Variabili d'ambiente richieste:**
- `SUPABASE_URL` ✅ (obbligatorio)
- `SUPABASE_SERVICE_ROLE_KEY` ✅ (obbligatorio)
- `BREVO_API_KEY` ⚠️ (opzionale, per email)

**Status:** ✅ ATTIVA - Mantenere

**Documentazione completa:** Vedi `FLUSSO-RICHIESTA-ANALISI.md`

---

### 2. `/api/request-free-token` ✅
**File:** `api/request-free-token.js`  
**Usata in:**
- `pricing.html:1878`

**Variabili d'ambiente richieste:**
- `SUPABASE_URL` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `BREVO_API_KEY` ✅

**Status:** ✅ ATTIVA - Mantenere

---

### 3. `/api/request-dashboard-token` ✅
**File:** `api/request-dashboard-token.js`  
**Usata in:**
- `accesso.html:487`
- `user/assets/js/admin.js:569`

**Variabili d'ambiente richieste:**
- `SUPABASE_URL` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `BREVO_API_KEY` ✅

**Status:** ✅ ATTIVA - Mantenere

---

### 4. `/api/validate-dashboard-token` ✅
**File:** `api/validate-dashboard-token.js`  
**Usata in:**
- `dashboard.html:2867, 3834, 3965`
- `accesso.html:526`
- `user/assets/js/admin.js:124`
- `report/admin/dashboard.js:1138`

**Variabili d'ambiente richieste:**
- `SUPABASE_URL` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅

**Status:** ✅ ATTIVA - Mantenere (CRITICA)

---

### 5. `/api/cancel-subscription` ✅
**File:** `api/cancel-subscription.js`  
**Usata in:**
- `accesso.html:631`

**Variabili d'ambiente richieste:**
- `SUPABASE_URL` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `BREVO_API_KEY` ✅

**Status:** ✅ ATTIVA - Mantenere

---

### 6. `/api/create-user-and-token` ✅
**File:** `api/create-user-and-token.js`  
**Usata in:**
- `user/assets/js/admin.js:252`

**Variabili d'ambiente richieste:**
- `SUPABASE_URL` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `BREVO_API_KEY` ✅

**Status:** ✅ ATTIVA - Mantenere (solo admin)

---

### 7. `/api/push` ✅
**File:** `api/push.js`  
**Usata in:**
- `dashboard.html:3332, 3357, 4267, 4292`

**Variabili d'ambiente richieste:**
- `SUPABASE_URL` ✅
- `SUPABASE_ANON_KEY` ✅
- `FIREBASE_SERVICE_ACCOUNT` ⚠️ (opzionale ma crasha se mancante)
- `FIREBASE_VAPID_PUBLIC_KEY` (opzionale)
- `FIREBASE_VAPID_PRIVATE_KEY` (opzionale)
- `PUSH_API_KEY` ⚠️ (default non sicuro - DA CAMBIARE)

**Status:** ✅ ATTIVA - Fallback hardcoded rimosso

---

## ✅ API CREATA

### 8. `/api/send-email` ✅
**File:** `api/send-email.js`  
**Usata in:**
- `Exante.html:1457`
- `Skilling.html:287`
- `user/assets/js/app.js:1190`
- `report/assets/js/components/trial-onboarding-modal.js:670`

**Variabili d'ambiente richieste:**
- `BREVO_API_KEY` ✅

**Status:** ✅ ATTIVA - Creata e funzionante

---

## ⚠️ API USATE SOLO IN ARCHIVIO (Codice Vecchio)

### 9. `/api/vote` ⚠️
**File:** `api/vote.js`  
**Usata in:**
- `archivio/assets/js/dashboard.js:1070, 1123` (solo archivio!)

**Variabili d'ambiente richieste:**
- `SUPABASE_URL` ✅
- `SUPABASE_ANON_KEY` ✅

**Status:** ⚠️ SOLO ARCHIVIO - Fallback hardcoded rimosso. Considerare rimozione se archivio non più usato

**Decisione:** Se `archivio/` non è più usato, rimuovere `/api/vote.js`

---

## 🔧 API HELPER (Non endpoint diretti)

### 10. `webhook-role-sync.js` 🔧
**File:** `api/webhook-role-sync.js`  
**Tipo:** Helper module (non endpoint API diretto)  
**Usato da:**
- Importato da altri file API

**Variabili d'ambiente richieste:**
- `SUPABASE_URL` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `BREVO_API_KEY` ✅

**Status:** ✅ MANTENERE (helper necessario)

---

## 📊 Riepilogo

### API Attive: 8
1. ✅ `/api/request-analysis`
2. ✅ `/api/request-free-token`
3. ✅ `/api/request-dashboard-token`
4. ✅ `/api/validate-dashboard-token`
5. ✅ `/api/cancel-subscription`
6. ✅ `/api/create-user-and-token`
7. ✅ `/api/push`
8. ✅ `/api/send-email`

### API Solo Archivio: 1
1. ⚠️ `/api/vote` (solo in `archivio/`)

### Helper: 1
1. 🔧 `webhook-role-sync.js` (modulo helper)

---

## ✅ PROBLEMI RISOLTI

### 1. `/api/send-email` CREATA ✅
**File:** `api/send-email.js` creato
**Funzionalità:**
- Gestisce richieste da Exante.html, Skilling.html, app.js, trial-onboarding-modal.js
- Usa Brevo API per invio email
- Supporta diversi tipi di email (webinar, profile-update, business-data, richiesta generica)

---

### 2. Fallback Hardcoded RIMOSSI ✅
**File:** `api/vote.js`, `api/push.js`

**Fix applicato:**
```javascript
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Variabili d\'ambiente mancanti');
}
```

---

## 📋 Variabili d'Ambiente Necessarie (Solo API Attive)

### Obbligatorie:
```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
BREVO_API_KEY=...
```

### Opzionali (solo se usi push):
```bash
FIREBASE_SERVICE_ACCOUNT=...
FIREBASE_VAPID_PUBLIC_KEY=...
FIREBASE_VAPID_PRIVATE_KEY=...
PUSH_API_KEY=...  # ⚠️ Cambiare da default!
```

### Non necessarie (se rimuovi vote):
```bash
# SUPABASE_ANON_KEY (solo per vote.js, che è solo archivio)
```

---

## ✅ Azioni Completate

1. **COMPLETATO:**
   - [x] Creare `api/send-email.js` ✅
   - [x] Rimuovere fallback hardcoded da `vote.js` e `push.js` ✅

2. **DA VALUTARE:**
   - [ ] Rimuovere `api/vote.js` se archivio non più usato
   - [ ] Rimuovere `archivio/assets/js/dashboard.js` (se non più usato)

3. **PULIZIA:**
   - [x] Verificare che tutte le API attive abbiano variabili d'ambiente configurate ✅
   - [ ] Rimuovere `SUPABASE_ANON_KEY` se non più necessaria (solo per vote, se archivio rimosso)

---

**Totale API attive:** 8 (+ 1 helper)  
**Totale API da considerare rimozione:** 1 (`vote` se archivio non usato)

