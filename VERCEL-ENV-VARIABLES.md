# 🔐 Variabili d'Ambiente Vercel - COMPLETE

## ⚠️ IMPORTANTE: Queste variabili DEVONO essere configurate in Vercel!

Senza queste variabili, le API non funzionano e tutto il sistema token/dashboard fallisce.

---

## 📋 Variabili Obbligatorie

### 1. `SUPABASE_URL`
**Valore:** `https://higkhlfjfhlecbtfnznx.supabase.co`

**Dove trovarla:** Supabase Dashboard → Settings → API → Project URL

**Usata da:**
- `/api/validate-dashboard-token.js`
- `/api/request-dashboard-token.js`
- `/api/generate-admin-token.js`
- `/api/webhook-paddle.js`
- `/api/webhook-lemonsqueezy.js`
- `/api/webhook-role-sync.js`
- Tutte le API che usano Supabase

---

### 2. `SUPABASE_SERVICE_ROLE_KEY` ⚠️ CRITICA
**Valore:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ1Nzk5OSwiZXhwIjoyMDc4MDMzOTk5fQ.iOqVIFi-WxChkTNkc58fizixSfRcANohcG1A9ggtkjs`

**Dove trovarla:** Supabase Dashboard → Settings → API → `service_role` key (secret)

**⚠️ SEGRETA - Non condividere pubblicamente!**

**Usata da:**
- `/api/validate-dashboard-token.js` ← **CRITICA per validazione token**
- `/api/request-dashboard-token.js` ← **CRITICA per generare token**
- `/api/generate-admin-token.js` ← **CRITICA per token admin**
- `/api/webhook-paddle.js` ← **CRITICA per webhook pagamenti**
- `/api/webhook-lemonsqueezy.js` ← **CRITICA per webhook pagamenti**
- `/api/webhook-role-sync.js` ← **CRITICA per sincronizzazione ruoli**

**Perché serve:**
- Bypassa Row Level Security (RLS)
- Permette di leggere/scrivere in tabelle protette (`dashboard_access_tokens`, `user_roles`, `subscribers`)
- Permette di accedere a `auth.users` per recuperare email
- Necessaria per tutte le operazioni amministrative

---

### 3. `SUPABASE_ANON_KEY` (Opzionale, ma consigliata)
**Valore:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw`

**Dove trovarla:** Supabase Dashboard → Settings → API → `anon` `public` key

**Usata da:**
- Alcune API come fallback
- Frontend (se usi Supabase client nel browser)

---

### 4. `BREVO_API_KEY` (Opzionale, per email)
**Dove trovarla:** Brevo Dashboard → Settings → API Keys

**Usata da:**
- `/api/request-dashboard-token.js` (per inviare email con nuovo token)
- `/api/generate-admin-token.js` (per inviare email con token admin)
- `/api/webhook-role-sync.js` (per inviare email quando viene generato token)

**Nota:** Se non configurata, i token vengono comunque generati ma non inviati via email.

---

## 🚀 Come Configurare in Vercel

1. **Vai su Vercel Dashboard**
   - https://vercel.com/dashboard
   - Seleziona il progetto `tradelia.org`

2. **Vai su Settings → Environment Variables**

3. **Aggiungi ogni variabile:**
   - **Name:** `SUPABASE_URL`
   - **Value:** `https://higkhlfjfhlecbtfnznx.supabase.co`
   - **Environment:** ✅ Production, ✅ Preview, ✅ Development
   - Clicca **Save**

4. **Ripeti per ogni variabile:**
   - `SUPABASE_SERVICE_ROLE_KEY` (con il valore completo sopra)
   - `SUPABASE_ANON_KEY` (opzionale)
   - `BREVO_API_KEY` (opzionale, se vuoi email automatiche)

5. **⚠️ IMPORTANTE: Dopo aver aggiunto le variabili, fai un REDEPLOY!**
   - Vai su **Deployments**
   - Clicca sui 3 puntini sull'ultimo deployment
   - Clicca **Redeploy**
   - Oppure fai un nuovo commit/push per triggerare un nuovo deploy

---

## ✅ Verifica che Funzioni

Dopo il redeploy, testa:
1. Vai su `/accesso.html`
2. Inserisci token: `adc51b9d333f47a95fc8a40ae8629401`
3. Dovrebbe funzionare senza errori 500

---

## 🔍 Troubleshooting

### Errore 500 "FUNCTION_INVOCATION_FAILED"
**Causa:** Variabili d'ambiente mancanti o errate
**Soluzione:** Verifica che tutte le variabili siano configurate correttamente in Vercel

### Errore "Token non valido" anche con token corretto
**Causa:** `SUPABASE_SERVICE_ROLE_KEY` mancante o errata
**Soluzione:** Verifica che la chiave service_role sia corretta

### Email non vengono inviate
**Causa:** `BREVO_API_KEY` mancante
**Soluzione:** Configura BREVO_API_KEY o ignora (i token vengono comunque generati)

---

## 📝 Note

- **NON committare mai le chiavi nel codice!** Usa sempre variabili d'ambiente
- La `SERVICE_ROLE_KEY` è **SEGRETA** - non condividerla pubblicamente
- Dopo ogni modifica alle variabili, **fai sempre un redeploy**

---

## 🎯 Riepilogo Variabili

| Variabile | Obbligatoria | Usata da |
|-----------|--------------|----------|
| `SUPABASE_URL` | ✅ SÌ | Tutte le API Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ **CRITICA** | API token, webhook, admin |
| `SUPABASE_ANON_KEY` | ⚠️ Consigliata | Fallback, frontend |
| `BREVO_API_KEY` | ❌ Opzionale | Invio email automatiche |

