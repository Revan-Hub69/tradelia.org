# ✅ Verifica Completa API e Credenziali

## ✅ COMPLETATE (Essenziali)

### 1. **Firebase VAPID Keys** ✅
- ✅ **VAPID Public Key**: `BGUfdP2IYXrvOwDYEqmRwhZqodiQB1CKeaLd1-oILrVCfgTW7n_mjCe3WQYzYXQw1dqgOtIRTOEfBHu6gj22Uc0`
  - Salvata in: `archivio/assets/js/fcm-config.js`
- ✅ **VAPID Private Key**: `E6cggtHVRuV6vN3vDkoRDU_oRcgsGid8QFAs0R1n9JQ`
  - Salvata in: `archivio/firebase-private-config.local.js`
  - ⏳ **Da aggiungere in Vercel**: `FIREBASE_VAPID_PRIVATE_KEY`

### 2. **Firebase Service Account** ✅
- ✅ **JSON completo** salvato in: `archivio/firebase-private-config.local.js`
- ⏳ **Da aggiungere in Vercel**: `FIREBASE_SERVICE_ACCOUNT` (JSON completo come stringa)

### 3. **Supabase** ✅
- ✅ **URL**: `https://higkhlfjfhlecbtfnznx.supabase.co`
  - Salvato in: `archivio/assets/js/supabase-config.js`
- ✅ **Anon Key**: Configurato
  - Salvato in: `archivio/assets/js/supabase-config.js`
- ⏳ **Da verificare in Vercel**: `SUPABASE_URL` e `SUPABASE_ANON_KEY`

---

## ⏳ OPZIONALI (Non essenziali per funzionamento base)

### 4. **Resend (Email Backup)** ⏳
- **API Key**: `RESEND_API_KEY`
- **Dove serve**: `/api/send-email-backup.js`
- **Stato**: Opzionale (email backup funziona solo se configurato)
- **Come ottenere**: https://resend.com → API Keys

### 5. **Lemon Squeezy (Pagamenti)** ⏳
- **API Key**: `LEMONSQUEEZY_API_KEY`
- **Store ID**: `LEMONSQUEEZY_STORE_ID`
- **Webhook Secret**: `LEMONSQUEEZY_WEBHOOK_SECRET`
- **Dove serve**: `/api/webhook-lemonsqueezy.js`
- **Stato**: Opzionale (webhook pagamenti funziona solo se configurato)
- **Come ottenere**: https://lemonsqueezy.com → Settings → API

### 6. **Push API Key (Sicurezza)** ⏳
- **API Key**: `PUSH_API_KEY`
- **Dove serve**: `/api/send-push.js` (protezione endpoint)
- **Stato**: Opzionale (puoi generare una chiave segreta a tua scelta)
- **Come generare**: Qualsiasi stringa segreta (es: `tradelia-push-secret-2025`)

---

## 📋 RIEPILOGO: Cosa Aggiungere in Vercel

### 🔴 URGENTE (per funzionamento base)

1. **FIREBASE_VAPID_PRIVATE_KEY**
   - Value: `E6cggtHVRuV6vN3vDkoRDU_oRcgsGid8QFAs0R1n9JQ`
   - Environment: Production, Preview, Development

2. **FIREBASE_SERVICE_ACCOUNT**
   - Value: JSON completo (convertito in stringa su una riga)
   - Environment: Production, Preview, Development
   - **Formato**: Il JSON completo che abbiamo salvato, ma come stringa JSON

3. **SUPABASE_URL** (verificare se presente)
   - Value: `https://higkhlfjfhlecbtfnznx.supabase.co`
   - Environment: Production, Preview, Development

4. **SUPABASE_ANON_KEY** (verificare se presente)
   - Value: (la tua anon key)
   - Environment: Production, Preview, Development

### 🟡 OPZIONALE (per funzionalità avanzate)

5. **PUSH_API_KEY** (opzionale, per sicurezza)
   - Value: Qualsiasi stringa segreta (es: `tradelia-push-secret-2025`)
   - Environment: Production, Preview, Development

6. **RESEND_API_KEY** (opzionale, per email backup)
   - Value: `re_xxxxx` (da Resend.com)
   - Environment: Production, Preview, Development

7. **LEMONSQUEEZY_API_KEY** (opzionale, per pagamenti)
   - Value: (da Lemon Squeezy)
   - Environment: Production, Preview, Development

8. **LEMONSQUEEZY_STORE_ID** (opzionale, per pagamenti)
   - Value: (da Lemon Squeezy)
   - Environment: Production, Preview, Development

9. **LEMONSQUEEZY_WEBHOOK_SECRET** (opzionale, per pagamenti)
   - Value: (da Lemon Squeezy)
   - Environment: Production, Preview, Development

---

## ✅ CHECKLIST FINALE

### Essenziali (per funzionamento base)
- [x] VAPID Public Key salvata
- [x] VAPID Private Key salvata
- [x] Firebase Service Account JSON salvato
- [ ] **FIREBASE_VAPID_PRIVATE_KEY** aggiunta in Vercel
- [ ] **FIREBASE_SERVICE_ACCOUNT** aggiunta in Vercel
- [ ] **SUPABASE_URL** verificata in Vercel
- [ ] **SUPABASE_ANON_KEY** verificata in Vercel

### Opzionali (per funzionalità avanzate)
- [ ] **PUSH_API_KEY** aggiunta in Vercel (opzionale)
- [ ] **RESEND_API_KEY** aggiunta in Vercel (opzionale)
- [ ] **LEMONSQUEEZY_*** aggiunte in Vercel (opzionale)

---

## 🎯 PROSSIMI STEP

1. ✅ Service Account JSON salvato
2. ⏳ **Aggiungere variabili ambiente in Vercel** (FIREBASE_VAPID_PRIVATE_KEY, FIREBASE_SERVICE_ACCOUNT)
3. ⏳ **Installare dipendenze** (`npm install`)
4. ⏳ **Testare** (login, votazioni, push)

---

**Nota**: Le API opzionali (Resend, Lemon Squeezy) possono essere aggiunte successivamente. Per ora, concentriamoci sulle essenziali per far funzionare la dashboard base.

