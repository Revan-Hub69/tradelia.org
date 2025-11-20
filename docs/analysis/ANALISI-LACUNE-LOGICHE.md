# 🔍 Analisi Lacune Logiche - Sistema Tradelia

## ⚠️ PROBLEMI CRITICI

### 1. **GESTIONE CREDITI - LACUNE GRAVI**

#### 1.1 Creazione record crediti mancante
- **Problema**: `fetchCredits()` usa `maybeSingle()` - se l'utente non ha mai acquistato crediti, il record non esiste
- **Conseguenza**: `state.credits` diventa `null`, ma il codice assume sempre `{ credits_balance: 0, ... }`
- **Dove**: `fetchCredits()` line 1087 - fallback crea oggetto ma non lo salva in DB
- **Rischio**: Utente institutional senza record crediti → può inviare richieste senza scalare crediti (BUG!)

#### 1.2 Scalata crediti non atomica
- **Problema**: Creazione `analysis_requests` e update crediti sono due operazioni separate
- **Conseguenza**: Se la seconda fallisce, la richiesta esiste ma il credito non è scalato (doppia richiesta possibile)
- **Dove**: `handleProposeAsset()` line 932-952
- **Rischio**: Perdita di crediti o richieste duplicate

#### 1.3 Admin bypass crediti - logica inconsistente
- **Problema**: Admin può inviare richieste senza crediti, ma il contatore crediti mostra sempre 0
- **Conseguenza**: UI confusa - admin vede "Crediti residui: 0" ma può comunque inviare
- **Dove**: `renderCreditsCounter()` mostra sempre crediti reali, anche per admin
- **Rischio**: Confusione UX

### 2. **SCADENZA PIANO - LACUNE**

#### 2.1 Verifica scadenza solo al login
- **Problema**: `fetchUserRole()` verifica scadenza solo quando viene chiamata (al bootstrap)
- **Conseguenza**: Se un piano scade durante la sessione, l'utente continua ad avere accesso
- **Dove**: `fetchUserRole()` line 427-434
- **Rischio**: Accesso non autorizzato dopo scadenza

#### 2.2 Nessun refresh automatico scadenza
- **Problema**: Non c'è polling o check periodico della scadenza
- **Conseguenza**: Utente può usare il sistema anche se il piano è scaduto durante la sessione
- **Rischio**: Violazione business logic

#### 2.3 Admin con scadenza
- **Problema**: Admin ha `planExpiresAt = null`, ma se per errore ha un record in `user_roles` con scadenza, cosa succede?
- **Conseguenza**: Logica inconsistente
- **Dove**: `fetchUserRole()` line 410-413

### 3. **ANALISI ON DEMAND - LACUNE GRAVI**

#### 3.1 Nessun collegamento tra richiesta e report generato
- **Problema**: `analysis_requests` ha solo `ticker` e `status`, ma non ha `report_id` o `report_slug`
- **Conseguenza**: Quando un'analisi è completata, non c'è modo di collegarla al report generato
- **Dove**: Tabella `analysis_requests` non ha campo `report_id`
- **Rischio**: Utente non sa dove trovare l'analisi completata

#### 3.2 Status "completed" ma nessuna notifica
- **Problema**: Quando status diventa "completed", non c'è notifica all'utente
- **Conseguenza**: Utente non sa quando l'analisi è pronta
- **Dove**: Nessun sistema di notifica implementato
- **Rischio**: UX pessima

#### 3.3 Nessun workflow di completamento
- **Problema**: Non c'è codice che aggiorna lo status da "pending" → "processing" → "completed"
- **Conseguenza**: Le richieste rimangono sempre "pending"
- **Dove**: Nessun endpoint o funzione che processa le richieste
- **Rischio**: Sistema non funzionante

#### 3.4 Nessun limite di richieste simultanee
- **Problema**: Utente può inviare infinite richieste "pending"
- **Conseguenza**: Spam, sovraccarico sistema
- **Rischio**: Abuso

### 4. **RUOLI E PERMESSI - INCONSISTENZE**

#### 4.1 Institutional può vedere community proposals?
- **Problema**: Codice dice "Institutional ha solo richieste on-demand", ma può vedere le proposte?
- **Conseguenza**: Logica confusa - può vedere ma non votare?
- **Dove**: `renderCommunitySection()` line 711-717
- **Rischio**: UX inconsistente

#### 4.2 Admin può votare proposte community?
- **Problema**: Admin ha ruolo "institutional", quindi non può votare (line 1015)
- **Conseguenza**: Admin non può testare funzionalità community
- **Rischio**: Testing limitato

#### 4.3 Utente senza ruolo può vedere qualcosa?
- **Problema**: Se `state.role === null`, cosa può vedere?
- **Conseguenza**: Lock overlay, ma nessuna indicazione su come ottenere un piano
- **Dove**: Varie funzioni assumono sempre un ruolo valido

### 5. **DASHBOARD STATS - LACUNE**

#### 5.1 Stats non aggiornate in real-time
- **Problema**: `fetchDashboardStats()` viene chiamata solo al bootstrap
- **Conseguenza**: Stats non riflettono azioni durante la sessione
- **Dove**: `bootstrapUserArea()` line 170
- **Rischio**: Dati obsoleti

#### 5.2 Stats per institutional solo
- **Problema**: `fetchDashboardStats()` conta solo `analysis_requests` se institutional
- **Conseguenza**: Trial/Pro vedono sempre "0 richieste"
- **Dove**: `fetchDashboardStats()` line 463-467
- **Rischio**: Stats inutili per Trial/Pro

### 6. **ADMIN DASHBOARD - LACUNE GRAVI**

#### 6.1 RPC function non esiste ancora
- **Problema**: `get_user_emails_for_admin()` viene chiamata ma potrebbe non esistere in Supabase
- **Conseguenza**: Fallback usa user_id, ma non email reali
- **Dove**: `admin.js` line 94-95
- **Rischio**: Dashboard inutile senza email

#### 6.2 Nessuna funzione di modifica
- **Problema**: `editUser()` e `manageCredits()` sono placeholder vuoti
- **Conseguenza**: Dashboard admin non può fare nulla
- **Dove**: `admin.js` line 238-246
- **Rischio**: Dashboard non funzionale

#### 6.3 Nessuna gestione scadenze
- **Problema**: Admin non può modificare `valid_until` da dashboard
- **Conseguenza**: Deve usare SQL direttamente
- **Rischio**: Workflow inefficiente

#### 6.4 Nessuna creazione crediti
- **Problema**: Admin non può aggiungere crediti a un utente
- **Conseguenza**: Deve usare SQL direttamente
- **Rischio**: Workflow inefficiente

### 7. **PROPOSTE COMMUNITY - LACUNE**

#### 7.1 Nessun limite proposte per utente
- **Problema**: Utente può proporre infinite proposte
- **Conseguenza**: Spam
- **Rischio**: Abuso

#### 7.2 Nessuna moderazione
- **Problema**: Proposte vengono pubblicate immediatamente
- **Conseguenza**: Contenuti inappropriati possibili
- **Rischio**: Qualità contenuti

#### 7.3 Vote count non aggiornato in real-time
- **Problema**: Dopo un voto, la lista non si aggiorna automaticamente
- **Conseguenza**: UX confusa
- **Dove**: `handleVote()` non chiama `renderCommunityProposalsList()`

### 8. **INTEGRAZIONE WEBHOOK - LACUNE**

#### 8.1 Webhook non aggiornano user_roles
- **Problema**: Webhook Stripe/Paddle aggiornano solo `subscribers`, non `user_roles`
- **Conseguenza**: Utente paga ma non ottiene ruolo automaticamente
- **Dove**: `webhook-stripe.js`, `webhook-paddle.js`
- **Rischio**: Utente paga ma non ha accesso

#### 8.2 Nessun collegamento subscribers → user_roles
- **Problema**: `subscribers` e `user_roles` sono tabelle separate senza relazione
- **Conseguenza**: Nessuna sincronizzazione automatica
- **Rischio**: Inconsistenza dati

#### 8.3 Nessun aggiornamento valid_until da webhook
- **Problema**: Webhook non impostano `valid_until` in `user_roles`
- **Conseguenza**: Scadenze non gestite automaticamente
- **Rischio**: Piani non scadono automaticamente

### 9. **SICUREZZA E VALIDAZIONE - LACUNE**

#### 9.1 Nessuna validazione ticker
- **Problema**: Ticker viene solo uppercase, ma non validato (es. "ASDFASDFASDF" è accettato)
- **Conseguenza**: Richieste invalide possibili
- **Dove**: `handleProposeAsset()` line 907
- **Rischio**: Spam, errori

#### 9.2 Nessun rate limiting
- **Problema**: Utente può inviare richieste rapidamente
- **Conseguenza**: Abuso, sovraccarico
- **Rischio**: DoS

#### 9.3 RLS policies non verificate
- **Problema**: Non sappiamo se le RLS policies sono corrette
- **Conseguenza**: Possibili accessi non autorizzati
- **Rischio**: Sicurezza

### 10. **UX E FEEDBACK - LACUNE**

#### 10.1 Nessun loading state durante richiesta
- **Problema**: Pulsante disabilitato ma nessun indicatore visivo
- **Conseguenza**: UX confusa
- **Dove**: `handleProposeAsset()` line 929

#### 10.2 Nessun feedback su stato richiesta
- **Problema**: Utente non sa quando la richiesta è in processing
- **Conseguenza**: UX confusa
- **Dove**: `renderProposalsList()` mostra status ma non aggiorna

#### 10.3 Nessun link a report completato
- **Problema**: Quando status è "completed", non c'è link al report
- **Conseguenza**: Utente non sa dove trovare l'analisi
- **Dove**: `renderProposalsList()` line 776-798

### 11. **DATI E STATO - LACUNE**

#### 11.1 State non sincronizzato con DB
- **Problema**: Dopo operazioni, state viene aggiornato ma non sempre
- **Conseguenza**: UI mostra dati obsoleti
- **Esempio**: Dopo voto, `state.userVotes` aggiornato ma lista non refreshata

#### 11.2 Nessun error recovery
- **Problema**: Se una query fallisce, state rimane inconsistente
- **Conseguenza**: UI in stato inconsistente
- **Rischio**: Bug difficili da debuggare

#### 11.3 Race conditions possibili
- **Problema**: Operazioni async senza lock o debounce
- **Conseguenza**: Doppie operazioni possibili
- **Esempio**: Click rapido su "Invia ticker" → doppia richiesta

### 12. **MIGRAZIONI E SCHEMA - LACUNE**

#### 12.1 valid_until non in schema.sql originale
- **Problema**: Campo aggiunto in migration separata, ma non in schema principale
- **Conseguenza**: Schema non completo
- **Dove**: `schema.sql` vs `migration-add-expiration.sql`

#### 12.2 Nessuna migration per analysis_requests
- **Problema**: Tabella usata ma non creata in schema.sql
- **Conseguenza**: Dipendenza da migration separata
- **Rischio**: Setup incompleto

#### 12.3 Nessuna migration per user_analysis_credits
- **Problema**: Tabella usata ma non creata in schema.sql
- **Conseguenza**: Dipendenza da migration separata
- **Rischio**: Setup incompleto

---

## 📊 PRIORITÀ FIX

### 🔴 CRITICO (Blocca funzionalità)
1. Creazione record crediti automatica per utenti institutional
2. Collegamento analysis_requests → report_id quando completato
3. Workflow completamento analisi (pending → processing → completed)
4. Webhook aggiornano user_roles, non solo subscribers
5. Validazione ticker e rate limiting

### 🟠 ALTO (Grave impatto UX)
6. Notifiche quando analisi completata
7. Refresh automatico scadenza piano
8. Stats aggiornate in real-time
9. Link a report completato in lista richieste
10. Admin dashboard funzionale (modifica utenti, crediti, scadenze)

### 🟡 MEDIO (Migliora qualità)
11. Limite proposte per utente
12. Moderazione proposte
13. Loading states e feedback UX
14. Error recovery e state sync
15. Race condition prevention

### 🟢 BASSO (Nice to have)
16. Admin può votare proposte (per testing)
17. Polling scadenza piano
18. Validazione ticker avanzata
19. Rate limiting avanzato
20. Audit log operazioni

---

## 💡 OSSERVAZIONI GENERALI

1. **Sistema incompleto**: Molte funzionalità iniziate ma non completate
2. **Nessun workflow end-to-end**: Analisi on-demand non ha workflow completo
3. **Integrazione webhook debole**: Non sincronizza tutti i dati necessari
4. **Admin dashboard placeholder**: Struttura creata ma non funzionale
5. **State management fragile**: Molte assunzioni su stato che potrebbero essere inconsistenti
6. **Mancanza validazioni**: Pochi controlli su input e operazioni
7. **Nessun sistema notifiche**: Utenti non informati su eventi importanti
8. **RLS non verificato**: Sicurezza dipende da policies non testate

