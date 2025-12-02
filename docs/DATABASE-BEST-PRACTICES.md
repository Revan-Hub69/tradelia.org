# Database Best Practices - Tradelia

## 📚 Principi Accademici per Database Design

### 1. Normalizzazione (3NF - Third Normal Form)

- ✅ Eliminare duplicati di dati
- ✅ Separare entità in tabelle distinte
- ✅ Usare foreign keys per relazioni
- ✅ Evitare dati ridondanti

### 2. Integrità Referenziale

- ✅ Foreign keys con `ON DELETE CASCADE` o `ON DELETE SET NULL`
- ✅ Constraints per validazione dati
- ✅ Unique constraints dove necessario

### 3. Sicurezza (RLS - Row Level Security)

- ✅ RLS abilitato su tutte le tabelle
- ✅ Policies esplicite per ogni operazione
- ✅ Principio del minimo privilegio

### 4. Performance

- ✅ Indici su foreign keys
- ✅ Indici su colonne usate in WHERE/ORDER BY
- ✅ Indici compositi per query comuni

### 5. Naming Conventions

- ✅ Nomi tabelle: `snake_case`, plurale (`users`, `reports`)
- ✅ Nomi colonne: `snake_case` (`user_id`, `created_at`)
- ✅ Foreign keys: `{table}_id` (es. `user_id`, `report_id`)
- ✅ Timestamps: `created_at`, `updated_at`, `deleted_at`

### 6. Audit Trail

- ✅ `created_at` e `updated_at` su tutte le tabelle
- ✅ `created_by` e `updated_by` per audit
- ✅ Soft deletes con `deleted_at` dove necessario

### 7. Versioning e Migrazioni

- ✅ Migrazioni idempotenti (`CREATE TABLE IF NOT EXISTS`)
- ✅ Versioning con `schema_migrations`
- ✅ Rollback possibile

---

## 🏗️ Architettura Database Tradelia

### Categorie Tabelle (54 totali)

#### 1. **User Management** (11 tabelle)

- `profiles` - Profilo utente (standard Supabase)
- `user_roles` - Ruoli e subscription
- `admin_emails` - Whitelist admin
- `user_activities` - Log attività
- `user_achievements` - Achievement sbloccati
- `user_stats` - Statistiche utente
- `user_notification_preferences` - Preferenze notifiche
- `education_user_progress` - Progresso corsi
- `education_user_lesson_progress` - Progresso lezioni
- `education_user_lesson_quiz_attempts` - Tentativi quiz

#### 2. **Reports & Documents** (4 tabelle)

- `reports` - Report generati
- `report_modules` - Moduli report
- `report_downloads` - Download report
- `report_audit_log` - Audit report

#### 3. **Education** (11 tabelle)

- `courses` - Corsi disponibili
- `education_modules` - Moduli educativi
- `education_lessons` - Lezioni
- `education_lesson_quizzes` - Quiz
- `education_lesson_quiz_questions` - Domande quiz
- `education_lesson_quiz_options` - Opzioni quiz
- `course_materials` - Materiali corsi
- `course_progress` - Progresso corsi (legacy)
- `modules` - Moduli dashboard (legacy)
- `lesson_notes` - Note lezioni
- `achievements` - Achievement disponibili

#### 4. **Trading & Portfolio** (4 tabelle)

- `portfolio_positions` - Posizioni portfolio
- `trading_journal` - Journal trading
- `watchlist` - Watchlist
- `watchlist_alerts` - Alert watchlist
- `watchlist_alert_history` - Storia alert

#### 5. **Payments & Billing** (4 tabelle)

- `payments` - Pagamenti
- `invoices` - Fatture
- `credits_log` - Log crediti
- `xp_transactions` - Transazioni XP (gamification)

#### 6. **Notifications** (2 tabelle)

- `notifications` - Notifiche
- `push_subscriptions` - Subscription push

#### 7. **Community & Social** (4 tabelle)

- `asset_proposals` - Proposte asset (Pro)
- `asset_votes` - Voti proposte
- `analysis_requests` - Richieste analisi
- `social_posts` - Post social
- `social_configs` - Config social

#### 8. **Utilities** (3 tabelle)

- `financial_calculations` - Calcoli finanziari
- `pac_simulations` - Simulazioni PAC
- `expenses` - Spese

#### 9. **Alliance/Oslo** (3 tabelle)

- `alliance_members` - Membri alliance
- `alliance_events` - Eventi alliance
- `event_notifications` - Notifiche eventi

#### 10. **System** (3 tabelle)

- `favorites` - Preferiti utente
- `material_downloads` - Download materiali
- `schema_migrations` - Migrazioni applicate

---

## 🔄 Unificazioni Necessarie

### 1. `profiles` vs `user_profiles`

- ✅ **Unificare in `profiles`** (standard Supabase)
- ✅ Migrare dati da `user_profiles` → `profiles`
- ✅ Creare view temporanea per retrocompatibilità

### 2. `admin_users` vs `admin_emails`

- ✅ **Verificare struttura**
- ✅ Se `admin_users` ha solo email → unificare
- ✅ Se ha campi aggiuntivi → mantenere separati

### 3. `course_progress` vs `education_user_progress`

- ✅ **Verificare differenze**
- ✅ Unificare se possibile

### 4. `modules` vs `education_modules`

- ✅ **Verificare differenze**
- ✅ Unificare se possibile

---

## 📋 Ordine Migrazioni

1. **001_initial_schema.sql** - Core (user_roles, admin_emails, pdf_customizations)
2. **002_community_tables.sql** - Community (asset_proposals, asset_votes)
3. **003_unify_profiles.sql** - Unifica profiles
4. **004_user_management.sql** - User management completo
5. **005_education.sql** - Sistema educativo
6. **006_reports.sql** - Reports e documenti
7. **007_trading.sql** - Trading e portfolio
8. **008_payments.sql** - Pagamenti e billing
9. **009_notifications.sql** - Notifiche
10. **010_utilities.sql** - Utilities e calcoli
11. **011_alliance.sql** - Alliance/Oslo
12. **012_system.sql** - Tabelle di sistema
13. **013_fix_security.sql** - Fix sicurezza finale

---

## ✅ Checklist Best Practices

Per ogni tabella:

- [ ] RLS abilitato
- [ ] Policies per SELECT, INSERT, UPDATE, DELETE
- [ ] Foreign keys con ON DELETE appropriato
- [ ] Indici su foreign keys
- [ ] Indici su colonne usate in WHERE/ORDER BY
- [ ] `created_at` e `updated_at`
- [ ] Constraints per validazione
- [ ] Commenti SQL per documentazione
