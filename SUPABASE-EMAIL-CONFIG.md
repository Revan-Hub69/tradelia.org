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

### 3. Configurare Sender Email (Opzionale)

**Passo 1: Vai a SMTP Settings**
1. Menu laterale: **Settings** → **Auth** → **SMTP Settings**
2. Oppure: **Project Settings** → **Auth** → **SMTP**

**Passo 2: Configura SMTP personalizzato (opzionale)**
- Se vuoi usare un dominio email personalizzato (es. `noreply@tradelia.org`)
- Configura SMTP con provider email (SendGrid, Mailgun, Resend, etc.)

**Nota**: Se non configuri SMTP, Supabase usa il suo servizio email predefinito.

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

