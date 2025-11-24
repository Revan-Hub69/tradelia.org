# Sistema Educativo: Best Practice Implementate

## 📚 Struttura Completa

### 1. **Learning Objectives Espliciti** ✅

- **Tabella**: `education_learning_objectives`
- **Bloom's Taxonomy**: remember, understand, apply, analyze, evaluate, create
- **Posizionamento**: Ogni modulo e lezione ha obiettivi chiari
- **Beneficio**: Utente sa cosa imparerà prima di iniziare

### 2. **Quiz Interattivi Durante Lezioni** ✅

- **Tabella**: `education_lesson_quizzes`
- **Posizioni**: start, middle, end, checkpoint (dopo paragrafo specifico)
- **Funzione**: Retrieval practice immediato durante apprendimento
- **Feedback**: Immediato, con spiegazioni
- **Paper**: Roediger & Karpicke (2006) - "Test-Enhanced Learning"

### 3. **Spaced Repetition System** ✅

- **Tabella**: `education_spaced_repetition`
- **Algoritmo**: SM-2 (SuperMemo, Wozniak 1987)
- **Funzione**: Ripasso ottimizzato basato su performance
- **Tracking**: Ease factor, interval days, repetitions, streak
- **Beneficio**: Consolidamento memoria a lungo termine

### 4. **Adaptive Difficulty** ✅

- **Tabella**: `education_question_performance`
- **Calcolo**: Difficulty score basato su performance globale/individuale
- **Uso**: Adatta difficoltà quiz in base a performance
- **Beneficio**: Personalizzazione apprendimento

### 5. **Reflection Prompts (Metacognition)** ✅

- **Tabella**: `education_reflection_prompts`
- **Tipi**: pre_lesson, post_lesson, mid_module, post_module
- **Funzione**: Self-regulated learning, metacognition
- **Paper**: Zimmerman (2002) - "Becoming a Self-Regulated Learner"

### 6. **Sistemi Già Implementati** ✅

- **Retrieval Practice**: `education-retrieval-practice.js`
- **Interleaving**: `education-interleaving.js`
- **Metacognition**: `education-metacognition.js`
- **Gamification**: Badges, XP, levels, streaks

## 🎯 Tecniche di Apprendimento Avanzato

### Retrieval Practice

- **Quando**: Durante lezioni (lesson quizzes), dopo lezioni (retrieval sessions)
- **Frequenza**: 3-5 domande per lezione
- **Feedback**: Immediato con spiegazioni
- **Paper**: Karpicke & Blunt (2011) - "Retrieval Practice Produces More Learning"

### Spaced Repetition

- **Quando**: Daily review session
- **Algoritmo**: SM-2 (SuperMemo)
- **Scheduling**: Automatico basato su performance
- **Paper**: Wozniak (1987) - SuperMemo Algorithm

### Interleaving

- **Quando**: Test finali, retrieval sessions
- **Strategia**: Mescola domande di tipi diversi
- **Beneficio**: Migliora transfer learning
- **Paper**: Rohrer & Taylor (2007) - "The Shuffling of Mathematics Problems Improves Learning"

### Metacognition

- **Quando**: Pre-lesson (self-assessment), post-lesson (reflection)
- **Prompt**: "Quanto conosci già?", "Cosa hai imparato?", "Cosa vuoi approfondire?"
- **Beneficio**: Self-regulated learning
- **Paper**: Winne & Hadwin (2008) - "The Weave of Motivation and Self-Regulated Learning"

### Scaffolding

- **Come**: Prerequisiti moduli, learning objectives, progressive disclosure
- **Beneficio**: Supporto graduale, ZPD (Vygotsky)
- **Paper**: Vygotsky (1978) - "Mind in Society"

## 📊 Struttura Quiz Completa

### Test Finale Modulo

- **Quando**: Fine modulo
- **Domande**: 5-7 domande
- **Bloom Levels**: Mix (remember, understand, apply, analyze)
- **Passing Score**: 70%
- **Max Attempts**: 3

### Lesson Quizzes (Nuovo!)

- **Quando**: Durante lezione (start/middle/end/checkpoint)
- **Domande**: 3-5 domande
- **Bloom Levels**: remember, understand (per consolidamento)
- **Required**: Opzionale (può essere required per proseguire)
- **Feedback**: Immediato

### Retrieval Practice Sessions

- **Quando**: On-demand, daily review
- **Domande**: 10-20 domande
- **Focus**: Consolidamento, spaced repetition
- **Score**: Non mostrato (low-stakes)

### Spaced Repetition Review

- **Quando**: Daily (domande scadute)
- **Domande**: 10-20 domande
- **Focus**: Consolidamento memoria
- **Algoritmo**: SM-2

## 🎓 Learning Objectives Template

Per ogni modulo/lezione, definire:

```sql
INSERT INTO education_learning_objectives (module_id, lesson_id, objective_text, bloom_level, order_index) VALUES
-- Al termine di questa lezione, sarai in grado di:
(module_id, lesson_id, 'Definire concetto X', 'remember', 1),
(module_id, lesson_id, 'Spiegare come funziona Y', 'understand', 2),
(module_id, lesson_id, 'Applicare formula Z in scenario reale', 'apply', 3),
(module_id, lesson_id, 'Analizzare pro/contro di W', 'analyze', 4);
```

## 📝 Reflection Prompts Template

### Pre-Lesson

- "Quanto conosci già questo argomento?" (1-5 scale)
- "Cosa ti aspetti di imparare?"
- "Hai domande specifiche?"

### Post-Lesson

- "Cosa hai imparato di nuovo?"
- "Quale concetto ti è risultato più difficile?"
- "Come applicherai questo nella pratica?"

### Mid-Module

- "Stai raggiungendo i tuoi obiettivi?"
- "Cosa vuoi approfondire?"
- "Hai bisogno di supporto?"

### Post-Module

- "Quali sono i 3 concetti chiave che hai appreso?"
- "Come cambierà il tuo approccio?"
- "Cosa vuoi studiare dopo?"

## 🚀 Prossimi Passi

1. ✅ Schema database avanzato creato
2. ⏳ Creare learning objectives per tutti i moduli esistenti
3. ⏳ Creare lesson quizzes per tutte le lezioni (3-5 domande per lezione)
4. ⏳ Integrare spaced repetition nel frontend
5. ⏳ Aggiungere reflection prompts a tutte le lezioni
6. ⏳ Implementare adaptive difficulty nel frontend
7. ⏳ Creare dashboard spaced repetition (daily review)

## 📖 Riferimenti Accademici

- **Bloom's Taxonomy**: Bloom (1956), Anderson & Krathwohl (2001)
- **Retrieval Practice**: Roediger & Karpicke (2006), Karpicke & Blunt (2011)
- **Spaced Repetition**: Ebbinghaus (1885), Wozniak (1987)
- **Interleaving**: Rohrer & Taylor (2007), Birnbaum et al. (2013)
- **Metacognition**: Zimmerman (2002), Winne & Hadwin (2008)
- **Scaffolding**: Vygotsky (1978), Chi et al. (1981)
- **Gamification**: Deterding et al. (2011), Sailer et al. (2017)
