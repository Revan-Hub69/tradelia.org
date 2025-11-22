# ⚠️ Limite Serverless Functions Vercel Hobby Plan

## 📊 Situazione

**Limite Vercel Hobby Plan:** 12 Serverless Functions  
**Funzioni Attuali:** 15 funzioni

**Problema:** Superato il limite di 3 funzioni

---

## 📋 Lista Funzioni Serverless Attuali

### Funzioni Essenziali (Non Rimovibili)

1. ✅ `activate-order.js` - Attiva ordini dopo pagamento
2. ✅ `create-order.js` - Crea ordini
3. ✅ `get-user-plan.js` - Ottiene piano utente
4. ✅ `save-billing-data.js` - Salva dati fatturazione
5. ✅ `validate-dashboard-token.js` - Valida token dashboard
6. ✅ `request-dashboard-token.js` - Richiede nuovo token
7. ✅ `request-analysis.js` - Richiede analisi
8. ✅ `send-email.js` - Invia email
9. ✅ `vote.js` - Sistema voti community
10. ✅ `admin.js` - Admin dashboard API
11. ✅ `webhook-role-sync.js` - Webhook sincronizzazione ruoli
12. ✅ `cancel-subscription.js` - Cancella abbonamenti

**Totale Essenziali:** 12 funzioni (limite esatto)

### Funzioni da Verificare/Rimuovere

13. ⚠️ `push.js` - Push notifications (verificare se usato)
14. ⚠️ `create-user-and-token.js` - Crea utente e token (verificare se usato)

---

## 🔍 Analisi Funzioni

### `push.js`

**Scopo:** Gestisce push notifications  
**Uso:** Verificare se ancora utilizzato

**Raccomandazione:**

- Se non usato → Rimuovere
- Se usato → Integrare in `send-email.js` o `admin.js`

### `create-user-and-token.js`

**Scopo:** Crea utente e token in un'unica chiamata  
**Uso:** Verificare se ancora utilizzato

**Raccomandazione:**

- Se non usato → Rimuovere
- Se usato → Integrare in `admin.js` o `request-dashboard-token.js`

---

## ✅ Soluzioni

### Opzione 1: Rimuovere Funzioni Non Usate (Raccomandato)

**Se `push.js` e `create-user-and-token.js` non sono usati:**

- Rimuovere entrambe
- **Risultato:** 12 funzioni (limite esatto)

### Opzione 2: Consolidare Funzioni

**Se `push.js` è usato:**

- Integrare in `send-email.js` (endpoint `/api/send-email?type=push`)

**Se `create-user-and-token.js` è usato:**

- Integrare in `admin.js` (endpoint `/api/admin?action=create-user-token`)

### Opzione 3: Upgrade Vercel Plan

**Vercel Pro Plan:**

- Limite: 100 Serverless Functions
- Costo: $20/mese

**Raccomandazione:** Solo se necessario, altrimenti rimuovere/consolidare

---

## 🎯 Azioni Immediate

1. **Verificare uso `push.js`:**
   - Cercare riferimenti nel codebase
   - Se non usato → Rimuovere

2. **Verificare uso `create-user-and-token.js`:**
   - Cercare riferimenti nel codebase
   - Se non usato → Rimuovere

3. **Se entrambe non usate:**
   - Rimuovere → 12 funzioni (limite esatto)

4. **Se usate:**
   - Consolidare in altre funzioni esistenti

---

## 📝 Checklist

- [ ] Verificare uso `push.js`
- [ ] Verificare uso `create-user-and-token.js`
- [ ] Rimuovere funzioni non usate
- [ ] Consolidare funzioni se necessario
- [ ] Testare deploy su Vercel
- [ ] Verificare che tutte le funzioni funzionino
