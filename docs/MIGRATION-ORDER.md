# Ordine Migrazioni Supabase - Tradelia

## 📋 Migrazioni Sequenziali

Eseguire le migrazioni **nell'ordine esatto** qui sotto, una alla volta, nel Supabase SQL Editor.

### ⚠️ IMPORTANTE

1. **Esegui una migrazione alla volta**
2. **Verifica che non ci siano errori** prima di procedere
3. **Non saltare migrazioni** - ogni migrazione dipende dalle precedenti
4. **Backup database** prima di iniziare (opzionale ma consigliato)

---

## 📝 Ordine di Esecuzione

### 1. `001_initial_schema.sql`

**Cosa crea:**

- `user_roles` - Ruoli e subscription
- `admin_emails` - Whitelist admin
- `pdf_customizations` - Personalizzazione PDF (Desk)
- `schema_migrations` - Tracking migrazioni
- Funzione `update_updated_at_column()`

**Prerequisiti:** Nessuno

**Tempo stimato:** 30 secondi

---

### 2. `002_community_tables.sql`

**Cosa crea:**

- `asset_proposals` - Proposte asset (Pro)
- `asset_votes` - Voti proposte

**Prerequisiti:** `001_initial_schema.sql` (richiede `user_roles`)

**Tempo stimato:** 20 secondi

---

### 3. `003_user_management_complete.sql`

**Cosa crea:**

- `profiles` (esteso) - Profilo utente completo
- `user_activities` - Log attività
- `user_achievements` - Achievement sbloccati
- `user_stats` - Statistiche utente
- `user_notification_preferences` - Preferenze notifiche
- `xp_transactions` - Transazioni XP

**Prerequisiti:** `001_initial_schema.sql` (crea `profiles` table)

**Tempo stimato:** 1 minuto

---

### 4. `004_education_system.sql`

**Cosa crea:**

- `courses` - Corsi disponibili
- `education_modules` - Moduli educativi
- `education_lessons` - Lezioni
- `education_lesson_quizzes` - Quiz
- `education_lesson_quiz_questions` - Domande quiz
- `education_lesson_quiz_options` - Opzioni quiz
- `course_materials` - Materiali corsi
- `education_user_progress` - Progresso corsi
- `education_user_lesson_progress` - Progresso lezioni
- `education_user_lesson_quiz_attempts` - Tentativi quiz
- `lesson_notes` - Note lezioni
- `material_downloads` - Download materiali
- `achievements` - Achievement disponibili
- `course_progress` (legacy) - Retrocompatibilità
- `modules` (legacy) - Retrocompatibilità

**Prerequisiti:** `001_initial_schema.sql`

**Tempo stimato:** 2 minuti

---

### 5. `005_reports_documents.sql`

**Cosa crea:**

- `reports` - Report generati
- `report_modules` - Moduli report
- `report_downloads` - Download report
- `report_audit_log` - Audit report

**Prerequisiti:** `001_initial_schema.sql` (richiede `admin_emails`)

**Tempo stimato:** 1 minuto

---

### 6. `006_trading_portfolio.sql`

**Cosa crea:**

- `portfolio_positions` - Posizioni portfolio
- `trading_journal` - Journal trading
- `watchlist` - Watchlist
- `watchlist_alerts` - Alert watchlist
- `watchlist_alert_history` - Storia alert
- `expenses` - Spese

**Prerequisiti:** `001_initial_schema.sql`

**Tempo stimato:** 1 minuto

---

### 7. `007_payments_billing.sql`

**Cosa crea:**

- `payments` - Pagamenti
- `invoices` - Fatture
- `credits_log` - Log crediti

**Prerequisiti:** `001_initial_schema.sql`

**Tempo stimato:** 1 minuto

---

### 8. `008_notifications_social.sql`

**Cosa crea:**

- `notifications` - Notifiche
- `push_subscriptions` - Subscription push
- `social_posts` - Post social
- `social_configs` - Config social
- `analysis_requests` - Richieste analisi

**Prerequisiti:** `001_initial_schema.sql`, `002_community_tables.sql`

**Tempo stimato:** 1 minuto

---

### 9. `009_utilities_alliance.sql`

**Cosa crea:**

- `financial_calculations` - Calcoli finanziari
- `pac_simulations` - Simulazioni PAC
- `alliance_members` - Membri alliance
- `alliance_events` - Eventi alliance
- `event_notifications` - Notifiche eventi

**Prerequisiti:** `001_initial_schema.sql`

**Tempo stimato:** 1 minuto

---

### 10. `010_system_tables.sql`

**Cosa crea:**

- `favorites` - Preferiti utente
- `admin_users` - Tabella admin completa (se necessaria)

**Prerequisiti:** `001_initial_schema.sql` (richiede `admin_emails`)

**Tempo stimato:** 30 secondi

---

### 11. `011_add_admin_users.sql` (OPZIONALE)

**Cosa fa:**

- Aggiunge email admin alla tabella `admin_emails`
- Fornisce istruzioni per creare utenti con password

**Prerequisiti:** `001_initial_schema.sql` (richiede `admin_emails`)

**Tempo stimato:** 10 secondi

**Nota:** Per creare utenti con password, usa:

- Script: `node scripts/create-admin-users.mjs`
- Oppure Supabase Dashboard > Authentication > Users

---

---

## ✅ Checklist Post-Migrazione

Dopo aver eseguito tutte le migrazioni:

- [ ] Verifica che tutte le tabelle siano state create
- [ ] Verifica che RLS sia abilitato su tutte le tabelle
- [ ] Verifica che gli indici siano stati creati
- [ ] Testa accesso utente normale
- [ ] Testa accesso admin
- [ ] Verifica che le foreign keys funzionino
- [ ] Controlla che i trigger `updated_at` funzionino

---

## 🔍 Verifica Migrazioni Applicate

Esegui questa query per vedere quali migrazioni sono state applicate:

```sql
SELECT version, applied_at
FROM schema_migrations
ORDER BY applied_at;
```

---

## ⚠️ Troubleshooting

### Errore: "relation does not exist"

- **Causa:** Migrazione precedente non eseguita
- **Soluzione:** Esegui le migrazioni nell'ordine corretto

### Errore: "already exists"

- **Causa:** Migrazione già eseguita (normale se idempotente)
- **Soluzione:** Ignora l'errore o usa `DROP TABLE IF EXISTS` prima

### Errore: "permission denied"

- **Causa:** RLS policy troppo restrittiva
- **Soluzione:** Verifica le policies nella migrazione

### Errore: "column does not exist"

- **Causa:** Struttura tabella diversa da quella attesa
- **Soluzione:** Verifica struttura esistente prima di migrare

---

## 📊 Totale Tabelle Create

Dopo tutte le migrazioni, avrai **54 tabelle** complete per Tradelia.
