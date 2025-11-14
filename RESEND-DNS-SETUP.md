# 🔧 Guida Setup DNS Resend per tradelia.org

## 📋 Record DNS da Aggiungere

Hai questi record da aggiungere al tuo provider DNS:

### **1. DKIM (Domain Verification) - OBBLIGATORIO**

**Tipo**: `TXT`  
**Nome**: `resend._domainkey`  
**Contenuto**:
```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDI/ytqHfmmOhudGklbfZ5Y7KPah40aOao1Rf7hNLqJePYyVHCD6JAxmTNo7ZIqY//ZvQc15MhdrCNo675e+5RX8+XGyixueFdtxy5x9boCSjIYpurqJ8zyh9ZJpx5bgy+5LG6udh1CR6T36IqcE3re1pFVdC2HiE5ST+G1NClfZQIDAQAB
```
**TTL**: `Auto` (o `3600`)

---

### **2. SPF (Enable Sending) - OBBLIGATORIO**

#### **2a. MX Record per Sending**

**Tipo**: `MX`  
**Nome**: `send`  
**Contenuto**: `feedback-smtp.eu-west-1.amazonses.com`  
**Priorità**: `10`  
**TTL**: `Auto` (o `3600`)

#### **2b. TXT Record per SPF**

**Tipo**: `TXT`  
**Nome**: `send`  
**Contenuto**:
```
v=spf1 include:amazonses.com ~all
```
**TTL**: `Auto` (o `3600`)

---

### **3. DMARC (Optional ma Consigliato)**

**Tipo**: `TXT`  
**Nome**: `_dmarc`  
**Contenuto**:
```
v=DMARC1; p=none;
```
**TTL**: `Auto` (o `3600`)

---

### **4. MX per Receiving (Opzionale - solo se vuoi ricevere email)**

**Tipo**: `MX`  
**Nome**: `@` (root domain)  
**Contenuto**: `inbound-smtp.eu-west-1.amazonaws.com`  
**Priorità**: `9`  
**TTL**: `Auto` (o `3600`)

**⚠️ NOTA**: Questo record è solo se vuoi ricevere email su `@tradelia.org`. Se non ti serve, puoi saltarlo.

---

## 🚀 Come Aggiungere i Record DNS

### **Opzione 1: Cloudflare (Più Probabile)**

Se `tradelia.org` è gestito da Cloudflare:

#### **Passo 1: Accedi a Cloudflare**
1. Vai su https://dash.cloudflare.com
2. Accedi al tuo account
3. Seleziona il dominio **tradelia.org** (o il tuo account)

#### **Passo 2: Vai a DNS Settings**
1. Clicca su **DNS** nel menu laterale
2. Oppure: **tradelia.org** → **DNS** → **Records**

#### **Passo 3: Aggiungi Record DKIM (TXT)**
1. Clicca **Add record**
2. **Type**: Seleziona `TXT`
3. **Name**: `resend._domainkey` (senza `.tradelia.org`)
4. **Content**: Incolla il valore DKIM completo:
   ```
   p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDI/ytqHfmmOhudGklbfZ5Y7KPah40aOao1Rf7hNLqJePYyVHCD6JAxmTNo7ZIqY//ZvQc15MhdrCNo675e+5RX8+XGyixueFdtxy5x9boCSjIYpurqJ8zyh9ZJpx5bgy+5LG6udh1CR6T36IqcE3re1pFVdC2HiE5ST+G1NClfZQIDAQAB
   ```
5. **TTL**: `Auto` (o `3600`)
6. Clicca **Save**

#### **Passo 4: Aggiungi Record SPF - MX (MX)**
1. Clicca **Add record**
2. **Type**: Seleziona `MX`
3. **Name**: `send` (senza `.tradelia.org`)
4. **Mail server**: `feedback-smtp.eu-west-1.amazonses.com`
5. **Priority**: `10`
6. **TTL**: `Auto` (o `3600`)
7. Clicca **Save**

#### **Passo 5: Aggiungi Record SPF - TXT (TXT)**
1. Clicca **Add record**
2. **Type**: Seleziona `TXT`
3. **Name**: `send` (senza `.tradelia.org`)
4. **Content**: `v=spf1 include:amazonses.com ~all`
5. **TTL**: `Auto` (o `3600`)
6. Clicca **Save**

#### **Passo 6: Aggiungi Record DMARC (TXT) - Opzionale**
1. Clicca **Add record**
2. **Type**: Seleziona `TXT`
3. **Name**: `_dmarc` (senza `.tradelia.org`)
4. **Content**: `v=DMARC1; p=none;`
5. **TTL**: `Auto` (o `3600`)
6. Clicca **Save**

#### **Passo 7: Aggiungi MX per Receiving (MX) - Opzionale**
1. Clicca **Add record**
2. **Type**: Seleziona `MX`
3. **Name**: `@` (root domain, lascia vuoto o `@`)
4. **Mail server**: `inbound-smtp.eu-west-1.amazonaws.com`
5. **Priority**: `9`
6. **TTL**: `Auto` (o `3600`)
7. Clicca **Save**

---

### **Opzione 2: Vercel (Se il dominio è su Vercel)**

Se `tradelia.org` è gestito da Vercel:

#### **Passo 1: Accedi a Vercel**
1. Vai su https://vercel.com/dashboard
2. Accedi al tuo account
3. Vai su **Settings** → **Domains**

#### **Passo 2: Gestisci DNS**
1. Trova `tradelia.org` nella lista
2. Clicca su **Manage** o **DNS**
3. Vercel potrebbe reindirizzarti al provider DNS originale (es. Cloudflare, Namecheap, etc.)
4. Segui le istruzioni del provider DNS effettivo

**⚠️ NOTA**: Vercel spesso non gestisce direttamente i DNS, ma li delega al provider originale. Controlla dove sono gestiti i DNS.

---

### **Opzione 3: Altri Provider DNS**

Se usi un altro provider (Namecheap, GoDaddy, Google Domains, etc.):

#### **Passaggi Generali:**
1. Accedi al tuo provider DNS
2. Vai alla sezione **DNS Management** o **Zone Records**
3. Aggiungi i record seguendo la stessa struttura:
   - **Tipo**: TXT o MX (come indicato)
   - **Nome/Host**: Il nome del record (es. `resend._domainkey`, `send`, `_dmarc`, `@`)
   - **Valore/Contenuto**: Il valore fornito
   - **TTL**: `3600` (1 ora) o `Auto`
   - **Priorità**: Solo per MX (10 per `send`, 9 per `@`)

---

## ✅ Verifica Record DNS

### **Dopo aver aggiunto i record, verifica che siano attivi:**

#### **Metodo 1: Tool Online**
1. Vai su https://dnschecker.org
2. Inserisci il nome del record (es. `resend._domainkey.tradelia.org`)
3. Seleziona tipo `TXT`
4. Clicca **Search**
5. Verifica che il record sia visibile

#### **Metodo 2: Command Line**
```bash
# Verifica DKIM
nslookup -type=TXT resend._domainkey.tradelia.org

# Verifica SPF
nslookup -type=TXT send.tradelia.org

# Verifica DMARC
nslookup -type=TXT _dmarc.tradelia.org

# Verifica MX
nslookup -type=MX send.tradelia.org
```

#### **Metodo 3: Resend Dashboard**
1. Vai su **Resend Dashboard** → **Domains** → **tradelia.org**
2. Resend verificherà automaticamente i record
3. Quando vedi ✅ **Verified**, il dominio è pronto

**⏱️ Tempo di propagazione**: 5 minuti - 48 ore (di solito 15-30 minuti)

---

## 📋 Checklist Completa

- [ ] **Record DKIM** (`resend._domainkey` TXT) aggiunto
- [ ] **Record SPF MX** (`send` MX) aggiunto
- [ ] **Record SPF TXT** (`send` TXT) aggiunto
- [ ] **Record DMARC** (`_dmarc` TXT) aggiunto (opzionale)
- [ ] **Record MX Receiving** (`@` MX) aggiunto (opzionale, solo se serve)
- [ ] **Verifica DNS** completata (tool online o command line)
- [ ] **Resend Dashboard** mostra dominio verificato ✅

---

## 🔍 Troubleshooting

### **Problema: Record non visibili dopo 1 ora**

**Soluzioni:**
1. Verifica di aver salvato correttamente i record nel provider DNS
2. Controlla che il nome del record sia corretto (senza `.tradelia.org` alla fine)
3. Attendi fino a 48 ore (propagazione DNS)
4. Usa tool online per verificare la propagazione globale

### **Problema: Resend dice "Missing required DKIM record"**

**Soluzioni:**
1. Verifica che il record `resend._domainkey` sia di tipo `TXT`
2. Verifica che il contenuto sia esattamente quello fornito (senza spazi extra)
3. Controlla che il nome sia `resend._domainkey` (non `resend._domainkey.tradelia.org`)

### **Problema: Resend dice "Missing required SPF records"**

**Soluzioni:**
1. Verifica che entrambi i record SPF siano presenti:
   - `send` MX record
   - `send` TXT record
2. Verifica che i valori siano corretti

---

## 🎯 Dopo la Verifica

Una volta che Resend verifica il dominio:

1. ✅ **Configura SMTP in Supabase** (vedi `SUPABASE-EMAIL-CONFIG.md`)
2. ✅ **Test email** da Supabase Dashboard
3. ✅ **Verifica che le email arrivino da `noreply@tradelia.org`**

---

## 📝 Note Importanti

- **Nome record**: In Cloudflare e molti provider, inserisci solo il nome (es. `resend._domainkey`), NON `resend._domainkey.tradelia.org`
- **TTL**: `Auto` o `3600` (1 ora) va bene
- **Propagazione**: I record DNS possono richiedere fino a 48 ore per propagarsi globalmente
- **Verifica**: Resend verifica automaticamente ogni pochi minuti, ma puoi forzare la verifica cliccando "Verify" nel dashboard

---

## 🔗 Link Utili

- [Resend Domain Verification Docs](https://resend.com/docs/dashboard/domains/introduction)
- [DNS Checker Tool](https://dnschecker.org)
- [Cloudflare DNS Docs](https://developers.cloudflare.com/dns/manage-dns-records/)

