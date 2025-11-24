# Setup Completo Supabase - Sistema Educativo Tradelia

## 📋 Ordine di Esecuzione Script SQL

### FASE 1: Schema Base (Fondamentale)

#### 1.1 Schema Sistema Educativo Base

**File**: `supabase/add-education-system-schema.sql`
**Descrizione**: Crea tutte le tabelle base del sistema educativo

- `education_modules`
- `education_lessons`
- `education_tests`
- `education_questions`
- `education_question_options`
- `education_user_progress`
- `education_user_test_attempts`
- `education_badges` (base)
- `education_user_badges`
- `education_user_stats`
- `education_certificates`
- `education_pathways`
- Funzioni base e RLS policies

**⚠️ IMPORTANTE**: Eseguire PRIMA di tutti gli altri script

---

### FASE 2: Gamification Avanzata

#### 2.1 Sistema Gamification Professionale

**File**: `supabase/enhance-gamification-system.sql`
**Descrizione**: Sistema gamification avanzato

- `education_levels` (5 livelli)
- `education_xp_transactions` (tracking XP)
- `education_badge_progress` (badge progressivi)
- `education_streak_rewards` (reward streak)
- `education_user_streaks` (daily/weekly/monthly)
- `education_achievements` (achievement complessi)
- `education_quests` (quest system)
- `education_community_goals` (community goals)
- Funzioni: `add_education_xp`, `update_learning_streak`, `check_and_unlock_badge`, `calculate_user_level`

**✅ Dopo**: `add-education-system-schema.sql`

---

### FASE 3: Sistema Avanzato Apprendimento

#### 3.1 Features Avanzate Apprendimento

**File**: `supabase/enhance-education-system-advanced.sql`
**Descrizione**: Best practice apprendimento avanzato

- `education_learning_objectives` (obiettivi espliciti)
- `education_lesson_quizzes` (quiz durante lezioni)
- `education_lesson_quiz_questions`
- `education_lesson_quiz_options`
- `education_user_lesson_quiz_attempts`
- `education_spaced_repetition` (sistema SM-2)
- `education_spaced_repetition_sessions`
- `education_question_performance` (adaptive difficulty)
- `education_reflection_prompts` (metacognition)
- `education_user_reflections`
- Funzioni: `update_spaced_repetition`, `get_spaced_repetition_questions`, `update_question_difficulty`

**✅ Dopo**: `add-education-system-schema.sql`

---

### FASE 4: Contenuti Educativi

#### 4.1 Modulo 1: Fondamenti di Investimento (Base)

**File**: `supabase/seed-education-content.sql`
**Descrizione**: Crea Modulo 1 con 4 lezioni base

- 4 lezioni iniziali
- Test finale (5 domande)

**✅ Dopo**: `add-education-system-schema.sql`

#### 4.2 Espansione Modulo 1: Fondamenti (6 Lezioni)

**File**: `supabase/expand-module-1-foundations.sql`
**Descrizione**: Espande Modulo 1 a 6 lezioni

- Aggiunge 2 lezioni: "Inflazione e Potere d'Acquisto", "Tassazione degli Investimenti"
- Aggiorna test a 7 domande
- Aggiorna ore stimate a 4 ore

**✅ Dopo**: `seed-education-content.sql`

#### 4.3 Modulo 2: Gestione Rischio e Rischi (COMPLETO)

**File**: `supabase/module-2-risk-management-complete.sql`
**Descrizione**: Modulo completo avanzatissimo (8 lezioni)

- Lezione 1: Tassonomia Completa dei Rischi
- Lezione 2: Metriche Quantitative Avanzate
- Lezione 3: Strategie Pratiche di Gestione Rischio
- Lezione 4: Risk Management Avanzato
- Lezione 5: Risk Management Professionale
- Lezione 6: Gestione Rischi Estremi
- Lezione 7: Risk Management Portafoglio Completo
- Lezione 8: Mastery - Applicazione Reale
- Test finale (10 domande comprehensive)
- Learning objectives, quiz start/end, reflection prompts per ogni lezione
- 13 ore totali

**✅ Dopo**: `add-education-system-schema.sql`

#### 4.4 Modulo 3: Psicologia Finanziaria

**File**: `supabase/seed-education-module-3-psychology.sql`
**Descrizione**: Modulo su bias, emozioni, decisioni

- 4 lezioni
- Test finale
- 3 ore

**✅ Dopo**: `add-education-system-schema.sql`

#### 4.5 Modulo 3: Voglio Risparmiare

**File**: `supabase/seed-education-module-3-saving.sql`
**Descrizione**: Strategie scientifiche per accumulo capitale

- 3 lezioni (da espandere a 5)
- Test finale
- 4 ore

**✅ Dopo**: `add-education-system-schema.sql`

#### 4.6 Modulo 4: Strumenti Finanziari Base

**File**: `supabase/seed-education-module-4-instruments.sql`
**Descrizione**: Azioni, Obbligazioni, ETF, Fondi, Derivati, Crypto

- 6 lezioni (iniziato, da completare)
- Test finale
- 5 ore

**✅ Dopo**: `add-education-system-schema.sql`

#### 4.7 Modulo 4: Voglio Gestire il Mio Patrimonio

**File**: `supabase/seed-education-module-4-wealth-management.sql`
**Descrizione**: Wealth Management Evidence-Based

- 2 lezioni (da espandere a 4)
- Test finale
- 5 ore

**✅ Dopo**: `add-education-system-schema.sql`

#### 4.8 Modulo 5: Voglio Speculare

**File**: `supabase/seed-education-module-5-speculation.sql`
**Descrizione**: Trading e Speculazione - Cosa Dice la Ricerca

- 2 lezioni (da espandere a 4)
- Test finale
- 6 ore

**✅ Dopo**: `add-education-system-schema.sql`

---

### FASE 5: Popolamento Features Avanzate (Opzionale)

#### 5.1 Esempio Popolamento Features Avanzate

**File**: `supabase/example-populate-advanced-features.sql`
**Descrizione**: Template per popolare learning objectives, quiz, reflection prompts

- Esempio per Modulo 1, Lezione 1
- Template riutilizzabile per altri moduli/lezioni

**✅ Dopo**: `enhance-education-system-advanced.sql` e `seed-education-content.sql`

---

## 📊 Ordine Completo di Esecuzione

### Sequenza Obbligatoria (Minimo Funzionante)

1. ✅ **`add-education-system-schema.sql`** - Schema base (OBBLIGATORIO)
2. ✅ **`enhance-gamification-system.sql`** - Gamification avanzata
3. ✅ **`enhance-education-system-advanced.sql`** - Features avanzate apprendimento
4. ✅ **`seed-education-content.sql`** - Modulo 1 base
5. ✅ **`expand-module-1-foundations.sql`** - Espansione Modulo 1
6. ✅ **`module-2-risk-management-complete.sql`** - Modulo 2 completo

### Sequenza Completa (Tutti i Moduli)

1. ✅ `add-education-system-schema.sql`
2. ✅ `enhance-gamification-system.sql`
3. ✅ `enhance-education-system-advanced.sql`
4. ✅ `seed-education-content.sql`
5. ✅ `expand-module-1-foundations.sql`
6. ✅ `module-2-risk-management-complete.sql`
7. ✅ `seed-education-module-3-psychology.sql`
8. ✅ `seed-education-module-3-saving.sql`
9. ✅ `seed-education-module-4-instruments.sql`
10. ✅ `seed-education-module-4-wealth-management.sql`
11. ✅ `seed-education-module-5-speculation.sql`
12. ⚠️ `example-populate-advanced-features.sql` (opzionale, template)

---

## ⚠️ Note Importanti

### Dipendenze

- **Tutti gli script** dipendono da `add-education-system-schema.sql`
- Gli script di contenuti (`seed-*`, `module-*`) possono essere eseguiti in qualsiasi ordine DOPO lo schema base
- `enhance-gamification-system.sql` crea anche le tabelle base se non esistono (per compatibilità)

### Verifica Post-Esecuzione

Dopo aver eseguito gli script, verifica:

```sql
-- Verifica moduli creati
SELECT id, title, slug, order_index, estimated_hours
FROM education_modules
ORDER BY order_index;

-- Verifica lezioni
SELECT m.title as modulo, COUNT(l.id) as lezioni
FROM education_modules m
LEFT JOIN education_lessons l ON l.module_id = m.id
GROUP BY m.id, m.title
ORDER BY m.order_index;

-- Verifica test
SELECT m.title as modulo, COUNT(t.id) as test
FROM education_modules m
LEFT JOIN education_tests t ON t.module_id = m.id
GROUP BY m.id, m.title
ORDER BY m.order_index;

-- Verifica funzioni gamification
SELECT proname, prosrc
FROM pg_proc
WHERE proname IN ('add_education_xp', 'update_learning_streak', 'check_and_unlock_badge', 'calculate_user_level');

-- Verifica livelli
SELECT level_number, level_name, level_title, min_xp, max_xp
FROM education_levels
ORDER BY level_number;
```

### Errori Comuni

1. **"relation does not exist"**: Esegui prima `add-education-system-schema.sql`
2. **"duplicate key"**: Script già eseguito, usa `ON CONFLICT DO UPDATE` o `IF NOT EXISTS`
3. **"function does not exist"**: Verifica che le funzioni siano create correttamente

---

## 🎯 Checklist Esecuzione

- [ ] Eseguito `add-education-system-schema.sql`
- [ ] Eseguito `enhance-gamification-system.sql`
- [ ] Eseguito `enhance-education-system-advanced.sql`
- [ ] Eseguito `seed-education-content.sql`
- [ ] Eseguito `expand-module-1-foundations.sql`
- [ ] Eseguito `module-2-risk-management-complete.sql`
- [ ] Eseguito moduli aggiuntivi (3, 4, 5) se necessario
- [ ] Verificato moduli creati
- [ ] Verificato funzioni gamification
- [ ] Verificato livelli creati
- [ ] Testato API endpoints

---

## 📖 Documentazione Correlata

- `docs/education-ui-ux-best-practices.md` - Best practice UI/UX
- `docs/education-design-system.md` - Design system
- `docs/education-gamification-implementation.md` - Implementazione gamification
- `docs/education-system-best-practices.md` - Best practice sistema educativo
- `docs/education-implementation-guide.md` - Guida implementazione
- `docs/module-2-risk-structure.md` - Struttura Modulo 2
- `docs/module-2-risk-complete-spec.md` - Specifica completa Modulo 2
