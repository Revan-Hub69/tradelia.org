# Architettura Ruoli - Tradelia Dashboard

## 📋 Panoramica

Questo documento descrive la gerarchia e logica dei ruoli utente nel sistema Tradelia.

## 🎯 Gerarchia Ruoli

### Ruoli Disponibili

```
guest → pro → desk → admin
```

**NOTA IMPORTANTE**: Non esiste "authenticated" come ruolo/piano. È solo uno stato.

### Definizione Ruoli

1. **guest** (Default)
   - Nessun token o token senza piano attivo
   - Accesso limitato: solo visualizzazione contenuti web
   - Non può: scaricare PDF, richiedere analisi, votare

2. **pro**
   - Token valido + `user_plans.plan_type = 'pro'`
   - Piano Pro attivo (19€/mese)
   - Può: scaricare PDF (10€), richiedere analisi (1 inclusa + 3 extra a 29€), votare

3. **desk**
   - Token valido + `user_plans.plan_type = 'desk'`
   - Piano Desk attivo (institutional)
   - Può: scaricare PDF (incluso), richiedere analisi (2 incluse + extra a 49€), votare, proporre asset

4. **admin**
   - Token valido + (`plan_role` in admin_roles O email in `admin_emails` O user_id in `admin_users`)
   - Accesso completo + pannello admin
   - Può: tutto + gestione sistema

## 🔍 Logica Determinazione Ruolo

### Flusso API (`get-user-plan.js`)

```javascript
1. Valida token → ottiene userId, email, isAdmin
2. Se !userId → return { type: 'guest' }
3. Cerca piano attivo in user_plans (priorità: desk > pro)
4. Se piano trovato → return { type: plan_type } // 'pro' o 'desk'
5. Se nessun piano → return { type: 'guest' } // NON 'authenticated'
```

### Flusso Frontend (`auth.js`)

```javascript
1. Verifica token in localStorage
2. Se !token → return { role: 'guest' }
3. Chiama API get-user-plan.js
4. Usa direttamente plan.type come role
5. Aggiunge isAdmin se presente
```

## ⚠️ Problemi Corretti

### Prima (SBAGLIATO)

- `get-user-plan.js` restituiva `type: 'authenticated'` quando non c'era piano
- `auth.js` mappava `authenticated` come ruolo
- Confusione tra stato (autenticato) e piano (pro/desk)

### Dopo (CORRETTO)

- `get-user-plan.js` restituisce sempre `type: 'guest'|'pro'|'desk'`
- `auth.js` usa direttamente `plan.type` come `role`
- Separazione chiara: stato autenticazione ≠ piano utente

## 📊 Tabella Ruoli vs Permessi

| Funzionalità            | guest | pro      | desk         | admin |
| ----------------------- | ----- | -------- | ------------ | ----- |
| Visualizza Report (web) | ✅    | ✅       | ✅           | ✅    |
| Scarica PDF             | ❌    | ✅ (10€) | ✅ (incluso) | ✅    |
| Richiedi Analisi        | ❌    | ✅ (1+3) | ✅ (2+∞)     | ✅    |
| Votare Community        | ❌    | ✅       | ✅           | ✅    |
| Proporre Asset          | ❌    | ❌       | ✅           | ✅    |
| Notifiche Push          | ❌    | ✅       | ✅           | ✅    |
| Pannello Admin          | ❌    | ❌       | ❌           | ✅    |

## 🔐 Verifica Admin

L'utente è admin se:

1. `plan_role` in `['admin', 'internal', 'staff', 'team', 'founder']` (da token)
2. OPPURE `email` in tabella `admin_emails`
3. OPPURE `user_id` in tabella `admin_users`

## 📝 Best Practice

1. **Non usare "authenticated" come ruolo**
   - Usa sempre: `guest`, `pro`, `desk`, `admin`
   - "Authenticated" è solo uno stato (ha token valido)

2. **Verifica ruoli con `getUserRole()`**

   ```javascript
   const role = await getUserRole();
   if (role.role === 'pro') { ... }
   ```

3. **Verifica permessi con `canAccessFeature()`**

   ```javascript
   if (canAccessFeature('pdf', role, planData)) { ... }
   ```

4. **Verifica admin con `isAdmin()`**
   ```javascript
   if (isAdmin(role)) { ... }
   ```

## 🔄 Migrazione da "authenticated"

Se trovi codice che usa `role === 'authenticated'`:

```javascript
// PRIMA (SBAGLIATO)
if (role.role === "authenticated" || role.role === "pro") {
  // ...
}

// DOPO (CORRETTO)
if (role.role === "pro") {
  // ...
}
```

## 📚 Riferimenti

- `api/get-user-plan.js` - Determina piano utente
- `assets/js/dashboard/auth.js` - Gestione ruoli frontend
- `assets/js/dashboard/permissions.js` - Permessi per ruolo
- `api/_lib/adminAuth.js` - Verifica admin
