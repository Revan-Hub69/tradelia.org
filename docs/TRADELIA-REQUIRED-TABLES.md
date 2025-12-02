# 📊 Tabelle Richieste da Tradelia - Analisi Completa

## 🔍 Analisi Automatica del Codice

Ho analizzato tutto il codice di Tradelia e trovato **54 tabelle** realmente usate.

## 📋 Tabelle per Categoria

### 👥 User Management (11 tabelle)

- `admin_users` - Utenti admin
- `admin_emails` - Email admin (whitelist)
- `user_roles` - Ruoli utente (trial, pro, desk, admin)
- `user_profiles` - Profili utente
- `profiles` - Profili (alternativa?)
- `user_activities` - Attività utente
- `user_achievements` - Achievement utente
- `user_stats` - Statistiche utente
- `user_notification_preferences` - Preferenze notifiche
- `education_user_progress` - Progresso educazione
- `education_user_lesson_progress` - Progresso lezioni

### 📊 Reports (4 tabelle)

- `reports` - Report principali
- `report_modules` - Moduli report
- `report_audit_log` - Log audit report
- `report_downloads` - Download report

### 🎓 Education/Courses (11 tabelle)

- `courses` - Corsi
- `course_progress` - Progresso corsi
- `course_materials` - Materiali corsi
- `education_lessons` - Lezioni
- `education_modules` - Moduli educazione
- `education_lesson_quizzes` - Quiz lezioni
- `education_lesson_quiz_questions` - Domande quiz
- `education_lesson_quiz_options` - Opzioni quiz
- `education_user_lesson_quiz_attempts` - Tentativi quiz
- `lesson_notes` - Note lezioni
- `modules` - Moduli dashboard
- `achievements` - Achievement disponibili

### 💳 Payments/Billing (4 tabelle)

- `payments` - Pagamenti
- `invoices` - Fatture
- `credits_log` - Log crediti
- `push_subscriptions` - Sottoscrizioni push

### 🔧 Other (24 tabelle)

- `asset_proposals` - Proposte community
- `asset_votes` - Voti community
- `analysis_requests` - Richieste analisi
- `favorites` - Preferiti
- `notifications` - Notifiche
- `watchlist` - Watchlist
- `watchlist_alerts` - Alert watchlist
- `watchlist_alert_history` - Storico alert
- `portfolio_positions` - Posizioni portfolio
- `trading_journal` - Journal trading
- `expenses` - Spese
- `financial_calculations` - Calcoli finanziari
- `pac_simulations` - Simulazioni PAC
- `material_downloads` - Download materiali
- `xp_transactions` - Transazioni XP
- `alliance_events` - Eventi alliance (Oslo)
- `alliance_members` - Membri alliance
- `event_notifications` - Notifiche eventi
- `social_posts` - Post social
- `social_configs` - Config social
- `pdf_customizations` - Personalizzazioni PDF
- `schema_migrations` - Migrazioni schema

## ✅ Cosa Fare Ora

### 1. Verifica Quali Tabelle Esistono Già

Esegui questo SQL in Supabase Dashboard:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### 2. Confronta con la Lista

Confronta le tabelle esistenti con le 54 tabelle richieste.

### 3. Crea Migrazioni SOLO per Tabelle Mancanti

**NON creare migrazioni per tabelle che esistono già!**

### 4. Verifica Struttura Tabelle Esistenti

Se una tabella esiste ma manca qualche colonna, crea una migrazione per aggiungere solo quella colonna.

## 🎯 Priorità

### Alta Priorità (Core Functionality)

1. `user_roles` - **ESSENZIALE** per access control
2. `user_profiles` / `profiles` - Profili utente
3. `reports` - Report principali
4. `payments` - Pagamenti
5. `invoices` - Fatture

### Media Priorità

- Tabelle education
- Tabelle watchlist
- Tabelle portfolio

### Bassa Priorità

- Tabelle Oslo/alliance
- Tabelle social
- Tabelle avanzate

## 📝 Note Importanti

1. **NON cancellare tabelle esistenti** senza verificare prima
2. **NON creare duplicati** - verifica sempre prima
3. **Usa migrazioni incrementali** - aggiungi solo quello che manca
4. **Testa sempre** in dev prima di applicare in produzione

## 🔧 Script Utili

```bash
# Analizza codice per trovare tabelle usate
node scripts/analyze-required-tables.mjs

# Verifica progetto Supabase
npm run supabase:check-project

# Lista tutte le tabelle esistenti
npm run supabase:list-tables
```

## ❓ Domande Frequenti

**Q: Devo creare tutte le 54 tabelle?**
A: No, solo quelle che mancano. Verifica prima cosa esiste.

**Q: E se una tabella esiste ma ha struttura diversa?**
A: Crea una migrazione per aggiungere/modificare solo le colonne necessarie.

**Q: Come so se una tabella è usata?**
A: Esegui `node scripts/analyze-required-tables.mjs` per vedere dove è usata nel codice.
