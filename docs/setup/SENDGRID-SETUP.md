# 📧 Setup SendGrid per Tradelia

## 🎯 Obiettivo
Sostituire Resend con SendGrid per l'invio email tramite Supabase e API.

---

## 📋 Step 1: Creare Account SendGrid

1. Vai su https://signup.sendgrid.com
2. Crea un account gratuito (100 email/giorno)
3. Completa la verifica email

---

## 🔑 Step 2: Ottenere API Key

1. Vai su **SendGrid Dashboard** → **Settings** → **API Keys**
2. Clicca **"Create API Key"**
3. Nome: `Tradelia Production`
4. Permissions: **"Full Access"** (o almeno "Mail Send")
5. Clicca **"Create & View"**
6. **COPIA SUBITO LA CHIAVE** (si vede solo una volta!)
   - Formato: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## ⚙️ Step 3: Configurare SMTP in Supabase

1. Vai su **Supabase Dashboard** → **Settings** → **Auth** → **SMTP Settings**
2. Abilita **"Enable Custom SMTP"** → ON
3. Compila i campi:

| Campo | Valore |
|------|--------|
| **SMTP Host** | `smtp.sendgrid.net` |
| **SMTP Port** | `587` |
| **SMTP User** | `apikey` (esattamente così, minuscolo) |
| **SMTP Password** | `[LA_TUA_SENDGRID_API_KEY]` (la chiave che hai copiato) |
| **Sender email** | `Tradelia <noreply@tradelia.org>` |
| **Sender name** | `Tradelia` |

4. Clicca **Save**

---

## 🌐 Step 4: Verificare Dominio (Opzionale ma Consigliato)

Per usare `noreply@tradelia.org` invece di `noreply@sendgrid.net`:

1. Vai su **SendGrid Dashboard** → **Settings** → **Sender Authentication**
2. Clicca **"Authenticate Your Domain"**
3. Seleziona il tuo provider DNS (Aruba)
4. Aggiungi i record DNS che SendGrid ti fornisce:
   - **CNAME** records per verifica
   - **TXT** record per SPF
   - **TXT** record per DKIM
5. Attendi la verifica (può richiedere fino a 48h)

**Nota:** Puoi iniziare subito usando `noreply@sendgrid.net` temporaneamente.

---

## 🔐 Step 5: Configurare Variabili d'Ambiente

### Vercel / Cloudflare Pages

Aggiungi la variabile:

| Key | Value |
|-----|-------|
| `SENDGRID_API_KEY` | `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |

**Dove:**
- Vercel: Settings → Environment Variables
- Cloudflare Pages: Settings → Environment Variables

---

## ✅ Step 6: Test

1. **Test Supabase SMTP:**
   - Vai su Supabase → Authentication → Users
   - Crea un nuovo utente di test
   - Verifica che l'email di conferma arrivi

2. **Test API:**
   - Testa `/api/send-email` con una richiesta POST
   - Verifica che l'email arrivi

---

## 📊 Limiti Piano Gratuito

- **100 email/giorno** (piano gratuito)
- **Piano a pagamento:** $19.95/mese per 50.000 email

---

## 🔄 Migrazione da Resend

Dopo aver configurato SendGrid:
1. ✅ SMTP in Supabase configurato
2. ✅ API aggiornate (`/api/send-email.js` e `/api/send-email-backup.js`)
3. ✅ Variabili d'ambiente aggiornate
4. ✅ Test completati

Puoi rimuovere `RESEND_API_KEY` dalle variabili d'ambiente.

---

## 🆘 Troubleshooting

**Email non arrivano:**
- Verifica che l'API key abbia permessi "Mail Send"
- Controlla i log in SendGrid Dashboard → Activity
- Verifica che il sender email sia verificato

**Errore SMTP in Supabase:**
- Verifica che `SMTP User` sia esattamente `apikey` (minuscolo)
- Verifica che la porta sia `587` (non 465)
- Controlla che l'API key sia valida

---

## 📚 Documentazione

- SendGrid API: https://docs.sendgrid.com/api-reference/mail-send/mail-send
- SendGrid SMTP: https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp

