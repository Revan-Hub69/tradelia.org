# 🔧 Fix CSP e Creazione Utenti

## ✅ Problemi Risolti

### 1. **Content Security Policy (CSP) Error** (RISOLTO)

**Problema**:
```
Executing inline script violates the following Content Security Policy directive 
'script-src 'self' https://cdn.tailwindcss.com https://unpkg.com'
```

**Causa**:
- Lo script JavaScript era inline nell'HTML (`<script type="module">...</script>`)
- La CSP del server blocca script inline per sicurezza

**Soluzione**:
- ✅ Spostato tutto lo script inline in file esterno `report/admin/dashboard.js`
- ✅ HTML ora usa: `<script type="module" src="./dashboard.js"></script>`
- ✅ Nessuno script inline rimane nell'HTML

**File Modificati**:
- `report/admin/dashboard.html` - Rimosso script inline, aggiunto riferimento esterno
- `report/admin/dashboard.js` - Creato nuovo file con tutto il codice JavaScript

---

### 2. **Errore Creazione Utente: `updated_at` non trovato** (RISOLTO)

**Problema**:
```
Error creating user role: Could not find the 'updated_at' column of 'user_roles' 
in the schema cache
```

**Causa**:
- L'API `create-user-and-token.js` cercava di inserire `updated_at` in `user_roles`
- La colonna `updated_at` è stata rimossa dalla tabella `user_roles` (commit c5ce188)
- L'API non era stata aggiornata

**Soluzione**:
- ✅ Rimosso `updated_at` dall'upsert di `user_roles` (linea 129)
- ✅ L'API ora usa solo colonne base: `email`, `role`, `valid_until`

**File Modificati**:
- `api/create-user-and-token.js` - Rimosso `updated_at` da `user_roles`

**Nota**: Le colonne `updated_at` in `user_analysis_credits` e `user_profiles` sono state lasciate perché potrebbero ancora esistere in quelle tabelle. Se causano errori, rimuoverle anche lì.

---

## 📋 Flusso Creazione Utente e Token

### **Come Funziona**:

Quando clicchi "➕ Aggiungi Utente" nella dashboard admin:

1. **Form Compilazione**:
   - Email (obbligatorio)
   - Nome (opzionale)
   - Ruolo: Trial / Pro / Desk (obbligatorio)
   - Scadenza: data (obbligatorio)
   - Crediti iniziali: solo per Desk (opzionale)

2. **Chiamata API** (`/api/create-user-and-token`):
   - ✅ Valida i dati (email, ruolo, scadenza)
   - ✅ Genera token univoco (32 bytes hex)
   - ✅ Calcola hash SHA-256 del token
   - ✅ Crea/aggiorna record in `user_roles`:
     ```sql
     INSERT INTO user_roles (email, role, valid_until)
     VALUES (email, role, valid_until)
     ON CONFLICT (email) DO UPDATE ...
     ```
   - ✅ Crea record in `dashboard_access_tokens`:
     ```sql
     INSERT INTO dashboard_access_tokens (
       email, token_hash, plan_role, valid_from, valid_until, source
     )
     ```
   - ✅ Revoca vecchi token per la stessa email
   - ✅ Se ruolo = `institutional` e credits > 0:
     - Cerca `user_id` da `subscribers`
     - Crea/aggiorna `user_analysis_credits`
   - ✅ Se `displayName` fornito:
     - Cerca `user_id` da `subscribers`
     - Crea/aggiorna `user_profiles`

3. **Invio Email** (se `sendEmail = true`):
   - ✅ Usa Brevo API per inviare email
   - ✅ Email contiene:
     - Piano (Trial/Pro/Desk)
     - Scadenza
     - **Token di accesso** (in formato monospace)
     - Link a `/accesso.html`
   - ⚠️ Se `BREVO_API_KEY` non configurato:
     - Email non viene inviata
     - Token viene restituito nella risposta API

4. **Risposta API**:
   ```json
   {
     "ok": true,
     "token": "abc123...",  // Solo se sendEmail=false
     "email": "user@example.com",
     "role": "pro",
     "validUntil": "2025-12-31T23:59:59Z"
   }
   ```

5. **Utente Finale**:
   - Riceve email con token
   - Va su `/accesso.html`
   - Inserisce token
   - Accede alla dashboard

---

## 🔍 Verifica Funzionamento

### **Test CSP**:
1. Apri `/report/admin/dashboard.html`
2. Apri Console Browser (F12)
3. Non dovresti vedere errori CSP
4. La dashboard dovrebbe caricare normalmente

### **Test Creazione Utente**:
1. Apri `/user/admin.html` con token admin
2. Click "➕ Aggiungi Utente"
3. Compila form:
   - Email: `test@example.com`
   - Ruolo: `pro`
   - Scadenza: data futura (es. 2025-12-31)
4. Click "Crea Utente"
5. ✅ Dovresti vedere: "Utente creato con successo!"
6. ✅ Token inviato via email (se BREVO_API_KEY configurato)
7. ✅ Utente appare nella tabella

---

## ⚠️ Note Importanti

### **Variabili Ambiente Richieste**:
- `SUPABASE_URL` - URL progetto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (non anon key!)
- `BREVO_API_KEY` - Opzionale, per invio email

### **Se Email Non Viene Inviata**:
- Verifica `BREVO_API_KEY` in Vercel
- Se mancante, il token viene restituito nella risposta API
- **IMPORTANTE**: Salva il token, non verrà mostrato di nuovo!

### **Schema Database**:
- `user_roles`: `email` (PK), `role`, `valid_until` (NO `updated_at`)
- `dashboard_access_tokens`: `token_hash`, `email`, `plan_role`, `valid_until`
- `user_analysis_credits`: `user_id` (PK), `credits_balance` (potrebbe avere `updated_at`)
- `user_profiles`: `user_id` (PK), `display_name` (potrebbe avere `updated_at`)

---

**Data Fix**: 2025-01-XX
**Status**: ✅ Problemi Risolti

