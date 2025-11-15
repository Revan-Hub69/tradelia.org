# 📋 Area Utente - Specifica Completa Step-by-Step

## 🎯 Obiettivo
L'area utente (`/user/index.html`) è il centro di controllo dell'account utente. Deve permettere all'utente di:
1. Vedere stato account e piano
2. Gestire profilo e dati business
3. Gestire abbonamenti (attivare trial, upgrade, rinnovo, cancellazione)
4. Visualizzare report e attività
5. Gestire crediti (per institutional)
6. Richiedere analisi on-demand (per institutional)
7. Proporre asset alla community

---

## 📊 DASHBOARD (Tab "Dashboard")

### Funzionalità Richieste:
1. **Metriche Principali**
   - Report completati (count da `analysis_requests` con `status = 'completed'`)
   - Richieste in attesa (count da `analysis_requests` con `status IN ('pending', 'processing')`)
   - Crediti residui (solo per institutional, da `user_analysis_credits.credits_balance`)
   - Piano attivo (da `user_roles.role`)
   - Scadenza piano (da `user_roles.valid_until`, mostra giorni rimanenti)
   - Ultimo accesso (da `auth.sessions`)

2. **Quick Actions**
   - "Nuova richiesta analisi" (solo per institutional) → Apre tab "Analisi on demand"
   - "Vedi tutti i report" → Apre tab "Report"
   - "Upgrade piano" (solo se non è già institutional) → Apre tab "Abbonamento"

3. **Report Recenti**
   - Ultimi 5 report completati (da `analysis_requests` con `status = 'completed'`, ordinati per `created_at DESC`)
   - Mostra: ticker, data, stato
   - Link "Vedi tutti" → Apre tab "Report"

4. **Attività Recente**
   - Ultime attività (richieste, proposte, voti, ecc.)
   - Mostra: tipo, data, descrizione

5. **Notifiche Importanti**
   - Piano in scadenza (se scadenza < 7 giorni)
   - Crediti bassi (se < 5 crediti per institutional)
   - Report completati (se presente)
   - Aggiornamenti sistema

---

## 👤 PROFILO (Tab "Profilo")

### Funzionalità Richieste:
1. **Dati Personali**
   - Foto profilo (upload, preview, cancellazione)
   - Nome visualizzato (campo testo, max 80 caratteri)
   - Tipo account (select: Individuale / Business)
   - Se Business → Mostra sezione completa dati business

2. **Dati Business** (solo se `user_type = 'business'`)
   - Nome/Ragione Sociale * (obbligatorio)
   - Paese * (select, obbligatorio)
   - Lingua fatturazione (select: it/en/fr/de/es)
   - Indirizzo completo * (obbligatorio)
   - Città * (obbligatorio)
   - CAP * (obbligatorio)
   - Partita IVA (con prefisso paese)
   - Codice Fiscale
   - Giorni di scadenza fattura (numero, default 0)
   - Referente: Nome *, Cognome *, Email * (obbligatori)
   - Commenti aggiuntivi (textarea)

3. **Preferenze**
   - Notifiche email per richieste analisi completate (checkbox)
   - Avvisi dashboard per aggiornamenti importanti (checkbox)

4. **Sicurezza Account**
   - Form cambio password (campo nuova password, conferma password)
   - Form cambio email (campo nuova email, conferma via email)

### Azioni:
- **Salva profilo**: Salva tutti i dati in `user_profiles`, se ci sono modifiche invia email a `amministrazione@tradelia.org`
- **Annulla modifiche**: Reset form ai valori originali
- **Cambia password**: Valida password (min 8 caratteri), aggiorna in Supabase Auth
- **Cambia email**: Invia email di conferma alla nuova email

---

## 📄 REPORT (Tab "Report")

### Funzionalità Richieste:
1. **Filtri**
   - Per stato: Tutti / Completati / In attesa / In elaborazione / Errati
   - Per ticker: Campo ricerca (filtra per ticker)
   - Per data: Ultimo mese / Ultimi 3 mesi / Ultimo anno / Tutti

2. **Lista Report**
   - Tabella/list con report utente (da `analysis_requests` filtrati per `user_id`)
   - Mostra: Ticker, Data richiesta, Stato, Priorità, Azioni
   - Paginazione: 10 report per pagina

3. **Azioni**
   - Vedi dettagli (apre modal o pagina dettaglio)
   - Download report (se completato)
   - Cancella richiesta (solo se pending)

---

## 🔬 ANALISI ON DEMAND (Tab "Analisi on demand")

### Funzionalità Richieste:
1. **Contatore Crediti** (solo per institutional)
   - Mostra crediti residui (da `user_analysis_credits.credits_balance`)
   - Pulsante "Acquista crediti" (solo se non admin)

2. **Richiesta Analisi** (solo per institutional)
   - Campo input ticker
   - Validazione: ticker deve essere valido (3-5 caratteri, solo lettere maiuscole)
   - Rate limiting: max 3 richieste pending contemporaneamente
   - Controllo crediti: deve avere almeno 1 credito disponibile
   - Submit → Crea record in `analysis_requests` con `status = 'pending'`, scala 1 credito

3. **Proposte Community** (tutti gli utenti)
   - Campo input ticker
   - Submit → Crea record in `asset_proposals`
   - Visualizza lista proposte con voti (da `asset_votes`)
   - Vota proposte (toggle: aggiungi/rimuovi voto)

### Azioni:
- **Richiedi analisi**: Valida ticker, controlla crediti, crea richiesta, scala credito
- **Proponi asset**: Valida ticker, crea proposta
- **Vota proposta**: Aggiungi/rimuovi voto in `asset_votes`

---

## 💳 ABBONAMENTO (Tab "Abbonamento")

### Funzionalità Richieste:
1. **Info Piano Corrente**
   - Nome piano (Guest / Trial / Pro / Desk Professionale)
   - Descrizione piano
   - Benefit piano (lista)
   - Data scadenza (se presente, mostra giorni rimanenti)
   - Crediti disponibili (solo per institutional)

2. **Azioni Disponibili** (in base al ruolo):
   
   **Se nessun ruolo (`state.role === null`)**:
   - "Prova Pro gratuitamente (14 giorni)" → Chiama `handleUpgradeWithTrial('pro')`
   - "Prova Desk gratuitamente (14 giorni)" → Chiama `handleUpgradeWithTrial('institutional')`
   
   **Se ruolo Trial (`state.role === 'trial'`)**:
   - "Passa a Pro" → Apre checkout Paddle (`openPaddleUpgrade('pro', ...)`)
   
   **Se ruolo Pro (`state.role === 'pro'`)**:
   - "Passa a Desk Professionale" → Apre checkout Paddle (`openPaddleUpgrade('institutional', ...)`)
   
   **Se piano sta per scadere (scadenza < 7 giorni)**:
   - "Rinnova abbonamento (X giorni rimanenti)" → Apre checkout Paddle (`openPaddleUpgrade(state.role, ...)`)
   
   **Se piano attivo e non admin**:
   - "Cancella abbonamento" → Chiama `handleCancelSubscription()`

3. **Fatture e Documenti**
   - Lista fatture (da integrare con Xolo/Paddle)
   - Download fatture
   - Visualizza dettagli fattura

4. **Cronologia Pagamenti**
   - Lista pagamenti (da integrare con Paddle)
   - Mostra: Data, Importo, Metodo, Stato

### Azioni:
- **Attiva trial**: Crea record in `user_roles` con `role = targetRole` e `valid_until = oggi + 14 giorni`
- **Upgrade piano**: Apre checkout Paddle overlay (NON redirect a pricing!)
- **Rinnova abbonamento**: Apre checkout Paddle overlay per rinnovo
- **Cancella abbonamento**: Mostra conferma, marca piano come cancellato (webhook Paddle gestirà la disattivazione)

---

## 🔔 NOTIFICHE (Tab "Notifiche")

### Funzionalità Richieste:
1. **Categorie**
   - Tutte
   - Sistema (aggiornamenti, manutenzioni)
   - Report (analisi completate)
   - Abbonamento (scadenze, rinnovi)
   - Community (nuove proposte, voti)

2. **Lista Notifiche**
   - Notifiche generate dinamicamente in base a:
     - Report completati
     - Piano in scadenza
     - Crediti bassi
     - Nuove proposte community
     - Aggiornamenti sistema

3. **Supporto**
   - Link email supporto: `amministrazione@tradelia.org`
   - FAQ (link esterno o sezione dedicata)

---

## 🔐 AUTENTICAZIONE (Panel "auth")

### Funzionalità Richieste:
1. **Login**
   - Email e password
   - Submit → Login Supabase, reindirizza a dashboard

2. **Registrazione**
   - Email e password
   - Submit → Crea account Supabase, crea profilo, auto-login, reindirizza a dashboard

3. **Reset Password**
   - Campo email
   - Submit → Invia email reset (redirect a `/user/index.html?reset=true`)
   - Gestione redirect: Mostra form cambio password evidenziato

---

## 🚫 REGOLE E LIMITI

### Regole di Accesso:
- Utente non loggato → Mostra solo panel "auth" (login/registrazione)
- Utente loggato → Mostra tutti i panel tranne "auth"

### Regole per Ruoli:
- **Guest (nessun ruolo)**: Può solo vedere dashboard e attivare trial
- **Trial**: Può usare tutte le funzionalità per 14 giorni, può upgrade a Pro
- **Pro**: Accesso completo, può upgrade a Desk Professionale
- **Institutional (Desk)**: Accesso completo + crediti + richieste analisi on-demand
- **Admin**: Accesso completo, crediti illimitati, gestione proposte

### Regole per Funzionalità:
- **Richiesta analisi on-demand**: Solo institutional (o admin)
- **Proposte community**: Tutti gli utenti autenticati
- **Upgrade piano**: Tutti tranne institutional (non può upgrade ulteriormente)
- **Cancellazione abbonamento**: Solo utenti con piano attivo (non admin, non guest)

---

## 🔄 FLUSSI PRINCIPALI

### Flusso 1: Attivazione Trial (da Area Utente)
1. Utente loggato senza ruolo → Clicca "Prova Pro gratuitamente"
2. Chiama `handleUpgradeWithTrial('pro')`
3. Crea record in `user_roles` con `role = 'pro'` e `valid_until = oggi + 14 giorni`
4. Mostra toast "Trial attivato!"
5. Refresh area utente, mostra piano Pro attivo

### Flusso 2: Attivazione Trial (da Pricing - NON LOGGATO)
1. Utente non loggato → Clicca "Attiva prova gratuita" in pricing.html
2. Apre modal `trial-onboarding-modal` (step 1: Individuale/Business)
3. Se Business → Step 2: Raccolta dati business
4. Step 3: Creazione account automatica o login
5. Dopo login/registrazione → Attiva trial automaticamente
6. Chiude modal, mostra successo

### Flusso 3: Attivazione Trial (da Pricing - LOGGATO)
1. Utente loggato → Clicca "Attiva prova gratuita" in pricing.html
2. Verifica se ha già un ruolo:
   - Se ha già ruolo → Mostra messaggio "Hai già un piano attivo" o reindirizza all'area utente
   - Se non ha ruolo → Attiva trial direttamente (NON aprire modal!)

### Flusso 4: Upgrade Piano
1. Utente loggato → Clicca "Passa a Pro" o "Passa a Desk Professionale"
2. Chiama `openPaddleUpgrade(targetRole, email, name)`
3. Apre checkout Paddle overlay (NON redirect a pricing!)
4. Utente completa checkout
5. Webhook Paddle aggiorna ruolo in `user_roles`
6. Utente ritorna → Refresh area utente, mostra piano aggiornato

### Flusso 5: Rinnovo Abbonamento
1. Utente loggato con piano in scadenza (< 7 giorni) → Vede pulsante "Rinnova abbonamento"
2. Clicca pulsante → Chiama `handleRenewSubscription()`
3. Apre checkout Paddle overlay per rinnovo
4. Utente completa checkout
5. Webhook Paddle estende `valid_until` in `user_roles`
6. Refresh area utente, mostra nuova scadenza

---

## ⚠️ PROBLEMI DA FIXARE

### Problema 1: "Cambia piano" va a pricing invece di aprire checkout
**Fix**: I pulsanti "Passa a Pro" e "Passa a Desk Professionale" NON devono fare redirect. Devono chiamare `openPaddleUpgrade()` direttamente.

### Problema 2: "Attiva trial" in pricing rimanda all'area utente
**Fix**: 
- Se utente NON loggato → Apri modal trial-onboarding
- Se utente loggato ma senza ruolo → Attiva trial direttamente (NON aprire modal, NON redirect)
- Se utente loggato con ruolo → Mostra messaggio o reindirizza all'area utente

### Problema 3: Ricorsività tra pricing e area utente
**Fix**: 
- Rimuovere tutti i redirect automatici tra pricing e area utente
- Pricing è solo informativo (mostra piani, prezzi, info)
- Area utente è operativa (attiva trial, upgrade, gestisce account)
- I pulsanti in area utente NON devono andare a pricing, devono aprire checkout o attivare trial direttamente

### Problema 4: Modal trial non si apre correttamente
**Fix**: Verificare che `trialOnboardingModal.open()` funzioni correttamente e che il modal sia inizializzato

### Problema 5: Checkout Paddle non si apre
**Fix**: 
- Verificare che Paddle SDK sia caricato
- Verificare che Price IDs siano configurati
- Verificare che `openPaddleCheckout()` gestisca correttamente gli errori

---

## ✅ CHECKLIST FINALE

- [ ] Dashboard mostra tutte le metriche correttamente
- [ ] Profilo salva e carica dati business correttamente
- [ ] Modifiche profilo inviano email ad amministrazione
- [ ] Report mostra lista corretta con filtri e paginazione
- [ ] Analisi on-demand funziona solo per institutional
- [ ] Proposte community funzionano per tutti
- [ ] Abbonamento mostra info corrette
- [ ] Pulsanti upgrade aprono checkout Paddle (NON redirect)
- [ ] Pulsanti trial attivano trial direttamente (NON redirect)
- [ ] Nessun redirect ricorsivo tra pricing e area utente
- [ ] Reset password funziona correttamente
- [ ] Notifiche vengono generate correttamente

