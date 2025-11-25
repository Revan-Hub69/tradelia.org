# Piano Implementazione Sistema Learning #1

## Obiettivo

Implementare le 4 feature critiche per diventare il miglior sistema di learning al mondo:

1. Spaced Repetition
2. Retrieval Practice
3. Adaptive Learning
4. Interattività

---

## Fase 1: Database Schema (Supabase)

### Tabella: `spaced_repetition_items`

```sql
CREATE TABLE spaced_repetition_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  item_type TEXT NOT NULL, -- concept, formula, definition, key_point
  module_id UUID REFERENCES education_modules(id),
  lesson_id UUID REFERENCES education_lessons(id),
  content TEXT NOT NULL,
  question TEXT,
  answer TEXT,
  repetitions INTEGER DEFAULT 0,
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  interval_days INTEGER DEFAULT 0,
  next_review_date TIMESTAMPTZ,
  last_review_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabella: `spaced_repetition_reviews`

```sql
CREATE TABLE spaced_repetition_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES spaced_repetition_items(id),
  user_id UUID REFERENCES auth.users(id),
  quality INTEGER NOT NULL, -- 0-5
  review_date TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabella: `adaptive_learning_progress`

```sql
CREATE TABLE adaptive_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  module_id UUID REFERENCES education_modules(id),
  lesson_id UUID REFERENCES education_lessons(id),
  mastery_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  difficulty_level INTEGER DEFAULT 1, -- 1-5
  attempts INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  last_attempt_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Fase 2: API Endpoints

### `/api/education.js` - Nuovi endpoints

1. **POST `/api/education?action=save-spaced-repetition`**
   - Salva review result
   - Calcola next review date (SM-2)

2. **GET `/api/education?action=get-due-flashcards`**
   - Restituisce flashcards da rivedere oggi

3. **POST `/api/education?action=create-spaced-repetition-item`**
   - Crea nuovo item per spaced repetition

4. **POST `/api/education?action=update-mastery`**
   - Aggiorna mastery score dopo quiz/test

5. **GET `/api/education?action=get-adaptive-difficulty`**
   - Restituisce difficoltà adattiva per utente/lezione

---

## Fase 3: Frontend Components

### File: `education-spaced-repetition.js`

- Classe `SpacedRepetitionSystem`
- Algoritmo SM-2
- Gestione review

### File: `education-retrieval-practice.js`

- Classe `RetrievalPracticeSystem`
- Flashcard component
- Quiz frequenti

### File: `education-adaptive-learning.js`

- Classe `AdaptiveLearningSystem`
- Mastery learning
- Difficoltà adattiva

### File: `education-interactive-tools.js`

- Portfolio simulator
- Calculators (50+)
- Case studies interattivi

---

## Fase 4: Integrazione

1. Integrare in `education.js`
2. Aggiungere UI components
3. Collegare a gamification (XP per review)
4. Dashboard spaced repetition

---

## Priorità Implementazione

1. ✅ Database schema (primo)
2. ✅ API endpoints (secondo)
3. ✅ Spaced Repetition frontend (terzo)
4. ✅ Retrieval Practice frontend (quarto)
5. ⏭️ Adaptive Learning (quinto)
6. ⏭️ Interattività (sesto)

---

## Domande per Te

1. **Vuoi che inizi con database schema?** (SQL per Supabase)
2. **O preferisci vedere prima il frontend?** (JavaScript components)
3. **O vuoi un documento completo prima?** (specifiche dettagliate)

**Come preferisci procedere?**
