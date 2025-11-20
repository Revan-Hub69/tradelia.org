# 🔍 Analisi Completa: Ruoli, Abbonamenti e Integrazione Supabase

## 📊 Stato Attuale

### ✅ **RUOLI - Definiti e Funzionanti**

**Database Schema:**
- ✅ Tabella `user_roles` con constraint CHECK: `role in ('trial','pro','institutional')`
- ✅ Tabella `admin_users` per utenti admin
- ✅ Admin ha sempre ruolo `institutional` (hardcoded nel codice)
- ✅ RLS (Row Level Security) configurato correttamente

**Problemi Minori:**
- ⚠️ Admin non ha record in `user_roles` (usa solo `admin_users`)
- ⚠️ Se admin non è in `admin_users`, non viene riconosciuto come admin

---

### ⚠️ **SCADENZE - Parzialmente Implementate**

**Database:**
- ✅ Campo `valid_until` esiste in `user_roles` (migration-add-expiration.sql)
- ✅ Funzione `is_plan_valid(user_uuid)` esiste
- ✅ Indice su `valid_until` per query efficienti

**Frontend:**
- ✅ Verifica scadenza in `fetchUserRole()`
- ✅ Polling ogni 5 minuti per verificare scadenza
- ⚠️ **PROBLEMA**: Se `valid_until` è NULL, il piano è considerato permanente, ma la logica potrebbe non gestire correttamente tutti i casi

**Problemi:**
- ⚠️ Admin ha `valid_until = null` (permanente), ma se admin non è riconosciuto, potrebbe avere problemi
- ⚠️ Verifica scadenza potrebbe non essere atomica (race conditions)

---

### ❌ **UPGRADE - NON Implementati**

**Stato Attuale:**
- ❌ Solo link a `/pricing.html` (nessuna logica)
- ❌ Nessuna gestione cambio piano (trial → pro → institutional)
- ❌ Nessuna sincronizzazione con gateway pagamento
- ❌ Nessuna gestione periodo di transizione

**Cosa Manca:**
1. Funzione per cambiare ruolo utente
2. Gestione upgrade con webhook pagamento
3. Logica per mantenere crediti durante upgrade
4. Gestione downgrade (se necessario)

---

### ❌ **CANCELLAZIONE ABBONAMENTO - NON Implementata**

**Stato Attuale:**
- ❌ Funzione `handleCancelSubscription()` è solo un TODO
- ❌ Nessuna chiamata API al gateway pagamento
- ❌ Nessuna sincronizzazione con Supabase
- ❌ Nessuna gestione periodo di grazia

**Cosa Manca:**
1. Integrazione con Paddle/LemonSqueezy/Stripe per cancellazione
2. Aggiornamento `user_roles.valid_until` alla scadenza corrente
3. Notifica utente
4. Gestione rimborsi (se applicabile)

---

### ⚠️ **COLLEGAMENTI SUPABASE - Parziali**

**Webhook Implementati:**
- ✅ `webhook-paddle.js` - Gestisce eventi Paddle
- ✅ `webhook-lemonsqueezy.js` - Gestisce eventi LemonSqueezy
- ✅ `webhook-stripe.js` - Gestisce eventi Stripe
- ✅ `webhook-role-sync.js` - Funzione helper per sincronizzare ruoli

**Problemi Critici:**

1. **syncUserRoleFromSubscription() ha problemi:**
   ```javascript
   // USA admin.listUsers() che richiede SERVICE_ROLE_KEY
   // Ma alcuni webhook usano ANON_KEY
   const { data: authUsers } = await supabase.auth.admin.listUsers();
   ```
   - ⚠️ Richiede `SUPABASE_SERVICE_ROLE_KEY` (non sempre disponibile)
   - ⚠️ Non gestisce upgrade (cambio piano)
   - ⚠️ Non gestisce downgrade

2. **Mancanza sincronizzazione bidirezionale:**
   - ❌ Se ruolo cambia manualmente in DB, non si sincronizza con gateway
   - ❌ Se gateway cambia piano, potrebbe non aggiornare correttamente

3. **Gestione planType:**
   - ⚠️ `planMetadata` viene estratto da variant_id/product_id, ma mapping non è chiaro
   - ⚠️ Default a 'pro' se non specificato (potrebbe essere sbagliato)

4. **Tabella subscribers:**
   - ⚠️ Esiste ma non è chiaramente collegata a `user_roles`
   - ⚠️ `auth_user_id` può essere NULL se utente non ha ancora fatto login

---

## 🚨 **PROBLEMI CRITICI DA RISOLVERE**

### 1. **Gestione Ruoli e Admin**
- ⚠️ Admin check potrebbe fallire se `admin_users` non è popolato
- ⚠️ Admin non ha record in `user_roles`, ma codice assume `role === 'institutional'`

### 2. **Sincronizzazione Ruoli**
- ❌ `syncUserRoleFromSubscription()` usa `admin.listUsers()` che richiede SERVICE_ROLE_KEY
- ❌ Non tutti i webhook hanno accesso a SERVICE_ROLE_KEY
- ❌ Mapping planType → role non è robusto

### 3. **Upgrade/Downgrade**
- ❌ Completamente mancante
- ❌ Nessuna logica per cambio piano
- ❌ Nessuna gestione crediti durante upgrade

### 4. **Cancellazione**
- ❌ Completamente mancante
- ❌ Nessuna integrazione con gateway
- ❌ Nessuna gestione periodo di grazia

### 5. **Verifica Scadenza**
- ⚠️ Potrebbe avere race conditions
- ⚠️ Polling ogni 5 minuti potrebbe non essere sufficiente
- ⚠️ Verifica scadenza durante sessione potrebbe non aggiornare UI correttamente

---

## 📋 **RACCOMANDAZIONI**

### Priorità ALTA:
1. ✅ Fix logica admin (verificare sempre `admin_users` prima di `user_roles`)
2. ✅ Fix `syncUserRoleFromSubscription()` per usare SERVICE_ROLE_KEY correttamente
3. ✅ Implementare upgrade (trial → pro → institutional)
4. ✅ Implementare cancellazione abbonamento

### Priorità MEDIA:
5. ⚠️ Migliorare mapping planType → role nei webhook
6. ⚠️ Aggiungere sincronizzazione bidirezionale
7. ⚠️ Gestire edge cases (utente senza email, utente non ancora registrato)

### Priorità BASSA:
8. 📝 Documentare flusso completo
9. 📝 Aggiungere test per webhook
10. 📝 Monitoraggio e alerting

---

## 🔧 **AZIONI IMMEDIATE**

1. **Verificare che tutti i webhook usino SERVICE_ROLE_KEY** ✅ FATTO
2. **Implementare upgrade con chiamata API gateway** ⚠️ PARZIALE (solo link a pricing)
3. **Implementare cancellazione con chiamata API gateway** ⚠️ PARZIALE (aggiorna valid_until, ma non chiama gateway)
4. **Aggiungere logging dettagliato per debug** ✅ FATTO
5. **Testare tutti i flussi end-to-end** ⏳ DA FARE

---

## ✅ **CORREZIONI IMPLEMENTATE**

### 1. **Mapping Plan Identifier → Role**
- ✅ Aggiunta funzione `mapPlanToRole()` in `webhook-role-sync.js`
- ✅ Supporta mapping esplicito e inferenza da nome
- ✅ Logging migliorato per debug

### 2. **Sincronizzazione Ruoli**
- ✅ `syncUserRoleFromSubscription()` ora usa `planIdentifier` invece di `planMetadata`
- ✅ Gestione errori migliorata
- ✅ Creazione automatica credits per institutional

### 3. **Cancellazione Abbonamento**
- ✅ `handleCancelSubscription()` ora aggiorna `valid_until` in Supabase
- ✅ Gestisce piani manuali (senza subscription_id)
- ⚠️ **MANCA**: Chiamata API gateway per cancellazione effettiva

### 4. **Admin Check**
- ✅ Logging migliorato
- ✅ Verifica ruolo admin più robusta

### 5. **Webhook**
- ✅ Paddle e LemonSqueezy ora estraggono `planIdentifier` correttamente
- ✅ Logging migliorato per debug

---

## ⚠️ **PROBLEMI RIMANENTI**

### 1. **Upgrade - NON Implementato**
**Stato:** Solo link a `/pricing.html`
**Cosa serve:**
- API endpoint per upgrade (es. `/api/upgrade-subscription`)
- Chiamata gateway per cambio piano
- Aggiornamento `user_roles` con nuovo ruolo
- Gestione periodo di transizione

### 2. **Cancellazione - Parzialmente Implementata**
**Stato:** Aggiorna `valid_until` ma non chiama gateway
**Cosa serve:**
- API endpoint per cancellazione (es. `/api/cancel-subscription`)
- Chiamata gateway (Paddle/LemonSqueezy/Stripe) per cancellazione
- Gestione periodo di grazia

### 3. **Mapping Plan Identifier**
**Stato:** Mapping base implementato
**Cosa serve:**
- Configurare mapping esatto per i tuoi piani Paddle/LemonSqueezy
- Spostare mapping in variabili d'ambiente o configurazione
- Testare con ID reali dei piani

### 4. **Verifica Scadenza**
**Stato:** Funziona ma potrebbe avere race conditions
**Cosa serve:**
- Verifica atomica (usare transazioni o funzioni DB)
- Gestione edge cases (scadenza durante operazione)

---

## 📝 **CHECKLIST COMPLETA**

### Ruoli
- [x] Ruoli definiti nel DB (trial, pro, institutional)
- [x] Admin check funzionante
- [x] Mapping plan identifier → role
- [x] Sincronizzazione webhook → user_roles

### Scadenze
- [x] Campo valid_until nel DB
- [x] Verifica scadenza in frontend
- [x] Polling scadenza
- [ ] Verifica atomica (transazioni)

### Upgrade
- [ ] API endpoint upgrade
- [ ] Chiamata gateway
- [ ] Aggiornamento user_roles
- [ ] Gestione crediti durante upgrade

### Cancellazione
- [x] UI per cancellazione
- [x] Aggiornamento valid_until
- [ ] Chiamata API gateway
- [ ] Gestione periodo di grazia

### Collegamenti Supabase
- [x] Webhook Paddle
- [x] Webhook LemonSqueezy
- [x] Webhook Stripe
- [x] syncUserRoleFromSubscription
- [ ] Sincronizzazione bidirezionale

