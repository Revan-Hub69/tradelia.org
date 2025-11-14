# 🔧 Fix: Record SPF/MX Pending in Resend

## ⚠️ Problema

I record **SPF** e **MX** sono ancora "Pending" in Resend, anche se:
- ✅ DKIM è verificato
- ✅ Toggle "Enable Sending" è attivo

**Risultato**: Resend potrebbe **rifiutare l'invio di email** fino a quando SPF non è verificato.

---

## 🔍 Verifica Record DNS

### **1. Controlla Record SPF**

**Record da verificare:**
- **Tipo**: `TXT`
- **Nome**: `send` (o `send.tradelia.org`)
- **Contenuto**: `v=spf1 include:amazonses.com ~all` (o simile)

**Come verificare:**
```bash
# Windows PowerShell
nslookup -type=TXT send.tradelia.org

# O online
https://mxtoolbox.com/SuperTool.aspx?action=spf%3asend.tradelia.org
```

**Se il record non risolve:**
1. Vai al tuo provider DNS (Aruba)
2. Verifica che il record `send` (TXT) esista
3. Attendi propagazione (può richiedere fino a 48h, di solito 1-2h)

---

### **2. Controlla Record MX**

**Record da verificare:**
- **Tipo**: `MX`
- **Nome**: `send` (o `send.tradelia.org`)
- **Contenuto**: `feedback-smtp.eu-west-1.amazonses.com` (o simile)
- **Priority**: `10`

**Problema noto**: Aruba potrebbe non supportare record MX per sottodomini.

**Soluzione alternativa**: Se Aruba non supporta MX per `send`, puoi:
1. **Saltare il record MX** (non è obbligatorio per l'invio)
2. **Usare solo SPF** (più importante per deliverability)

---

## 🚀 Soluzione Temporanea: Usa @resend.dev

**Fino a quando SPF non è verificato**, puoi usare `@resend.dev` come sender:

### **Configurazione SMTP Supabase (Temporanea)**

1. Vai su **Supabase Dashboard** → **Settings** → **Auth** → **SMTP Settings**
2. **Sender email**: Cambia da `noreply@tradelia.org` a:
   ```
   Tradelia <noreply@resend.dev>
   ```
3. **Salva** e **testa** l'invio

**Vantaggi:**
- ✅ Funziona immediatamente (non richiede verifica dominio)
- ✅ Email arrivano correttamente
- ✅ Nessun problema di rate limit

**Svantaggi:**
- ❌ Email arrivano da `@resend.dev` invece di `@tradelia.org`
- ❌ Meno professionale (ma funziona)

---

## ✅ Soluzione Definitiva: Verifica SPF

### **Passo 1: Aggiungi Record SPF**

**Se non l'hai già fatto:**

1. Vai al tuo provider DNS (Aruba)
2. Aggiungi record **TXT**:
   - **Nome**: `send` (o `send.tradelia.org`)
   - **Contenuto**: `v=spf1 include:amazonses.com ~all`
   - **TTL**: `Auto` o `3600`

3. **Salva** e attendi propagazione (1-2h)

### **Passo 2: Verifica in Resend**

1. Vai su **Resend Dashboard** → **Domains** → **tradelia.org**
2. Clicca **"Refresh"** o **"Verify"**
3. Attendi che SPF risulti **"Verified"** ✅

### **Passo 3: Aggiorna SMTP Supabase**

1. Vai su **Supabase Dashboard** → **Settings** → **Auth** → **SMTP Settings**
2. **Sender email**: Cambia da `Tradelia <noreply@resend.dev>` a:
   ```
   noreply@tradelia.org
   ```
3. **Salva** e **testa** l'invio

---

## 🔍 Debug: Perché SPF è Pending?

### **Possibili cause:**

1. **Record non propagato**: Attendi 1-2h dopo l'aggiunta
2. **Nome record errato**: Deve essere `send` (non `send.tradelia.org` in alcuni provider)
3. **Contenuto errato**: Verifica che il contenuto sia esattamente quello fornito da Resend
4. **TTL troppo alto**: Usa `Auto` o `3600` (1 ora)

### **Come verificare:**

```bash
# Verifica record SPF
nslookup -type=TXT send.tradelia.org

# Dovresti vedere:
# send.tradelia.org text = "v=spf1 include:amazonses.com ~all"
```

---

## 📋 Checklist

- [ ] **Record SPF** (`send` TXT) aggiunto in Aruba
- [ ] **Record SPF** risolve correttamente (verifica con nslookup)
- [ ] **Resend Dashboard** mostra SPF "Verified" ✅
- [ ] **SMTP Supabase** configurato con `noreply@tradelia.org`
- [ ] **Test email** inviata con successo da Supabase
- [ ] **Email di verifica** arrivano da `noreply@tradelia.org`

---

## 🆘 Se Non Funziona

**Opzione 1: Usa @resend.dev temporaneamente**
- Configura SMTP con `Tradelia <noreply@resend.dev>`
- Funziona subito, cambia dopo verifica SPF

**Opzione 2: Contatta Support Resend**
- Vai su **Resend Dashboard** → **Support**
- Fornisci screenshot dei record DNS
- Chiedi perché SPF è ancora "Pending"

**Opzione 3: Verifica DNS con tool esterni**
- https://mxtoolbox.com/SuperTool.aspx?action=spf%3asend.tradelia.org
- https://www.dnswatch.info/dns/dnslookup?la=en&host=send.tradelia.org&type=TXT

---

## 📝 Note

- **MX record**: Non è obbligatorio per l'invio, solo per la ricezione
- **SPF record**: **OBBLIGATORIO** per l'invio da dominio personalizzato
- **DKIM record**: Già verificato ✅
- **DMARC record**: Opzionale ma consigliato per sicurezza

---

## 🔗 Link Utili

- [Resend Domain Verification](https://resend.com/docs/dashboard/domains/introduction)
- [Resend SPF Setup](https://resend.com/docs/dashboard/domains/spf)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)

