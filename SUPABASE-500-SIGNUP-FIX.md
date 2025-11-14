# 🔧 Fix: Errore 500 durante Signup in Supabase

## ⚠️ Problema

Durante la registrazione, Supabase restituisce errore **500** da `/auth/v1/signup`.

Questo significa che l'errore viene da **Supabase Auth stesso**, non dalle tabelle.

---

## 🔍 Cause Possibili

1. **Configurazione SMTP errata** → Supabase non riesce a inviare email di verifica
2. **Trigger/funzioni su `auth.users`** che falliscono durante signup
3. **Email verification obbligatoria** ma SMTP non configurato
4. **Rate limit raggiunto** a livello di Supabase

---

## ✅ Soluzione 1: Disabilita Email Verification (Temporaneo)

**Se non vuoi che Supabase invii email di verifica:**

1. Vai su **Supabase Dashboard** → **Authentication** → **Settings**
2. Trova **"Enable email confirmations"**
3. **Disabilita** il toggle
4. **Salva**

**Vantaggi:**
- ✅ Nessun invio email = nessun errore 500
- ✅ Auto-login immediato dopo signup
- ✅ Funziona subito

**Svantaggi:**
- ❌ Email non verificate
- ❌ Meno sicurezza

**⚠️ NOTA**: Dopo aver risolto SMTP, puoi riabilitare email verification.

---

## ✅ Soluzione 2: Configura SMTP Correttamente

**Se vuoi mantenere email verification:**

1. Vai su **Supabase Dashboard** → **Settings** → **Auth** → **SMTP Settings**
2. **Abilita Custom SMTP**: Toggle ON
3. **Inserisci credenziali Resend**:
   - **SMTP Host**: `smtp.resend.com`
   - **SMTP Port**: `587`
   - **SMTP User**: `resend`
   - **SMTP Password**: `re_esPbadDj_PzRxxMbVzkP4bRq2XxuC1fLx`
   - **Sender email**: `Tradelia <noreply@resend.dev>` (temporaneo)
4. **Test SMTP**: Clicca "Send test email"
5. **Se test funziona**: Salva e riprova signup

**Se test fallisce:**
- Verifica che l'API Key Resend sia corretta
- Verifica che Resend non abbia bloccato l'account
- Prova con `@resend.dev` invece di `@tradelia.org`

---

## ✅ Soluzione 3: Verifica Trigger su auth.users

**Se ci sono trigger che falliscono:**

1. Vai su **Supabase Dashboard** → **SQL Editor**
2. Esegui questa query per vedere i trigger:

```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';
```

3. **Se ci sono trigger**, verifica che non falliscano
4. **Se un trigger fallisce**, disabilitalo temporaneamente:

```sql
-- Esempio: disabilita un trigger
ALTER TABLE auth.users DISABLE TRIGGER nome_trigger;
```

---

## ✅ Soluzione 4: Controlla Log Supabase

**Per vedere l'errore esatto:**

1. Vai su **Supabase Dashboard** → **Logs** → **Postgres Logs**
2. Filtra per timestamp dell'errore
3. Cerca errori durante signup
4. Verifica messaggi di errore specifici

**Errori comuni:**
- `SMTP connection failed` → Configurazione SMTP errata
- `Trigger function error` → Trigger su auth.users fallisce
- `Rate limit exceeded` → Troppi tentativi

---

## 🔧 Debug: Log Dettagliati

**Nel browser, apri Console (F12) e cerca:**

```
[AuthModal] Signup error details: Object
```

**Espandi l'oggetto per vedere:**
- `message`: Messaggio errore
- `code`: Codice errore Supabase
- `status`: Status HTTP
- `details`: Dettagli aggiuntivi
- `hint`: Suggerimenti

**Copia l'errore completo** e verifica:
- Se `code` contiene `SMTP` → Problema email
- Se `code` contiene `trigger` → Problema trigger
- Se `code` contiene `rate_limit` → Rate limit

---

## 📋 Checklist

- [ ] **Email verification disabilitata** (temporaneo, per test)
- [ ] **SMTP configurato** correttamente in Supabase
- [ ] **Test email SMTP** funziona
- [ ] **Trigger su auth.users** verificati (se esistono)
- [ ] **Log Supabase** controllati per errori specifici
- [ ] **Console browser** controllata per dettagli errore

---

## 🆘 Se Nulla Funziona

### **1. Prova Signup Senza Email Verification**

1. Disabilita email verification in Supabase
2. Prova signup
3. Se funziona → Problema è SMTP
4. Se non funziona → Problema è altro (trigger, schema, etc.)

### **2. Controlla Supabase Status**

1. Vai su https://status.supabase.com
2. Verifica se ci sono problemi con Auth service
3. Se ci sono outage, aspetta che si risolvano

### **3. Contatta Support Supabase**

1. Vai su **Supabase Dashboard** → **Support**
2. Fornisci:
   - Screenshot dell'errore
   - Timestamp dell'errore
   - Log da Postgres Logs
   - Configurazione SMTP (senza API key)

---

## 🔗 Link Utili

- [Supabase Auth Settings](https://supabase.com/dashboard/project/_/auth/settings)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase Logs](https://supabase.com/dashboard/project/_/logs/postgres)
- [Supabase Status](https://status.supabase.com)

---

## 📝 Note

- **Errore 500 da `/auth/v1/signup`** significa che Supabase Auth stesso fallisce
- **Non è un problema di tabelle** (quelle darebbero errore diverso)
- **Probabilmente è SMTP** se email verification è abilitata
- **Disabilita email verification** per testare se è quello il problema

