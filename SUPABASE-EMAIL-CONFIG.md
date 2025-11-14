# 📧 Configurazione Email Supabase - Tradelia

## 🔴 Problemi Attuali

1. **Email di verifica non mostra branding Tradelia**
2. **Link di conferma va a `localhost:3000` invece del dominio reale**

## ✅ Soluzioni

### 1. Configurare Site URL in Supabase

**Passo 1: Accedi a Supabase Dashboard**
1. Vai su https://supabase.com/dashboard
2. Seleziona il progetto Tradelia

**Passo 2: Vai a Authentication Settings**
1. Menu laterale: **Authentication** → **URL Configuration**
2. Oppure: **Settings** → **Auth** → **URL Configuration**

**Passo 3: Configura Site URL**
- **Site URL**: `https://tradelia.org` (o il tuo dominio reale)
- **Redirect URLs**: Aggiungi questi URL (uno per riga):
  ```
  https://tradelia.org/user
  https://tradelia.org/user/
  https://www.tradelia.org/user
  https://www.tradelia.org/user/
  http://localhost:3000/user
  http://localhost:3000/user/
  ```

**⚠️ IMPORTANTE**: Il Site URL è quello che Supabase usa per generare i link nelle email. Se è impostato su `localhost:3000`, tutti i link andranno lì.

---

### 2. Personalizzare Template Email

**Passo 1: Vai a Email Templates**
1. Menu laterale: **Authentication** → **Email Templates**
2. Oppure: **Settings** → **Auth** → **Email Templates**

**Passo 2: Personalizza "Confirm signup"**
1. Seleziona template: **Confirm signup**
2. Modifica il template per includere:
   - Logo Tradelia
   - Colori del brand
   - Messaggio personalizzato

**Template di esempio (HTML):**
```html
<h2>Benvenuto su Tradelia</h2>
<p>Clicca sul link qui sotto per confermare il tuo account:</p>
<p><a href="{{ .ConfirmationURL }}">Conferma account</a></p>
<p>Se non hai richiesto questo account, ignora questa email.</p>
<p>— Il team Tradelia</p>
```

**Variabili disponibili:**
- `{{ .ConfirmationURL }}` - Link di conferma
- `{{ .SiteURL }}` - URL del sito (da Site URL configurato)
- `{{ .Email }}` - Email dell'utente
- `{{ .Token }}` - Token di conferma (se necessario)

**Passo 3: Personalizza "Magic Link" e "Change Email"**
- Stesso processo per gli altri template email

---

### 3. Configurare Resend come SMTP Provider

**Perché Resend?**
- Email da dominio personalizzato (`noreply@tradelia.org` invece di `noreply@supabase.io`)
- Branding completo nelle email
- Migliore deliverability
- Analytics e tracking email

---

#### **Passo 1: Crea Account Resend**

1. Vai su https://resend.com
2. Crea un account (gratuito fino a 3.000 email/mese)
3. Verifica la tua email

---

#### **Passo 2: Ottieni API Key**

1. Vai su **Resend Dashboard** → **API Keys**
2. Clicca **Create API Key**
3. Nome: `Tradelia Supabase SMTP`
4. Permissions: **Sending access**
5. Copia l'API Key (inizia con `re_`)
6. **⚠️ IMPORTANTE**: Salvala subito, non la vedrai più!

**Esempio API Key**: `re_1234567890abcdefghijklmnopqrstuvwxyz`

---

#### **Passo 3: Verifica Dominio in Resend**

**Per inviare email da `noreply@tradelia.org`:**

1. Vai su **Resend Dashboard** → **Domains**
2. Clicca **Add Domain**
3. Inserisci: `tradelia.org` (o `www.tradelia.org`)
4. Resend ti darà dei record DNS da aggiungere:
   - **SPF Record**: `v=spf1 include:resend.com ~all`
   - **DKIM Record**: (chiave pubblica fornita da Resend)
   - **DMARC Record**: (opzionale ma consigliato)

5. **Aggiungi i record DNS**:
   - Vai al tuo provider DNS (es. Cloudflare, Vercel, etc.)
   - Aggiungi i record TXT forniti da Resend
   - Attendi la verifica (può richiedere fino a 48h, di solito pochi minuti)

6. **Verifica dominio**:
   - Resend verificherà automaticamente i record DNS
   - Quando vedi "Verified" ✅, il dominio è pronto

**⚠️ NOTA**: Se non verifichi il dominio, puoi comunque usare Resend ma solo con `@resend.dev` (es. `noreply@resend.dev`)

---

#### **Passo 4: Configura Resend in Supabase**

1. Vai su **Supabase Dashboard** → **Settings** → **Auth** → **SMTP Settings**
2. Oppure: **Project Settings** → **Auth** → **SMTP**

3. **Abilita Custom SMTP**: Attiva il toggle "Enable Custom SMTP"

4. **Inserisci le credenziali Resend**:
   - **SMTP Host**: `smtp.resend.com`
   - **SMTP Port**: `587` (o `465` per SSL)
   - **SMTP User**: `resend` (fisso, non la tua API key)
   - **SMTP Password**: `re_esPbadDj_PzRxxMbVzkP4bRq2XxuC1fLx` (la tua API key)
   - **Sender email**: 
     - Se dominio verificato: `noreply@tradelia.org`
     - Se dominio NON verificato: `Tradelia <noreply@resend.dev>`
   - **Sender name**: `Tradelia` (opzionale)
   
   **⚠️ IMPORTANTE**: Usa la stessa API key sia qui che nella variabile d'ambiente `RESEND_API_KEY`

5. **Test SMTP**: Clicca "Send test email" per verificare la configurazione

6. **Salva**: Clicca "Save"

---

#### **Passo 5: Configura Variabile d'Ambiente (per API)**

**Per le API che usano Resend direttamente** (`/api/send-email.js`, `/api/send-email-backup.js`):

1. **Vercel**:
   - Vai su **Vercel Dashboard** → **Project** → **Settings** → **Environment Variables**
   - Aggiungi:
     - **Key**: `RESEND_API_KEY`
     - **Value**: `re_esPbadDj_PzRxxMbVzkP4bRq2XxuC1fLx` (la tua API key)
     - **Environments**: ✅ Production, ✅ Preview, ✅ Development

2. **Cloudflare Pages**:
   - Vai su **Cloudflare Dashboard** → **Pages** → **Project** → **Settings** → **Environment Variables**
   - Aggiungi:
     - **Variable name**: `RESEND_API_KEY`
     - **Value**: `re_esPbadDj_PzRxxMbVzkP4bRq2XxuC1fLx` (la tua API key)
     - **Environments**: ✅ Production, ✅ Preview

---

## 📋 Checklist Resend

- [ ] **Account Resend** creato e verificato
- [ ] **API Key Resend** generata e salvata
- [ ] **Dominio verificato** in Resend (opzionale ma consigliato)
- [ ] **SMTP configurato** in Supabase con credenziali Resend
- [ ] **Test email** inviata con successo da Supabase
- [ ] **Variabile `RESEND_API_KEY`** aggiunta in Vercel/Cloudflare Pages
- [ ] **Email di verifica** arrivano da `noreply@tradelia.org` (o `@resend.dev`)

---

## 🔍 Verifica Configurazione Resend

1. **Test da Supabase**:
   - Vai su **Supabase Dashboard** → **Auth** → **Users**
   - Crea un utente di test
   - Verifica che l'email arrivi da `noreply@tradelia.org` (o `@resend.dev`)

2. **Test da API**:
   - Chiama `/api/send-email` con POST
   - Verifica che l'email arrivi correttamente

3. **Controlla Resend Dashboard**:
   - Vai su **Resend Dashboard** → **Emails**
   - Dovresti vedere tutte le email inviate
   - Controlla status (delivered, bounced, etc.)

---

## 📝 Note Tecniche Resend

- **SMTP User**: Sempre `resend` (non la tua API key)
- **SMTP Password**: La tua API Key Resend completa
- **Porta**: `587` (TLS) o `465` (SSL) - entrambe funzionano
- **Rate Limit**: Piano gratuito = 3.000 email/mese
- **Dominio**: Se non verifichi il dominio, puoi usare `@resend.dev` temporaneamente
- **API Key**: Usa la stessa API Key sia per SMTP Supabase che per le API dirette

---

## 🔗 Link Utili Resend

- [Resend Dashboard](https://resend.com/dashboard)
- [Resend API Docs](https://resend.com/docs/api-reference)
- [Resend Domain Verification](https://resend.com/docs/dashboard/domains/introduction)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Guida Setup DNS Resend](RESEND-DNS-SETUP.md) - **Vedi questa guida per aggiungere i record DNS**

---

## 📋 Checklist

- [ ] **Site URL** configurato su `https://tradelia.org` (non localhost)
- [ ] **Redirect URLs** include dominio reale + localhost per sviluppo
- [ ] **Email Template "Confirm signup"** personalizzato con branding Tradelia
- [ ] **Email Template "Magic Link"** personalizzato (se usato)
- [ ] **Email Template "Change Email"** personalizzato (se usato)
- [ ] **SMTP Settings** configurato (opzionale, per email da dominio personalizzato)

---

## 🔍 Verifica

Dopo aver configurato:

1. **Test registrazione**:
   - Registra un nuovo account
   - Controlla l'email ricevuta
   - Verifica che:
     - Il logo/messaggio Tradelia sia presente
     - Il link di conferma punti a `https://tradelia.org/user` (non localhost)

2. **Test link**:
   - Clicca sul link nell'email
   - Verifica che reindirizzi correttamente all'area utente

---

## 📝 Note Tecniche

- Il codice JavaScript usa `window.location.origin` per il redirect, che è corretto
- Il problema del `localhost:3000` viene da Supabase che usa il **Site URL** configurato nella dashboard
- I template email possono essere in HTML o testo semplice
- Le variabili nei template usano sintassi Go template: `{{ .VariableName }}`

---

## 🔗 Link Utili

- [Supabase Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase URL Configuration](https://supabase.com/docs/guides/auth/auth-deep-dive/auth-deep-dive-jwts#redirect-urls)
- [Supabase SMTP Settings](https://supabase.com/docs/guides/auth/auth-smtp)

