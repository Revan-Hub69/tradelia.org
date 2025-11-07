# 🔒 Sicurezza API Key - Cosa è Sicuro e Cosa NON

## ✅ COSA È SICURO (Pubblico - Frontend)

### 1. **Firebase Config (`fcm-config.js`)**
**File:** `/archivio/assets/js/fcm-config.js`

**Contiene:**
- ✅ `apiKey` - **PUBBLICA** (va bene nel frontend)
- ✅ `projectId` - **PUBBLICO** (va bene)
- ✅ `messagingSenderId` - **PUBBLICO** (va bene)
- ✅ `appId` - **PUBBLICO** (va bene)
- ✅ `vapidPublicKey` - **PUBBLICA** (va bene, è pubblica per design)

**Sicurezza:** ✅ **SICURO** - Queste sono chiavi pubbliche progettate per essere esposte nel frontend

---

### 2. **Supabase Config (`supabase-config.js`)**
**File:** `/archivio/assets/js/supabase-config.js`

**Contiene:**
- ✅ `url` - **PUBBLICO** (va bene)
- ✅ `anonKey` - **PUBBLICA** (va bene, è "anon" per design)

**Sicurezza:** ✅ **SICURO** - Supabase Anon Key è progettata per essere pubblica. Le RLS policies proteggono i dati.

---

## ❌ COSA NON È SICURO (Privato - Solo Variabili Ambiente)

### 1. **Firebase Service Account**
**Dove:** **SOLO** in variabile ambiente Vercel (`FIREBASE_SERVICE_ACCOUNT`)

**Contiene:**
- ❌ `private_key` - **PRIVATA** (NON committare!)
- ❌ `client_email` - Privato
- ❌ Tutte le credenziali del Service Account

**Sicurezza:** ❌ **NON SICURO** se committato - Deve essere SOLO in variabili ambiente Vercel

**Cosa fare:**
- ✅ NON salvare in file
- ✅ SOLO in variabili ambiente Vercel
- ✅ Aggiungere pattern a `.gitignore` se necessario

---

### 2. **Push API Key**
**Dove:** **SOLO** in variabile ambiente Vercel (`PUSH_API_KEY`)

**Sicurezza:** ❌ **NON SICURO** se committato - Deve essere SOLO in variabili ambiente

---

## 📋 RIEPILOGO

### File Committati (Sicuri) ✅
- ✅ `/archivio/assets/js/fcm-config.js` - Chiavi pubbliche Firebase
- ✅ `/archivio/assets/js/supabase-config.js` - Chiavi pubbliche Supabase

### Variabili Ambiente Vercel (Private) ❌
- ❌ `FIREBASE_SERVICE_ACCOUNT` - **NON** in file, solo in Vercel
- ❌ `PUSH_API_KEY` - **NON** in file, solo in Vercel
- ❌ `SUPABASE_URL` - Opzionale (già in file come fallback)
- ❌ `SUPABASE_ANON_KEY` - Opzionale (già in file come fallback)

---

## 🔒 BEST PRACTICES

### 1. Chiavi Pubbliche (Frontend)
✅ **OK committare:**
- Firebase API key (pubblica)
- Supabase Anon Key (pubblica)
- VAPID public key (pubblica)

### 2. Chiavi Private (Server)
❌ **NON committare:**
- Service Account private keys
- API keys segrete
- Tokens di autenticazione

### 3. Variabili Ambiente
✅ **Usare sempre:**
- Variabili ambiente Vercel per chiavi private
- Fallback nel codice solo per chiavi pubbliche

---

## ✅ VERIFICA SICUREZZA

### Checklist:
- [x] Firebase config pubblico (fcm-config.js) - ✅ Sicuro
- [x] Supabase config pubblico (supabase-config.js) - ✅ Sicuro
- [ ] Service Account JSON - ❌ NON in file (solo Vercel env)
- [ ] Push API Key - ❌ NON in file (solo Vercel env)
- [ ] `.gitignore` configurato per escludere file sensibili

---

## 🎯 CONCLUSIONE

**Stato Attuale:**
- ✅ Tutte le chiavi pubbliche sono nel codice (corretto)
- ✅ Service Account è SOLO in variabile ambiente Vercel (corretto)
- ✅ Nessuna chiave privata nel repository (sicuro)

**Tutto è configurato correttamente!** ✅

