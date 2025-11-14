# 🔧 Fix: "Error sending email confirmation" in Supabase

## ⚠️ Problema

Quando si prova a registrarsi, Supabase restituisce:
```
Error sending email confirmation
```

Questo significa che **Supabase non riesce a inviare l'email di verifica** tramite SMTP.

---

## 🔍 Cause Possibili

1. **SMTP non configurato** in Supabase
2. **Credenziali SMTP errate** (API key Resend sbagliata)
3. **Record SPF/MX ancora pending** in Resend (se usi `@tradelia.org`)
4. **SMTP Host/Port errati**
5. **Email verification disabilitata** ma Supabase cerca comunque di inviare

---

## ✅ Soluzione Immediata: Configura SMTP in Supabase

### **Passo 1: Vai a SMTP Settings**

1. Vai su **Supabase Dashboard**
2. Seleziona il tuo progetto
3. Vai su **Settings** → **Auth** → **SMTP Settings**
   - Oppure: **Project Settings** → **Auth** → **SMTP**

---

### **Passo 2: Abilita Custom SMTP**

1. Trova il toggle **"Enable Custom SMTP"**
2. **Attivalo** (ON)

---

### **Passo 3: Inserisci Credenziali Resend**

**IMPORTANTE**: Usa `@resend.dev` temporaneamente (fino a quando SPF non è verificato):

| Campo | Valore |
|-------|--------|
| **SMTP Host** | `smtp.resend.com` |
| **SMTP Port** | `587` (o `465` per SSL) |
| **SMTP User** | `resend` (fisso, NON la tua API key) |
| **SMTP Password** | `re_esPbadDj_PzRxxMbVzkP4bRq2XxuC1fLx` (API Key Resend) |
| **Sender email** | `Tradelia <noreply@resend.dev>` |
| **Sender name** | `Tradelia` (opzionale) |

**⚠️ NOTA CRITICA**:
- **SMTP User** deve essere esattamente `resend` (non la tua API key)
- **SMTP Password** è la tua API Key Resend completa
- **Sender email** usa `@resend.dev` temporaneamente (non `@tradelia.org`)

---

### **Passo 4: Test SMTP**

1. Clicca **"Send test email"**
2. Inserisci un'email di test (es. la tua email personale)
3. Clicca **"Send"**

**Se il test funziona:**
- ✅ SMTP è configurato correttamente
- ✅ Le email di verifica dovrebbero funzionare

**Se il test fallisce:**
- ❌ Verifica le credenziali
- ❌ Controlla che l'API Key Resend sia corretta
- ❌ Verifica che Resend non abbia bloccato il tuo account

---

### **Passo 5: Salva**

1. Clicca **"Save"** in fondo alla pagina
2. Attendi conferma che le impostazioni sono state salvate

---

## 🔧 Verifica Configurazione

### **Checklist SMTP:**

- [ ] **Custom SMTP** è abilitato (toggle ON)
- [ ] **SMTP Host**: `smtp.resend.com`
- [ ] **SMTP Port**: `587` (o `465`)
- [ ] **SMTP User**: `resend` (esattamente così)
- [ ] **SMTP Password**: La tua API Key Resend (`re_esPbadDj_PzRxxMbVzkP4bRq2XxuC1fLx`)
- [ ] **Sender email**: `Tradelia <noreply@resend.dev>` (temporaneo)
- [ ] **Test email** inviata con successo

---

## 🚀 Quando SPF è Verificato

**Dopo che Resend verifica SPF** (record `send` TXT):

1. Vai su **Supabase Dashboard** → **Settings** → **Auth** → **SMTP Settings**
2. Cambia **Sender email** da:
   ```
   Tradelia <noreply@resend.dev>
   ```
   a:
   ```
   noreply@tradelia.org
   ```
3. **Salva**

---

## 🆘 Se Non Funziona

### **1. Verifica API Key Resend**

1. Vai su **Resend Dashboard** → **API Keys**
2. Verifica che l'API Key `re_esPbadDj_PzRxxMbVzkP4bRq2XxuC1fLx` esista
3. Se non esiste, crea una nuova API Key
4. Aggiorna **SMTP Password** in Supabase con la nuova key

---

### **2. Verifica Resend Account**

1. Vai su **Resend Dashboard** → **Settings**
2. Verifica che l'account non sia sospeso
3. Controlla i limiti del piano (Free = 3.000 email/mese)

---

### **3. Disabilita Email Verification (Temporaneo)**

**Se SMTP non funziona e vuoi testare la registrazione:**

1. Vai su **Supabase Dashboard** → **Authentication** → **Settings**
2. Trova **"Enable email confirmations"**
3. **Disabilita** il toggle
4. **Salva**

**Vantaggi:**
- ✅ Nessun invio email = nessun errore
- ✅ Auto-login immediato dopo signup
- ✅ Puoi testare la registrazione

**Svantaggi:**
- ❌ Email non verificate
- ❌ Meno sicurezza

**⚠️ NOTA**: Riabilita dopo aver risolto SMTP.

---

### **4. Controlla Log Supabase**

1. Vai su **Supabase Dashboard** → **Logs** → **Auth Logs**
2. Cerca errori recenti
3. Verifica messaggi di errore SMTP

**Errori comuni:**
- `535 Authentication failed` → API Key errata
- `550 Invalid sender` → Sender email non valido
- `Connection timeout` → SMTP Host/Port errati

---

## 📋 Configurazione Completa

### **Supabase SMTP Settings:**

```
✅ Enable Custom SMTP: ON
✅ SMTP Host: smtp.resend.com
✅ SMTP Port: 587
✅ SMTP User: resend
✅ SMTP Password: re_esPbadDj_PzRxxMbVzkP4bRq2XxuC1fLx
✅ Sender email: Tradelia <noreply@resend.dev>
✅ Sender name: Tradelia
```

### **Resend Dashboard:**

```
✅ Account attivo
✅ API Key valida
✅ Dominio tradelia.org aggiunto (opzionale)
✅ DKIM verificato ✅
✅ SPF pending ⚠️ (usa @resend.dev temporaneamente)
```

---

## 🔗 Link Utili

- [Supabase SMTP Settings](https://supabase.com/dashboard/project/_/auth/settings)
- [Resend Dashboard](https://resend.com/dashboard)
- [Resend API Keys](https://resend.com/api-keys)
- [Supabase SMTP Docs](https://supabase.com/docs/guides/auth/auth-smtp)

---

## 📝 Note Finali

- **Usa `@resend.dev` temporaneamente** fino a quando SPF non è verificato
- **Test email** è fondamentale per verificare la configurazione
- **Se test email funziona**, le email di verifica dovrebbero funzionare
- **Se test email fallisce**, controlla credenziali e API Key

