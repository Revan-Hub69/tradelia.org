# Piano Implementazione Flusso Iscrizione/Accesso Completo

## Stato Attuale

- ✅ Sistema token funzionante
- ✅ Validazione token in `api/auth.js`
- ❌ Manca registrazione email/password
- ❌ Manca login email/password
- ❌ Manca integrazione token ↔ email/password

## Implementazione

### 1. Frontend (`accesso.html`)

- [ ] Aggiungere tab switcher: "Codice di accesso" | "Email/Password"
- [ ] Form registrazione: email, password, conferma password
- [ ] Form login: email, password
- [ ] Link "Password dimenticata"
- [ ] Messaggi di errore/successo

### 2. API (`api/auth.js`)

- [ ] Endpoint `signup`: crea utente Supabase Auth + genera token automatico
- [ ] Endpoint `login`: login Supabase Auth + genera token se non esiste
- [ ] Endpoint `reset-password`: reset password via Supabase Auth
- [ ] Integrazione: dopo signup/login, genera token e invia email

### 3. Integrazione

- [ ] Dopo signup: conferma email → genera token → invia email
- [ ] Dopo login: verifica token esistente → genera se mancante
- [ ] Unificare flusso: token o email/password portano allo stesso step 2

### 4. UX

- [ ] Messaggi chiari per ogni step
- [ ] Loading states
- [ ] Error handling robusto
- [ ] Redirect dopo successo

## Note

- Usare Supabase Auth per email/password
- Token generato automaticamente dopo signup/login
- Mantenere compatibilità con sistema token esistente
