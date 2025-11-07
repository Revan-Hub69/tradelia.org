# 💳 Setup Paddle - Gestione Fiscale Automatica

## 🎯 Perché Paddle?

**Paddle** è la scelta migliore per Tradelia AI perché gestisce **automaticamente la fiscalità**:

✅ **Gestione Fiscale Automatica**
- ✅ IVA/VAT automatica per tutti i paesi (140+ paesi)
- ✅ Fatturazione automatica conforme
- ✅ Reverse charge per B2B
- ✅ Gestione tax ID automatica
- ✅ Compliance fiscale completa (GDPR, PCI DSS)

✅ **UX Perfetta**
- ✅ Checkout moderno e veloce
- ✅ Supporto mobile ottimizzato
- ✅ Pagamenti one-click
- ✅ Gestione abbonamenti integrata
- ✅ Customer portal integrato

✅ **API Eccellenti**
- ✅ Documentazione completa
- ✅ Webhook affidabili
- ✅ SDK ufficiali
- ✅ Supporto eccellente

✅ **Flessibilità**
- ✅ Abbonamenti ricorrenti
- ✅ Pagamenti una tantum
- ✅ Trial period
- ✅ Coupon e sconti
- ✅ Gestione invoice automatica

---

## 🚀 Setup Passo-Passo

### **Passo 1: Crea Account Paddle**

1. Vai su https://paddle.com
2. Clicca su **Sign up**
3. Crea account (email, password)
4. Completa la verifica (email, telefono)

### **Passo 2: Completa Setup Business**

1. Vai su **Settings** → **Business details**
2. Inserisci informazioni business:
   - Nome business: **Tradelia AI**
   - Tipo business: **SaaS / Software**
   - Indirizzo
   - Codice fiscale/Partita IVA
   - Tax ID (se necessario)
3. Completa verifica identità (se richiesto)

### **Passo 3: Configura Tax Settings**

1. Vai su **Settings** → **Tax**
2. Abilita **Automatic tax calculation**
3. Seleziona paesi supportati (o tutti)
4. Configura reverse charge per B2B (se necessario)
5. Paddle gestirà automaticamente IVA/VAT per tutti i clienti

### **Passo 4: Ottieni API Keys**

1. Vai su **Developer Tools** → **Authentication**
2. Copia:
   - **Vendor ID** (es: `12345`)
   - **Vendor API Key** (es: `test_xxxxx`) → per backend (NON condividere!)
   - **Public Key** (es: `test_xxxxx`) → per frontend

⚠️ **IMPORTANTE**: 
- Usa **Sandbox mode** per sviluppo
- Usa **Live mode** per produzione

### **Passo 5: Configura Webhook**

1. Vai su **Developer Tools** → **Notifications**
2. Clicca su **Add notification**
3. Inserisci:
   - **URL**: `https://tuo-dominio.vercel.app/api/webhook-paddle`
   - **Description**: `Tradelia AI - Subscription webhook`
4. Seleziona eventi da ascoltare:
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.activated`
   - ✅ `subscription.cancelled`
   - ✅ `subscription.past_due`
   - ✅ `subscription.payment_failed`
   - ✅ `subscription.payment_succeeded`
   - ✅ `transaction.completed`
5. Clicca **Save**
6. Copia **Webhook Secret** (es: `whsec_...`) → per verificare webhook

### **Passo 6: Crea Product e Price**

1. Vai su **Catalog** → **Products** → **Add product**
2. Inserisci:
   - **Name**: `Tradelia AI - Abbonamento Mensile`
   - **Description**: `Accesso completo alla dashboard Tradelia AI`
   - **Pricing model**: **Recurring**
   - **Price**: `€X.XX` (o la tua valuta)
   - **Billing period**: **Monthly** (o Annual)
   - **Trial period**: Opzionale (es: 7 giorni)
3. Paddle calcolerà automaticamente IVA/VAT in base al paese del cliente
4. Clicca **Save product**
5. Copia **Product ID** (es: `pro_...`) → per integrazione frontend

---

## 🔧 Configurazione Variabili Ambiente

### **Vercel / Cloudflare Pages**

Aggiungi queste variabili ambiente:

| Key | Value | Note |
|-----|-------|------|
| `PADDLE_VENDOR_ID` | `12345` | Vendor ID da Paddle Dashboard |
| `PADDLE_VENDOR_API_KEY` | `test_xxxxx` o `live_xxxxx` | Vendor API Key (per backend) |
| `PADDLE_PUBLIC_KEY` | `test_xxxxx` o `live_xxxxx` | Public Key (per frontend) |
| `PADDLE_WEBHOOK_SECRET` | `whsec_...` | Webhook signing secret |

⚠️ **IMPORTANTE**: 
- Usa `test_...` per sviluppo
- Usa `live_...` per produzione
- Il webhook secret è diverso per sandbox e live mode

---

## 📝 Integrazione Frontend

### **1. Installa Paddle.js**

```html
<!-- Aggiungi nel <head> -->
<script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
```

### **2. Inizializza Paddle**

```javascript
// Inizializza Paddle
Paddle.Setup({
  vendor: process.env.PADDLE_VENDOR_ID,
  environment: 'sandbox' // o 'production'
});
```

### **3. Crea Checkout**

```javascript
// Esempio: Apri checkout Paddle
function openPaddleCheckout(productId) {
  Paddle.Checkout.open({
    product: productId,
    email: userEmail, // Email utente
    passthrough: JSON.stringify({
      userId: userId, // ID utente (opzionale)
    }),
    successCallback: function(data) {
      // Subscription creata con successo
      console.log('Subscription creata:', data);
      // Reindirizza a dashboard
      window.location.href = '/archivio/dashboard.html';
    },
    closeCallback: function() {
      // Checkout chiuso
      console.log('Checkout chiuso');
    }
  });
}
```

---

## 🔄 Migrazione da Lemon Squeezy

### **1. Sostituisci Webhook**

- **Vecchio**: `/api/webhook-lemonsqueezy.js`
- **Nuovo**: `/api/webhook-paddle.js`

### **2. Aggiorna Variabili Ambiente**

Rimuovi:
- `LEMONSQUEEZY_API_KEY`
- `LEMONSQUEEZY_STORE_ID`
- `LEMONSQUEEZY_WEBHOOK_SECRET`

Aggiungi:
- `PADDLE_VENDOR_ID`
- `PADDLE_VENDOR_API_KEY`
- `PADDLE_PUBLIC_KEY` (opzionale per frontend)
- `PADDLE_WEBHOOK_SECRET`

### **3. Aggiorna Frontend**

Sostituisci integrazione Lemon Squeezy con Paddle Checkout.

---

## ✅ Checklist Finale

### **Paddle Account**
- [ ] Account creato e verificato
- [ ] Business details completati
- [ ] Tax settings configurati (automatic tax calculation)
- [ ] API keys copiate (sandbox e live)
- [ ] Webhook configurato
- [ ] Product e Price creati

### **Variabili Ambiente**
- [ ] `PADDLE_VENDOR_ID` aggiunta (Vercel)
- [ ] `PADDLE_VENDOR_API_KEY` aggiunta (Vercel)
- [ ] `PADDLE_PUBLIC_KEY` aggiunta (Vercel - opzionale per frontend)
- [ ] `PADDLE_WEBHOOK_SECRET` aggiunta (Vercel)
- [ ] Stesse variabili aggiunte su Cloudflare Pages

### **Codice**
- [ ] `/api/webhook-paddle.js` creato
- [ ] Frontend aggiornato con Paddle Checkout
- [ ] Test webhook funzionante

---

## 🔍 Test Webhook

### **1. Test Locale con Paddle Sandbox**

1. Vai su Paddle Dashboard → **Developer Tools** → **Notifications**
2. Clicca sul tuo webhook
3. Clicca su **Send test notification**
4. Seleziona evento (es: `subscription.created`)
5. Verifica che arrivi correttamente

### **2. Test in Produzione**

1. Vai su Paddle Dashboard → **Developer Tools** → **Notifications**
2. Clicca sul tuo webhook (live mode)
3. Clicca su **Send test notification**
4. Seleziona evento
5. Verifica che arrivi correttamente

---

## 💰 Gestione Fiscale Automatica

### **Cosa Gestisce Paddle Automaticamente:**

✅ **IVA/VAT**
- Calcolo automatico in base al paese del cliente
- Gestione reverse charge per B2B
- Compliance con tutte le normative fiscali

✅ **Fatturazione**
- Fatture automatiche conformi
- Gestione tax ID
- Supporto multi-valuta

✅ **Compliance**
- GDPR compliant
- PCI DSS Level 1
- SOC 2 Type II

---

## 📚 Risorse

- **Paddle Docs**: https://developer.paddle.com
- **Paddle Checkout**: https://developer.paddle.com/concepts/checkout/overview
- **Paddle Subscriptions**: https://developer.paddle.com/concepts/subscriptions/overview
- **Paddle Webhooks**: https://developer.paddle.com/webhook-reference
- **Paddle Tax**: https://developer.paddle.com/concepts/tax/overview

---

## 🆚 Paddle vs Lemon Squeezy

| Feature | Paddle | Lemon Squeezy |
|---------|--------|---------------|
| Gestione IVA/VAT | ✅ Automatica | ✅ Automatica |
| Fatturazione | ✅ Automatica | ✅ Automatica |
| Compliance | ✅ Completa | ✅ Completa |
| UX | ✅ Eccellente | ✅ Buona |
| API | ✅ Eccellenti | ✅ Buone |
| Supporto | ✅ Eccellente | ✅ Buono |
| Prezzi | Trasparenti | Trasparenti |

**Conclusione**: Entrambi gestiscono la fiscalità automaticamente. Paddle ha API più mature e supporto migliore.

---

**Pronto per integrare Paddle! 🚀**

