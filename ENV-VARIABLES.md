# Variabili d'Ambiente - Tradelia.org

Questo documento elenca tutte le variabili d'ambiente necessarie per il funzionamento del progetto.

## 📋 Variabili Obbligatorie

### Supabase
```bash
# URL del progetto Supabase
SUPABASE_URL=https://your-project.supabase.co

# Service Role Key (per operazioni server-side)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anon Key (per operazioni client-side, opzionale se usato solo server-side)
SUPABASE_ANON_KEY=your-anon-key
```

**Dove sono usate:**
- `api/_lib/supabase.js` - Client Supabase principale
- `api/webhook-role-sync.js` - Sincronizzazione ruoli
- `api/cancel-subscription.js` - Cancellazione abbonamenti
- `api/request-dashboard-token.js` - Generazione token dashboard
- `api/create-user-and-token.js` - Creazione utenti
- `api/vote.js` - Sistema votazioni
- `api/push.js` - Push notifications

---

### Brevo (Email Service)
```bash
# API Key per invio email tramite Brevo
BREVO_API_KEY=your-brevo-api-key
```

**Dove sono usate:**
- `api/request-free-token.js` - Invio token gratuiti
- `api/request-dashboard-token.js` - Invio token dashboard
- `api/create-user-and-token.js` - Invio email creazione utente
- `api/cancel-subscription.js` - Notifiche cancellazione
- `api/webhook-role-sync.js` - Notifiche email

---

## 🔧 Variabili Opzionali / Condizionali

### Firebase (Push Notifications)
```bash
# Service Account JSON per Firebase Admin SDK
# Deve essere un JSON stringificato o oggetto
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}

# VAPID Keys per Web Push (se usato)
FIREBASE_VAPID_PUBLIC_KEY=your-vapid-public-key
FIREBASE_VAPID_PRIVATE_KEY=your-vapid-private-key
```

**Dove sono usate:**
- `api/push.js` - Inizializzazione Firebase Admin e Web Push

**Nota:** Se `FIREBASE_SERVICE_ACCOUNT` non è configurato, l'API `push.js` crasha all'avvio.

---

### Push API Key
```bash
# API Key per autorizzare invio push notifications
# Default: 'your-secret-api-key' (NON SICURO - cambiare in produzione)
PUSH_API_KEY=your-secret-push-api-key
```

**Dove è usata:**
- `api/push.js` - Autorizzazione invio push (action: 'send')

**⚠️ IMPORTANTE:** Cambiare il valore di default in produzione!

---

### Xolo Go (Payment Gateway)
```bash
# API Key per integrazione Xolo Go
XOLO_API_KEY=your-xolo-api-key
```

**Dove è usata:**
- `GUIDA-XOLO-GO.md` - Documentazione integrazione (non implementata nel codice attuale)

---

### RapidAPI / Twelve Data (API Esterne)
```bash
# API Key per RapidAPI
RAPIDAPI_KEY=your-rapidapi-key

# API Key per Twelve Data
TWELVE_API_KEY=your-twelve-api-key
```

**Dove sono usate:**
- `pages/api/azioniblocco1.ts` - Fetch dati azionari

---

### Admin Dashboard
```bash
# Token per accesso admin dashboard
ADMIN_DASHBOARD_TOKEN=your-admin-token

# Auto-push a GitHub (true/false)
ADMIN_AUTO_PUSH=false

# Auto-rigenera manifest (true/false, default: true)
ADMIN_AUTO_MANIFEST=true
```

**Dove sono usate:**
- `pages/api/admin/_utils.ts` - Utilità admin

---

### Debug / Development
```bash
# Abilita debug logging
DEBUG=true

# Branch Git (auto-detect se non specificato)
GIT_BRANCH=main
```

**Dove sono usate:**
- `swing-master-5.0/test/test-f1b.js` - Test debug
- `report/admin/upload-chart-server.js` - Info branch

---

## 📝 File .env.example

Crea un file `.env.example` nella root del progetto con:

```bash
# ============================================
# SUPABASE
# ============================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# ============================================
# BREVO (Email Service)
# ============================================
BREVO_API_KEY=your-brevo-api-key

# ============================================
# FIREBASE (Push Notifications)
# ============================================
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
FIREBASE_VAPID_PUBLIC_KEY=your-vapid-public-key
FIREBASE_VAPID_PRIVATE_KEY=your-vapid-private-key

# ============================================
# PUSH API
# ============================================
PUSH_API_KEY=your-secret-push-api-key

# ============================================
# XOLO GO (Payment Gateway)
# ============================================
XOLO_API_KEY=your-xolo-api-key

# ============================================
# EXTERNAL APIs
# ============================================
RAPIDAPI_KEY=your-rapidapi-key
TWELVE_API_KEY=your-twelve-api-key

# ============================================
# ADMIN
# ============================================
ADMIN_DASHBOARD_TOKEN=your-admin-token
ADMIN_AUTO_PUSH=false
ADMIN_AUTO_MANIFEST=true

# ============================================
# DEBUG / DEVELOPMENT
# ============================================
DEBUG=false
GIT_BRANCH=main
```

---

## ⚠️ Note Importanti

### Variabili con Fallback Hardcoded (DA RIMUOVERE)

**File:** `api/vote.js`, `api/push.js`

Questi file hanno fallback hardcoded che **devono essere rimossi** per sicurezza:

```javascript
// ❌ DA RIMUOVERE
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://higkhlfjfhlecbtfnznx.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGci...';

// ✅ CORRETTO
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Variabili d\'ambiente mancanti');
}
```

---

## 🔒 Sicurezza

1. **Non committare file `.env`** - Aggiungi a `.gitignore`
2. **Usa Vercel Environment Variables** per produzione
3. **Rimuovi tutti i fallback hardcoded** da `vote.js` e `push.js`
4. **Cambia `PUSH_API_KEY` default** da `'your-secret-api-key'`

---

## 📊 Riepilogo Variabili per Ambiente

### Produzione (Vercel)
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `BREVO_API_KEY`
- ✅ `FIREBASE_SERVICE_ACCOUNT` (se usato)
- ✅ `PUSH_API_KEY` (se usato)
- ✅ `XOLO_API_KEY` (se usato)

### Sviluppo Locale
- Tutte le variabili sopra
- `DEBUG=true` (opzionale)
- `GIT_BRANCH=local` (opzionale)

---

**Ultimo aggiornamento:** 2025-01-27  
**Versione:** 1.0

