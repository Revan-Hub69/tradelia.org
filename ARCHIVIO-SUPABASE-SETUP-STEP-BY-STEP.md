# Supabase Setup - Guida Step by Step

## 📋 STEP 1: Creare Account Supabase

### Cosa fare:

1. **Apri il browser** e vai su: https://supabase.com

2. **Clicca su "Start your project"** (in alto a destra) oppure **"Sign In"**

3. **Scegli come registrarti:**
   - Puoi usare **GitHub** (consigliato, più veloce)
   - Oppure **Email** (crea account con email/password)

4. **Se usi GitHub:**
   - Clicca "Continue with GitHub"
   - Autorizza Supabase ad accedere al tuo GitHub
   - Fatto! ✅

5. **Se usi Email:**
   - Inserisci email e password
   - Clicca "Sign Up"
   - Verifica email (controlla la posta)
   - Clicca sul link nella email
   - Fatto! ✅

### ✅ Verifica:
- Hai un account Supabase?
- Sei loggato nel dashboard?

---

---

## 📋 STEP 2: Creare un Nuovo Progetto

### Cosa fare:

1. **Nel dashboard Supabase**, dovresti vedere:
   - Un pulsante **"New Project"** (in alto a destra)
   - Oppure **"Create a new project"** (se è il primo progetto)

2. **Clicca su "New Project"** o **"Create a new project"**

3. **Compila il form:**

   **a) Organization:**
   - Se è il primo progetto, crea una nuova organization
   - Nome: `Tradelia` (o quello che preferisci)
   - Clicca "Create new organization"

   **b) Project Name:**
   - Nome: `tradelia-archivio` (o `tradelia-dashboard`)
   - Questo è solo un nome interno, puoi cambiarlo dopo

   **c) Database Password:**
   - ⚠️ **IMPORTANTE**: Crea una password forte (almeno 12 caratteri)
   - **SALVA QUESTA PASSWORD** in un posto sicuro!
   - Ti servirà per accedere al database direttamente
   - Esempio: `Tradelia2025!Secure`

   **d) Region:**
   - Scegli la regione più vicina a te
   - Per l'Italia: `West EU (Ireland)` o `Central EU (Frankfurt)`
   - La regione influisce sulla velocità

   **e) Pricing Plan:**
   - Scegli **"Free"** (per iniziare)
   - Include: 500MB database, 2GB bandwidth (perfetto per 30-40 utenti)

4. **Clicca su "Create new project"**

5. **Attendi il setup** (circa 2-3 minuti):
   - Vedrai un messaggio "Setting up your project..."
   - Non chiudere la pagina!
   - Il progetto viene creato automaticamente

6. **Quando è pronto:**
   - Vedrai il dashboard del progetto
   - Dovresti vedere: "Project is ready!"

### ✅ Verifica:
- Hai creato il progetto?
- Vedi il dashboard del progetto?
- Il progetto è "ready" (non più in setup)?

---

---

## ✅ STEP 3: Trovare le Credenziali (COMPLETATO)

### Credenziali trovate:
- ✅ **URL**: `https://higkhlfjfhlecbtfnznx.supabase.co`
- ✅ **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### ✅ File aggiornato:
- `/archivio/assets/js/supabase-config.js` - Configurato con le tue credenziali

---

## 📋 STEP 4: Creare le Tabelle nel Database

### Cosa fare:

1. **Nel dashboard Supabase**, vai nella sezione **"SQL Editor"**:
   - Menu laterale sinistro
   - Clicca su **"SQL Editor"** (icona con simbolo `</>`)

2. **Clicca su "New query"** (in alto a destra)

3. **Apri il file SQL** che ho preparato:
   - File: `/archivio/setup-supabase.sql`
   - Copia tutto il contenuto del file

4. **Incolla il codice SQL** nell'editor SQL di Supabase

5. **Clicca su "Run"** (in basso a destra) oppure premi `Ctrl+Enter` (Windows) o `Cmd+Enter` (Mac)

6. **Attendi l'esecuzione** (pochi secondi):
   - Vedrai un messaggio di successo
   - Dovresti vedere: "Success. No rows returned"

7. **Verifica che le tabelle siano state create:**
   - Vai su **"Table Editor"** nel menu laterale
   - Dovresti vedere 2 tabelle:
     - ✅ `subscribers` (abbonati)
     - ✅ `push_subscriptions` (subscriptions push)

### ✅ Verifica:
- Hai eseguito lo script SQL?
- Vedi le tabelle `subscribers` e `push_subscriptions`?
- Nessun errore nell'esecuzione?

---

## ⏸️ **ATTENDI CONFERMA**

**Dimmi quando hai completato lo STEP 4** e procediamo con lo STEP 5 (decommentare il codice).

---

*Prossimo step: Decommentare il codice Supabase in dashboard.js*

