# Sistema Pagamenti Xolo Go - Termini e Condizioni

**Data**: 2025-01-XX  
**Versione**: 1.0.0  
**Payment Provider**: Xolo Go (non Stripe)

---

## 🎯 Modus Operandi

### **1. Consulente (Desk/Institutional)**
- **Pagamento**: Entro 14 giorni dalla fatturazione
- **Metodo**: Fatturazione manuale via Xolo
- **Termini**: Net 14 (pagamento entro 14 giorni)
- **Contratto**: Annuale o mensile (da definire)

### **2. Contratto Pro (Individual)**
- **Trial Period**: 14 giorni prova gratuita (solo prima volta)
- **Rimborso**: 14 giorni rimborso completo se non soddisfatto
- **Disdetta**: Gratuita in qualsiasi momento
- **Metodo**: Pagamento anticipato via Xolo

---

## 📋 Best Practice Accademiche per Trial Period

### **Standard Industry (SaaS)**

1. **14-Day Free Trial** (Standard)
   - ✅ Pratica comune per SaaS
   - ✅ Tempo sufficiente per valutare prodotto
   - ✅ Non troppo lungo da essere abusato

2. **Money-Back Guarantee** (Alternativa)
   - ✅ 14 giorni rimborso completo
   - ✅ Più trasparente per utente
   - ✅ Maggiore fiducia

3. **Raccomandazione**: **Offrire entrambe le opzioni**
   - Trial gratuito per nuovi utenti (prima volta)
   - Money-back guarantee per chi paga subito

---

## 🔐 Termini e Condizioni - Best Practice

### **1. Trial Period (14 giorni)**

**Condizioni:**
- ✅ Disponibile solo per nuovi utenti (prima volta)
- ✅ Nessun pagamento richiesto durante trial
- ✅ Accesso completo a tutte le funzionalità Pro
- ✅ Auto-conversione a pagamento dopo 14 giorni
- ✅ Disdetta gratuita durante trial (nessun addebito)

**Compliance:**
- ✅ GDPR: Consenso esplicito per trial
- ✅ MiFID: Trasparenza condizioni
- ✅ Consumer Protection: Diritto di recesso

### **2. Money-Back Guarantee (14 giorni)**

**Condizioni:**
- ✅ Rimborso completo entro 14 giorni dal pagamento
- ✅ Nessuna domanda richiesta
- ✅ Rimborso automatico via Xolo
- ✅ Disdetta gratuita in qualsiasi momento

**Compliance:**
- ✅ Consumer Rights Directive (UE)
- ✅ Diritto di recesso 14 giorni (B2C)
- ✅ Trasparenza condizioni rimborso

### **3. Consulente (Desk/Institutional)**

**Condizioni:**
- ✅ Pagamento Net 14 (entro 14 giorni fattura)
- ✅ Fatturazione manuale via Xolo
- ✅ Contratto annuale o mensile
- ✅ Disdetta con preavviso 30 giorni

**Compliance:**
- ✅ B2B (Business-to-Business)
- ✅ Termini contrattuali chiari
- ✅ Fatturazione conforme normativa fiscale

---

## 💳 Flusso Pagamento Xolo Go

### **Pro (Individual) - Trial First**

```
1. Utente si registra → Account Pro
2. Trial 14 giorni (gratuito)
3. Dopo 14 giorni:
   - Se non disdice → Auto-conversione a pagamento
   - Se disdice → Account torna a Trial/Guest
4. Pagamento via Xolo Go
5. Money-back guarantee 14 giorni
```

### **Pro (Individual) - Pay First**

```
1. Utente si registra → Account Pro
2. Pagamento immediato via Xolo Go
3. Money-back guarantee 14 giorni
4. Se richiede rimborso → Rimborso completo
5. Disdetta gratuita sempre
```

### **Consulente (Desk/Institutional)**

```
1. Admin crea account Desk
2. Fatturazione manuale via Xolo
3. Fattura inviata (Net 14)
4. Pagamento entro 14 giorni
5. Disdetta con preavviso 30 giorni
```

---

## 📝 Termini Legali da Implementare

### **1. Terms of Service**
- Definire trial period
- Condizioni disdetta
- Limiti responsabilità
- Proprietà intellettuale

### **2. Refund Policy**
- 14 giorni money-back guarantee
- Processo rimborso
- Tempi rimborso
- Eccezioni (se presenti)

### **3. Privacy Policy**
- Già presente ✅
- Aggiornare per trial period
- Consenso esplicito

### **4. Subscription Terms**
- Durata abbonamento
- Rinnovo automatico
- Prezzi e modifiche
- Disdetta

---

## 🔧 Implementazione Tecnica

### **Database Schema**

```sql
-- Subscription con trial period
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  plan_type TEXT NOT NULL, -- 'pro', 'desk'
  status TEXT NOT NULL, -- 'trial', 'active', 'cancelled', 'expired'
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  payment_method TEXT, -- 'xolo_manual', 'xolo_go'
  xolo_invoice_id TEXT,
  metadata JSONB
);

-- Orders per tracking pagamenti
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  order_type TEXT NOT NULL,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  status TEXT, -- 'pending', 'paid', 'refunded', 'cancelled'
  payment_method TEXT,
  xolo_invoice_id TEXT,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **API Endpoints Necessari**

1. **POST /api/billing?action=start-trial**
   - Avvia trial 14 giorni
   - Verifica se utente ha già usato trial

2. **POST /api/billing?action=convert-trial**
   - Converte trial in pagamento
   - Crea ordine Xolo

3. **POST /api/billing?action=request-refund**
   - Richiede rimborso (14 giorni)
   - Verifica eligibilità
   - Crea refund via Xolo

4. **POST /api/billing?action=cancel-subscription**
   - Disdette abbonamento
   - Nessun addebito futuro

---

## 📊 Best Practice Implementazione

### **1. Trial Period Logic**

```javascript
// Verifica se utente può usare trial
async function canUseTrial(userId) {
  // Controlla se ha già usato trial
  const { data } = await supabase
    .from('subscriptions')
    .select('trial_started_at')
    .eq('user_id', userId)
    .eq('plan_type', 'pro')
    .not('trial_started_at', 'is', null)
    .limit(1);
  
  return data.length === 0; // True se non ha mai usato trial
}

// Avvia trial
async function startTrial(userId) {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);
  
  await supabase.from('subscriptions').insert({
    user_id: userId,
    plan_type: 'pro',
    status: 'trial',
    trial_started_at: new Date().toISOString(),
    trial_ends_at: trialEndsAt.toISOString(),
  });
}
```

### **2. Auto-Conversion Logic**

```javascript
// Verifica trial scaduti e converte
async function checkExpiredTrials() {
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'trial')
    .lte('trial_ends_at', new Date().toISOString());
  
  for (const subscription of data) {
    // Se non disdetto, converte a pagamento
    await convertTrialToPayment(subscription);
  }
}
```

### **3. Refund Logic**

```javascript
// Verifica eligibilità rimborso
async function canRefund(orderId) {
  const { data: order } = await supabase
    .from('orders')
    .select('created_at, status')
    .eq('id', orderId)
    .single();
  
  if (!order || order.status !== 'paid') {
    return false;
  }
  
  const daysSincePayment = (Date.now() - new Date(order.created_at)) / (1000 * 60 * 60 * 24);
  return daysSincePayment <= 14; // Entro 14 giorni
}
```

---

## ✅ Checklist Implementazione

- [ ] Database schema per subscriptions/orders
- [ ] API endpoint start-trial
- [ ] API endpoint convert-trial
- [ ] API endpoint request-refund
- [ ] Logica auto-conversion trial
- [ ] Frontend: UI trial period
- [ ] Frontend: UI refund request
- [ ] Terms of Service aggiornati
- [ ] Refund Policy aggiornata
- [ ] Privacy Policy aggiornata
- [ ] Email notifications (trial ending, conversion, refund)

---

## 📚 Riferimenti Legali

1. **Consumer Rights Directive (UE)**
   - Diritto di recesso 14 giorni
   - Rimborso completo

2. **GDPR**
   - Consenso esplicito trial
   - Trasparenza condizioni

3. **MiFID II**
   - Trasparenza costi
   - Condizioni chiare

4. **Best Practice SaaS**
   - 14-day trial standard
   - Money-back guarantee
   - Disdetta gratuita
