# 📧 Setup Brevo per Tradelia

## 🎯 Obiettivo
Configurare Brevo (ex Sendinblue) per l'invio email tramite Supabase e API.

---

## ⚙️ Step 1: Configurare SMTP in Supabase

1. Vai su **Supabase Dashboard** → **Settings** → **Auth** → **SMTP Settings**
2. Abilita **"Enable Custom SMTP"** → ON
3. Compila i campi:

| Campo | Valore |
|------|--------|
| **SMTP Host** | `smtp-relay.brevo.com` |
| **SMTP Port** | `587` |
| **SMTP User** | `9ba731001@smtp-brevo.com` |
| **SMTP Password** | `xsmtpsib-e31ec81f4271869670fe04a529db4f7851d62589f0caaba7f8aaa44cc84eb248-IxEjXDCD8IbZWiYI` |
| **Sender email** | `Tradelia <noreply@tradelia.org>` |
| **Sender name** | `Tradelia` |

4. Clicca **Save**

---

## 🔐 Step 2: Configurare Variabili d'Ambiente

### Vercel / Cloudflare Pages

Aggiungi la variabile:

| Key | Value |
|-----|-------|
| `BREVO_API_KEY` | `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` |

**Dove:**
- Vercel: Settings → Environment Variables
- Cloudflare Pages: Settings → Environment Variables

---

## ✅ Step 3: Test

1. **Test Supabase SMTP:**
   - Vai su Supabase → Authentication → Users
   - Crea un nuovo utente di test
   - Verifica che l'email di conferma arrivi

2. **Test API:**
   - Testa `/api/send-email` con una richiesta POST
   - Verifica che l'email arrivi

---

## 📊 Limiti Piano Gratuito

- **300 email/giorno** (9.000/mese)
- **Piano a pagamento:** €9/mese per 20.000 email

---

## 🌐 Step 4: Verificare Dominio (Opzionale ma Consigliato)

Per usare `noreply@tradelia.org` invece di `noreply@brevo.com`:

1. Vai su **Brevo Dashboard** → **Senders & IP** → **Domains**
2. Clicca **"Add a domain"**
3. Inserisci `tradelia.org`
4. Aggiungi i record DNS che Brevo ti fornisce:
   - **CNAME** records per verifica
   - **TXT** record per SPF
   - **TXT** record per DKIM
5. Attendi la verifica (può richiedere fino a 48h)

**Nota:** Puoi iniziare subito usando `noreply@tradelia.org` anche senza verifica, ma potrebbe finire in spam.

---

## 🔄 Credenziali Salvate

Tutte le credenziali sono salvate in `ARCHIVIO-ENV-VALUES-READY.txt`:
- **BREVO_API_KEY**: Per uso programmatico
- **BREVO_SMTP_KEY**: Per Supabase SMTP
- **BREVO_SMTP_LOGIN**: Login SMTP
- **BREVO_SMTP_SERVER**: Server SMTP
- **BREVO_SMTP_PORT**: Porta SMTP

---

## 🆘 Troubleshooting

**Email non arrivano:**
- Verifica che l'API key abbia permessi corretti
- Controlla i log in Brevo Dashboard → Statistics → Email logs
- Verifica che il sender email sia configurato correttamente

**Errore SMTP in Supabase:**
- Verifica che `SMTP User` sia esattamente `9ba731001@smtp-brevo.com`
- Verifica che la porta sia `587` (non 465)
- Controlla che la SMTP key sia valida

---

## 📚 Documentazione

- Brevo API: https://developers.brevo.com/docs/send-emails-with-api
- Brevo SMTP: https://help.brevo.com/hc/en-us/articles/209467485

