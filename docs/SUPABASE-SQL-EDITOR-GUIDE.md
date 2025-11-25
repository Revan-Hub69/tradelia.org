# Guida Completa: File da Eseguire su Supabase SQL Editor

## 📋 Ordine di Esecuzione

Esegui questi file **nell'ordine indicato** su Supabase Dashboard → SQL Editor.

---

## FASE 1: Schema Base (Se non già eseguiti)

### 1. Schema Principale
**File**: `supabase/schema.sql`
- **Descrizione**: Schema base del database
- **Quando**: Solo se database vuoto
- **⚠️ ATTENZIONE**: Verifica se già eseguito

### 2. Education System Schema
**File**: `supabase/add-education-system-schema.sql`
- **Descrizione**: Crea tutte le tabelle per il sistema educativo
- **Quando**: **OBBLIGATORIO** - Prima di tutto
- **Tabelle create**: education_modules, education_lessons, education_tests, education_questions, ecc.

### 3. Advanced Features Schema
**File**: `supabase/enhance-education-system-advanced.sql`
- **Descrizione**: Aggiunge tabelle per quiz durante lezioni, learning objectives, reflections
- **Quando**: **OBBLIGATORIO** - Dopo education-system-schema
- **Tabelle aggiunte**: education_lesson_quizzes, education_learning_objectives, education_reflection_prompts

### 4. Gamification System
**File**: `supabase/enhance-gamification-system.sql`
- **Descrizione**: Sistema di gamification (badges, points, leaderboard)
- **Quando**: **OBBLIGATORIO**
- **Tabelle**: education_badges, education_user_badges, education_leaderboard

---

## FASE 2: Spaced Repetition System

### 5. Spaced Repetition Schema
**File**: `supabase/seed-education-spaced-repetition.sql`
- **Descrizione**: Sistema spaced repetition con algoritmo SM-2
- **Quando**: **OBBLIGATORIO**
- **Tabelle**: spaced_repetition_items, spaced_repetition_reviews, adaptive_learning_progress
- **Funzioni**: calculate_next_review_sm2, get_due_items

---

## FASE 3: Contenuti Educativi Base

### 6. Modulo 1: Fondamenti
**File**: `supabase/seed-education-content.sql`
- **Descrizione**: Modulo 1 - Fondamenti di Investimento (4 lezioni)
- **Quando**: **OBBLIGATORIO**
- **Contenuto**: Lezioni base su investimenti, diversificazione, rischio, costi

### 7. Modulo 2: Gestione Rischio
**File**: `supabase/seed-education-module-2-risk-management.sql`
- **Descrizione**: Modulo 2 - Gestione Rischio (3 lezioni avanzate)
- **Quando**: **OBBLIGATORIO**
- **Contenuto**: Tassonomia rischi, metriche quantitative, strategie pratiche

### 8. Modulo 3: Risparmio
**File**: `supabase/seed-education-module-3-saving.sql`
- **Descrizione**: Modulo 3 - Risparmio e Accumulo (3 lezioni)
- **Quando**: **OBBLIGATORIO**
- **Contenuto**: Strategie risparmio, PAC, budgeting

### 9. Modulo 4: Strumenti Finanziari
**File**: `supabase/seed-education-module-4-instruments.sql`
- **Descrizione**: Modulo 4 - Strumenti Finanziari Base (6 lezioni)
- **Quando**: **OBBLIGATORIO**
- **Contenuto**: Stocks, Bonds, ETF, Funds, REIT, Commodities

### 10. Modulo 4b: Wealth Management
**File**: `supabase/seed-education-module-4-wealth-management.sql`
- **Descrizione**: Modulo 4b - Wealth Management (2 lezioni)
- **Quando**: **OBBLIGATORIO**
- **Contenuto**: Gestione patrimonio, pianificazione finanziaria

### 11. Modulo 5: Speculazione
**File**: `supabase/seed-education-module-5-speculation.sql`
- **Descrizione**: Modulo 5 - Trading e Speculazione (2 lezioni)
- **Quando**: **OBBLIGATORIO**
- **Contenuto**: Trading base, analisi tecnica

---

## FASE 4: Contenuti Avanzati (Opzionali)

### 12. Modulo 2 Avanzato
**File**: `supabase/module-2-risk-management-complete.sql`
- **Descrizione**: Modulo 2 versione completa avanzata (8 lezioni)
- **Quando**: **OPZIONALE** - Se vuoi versione completa
- **Nota**: Sostituisce o integra seed-education-module-2-risk-management.sql

### 13. Modulo 3 Psicologia
**File**: `supabase/seed-education-module-3-psychology.sql`
- **Descrizione**: Modulo 3b - Psicologia Finanziaria
- **Quando**: **OPZIONALE**
- **Contenuto**: Bias comportamentali, psicologia investimenti

---

## FASE 5: Popolamento Dati di Esempio

### 14. Esempio Popolamento Features Avanzate
**File**: `supabase/example-populate-advanced-features.sql`
- **Descrizione**: Popola dati di esempio per testare features avanzate
- **Quando**: **OPZIONALE** - Solo per testing
- **Contenuto**: Quiz, objectives, reflections di esempio

---

## 📊 Riepilogo File OBBLIGATORI

Esegui questi file **in ordine**:

1. ✅ `add-education-system-schema.sql`
2. ✅ `enhance-education-system-advanced.sql`
3. ✅ `enhance-gamification-system.sql`
4. ✅ `seed-education-spaced-repetition.sql`
5. ✅ `seed-education-content.sql`
6. ✅ `seed-education-module-2-risk-management.sql`
7. ✅ `seed-education-module-3-saving.sql`
8. ✅ `seed-education-module-4-instruments.sql`
9. ✅ `seed-education-module-4-wealth-management.sql`
10. ✅ `seed-education-module-5-speculation.sql`

---

## ⚠️ Note Importanti

1. **Ordine**: Rispetta l'ordine indicato (schema prima, poi contenuti)
2. **Errori**: Se un file fallisce, verifica dipendenze (tabelle già create?)
3. **Duplicati**: I file usano `ON CONFLICT` quindi possono essere rieseguiti
4. **Testing**: Dopo esecuzione, verifica con query:
   ```sql
   SELECT COUNT(*) FROM education_modules;
   SELECT COUNT(*) FROM education_lessons;
   SELECT COUNT(*) FROM education_tests;
   ```

---

## 🔍 Verifica Post-Esecuzione

Esegui queste query per verificare:

```sql
-- Verifica moduli
SELECT id, title, slug, order_index FROM education_modules ORDER BY order_index;

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
```

---

## 📝 File NON Necessari (per ora)

Questi file NON servono per il sistema educativo base:
- `schema.sql` (se già eseguito)
- `dashboard-complete-schema.sql` (altro sistema)
- `complete-module-4-instruments.sql` (duplicato)
- Altri file non-education

---

## ✅ Checklist Esecuzione

- [ ] Fase 1: Schema Base (4 file)
- [ ] Fase 2: Spaced Repetition (1 file)
- [ ] Fase 3: Contenuti Base (6 file)
- [ ] Verifica con query di controllo
- [ ] Test sistema educativo su frontend

