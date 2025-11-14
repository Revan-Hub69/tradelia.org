# 🔧 Fix: Rate Limit "Troppe richieste da email nuova" in Supabase

## ⚠️ Problema

Quando si prova a registrarsi, Supabase restituisce l'errore:
```
Troppe richieste da email nuova
```

Questo è un **rate limit di Supabase** per prevenire spam e abusi.

---

## 🔍 Cause Possibili

1. **Troppi tentativi di registrazione** con la stessa email
2. **Troppi tentativi da stesso IP** (anche con email diverse)
3. **Configurazione SMTP errata** che causa errori ripetuti
4. **Email verification obbligatoria** in Supabase che invia email ad ogni signup

---

## ✅ Soluzioni Implementate

### **1. Messaggio di Errore Migliorato**

Ora l'utente vede un messaggio più chiaro:
```
Troppe richieste di registrazione. Attendi 10-15 minuti prima di riprovare, 
oppure prova con un'email diversa.
```

### **2. Rilevamento Email Già Registrata**

Se l'email è già registrata, l'utente viene automaticamente:
- Reindirizzato al tab "Accedi"
- Con email pre-compilata nel form login

### **3. Auto-Login Dopo Signup**

Dopo la registrazione, l'utente viene automaticamente loggato, evitando di dover verificare l'email.

---

## 🚀 Soluzioni Immediate

### **Opzione 1: Attendi 10-15 Minuti**

Il rate limit di Supabase si resetta automaticamente dopo 10-15 minuti.

**Come verificare:**
1. Attendi 15 minuti
2. Prova di nuovo a registrarti
3. Se funziona? ✅ Risolto

---

### **Opzione 2: Usa Email Diversa**

Il rate limit è per **email + IP**. Prova con:
- Email diversa
- Oppure da rete diversa (mobile hotspot, VPN)

---

### **Opzione 3: Disabilita Email Verification in Supabase**

**Se non vuoi che Supabase invii email di verifica:**

1. Vai su **Supabase Dashboard** → **Authentication** → **Settings**
2. Trova **"Enable email confirmations"**
3. **Disabilita** il toggle
4. **Salva**

**Vantaggi:**
- ✅ Nessun invio email = nessun rate limit
- ✅ Auto-login immediato dopo signup
- ✅ Esperienza utente più fluida

**Svantaggi:**
- ❌ Meno sicurezza (email non verificata)
- ❌ Possibilità di account con email non valide

**⚠️ NOTA**: Se hai già configurato Resend SMTP, questa opzione potrebbe non essere necessaria, ma può comunque aiutare a ridurre il carico.

---

### **Opzione 4: Verifica Configurazione SMTP**

**Se la configurazione SMTP è errata, Supabase potrebbe fallire e causare rate limit:**

1. Vai su **Supabase Dashboard** → **Settings** → **Auth** → **SMTP Settings**
2. Verifica che:
   - ✅ **SMTP Host**: `smtp.resend.com`
   - ✅ **SMTP Port**: `587`
   - ✅ **SMTP User**: `resend`
   - ✅ **SMTP Password**: La tua API Key Resend (`re_esPbadDj_PzRxxMbVzkP4bRq2XxuC1fLx`)
   - ✅ **Sender email**: `Tradelia <noreply@resend.dev>` (temporaneo, fino a verifica SPF)
3. Clicca **"Send test email"**
4. Se il test fallisce, correggi la configurazione

---

## 🔧 Configurazione Supabase Consigliata

### **Per Ridurre Rate Limit:**

1. **Disabilita Email Verification** (se non necessaria):
   - **Supabase Dashboard** → **Authentication** → **Settings**
   - **"Enable email confirmations"** → **OFF**

2. **Abilita Auto-Login dopo Signup**:
   - Già implementato nel codice ✅
   - L'utente viene loggato automaticamente dopo registrazione

3. **Configura SMTP Correttamente**:
   - Usa Resend con `@resend.dev` temporaneamente
   - Quando SPF è verificato, passa a `@tradelia.org`

---

## 📊 Limiti Supabase

### **Free Tier:**
- **Email verification**: 3 email/ora per utente
- **Password reset**: 3 email/ora per utente
- **Magic link**: 3 email/ora per utente

### **Pro Tier:**
- Limiti più alti (variano in base al piano)

---

## 🆘 Se Nulla Funziona

### **1. Controlla Log Supabase**

1. Vai su **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Cerca errori recenti
3. Verifica se ci sono problemi con SMTP

### **2. Contatta Support Supabase**

Se il problema persiste:
1. Vai su **Supabase Dashboard** → **Support**
2. Fornisci:
   - Screenshot dell'errore
   - Timestamp degli errori
   - Configurazione SMTP (senza API key)

### **3. Usa Account Supabase Diverso (Temporaneo)**

Se è un problema di rate limit globale:
- Crea un nuovo progetto Supabase
- Migra i dati (se necessario)
- Usa il nuovo progetto temporaneamente

---

## 📝 Checklist

- [ ] **Atteso 15 minuti** dopo ultimo tentativo
- [ ] **Provato con email diversa**
- [ ] **Verificata configurazione SMTP** in Supabase
- [ ] **Test email SMTP** funziona
- [ ] **Email verification disabilitata** (se non necessaria)
- [ ] **Auto-login dopo signup** funziona
- [ ] **Messaggio errore** è chiaro e utile

---

## 🔗 Link Utili

- [Supabase Auth Settings](https://supabase.com/dashboard/project/_/auth/settings)
- [Supabase Rate Limits](https://supabase.com/docs/guides/platform/rate-limits)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)

