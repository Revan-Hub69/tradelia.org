# 🔍 Diagnostica Email Admin - Tradelia.org

## ⚠️ Problema: Email non arrivano

Se le email non arrivano a `amministrazione@tradelia.org`, verifica:

---

## ✅ 1. Verifica BREVO_API_KEY

**Controlla se è configurato in Vercel/Cloudflare:**

1. **Vercel:**
   - Vai su https://vercel.com
   - Project → Settings → Environment Variables
   - Cerca `BREVO_API_KEY`
   - Deve essere presente in **Production**, **Preview**, **Development**

2. **Cloudflare Pages:**
   - Vai su https://dash.cloudflare.com
   - Pages → Project → Settings → Environment Variables
   - Cerca `BREVO_API_KEY`
   - Deve essere presente in **Production**, **Preview**

**Formato corretto:**
```
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ IMPORTANTE:** Se `BREVO_API_KEY` non è configurato, le email **NON vengono inviate** (il codice controlla `if (BREVO_API_KEY)` prima di inviare).

---

## ✅ 2. Verifica Log Vercel/Cloudflare

**Controlla i log per errori:**

1. **Vercel:**
   - Project → Deployments → [ultimo deployment] → Functions
   - Cerca log con `[Request Analysis]` o `[Request Free Token]` o `[Request Token]`
   - Cerca errori come:
     - `BREVO_API_KEY non configurato`
     - `Errore invio email admin`
     - `Brevo API error`

2. **Cloudflare Pages:**
   - Project → Deployments → [ultimo deployment] → Logs
   - Cerca gli stessi errori

**Log da cercare:**
- ✅ `Email admin inviata con successo` → Email inviata correttamente
- ❌ `BREVO_API_KEY non configurato` → Chiave mancante
- ❌ `Errore invio email admin` → Errore Brevo API
- ❌ `Brevo API error: 401` → Chiave non valida
- ❌ `Brevo API error: 402` → Quota esaurita

---

## ✅ 3. Verifica Email Brevo

**Controlla il dashboard Brevo:**

1. Vai su https://app.brevo.com
2. **Statistics** → **Sent Emails**
3. Verifica se le email sono state inviate
4. Controlla:
   - **Delivered** → Email consegnata
   - **Bounced** → Email rimbalzata (indirizzo non valido)
   - **Opened** → Email aperta
   - **Clicked** → Link cliccato

**Se le email non compaiono:**
- La chiave API potrebbe essere errata
- La quota potrebbe essere esaurita
- L'account Brevo potrebbe essere sospeso

---

## ✅ 4. Verifica Spam

**Controlla la cartella spam:**

1. Apri `amministrazione@tradelia.org`
2. Controlla la cartella **Spam/Posta indesiderata**
3. Se trovi le email:
   - Segna come "Non spam"
   - Aggiungi `noreply@tradelia.org` ai contatti
   - Configura un filtro per evitare spam

---

## ✅ 5. Verifica Indirizzo Email

**Controlla che l'indirizzo sia corretto:**

Nel codice, l'email admin è:
```javascript
const ADMIN_EMAIL = 'amministrazione@tradelia.org';
```

**File che usano questo indirizzo:**
- `/api/request-analysis.js` → Richieste analisi/desk
- `/api/request-free-token.js` → Token gratuiti
- `/api/request-dashboard-token.js` → Token dashboard

**Verifica:**
- L'indirizzo è corretto?
- L'email esiste?
- L'email accetta messaggi esterni?

---

## ✅ 6. Test Manuale

**Testa l'invio email:**

1. **Crea una richiesta di test:**
   - Vai su `/report/index.html` (o pagina con form analisi)
   - Compila il form
   - Invia

2. **Controlla i log:**
   - Vercel/Cloudflare → Logs
   - Cerca `[Request Analysis] Email admin inviata con successo`

3. **Controlla Brevo:**
   - Dashboard → Statistics → Sent Emails
   - Verifica se l'email è stata inviata

4. **Controlla email:**
   - Apri `amministrazione@tradelia.org`
   - Controlla inbox e spam

---

## 🔧 Fix Comuni

### Problema: BREVO_API_KEY non configurato

**Soluzione:**
1. Vai su Vercel/Cloudflare
2. Aggiungi `BREVO_API_KEY` nelle Environment Variables
3. Valore: `xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
4. Seleziona tutti gli environment (Production, Preview, Development)
5. **Redeploy** il progetto

### Problema: Chiave API non valida

**Soluzione:**
1. Vai su https://app.brevo.com
2. Settings → API Keys
3. Genera una nuova API Key
4. Copia la chiave
5. Aggiorna `BREVO_API_KEY` in Vercel/Cloudflare
6. **Redeploy**

### Problema: Quota esaurita

**Soluzione:**
1. Vai su https://app.brevo.com
2. Verifica la quota email
3. Se esaurita, aggiorna il piano o aspetta il reset mensile

### Problema: Email in spam

**Soluzione:**
1. Aggiungi `noreply@tradelia.org` ai contatti
2. Segna come "Non spam"
3. Configura un filtro per evitare spam
4. Considera di verificare il dominio in Brevo (SPF, DKIM, DMARC)

---

## 📊 Log Migliorati

**Ora il codice logga:**
- ✅ `Email admin inviata con successo` → Con messageId
- ❌ `BREVO_API_KEY non configurato` → Chiave mancante
- ❌ `Errore invio email admin` → Con dettagli errore Brevo
- ❌ `Brevo API error: 401` → Chiave non valida
- ❌ `Brevo API error: 402` → Quota esaurita

**Cosa controllare nei log:**
1. Se vedi `BREVO_API_KEY non configurato` → Aggiungi la chiave
2. Se vedi `Brevo API error: 401` → Chiave non valida, rigenera
3. Se vedi `Brevo API error: 402` → Quota esaurita
4. Se vedi `Email admin inviata con successo` → Email inviata, controlla spam

---

## 🎯 Checklist Diagnostica

- [ ] `BREVO_API_KEY` configurato in Vercel/Cloudflare?
- [ ] Chiave presente in Production, Preview, Development?
- [ ] Chiave valida (formato: `xkeysib-...`)?
- [ ] Log mostrano `Email admin inviata con successo`?
- [ ] Brevo Dashboard mostra email inviate?
- [ ] Email in spam?
- [ ] Indirizzo `amministrazione@tradelia.org` corretto?
- [ ] Email accetta messaggi esterni?

---

## 📝 Note

1. **Le email non bloccano il flusso:** Se l'email fallisce, la richiesta viene comunque salvata in Supabase
2. **Log dettagliati:** Ora tutti gli errori vengono loggati con dettagli completi
3. **Verifica Brevo:** Il dashboard Brevo è la fonte più affidabile per verificare se le email sono state inviate

---

## 🔗 File Correlati

- `/api/request-analysis.js` → Richieste analisi/desk
- `/api/request-free-token.js` → Token gratuiti
- `/api/request-dashboard-token.js` → Token dashboard
- `/api/send-email.js` → Email generiche

