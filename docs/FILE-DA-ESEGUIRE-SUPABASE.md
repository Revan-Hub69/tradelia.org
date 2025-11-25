# 📋 File da Eseguire su Supabase SQL Editor

## 🧹 STEP 0: PULIZIA MODULI VECCHI (IMPORTANTE!)

**Se vedi moduli vecchi nella dashboard** (es. "Fondamenti di Finanza Personale", "Approfondimento Universitario", "Livello Accademico e Scientifico"), esegui PRIMA questi script:

### File 0a: `supabase/verify-current-modules.sql`

**Cosa fa**: Mostra tutti i moduli attualmente nel database
**Quando**: Prima di tutto, per vedere cosa c'è

### File 0b: `supabase/cleanup-old-modules.sql`

**Cosa fa**: Rimuove moduli vecchi/non corretti
**Quando**: Dopo aver verificato, se ci sono moduli vecchi da rimuovere
**⚠️ ATTENZIONE**: Rimuove solo i moduli vecchi, mantiene quelli corretti

---

## ⚠️ ORDINE OBBLIGATORIO - Esegui in sequenza

---

## 1️⃣ SCHEMA BASE (Fondamentale)

### File 1: `supabase/add-education-system-schema.sql`

**Cosa fa**: Crea tutte le tabelle base del sistema educativo
**Tabelle**: education_modules, education_lessons, education_tests, education_questions, education_question_options, education_user_progress, education_pathways
**⚠️ DEVE essere eseguito PER PRIMO**

### File 2: `supabase/enhance-education-system-advanced.sql`

**Cosa fa**: Aggiunge tabelle per features avanzate
**Tabelle**: education_lesson_quizzes, education_learning_objectives, education_reflection_prompts
**⚠️ Dopo File 1**

### File 3: `supabase/enhance-gamification-system.sql`

**Cosa fa**: Sistema gamification completo
**Tabelle**: education_badges, education_user_badges, education_leaderboard
**⚠️ Dopo File 2**

---

## 2️⃣ SPACED REPETITION (Nuovo Sistema)

### File 4: `supabase/seed-education-spaced-repetition.sql`

**Cosa fa**: Sistema spaced repetition con algoritmo SM-2
**Tabelle**: spaced_repetition_items, spaced_repetition_reviews, adaptive_learning_progress
**Funzioni**: calculate_next_review_sm2, get_due_items
**⚠️ Dopo File 3**

---

## 3️⃣ CONTENUTI EDUCATIVI (Lezioni)

### File 5: `supabase/seed-education-content.sql`

**Cosa fa**: Modulo 1 - Fondamenti (4 lezioni)
**Contenuto**: Cos'è investimento, Diversificazione, Rischio, Costi
**⚠️ Dopo File 4**

### File 6: `supabase/seed-education-module-2-risk-management.sql`

**Cosa fa**: Modulo 2 - Gestione Rischio (3 lezioni)
**Contenuto**: Tassonomia rischi, Metriche quantitative, Strategie pratiche
**⚠️ Dopo File 5**

### File 7: `supabase/seed-education-module-3-saving.sql`

**Cosa fa**: Modulo 3 - Risparmio (3 lezioni)
**Contenuto**: Strategie risparmio, PAC, Budgeting
**⚠️ Dopo File 6**

### File 8: `supabase/seed-education-module-4-instruments.sql`

**Cosa fa**: Modulo 4 - Strumenti Finanziari (6 lezioni)
**Contenuto**: Stocks, Bonds, ETF, Funds, REIT, Commodities
**⚠️ Dopo File 7**

### File 9: `supabase/seed-education-module-4-wealth-management.sql`

**Cosa fa**: Modulo 4b - Wealth Management (2 lezioni)
**Contenuto**: Gestione patrimonio, Pianificazione finanziaria
**⚠️ Dopo File 8**

### File 10: `supabase/seed-education-module-5-speculation.sql`

**Cosa fa**: Modulo 5 - Trading (2 lezioni)
**Contenuto**: Trading base, Analisi tecnica
**⚠️ Dopo File 9**

---

## 📊 RIEPILOGO VELOCE

**Totale file da eseguire: 10**

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

## ✅ VERIFICA POST-ESECUZIONE

Dopo aver eseguito tutti i file, esegui questa query per verificare:

```sql
-- Conta moduli
SELECT COUNT(*) as total_modules FROM education_modules;

-- Conta lezioni
SELECT COUNT(*) as total_lessons FROM education_lessons;

-- Conta test
SELECT COUNT(*) as total_tests FROM education_tests;

-- Verifica moduli e lezioni
SELECT
  m.title as modulo,
  m.order_index,
  COUNT(l.id) as num_lezioni,
  COUNT(t.id) as num_test
FROM education_modules m
LEFT JOIN education_lessons l ON l.module_id = m.id
LEFT JOIN education_tests t ON t.module_id = m.id
GROUP BY m.id, m.title, m.order_index
ORDER BY m.order_index;
```

**Risultato atteso:**

- 5 moduli
- ~20 lezioni totali
- 5 test (uno per modulo)

---

## ⚠️ NOTE IMPORTANTI

1. **Ordine**: Rispetta l'ordine (schema → contenuti)
2. **Errori**: Se un file fallisce, verifica che le tabelle precedenti esistano
3. **Duplicati**: I file usano `ON CONFLICT` quindi possono essere rieseguiti
4. **Testing**: Dopo esecuzione, testa il sistema su frontend

---

## 🚫 FILE DA NON ESEGUIRE (per ora)

Questi file NON servono ora:

- `seed-education-all-lessons-tradelia.sql` (incompleto, solo 2 lezioni)
- `seed-education-content-tradelia.sql` (duplicato)
- `seed-education-pathway-pac-*.sql` (percorsi completi non ancora pronti)
- `module-2-risk-management-complete.sql` (versione avanzata, opzionale)
- `seed-education-module-3-psychology.sql` (opzionale)

---

## 📝 ISTRUZIONI ESECUZIONE

1. Vai su **Supabase Dashboard** → **SQL Editor**
2. Apri ogni file nell'ordine indicato
3. Copia e incolla il contenuto
4. Clicca **Run** (o F5)
5. Verifica che non ci siano errori
6. Passa al file successivo

---

## 🎯 RISULTATO FINALE

Dopo aver eseguito tutti i 10 file, avrai:

- ✅ Sistema educativo completo funzionante
- ✅ 5 moduli con ~20 lezioni
- ✅ Sistema gamification attivo
- ✅ Sistema spaced repetition attivo
- ✅ Quiz, objectives, reflections per ogni lezione
- ✅ Pronto per uso su frontend
