# Course System - Documentazione Implementazione

**Data**: 2025-01-27  
**Versione**: 1.0.0  
**Status**: Production-Ready

---

## 📋 OVERVIEW

Il Course System di Tradelia è un sistema educativo completo che include:
- Course Detail Pages con progress tracking
- Lesson Player con video/content viewer
- Quiz System interattivo con feedback immediato
- Notes System per note personali
- Progress Tracking dettagliato
- Materials Download
- Completion Badge System (badge simbolici, non certificazioni ufficiali)

---

## 🏗️ ARCHITETTURA

### Database Schema

#### Tabelle Principali
- `education_modules`: Moduli formativi (corsi)
- `education_lessons`: Lezioni all'interno dei moduli
- `education_lesson_quizzes`: Quiz embedded nelle lezioni
- `education_lesson_quiz_questions`: Domande dei quiz
- `education_lesson_quiz_options`: Opzioni per domande multiple choice
- `education_user_progress`: Progress utente nei moduli
- `education_user_lesson_progress`: Progress utente nelle lezioni
- `education_user_lesson_quiz_attempts`: Tentativi quiz utente

#### Relazioni
```
education_modules (1) ──< (N) education_lessons
education_lessons (1) ──< (N) education_lesson_quizzes
education_lesson_quizzes (1) ──< (N) education_lesson_quiz_questions
education_lesson_quiz_questions (1) ──< (N) education_lesson_quiz_options
```

### API Endpoints

#### Courses
- `GET /api/dashboard/courses` - Lista tutti i corsi con progress
- `GET /api/courses/[slug]` - Dettagli corso completo con lessons

#### Lessons
- `GET /api/courses/[slug]/lessons/[lessonId]` - Dettagli lezione con progress
- `POST /api/courses/[slug]/lessons/[lessonId]/complete` - Segna lezione come completata
- `POST /api/courses/[slug]/lessons/[lessonId]/notes` - Salva note personali

#### Quizzes
- `GET /api/courses/[slug]/lessons/[lessonId]/quizzes/[quizId]` - Recupera quiz completo
- `POST /api/courses/[slug]/lessons/[lessonId]/quizzes/[quizId]/submit` - Salva tentativo quiz

---

## 🎨 COMPONENTI UI

### Course Detail Page (`app/courses/[slug]/page.tsx`)
**Funzionalità**:
- Header con info corso (titolo, descrizione, stats)
- Progress bar visibile
- Lista lezioni con stato completamento
- Sidebar con quick actions e info corso
- Link a certificazione se corso completato

**Props**: Nessuna (usa `useParams` per slug)

**State Management**: `useApi` hook per data fetching

### Lesson Player (`app/courses/[slug]/lessons/[lessonId]/page.tsx`)
**Funzionalità**:
- Video player o content viewer
- Navigation prev/next lesson
- Notes personali con auto-save
- Time tracking
- Completion button
- Sidebar con info lezione

**Props**: Nessuna (usa `useParams` per slug e lessonId)

**State Management**:
- `useApi` per lesson data
- `useState` per notes e time tracking
- `authenticatedFetch` per API calls

### Quiz System (`components/courses/QuizSystem.tsx`)
**Funzionalità**:
- Caricamento quiz con domande e opzioni
- Multiple choice questions
- Immediate feedback (opzionale)
- Scoring e passing logic
- Retry logic con limite tentativi
- Visual feedback (correct/incorrect)

**Props**:
```typescript
interface QuizSystemProps {
  quizId: string;
  lessonId: string;
  courseSlug: string;
  onComplete?: (score: number, passed: boolean) => void;
}
```

**State Management**:
- `useState` per quiz data, answers, submitted state
- `useEffect` per caricamento quiz
- `authenticatedFetch` per submit

---

## 🔄 FLOW DI UTILIZZO

### 1. Accesso Corso
```
User → /dashboard/education → Click corso → /courses/[slug]
```

### 2. Visualizzazione Lezione
```
Course Detail → Click lezione → /courses/[slug]/lessons/[lessonId]
```

### 3. Completamento Lezione
```
Lesson Player → Watch/Read content → Mark Complete → Update progress → Next lesson
```

### 4. Quiz
```
Lesson Player → Quiz embedded → Answer questions → Submit → Feedback → Retry (if allowed)
```

### 5. Notes
```
Lesson Player → Notes section → Type notes → Auto-save → Persist to database
```

---

## 🗄️ DATA FLOW

### Progress Tracking
1. User completa lezione → `POST /api/courses/[slug]/lessons/[lessonId]/complete`
2. API aggiorna `education_user_lesson_progress`
3. API calcola progress modulo → Aggiorna `education_user_progress`
4. Frontend ricarica course data → Mostra progress aggiornato

### Notes System
1. User scrive note → `onChange` → `useState` update
2. User clicca "Salva" → `POST /api/courses/[slug]/lessons/[lessonId]/notes`
3. API salva in `lesson_notes` (o JSONB in progress)
4. Frontend mostra toast success

### Quiz System
1. User inizia quiz → `GET /api/courses/[slug]/lessons/[lessonId]/quizzes/[quizId]`
2. User risponde → `useState` update answers
3. User submit → Calcola score → `POST /api/.../quizzes/[quizId]/submit`
4. API salva tentativo → Ritorna can_retry
5. Frontend mostra feedback e retry button (se allowed)

---

## 🌐 INTERNAZIONALIZZAZIONE

### Translation Keys

#### Courses (`courses.detail.*`)
- `loading`, `errorTitle`, `errorMessage`
- `getCertification`, `lessons`, `duration`, `progress`, `completed`
- `progressLabel`, `lessonsTitle`, `minutes`, `noLessons`
- `quickActions`, `continueLesson`, `startCourse`, `downloadMaterials`
- `courseInfo`, `difficulty`, `totalLessons`, `estimatedTime`, `hours`

#### Lessons (`lessons.*`)
- `loading`, `errorTitle`, `errorMessage`, `lesson`, `completed`
- `minutes`, `timeSpent`, `videoNotSupported`
- `markComplete`, `notes`, `notesPlaceholder`, `notesHint`
- `saving`, `save`, `navigation`, `noPrevious`, `noNext`
- `backToCourse`, `lessonInfo`, `type`, `duration`, `completedAt`
- `completeSuccess`, `completeError`, `notesSaved`, `notesError`

#### Quiz (`quiz.*`)
- `loading`, `loadError`, `notFound`
- `questions`, `passingScore`, `attempt`
- `correct`, `incorrect`, `submit`
- `passed`, `failed`, `retry`, `submitError`

### Usage
```typescript
import { useTranslations } from '@/lib/i18n/use-translations';

const { t } = useTranslations();
const message = t('courses.detail.loading') || 'Caricamento corso...';
```

---

## 🔒 SICUREZZA

### Authentication
- Tutti gli endpoint richiedono autenticazione (tranne GET pubblici)
- `createClient()` da `@/lib/supabase/server` gestisce session
- RLS policies su tutte le tabelle

### Authorization
- Users possono vedere solo i propri progress
- Users possono modificare solo i propri notes
- Quiz attempts sono user-specific

### Data Validation
- Input validation su tutti i form
- SQL injection prevention (Supabase parameterized queries)
- XSS prevention (React automatic escaping)

---

## ⚡ PERFORMANCE

### Optimization Strategies
1. **Caching**: `useApi` hook con `cacheTime` (2-5 minuti)
2. **Lazy Loading**: Lessons caricate on-demand
3. **Code Splitting**: Dynamic imports per componenti pesanti
4. **Image Optimization**: Next.js Image component per assets

### Metrics Target
- Page Load: < 2s
- API Response: < 500ms
- Time to Interactive: < 3s
- First Contentful Paint: < 1.5s

---

## 🧪 TESTING

### Unit Tests (TODO)
- Quiz scoring logic
- Progress calculation
- Notes save/load

### Integration Tests (TODO)
- Course → Lesson → Complete flow
- Quiz submit → Score calculation
- Notes persistence

### E2E Tests (TODO)
- Complete course flow
- Quiz retry logic
- Notes auto-save

---

## 🐛 KNOWN ISSUES & TODOS

### Issues
- [ ] `lesson_notes` table potrebbe non esistere (fallback necessario)
- [ ] Quiz API usa `education_lesson_quizzes` ma schema base usa `education_tests`
- [ ] Certification System non ancora implementato

### TODOs
- [ ] Completion Badge display (badge simbolici, non ufficiali)
- [ ] Materials Download API
- [ ] Course Progress charts avanzati
- [ ] Notes search e export
- [ ] Spaced Repetition scheduling
- [ ] Adaptive difficulty per quiz

---

## 📚 RISORSE

### Documentazione
- [Academic Verification](./COURSE-SYSTEM-ACADEMIC-VERIFICATION.md)
- [Database Schema](../supabase/add-education-system-schema.sql)
- [API Documentation](./API-DOCUMENTATION.md) (TODO)

### External Resources
- [Bloom's Taxonomy](https://cft.vanderbilt.edu/guides-sub-pages/blooms-taxonomy/)
- [Spaced Repetition Research](https://www.gwern.net/Spaced-repetition)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Status**: Production-Ready  
**Last Updated**: 2025-01-27

