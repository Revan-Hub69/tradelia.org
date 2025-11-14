# 🔧 Fix: Errore 500 "unexpected_failure" durante Signup

## ⚠️ Problema

Supabase restituisce errore **500** con `x_sb_error_code: "unexpected_failure"` durante signup.

Questo è un **errore generico di Supabase Auth** che di solito indica:
- **SMTP non configurato** ma email verification è abilitata
- **Configurazione SMTP errata**
- **Trigger/funzioni su auth.users** che falliscono

---

## ✅ Soluzione Immediata: Disabilita Email Verification

**Questo risolve il problema immediatamente:**

1. Vai su **Supabase Dashboard** → **Authentication** → **Settings**
2. Trova **"Enable email confirmations"**
3. **Disabilita** il toggle (OFF)
4. **Salva**
5. Prova di nuovo signup

**Se funziona dopo questo** → Il problema è SMTP. Configura SMTP correttamente (vedi sotto).

---

## ✅ Soluzione Definitiva: Configura SMTP

**Se vuoi mantenere email verification:**

### **Passo 1: Vai a SMTP Settings**

1. Vai su **Supabase Dashboard** → **Settings** → **Auth** → **SMTP Settings**

### **Passo 2: Abilita Custom SMTP**

1. Toggle **"Enable Custom SMTP"** → **ON**

### **Passo 3: Inserisci Credenziali Resend**

| Campo | Valore |
|-------|--------|
| **SMTP Host** | `smtp.resend.com` |
| **SMTP Port** | `587` |
| **SMTP User** | `resend` (esattamente così) |
| **SMTP Password** | `re_esPbadDj_PzRxxMbVzkP4bRq2XxuC1fLx` |
| **Sender email** | `Tradelia <noreply@resend.dev>` |
| **Sender name** | `Tradelia` |

### **Passo 4: Test SMTP**

1. Clicca **"Send test email"**
2. Inserisci la tua email
3. Clicca **"Send"**

**Se test funziona:**
- ✅ SMTP è configurato correttamente
- ✅ Signup dovrebbe funzionare

**Se test fallisce:**
- ❌ Verifica API Key Resend
- ❌ Verifica che Resend non abbia bloccato l'account
- ❌ Prova con `@resend.dev` invece di `@tradelia.org`

### **Passo 5: Salva e Riabilita Email Verification**

1. **Salva** le impostazioni SMTP
2. Vai su **Authentication** → **Settings**
3. **Abilita** "Enable email confirmations"
4. **Salva**
5. Prova signup

---

## 🔍 Verifica Trigger/Funzioni

**Se SMTP è configurato ma l'errore persiste:**

1. Vai su **Supabase Dashboard** → **SQL Editor**
2. Esegui `supabase/check-auth-triggers.sql`
3. Verifica se ci sono trigger su `auth.users` che falliscono
4. Se ci sono trigger problematici, disabilitali temporaneamente

---

## 📋 Checklist

- [ ] **Email verification disabilitata** (per test immediato)
- [ ] **SMTP configurato** in Supabase (se vuoi email verification)
- [ ] **Test email SMTP** funziona
- [ ] **Trigger verificati** (se errore persiste)
- [ ] **Log Supabase** controllati per errori specifici

---

## 🆘 Se Nulla Funziona

### **1. Controlla Log Supabase**

1. Vai su **Supabase Dashboard** → **Logs** → **Postgres Logs**
2. Filtra per timestamp dell'errore
3. Cerca errori specifici durante signup

**Errori comuni:**
- `SMTP connection failed` → SMTP non configurato/errato
- `Trigger function error` → Trigger su auth.users fallisce
- `Email sending failed` → Problema con Resend

### **2. Prova Signup Senza Email Verification**

1. Disabilita email verification
2. Prova signup
3. Se funziona → Problema è SMTP
4. Se non funziona → Problema è altro (trigger, schema, etc.)

### **3. Contatta Support Supabase**

1. Vai su **Supabase Dashboard** → **Support**
2. Fornisci:
   - Screenshot dell'errore
   - Timestamp dell'errore
   - `x_sb_error_code: "unexpected_failure"`
   - Log da Postgres Logs
   - Configurazione SMTP (senza API key)

---

## 🔗 Link Utili

- [Supabase Auth Settings](https://supabase.com/dashboard/project/_/auth/settings)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase Logs](https://supabase.com/dashboard/project/_/logs/postgres)

---

## 📝 Note

- **`unexpected_failure`** è un errore generico di Supabase
- **Di solito è SMTP** se email verification è abilitata
- **Disabilita email verification** per testare se è quello il problema
- **Configura SMTP** correttamente per risolvere definitivamente

