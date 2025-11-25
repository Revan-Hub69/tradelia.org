# 🚀 Setup Supabase - Versione Semplificata

## ⚠️ Problema: Troppi Errori SQL

Se stai riscontrando errori continui, usa questa **versione semplificata** che crea tutto in un unico script.

---

## 📋 Script Unico Semplificato

### `supabase/setup-education-system-simple.sql`

**Cosa fa:**

- ✅ Crea tutte le tabelle base in un unico script
- ✅ Gestisce errori gracefully (IF NOT EXISTS)
- ✅ Crea indici, trigger, RLS policies
- ✅ Funzioni base (update_updated_at, has_tracking_consent, delete_user_education_data)
- ✅ Verifica finale

**Esegui questo PRIMO** se hai problemi con gli altri script.

---

## 📋 Ordine Completo Semplificato

### 1. Setup Base (Script Unico)

**File**: `supabase/setup-education-system-simple.sql`

Esegui questo PRIMO. Crea tutto il necessario base.

---

### 2. Gamification Avanzata

**File**: `supabase/enhance-gamification-system.sql`

Aggiunge livelli, XP transactions, quests, achievements.

---

### 3. Sistema Avanzato Apprendimento

**File**: `supabase/enhance-education-system-advanced.sql`

Aggiunge spaced repetition, quiz, reflection prompts.

---

### 4. Contenuti Educativi

**4.1 Modulo 1 Base**

- `supabase/seed-education-content.sql`

**4.2 Espansione Modulo 1**

- `supabase/expand-module-1-foundations.sql`

**4.3 Modulo 2 Completo**

- `supabase/module-2-risk-management-complete.sql`

---

## ✅ Verifica Rapida

Dopo ogni script, esegui:

```sql
-- Verifica tabelle create
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'education_%'
ORDER BY table_name;

-- Verifica moduli
SELECT id, title, slug, order_index
FROM education_modules
WHERE is_active = true
ORDER BY order_index;
```

---

## 🔧 Se Continui ad Avere Errori

### Opzione A: Esegui Solo Script Semplificato

1. Esegui `setup-education-system-simple.sql`
2. Verifica con query sopra
3. Se funziona, procedi con gli altri script

### Opzione B: Esegui Script in Parti

1. Copia solo la sezione "TABELLE BASE" di `setup-education-system-simple.sql`
2. Esegui
3. Poi "INDICI"
4. Poi "RLS POLICIES"
5. Poi "FUNZIONI"

### Opzione C: Verifica Errori Specifici

Se un errore specifico persiste, dimmi quale e lo correggo.

---

## 📊 Cosa Dovresti Vedere

Dopo `setup-education-system-simple.sql`:

**Tabelle create:**

- education_modules
- education_lessons
- education_tests
- education_questions
- education_question_options
- education_user_progress
- education_user_lesson_progress
- education_user_test_attempts
- education_badges
- education_user_badges
- education_user_stats
- education_user_tracking_preferences

**Funzioni create:**

- update_updated_at_column
- has_tracking_consent
- delete_user_education_data

---

## 🎯 Prossimi Passi

1. ✅ Esegui `setup-education-system-simple.sql`
2. ✅ Verifica con query sopra
3. ✅ Se OK, procedi con `enhance-gamification-system.sql`
4. ✅ Poi `enhance-education-system-advanced.sql`
5. ✅ Poi contenuti (seed-education-content.sql, etc.)

---

## ⚠️ Note

- Lo script semplificato **non** include gamification avanzata o features avanzate
- Dopo lo script base, esegui gli script di enhancement
- Se un enhancement fallisce, puoi continuare (sono additivi)
