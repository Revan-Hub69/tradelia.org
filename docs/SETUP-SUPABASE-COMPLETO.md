# 🚀 Setup Completo Supabase - Sistema Educativo Tradelia

## 📌 Come Eseguire gli Script

### Opzione 1: SQL Editor (Attuale - OK per Sviluppo)

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Vai a **SQL Editor**
4. Copia e incolla ogni script nell'ordine indicato
5. Clicca **Run**

### Opzione 2: Supabase CLI (Best Practice - Raccomandato per Produzione)

```bash
# Installa Supabase CLI
npm install -g supabase

# Inizializza (se non fatto)
supabase init

# Link progetto
supabase link --project-ref your-project-ref

# Converti script in migrations e push
supabase migration new add_education_system
# (copia contenuto script nella migration)
supabase db push
```

**Vedi**: `docs/supabase-deployment-strategies.md` per dettagli completi

---

## ⚠️ IMPORTANTE: Ordine di Esecuzione

**Esegui gli script IN QUESTO ORDINE ESATTO** per evitare errori di dipendenze.

---

## 📋 FASE 1: Schema Base (OBBLIGATORIO - PRIMO)

### 1. Schema Sistema Educativo Base

**File**: `supabase/add-education-system-schema.sql`

**Cosa crea:**

- ✅ Tabelle base: `education_modules`, `education_lessons`, `education_tests`, `education_questions`, `education_question_options`
- ✅ Tabelle progress: `education_user_progress`, `education_user_lesson_progress`, `education_user_test_attempts`
- ✅ Tabelle gamification base: `education_badges`, `education_user_badges`, `education_user_stats`
- ✅ Tabelle pathways: `education_pathways`, `education_pathway_modules`
- ✅ Funzioni base e RLS policies

**⚠️ DEVI ESEGUIRE QUESTO PRIMA DI TUTTI GLI ALTRI**

---

## 📋 FASE 2: Gamification Avanzata

### 2. Sistema Gamification Professionale

**File**: `supabase/enhance-gamification-system.sql`

**Cosa crea:**

- ✅ `education_levels` (5 livelli: Foundation → Grandmaster)
- ✅ `education_xp_transactions` (tracking dettagliato XP)
- ✅ `education_badge_progress` (badge progressivi)
- ✅ `education_streak_rewards` (reward streak)
- ✅ `education_user_streaks` (daily/weekly/monthly)
- ✅ `education_achievements` (achievement complessi)
- ✅ `education_quests` (quest system)
- ✅ `education_community_goals` (community goals)
- ✅ Funzioni: `add_education_xp`, `update_learning_streak`, `check_and_unlock_badge`, `calculate_user_level`
- ✅ Seed data: 5 livelli, streak rewards

**✅ Dopo**: `add-education-system-schema.sql`

**Nota**: Questo script crea anche le tabelle base se non esistono (per compatibilità)

---

## 📋 FASE 3: Sistema Avanzato Apprendimento

### 3. Features Avanzate Apprendimento

**File**: `supabase/enhance-education-system-advanced.sql`

**Cosa crea:**

- ✅ `education_learning_objectives` (obiettivi espliciti Bloom Taxonomy)
- ✅ `education_lesson_quizzes` (quiz durante lezioni)
- ✅ `education_lesson_quiz_questions`, `education_lesson_quiz_options`
- ✅ `education_user_lesson_quiz_attempts`
- ✅ `education_spaced_repetition` (sistema SM-2)
- ✅ `education_spaced_repetition_sessions`
- ✅ `education_question_performance` (adaptive difficulty)
- ✅ `education_reflection_prompts` (metacognition)
- ✅ `education_user_reflections`
- ✅ Funzioni: `update_spaced_repetition`, `get_spaced_repetition_questions`, `update_question_difficulty`

**✅ Dopo**: `add-education-system-schema.sql`

---

## 📋 FASE 4: Contenuti Educativi

### 4. Modulo 1: Fondamenti di Investimento (Base)

**File**: `supabase/seed-education-content.sql`

**Cosa crea:**

- ✅ Modulo 1: "Fondamenti di Investimento"
- ✅ 4 lezioni iniziali
- ✅ Test finale (5 domande)
- ✅ Badge base

**✅ Dopo**: `add-education-system-schema.sql`

---

### 5. Espansione Modulo 1: Fondamenti (6 Lezioni)

**File**: `supabase/expand-module-1-foundations.sql`

**Cosa crea:**

- ✅ Aggiunge 2 lezioni: "Inflazione e Potere d'Acquisto", "Tassazione degli Investimenti"
- ✅ Aggiorna test a 7 domande
- ✅ Aggiorna ore stimate a 4 ore

**✅ Dopo**: `seed-education-content.sql`

---

### 6. Modulo 2: Gestione Rischio e Rischi (COMPLETO - AVANZATISSIMO)

**File**: `supabase/module-2-risk-management-complete.sql`

**Cosa crea:**

- ✅ Modulo 2: "Gestione Rischio e Rischi: Analisi Completa e Professionale"
- ✅ **8 lezioni progressive** (Intermediate → Expert):
  1. Tassonomia Completa dei Rischi (13 tipi)
  2. Metriche Quantitative Avanzate (VaR, CVaR, Sharpe, Sortino)
  3. Strategie Pratiche di Gestione Rischio
  4. Risk Management Avanzato
  5. Risk Management Professionale
  6. Gestione Rischi Estremi
  7. Risk Management Portafoglio Completo
  8. Mastery - Applicazione Reale
- ✅ Test finale (10 domande comprehensive)
- ✅ Learning objectives per ogni lezione
- ✅ Quiz start/end per ogni lezione
- ✅ Reflection prompts (pre/post lezione)
- ✅ 13 ore totali

**✅ Dopo**: `add-education-system-schema.sql` e `seed-education-content.sql` (per prerequisite)

---

### 7. Modulo 3: Psicologia Finanziaria

**File**: `supabase/seed-education-module-3-psychology.sql`

**Cosa crea:**

- ✅ Modulo 3: "Psicologia Finanziaria: Bias, Emozioni e Decisioni"
- ✅ 4 lezioni
- ✅ Test finale
- ✅ 3 ore

**✅ Dopo**: `add-education-system-schema.sql`

---

### 8. Modulo 3: Voglio Risparmiare

**File**: `supabase/seed-education-module-3-saving.sql`

**Cosa crea:**

- ✅ Modulo: "Voglio Risparmiare: Strategie Scientifiche per Accumulo Capitale"
- ✅ 3 lezioni (da espandere a 5)
- ✅ Test finale
- ✅ 4 ore

**✅ Dopo**: `add-education-system-schema.sql`

---

### 9. Modulo 4: Strumenti Finanziari Base

**File**: `supabase/seed-education-module-4-instruments.sql`

**Cosa crea:**

- ✅ Modulo: "Strumenti Finanziari Base: Azioni, Obbligazioni, ETF e Altro"
- ✅ 6 lezioni (iniziato, da completare)
- ✅ Test finale
- ✅ 5 ore

**✅ Dopo**: `add-education-system-schema.sql`

---

### 10. Modulo 4: Voglio Gestire il Mio Patrimonio

**File**: `supabase/seed-education-module-4-wealth-management.sql`

**Cosa crea:**

- ✅ Modulo: "Voglio Gestire il Mio Patrimonio: Wealth Management Evidence-Based"
- ✅ 2 lezioni (da espandere a 4)
- ✅ Test finale
- ✅ 5 ore

**✅ Dopo**: `add-education-system-schema.sql`

---

### 11. Modulo 5: Voglio Speculare

**File**: `supabase/seed-education-module-5-speculation.sql`

**Cosa crea:**

- ✅ Modulo: "Voglio Speculare: Trading e Speculazione - Cosa Dice la Ricerca"
- ✅ 2 lezioni (da espandere a 4)
- ✅ Test finale
- ✅ 6 ore

**✅ Dopo**: `add-education-system-schema.sql`

---

## 📋 FASE 5: Popolamento Features Avanzate (Opzionale)

### 12. Esempio Popolamento Features Avanzate

**File**: `supabase/example-populate-advanced-features.sql`

**Cosa crea:**

- ✅ Template per popolare learning objectives, quiz, reflection prompts
- ✅ Esempio per Modulo 1, Lezione 1
- ✅ Template riutilizzabile per altri moduli/lezioni

**✅ Dopo**: `enhance-education-system-advanced.sql` e `seed-education-content.sql`

---

## 🎯 ORDINE COMPLETO DI ESECUZIONE

### Sequenza Minima (Sistema Funzionante)

1. ✅ **`add-education-system-schema.sql`** ⚠️ OBBLIGATORIO PRIMO
2. ✅ **`enhance-gamification-system.sql`**
3. ✅ **`enhance-education-system-advanced.sql`**
4. ✅ **`seed-education-content.sql`**
5. ✅ **`expand-module-1-foundations.sql`**
6. ✅ **`module-2-risk-management-complete.sql`**

### Sequenza Completa (Tutti i Moduli)

1. ✅ `add-education-system-schema.sql` ⚠️ PRIMO
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

## ✅ Verifica Post-Esecuzione

Dopo aver eseguito gli script, esegui queste query per verificare:

```sql
-- 1. Verifica moduli creati
SELECT id, title, slug, order_index, estimated_hours, difficulty_level
FROM education_modules
WHERE is_active = true
ORDER BY order_index;

-- 2. Verifica lezioni per modulo
SELECT
  m.title as modulo,
  m.order_index,
  COUNT(l.id) as lezioni,
  SUM(l.estimated_minutes) as minuti_totali
FROM education_modules m
LEFT JOIN education_lessons l ON l.module_id = m.id AND l.is_active = true
WHERE m.is_active = true
GROUP BY m.id, m.title, m.order_index
ORDER BY m.order_index;

-- 3. Verifica test per modulo
SELECT
  m.title as modulo,
  COUNT(t.id) as test,
  SUM((SELECT COUNT(*) FROM education_questions q WHERE q.test_id = t.id)) as domande_totali
FROM education_modules m
LEFT JOIN education_tests t ON t.module_id = m.id AND t.is_active = true
WHERE m.is_active = true
GROUP BY m.id, m.title
ORDER BY m.order_index;

-- 4. Verifica funzioni gamification
SELECT proname, proargnames, prosrc
FROM pg_proc
WHERE proname IN (
  'add_education_xp',
  'update_learning_streak',
  'check_and_unlock_badge',
  'calculate_user_level',
  'update_spaced_repetition',
  'get_spaced_repetition_questions',
  'update_question_difficulty'
)
ORDER BY proname;

-- 5. Verifica livelli creati
SELECT level_number, level_name, level_title, min_xp, max_xp, color_hex
FROM education_levels
ORDER BY level_number;

-- 6. Verifica streak rewards
SELECT streak_days, xp_reward, description
FROM education_streak_rewards
ORDER BY streak_days;

-- 7. Verifica tabelle avanzate
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'education_%'
ORDER BY table_name;
```

---

## ⚠️ Errori Comuni e Soluzioni

### 1. "relation does not exist"

**Causa**: Script eseguito fuori ordine
**Soluzione**: Esegui prima `add-education-system-schema.sql`

### 2. "policy already exists"

**Causa**: Script già eseguito parzialmente
**Soluzione**: Gli script ora usano `DROP POLICY IF EXISTS` - ri-esegui lo script

### 3. "column prerequisites does not exist"

**Causa**: Schema base non aggiornato
**Soluzione**: Esegui `add-education-system-schema.sql` (ora include `prerequisites`)

### 4. "syntax error at or near UNIQUE"

**Causa**: Constraint UNIQUE con COALESCE
**Soluzione**: Corretto - usa `CONSTRAINT unique_name UNIQUE(...)`

### 5. "duplicate key value"

**Causa**: Script già eseguito
**Soluzione**: Gli script usano `ON CONFLICT DO UPDATE` - ri-eseguire è sicuro

---

## 📊 Statistiche Finali Attese

Dopo esecuzione completa:

- **Moduli**: 5+ (1 base + 1 espanso + 1 completo avanzato + 3 opzionali)
- **Lezioni**: 25+ (6 + 8 + 4 + 3 + 6 + 2 + 2)
- **Test**: 5+ (uno per modulo)
- **Domande**: 50+ (7 + 10 + altre)
- **Ore Totali**: 40+ ore
- **Livelli**: 5 (Foundation → Grandmaster)
- **Funzioni**: 7+ (gamification + apprendimento avanzato)

---

## 🎯 Checklist Esecuzione

- [ ] Eseguito `add-education-system-schema.sql` ⚠️ PRIMO
- [ ] Eseguito `enhance-gamification-system.sql`
- [ ] Eseguito `enhance-education-system-advanced.sql`
- [ ] Eseguito `seed-education-content.sql`
- [ ] Eseguito `expand-module-1-foundations.sql`
- [ ] Eseguito `module-2-risk-management-complete.sql`
- [ ] Eseguito moduli aggiuntivi (3, 4, 5) se necessario
- [ ] Verificato moduli creati (query 1)
- [ ] Verificato lezioni (query 2)
- [ ] Verificato test (query 3)
- [ ] Verificato funzioni (query 4)
- [ ] Verificato livelli (query 5)
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
- `docs/supabase-setup-complete.md` - Setup completo (dettagliato)

---

## 🚀 Pronto per Avviare!

Tutti gli script sono stati corretti e sono pronti per l'esecuzione. Segui l'ordine sopra e verifica con le query di controllo.
