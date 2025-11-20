# REPORT CRITICITÀ COMPLETO - Tradelia.org

**Data analisi:** 2025-01-27  
**Scope:** Analisi completa codebase per errori server, problemi logici, configurazioni mancanti

---

## 🔴 CRITICITÀ CRITICHE (Bloccanti)

### 1. **Chiavi API Hardcoded nel Codice** ⚠️ SICUREZZA
**File:** `api/vote.js`, `api/push.js`

**Problema:**
```javascript
// api/vote.js:8-9
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://higkhlfjfhlecbtfnznx.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**Impatto:**
- Chiavi API esposte nel repository pubblico
- Violazione best practices sicurezza
- Se il repository è pubblico, le chiavi sono compromesse

**Fix richiesto:**
- Rimuovere tutti i fallback hardcoded
- Usare solo `process.env.*` senza default
- Verificare che le variabili d'ambiente siano configurate in Vercel

---

### 2. **Null Pointer Error in `request-analysis.js`** 🐛 BUG
**File:** `api/request-analysis.js:101-102`

**Problema:**
```javascript
const sanitizedTipoAnalisi = tipoAnalisi.trim();  // ❌ Se tipoAnalisi è null/undefined → CRASH
const sanitizedDettagli = dettagli.trim();        // ❌ Se dettagli è null/undefined → CRASH
```

**Impatto:**
- Crash dell'API se `tipoAnalisi` o `dettagli` sono null/undefined
- Anche se validati prima, se la validazione fallisce in modo inatteso, il codice crasha

**Fix richiesto:**
```javascript
const sanitizedTipoAnalisi = tipoAnalisi ? tipoAnalisi.trim() : null;
const sanitizedDettagli = dettagli ? dettagli.trim() : null;
```

---

## 🟠 CRITICITÀ ALTE (Da risolvere urgentemente)

### 3. **Validazione Inconsistente in `request-analysis.js`**
**File:** `api/request-analysis.js:69-91`

**Problema:**
- La validazione di `tipoAnalisi` e `dettagli` avviene solo per `tipo === 'analisi-su-richiesta'`
- Ma poi vengono usati anche per `piano-desk` (riga 116-117)
- Se `tipo === 'piano-desk'`, `tipoAnalisi` e `dettagli` potrebbero essere undefined

**Fix richiesto:**
- Verificare che `tipoAnalisi` e `dettagli` siano opzionali per `piano-desk`
- Oppure validarli anche per `piano-desk` se richiesti

---

### 4. **CORS Troppo Permissivo**
**File:** Tutte le API (`api/*.js`)

**Problema:**
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');  // ❌ Permette qualsiasi origine
```

**Impatto:**
- Vulnerabilità CSRF
- Qualsiasi sito può chiamare le API

**Fix consigliato:**
```javascript
const allowedOrigins = ['https://tradelia.org', 'https://www.tradelia.org'];
const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

---

### 5. **Mancanza Validazione Email Completa**
**File:** `api/request-analysis.js:60`, `api/request-free-token.js:134`

**Problema:**
```javascript
if (!email || typeof email !== 'string' || !email.includes('@')) {
  // ❌ Validazione troppo debole: "a@b" passa la validazione
}
```

**Fix consigliato:**
- Usare regex email più robusta
- O usare libreria di validazione email

---

### 6. **Error Handling Inconsistente**
**File:** `api/vote.js`, `api/push.js`

**Problema:**
- Alcune API usano `handleRouteError` (standardizzato)
- Altre usano try/catch manuale con formattazione inconsistente
- `vote.js` non usa il sistema di error handling standardizzato

**Fix consigliato:**
- Standardizzare tutti gli error handler usando `_lib/http.js`

---

## 🟡 CRITICITÀ MEDIE (Da monitorare)

### 7. **Variabili d'Ambiente Mancanti - Fallback Non Sicuri**
**File:** `api/push.js:15-18`

**Problema:**
```javascript
if (!serviceAccount) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT non configurato');
}
```

**Impatto:**
- Se `FIREBASE_SERVICE_ACCOUNT` non è configurato, l'API crasha all'avvio
- Nessun fallback graceful

**Fix consigliato:**
- Verificare all'avvio che tutte le variabili necessarie siano presenti
- Documentare tutte le variabili d'ambiente richieste

---

### 8. **TODO Non Implementato in `push.js`**
**File:** `api/push.js:75-76`

**Problema:**
```javascript
// TODO: Salva subscription in database (Supabase o Vercel KV)
// await saveSubscription(userId, subscription);
```

**Impatto:**
- Le subscription push non vengono salvate
- Impossibile inviare notifiche push agli utenti

---

### 9. **Validazione P.IVA Solo per IT**
**File:** `api/request-analysis.js:83`

**Problema:**
```javascript
if (!piva || !piva.match(/^IT[0-9]{11}$/)) {
  // ❌ Accetta solo P.IVA italiana
}
```

**Impatto:**
- Utenti esteri non possono usare il servizio
- Se il servizio è solo per IT, va documentato

---

### 10. **Mancanza Rate Limiting**
**File:** Tutte le API

**Problema:**
- Nessun rate limiting implementato
- Possibile abuso delle API

**Fix consigliato:**
- Implementare rate limiting (es. Vercel Edge Config o middleware)

---

## 🔵 CRITICITÀ BASSE (Miglioramenti)

### 11. **Logging Inconsistente**
**File:** Tutte le API

**Problema:**
- Alcuni usano `console.error`, altri `console.warn`
- Nessuno standard di logging
- Manca logging strutturato (JSON)

**Fix consigliato:**
- Standardizzare logging con formato JSON
- Usare livelli di log appropriati

---

### 12. **Mancanza Documentazione API**
**Problema:**
- Nessuna documentazione OpenAPI/Swagger
- Endpoint non documentati

**Fix consigliato:**
- Aggiungere documentazione API
- Considerare OpenAPI spec

---

### 13. **Validazione Input Incompleta**
**File:** `api/vote.js:27`

**Problema:**
```javascript
if (!ticker || !votes || votes < 1 || votes > 10) {
  // ❌ Non valida tipo di ticker (stringa, lunghezza, caratteri validi)
}
```

**Fix consigliato:**
- Validare formato ticker (es. solo lettere maiuscole, max 10 caratteri)

---

### 14. **Mancanza Test Unitari**
**Problema:**
- Nessun test trovato nel repository
- Difficile garantire qualità del codice

**Fix consigliato:**
- Aggiungere test unitari per API critiche
- Test di integrazione per flussi completi

---

## 📋 RIEPILOGO PRIORITÀ

### 🔴 Da Fixare SUBITO (Bloccanti):
1. Rimuovere chiavi hardcoded da `vote.js` e `push.js`
2. Fix null pointer in `request-analysis.js:101-102`
3. Implementare CORS più restrittivo

### 🟠 Da Fixare questa settimana:
4. Validazione inconsistente `request-analysis.js`
5. Validazione email più robusta
6. Standardizzare error handling

### 🟡 Da monitorare:
7. Variabili d'ambiente mancanti
8. TODO in `push.js`
9. Validazione P.IVA solo IT
10. Rate limiting

### 🔵 Miglioramenti futuri:
11. Logging strutturato
12. Documentazione API
13. Validazione input più completa
14. Test unitari

---

## 🔧 CHECKLIST FIX RAPIDI

- [ ] Rimuovere fallback hardcoded da `api/vote.js`
- [ ] Rimuovere fallback hardcoded da `api/push.js`
- [ ] Fix null pointer `api/request-analysis.js:101-102`
- [ ] Aggiungere validazione null-safe per `tipoAnalisi` e `dettagli`
- [ ] Implementare CORS whitelist
- [ ] Verificare tutte le variabili d'ambiente in Vercel
- [ ] Standardizzare error handling in tutte le API
- [ ] Aggiungere validazione email più robusta

---

## 📊 STATISTICHE

- **API analizzate:** 12
- **Criticità critiche:** 2
- **Criticità alte:** 4
- **Criticità medie:** 4
- **Criticità basse:** 4
- **Totale criticità:** 14

---

**Generato da:** Analisi automatica codebase  
**Prossimi passi:** Prioritizzare fix critici e implementare miglioramenti di sicurezza

