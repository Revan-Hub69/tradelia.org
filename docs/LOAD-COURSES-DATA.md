# Caricamento Dati Corsi su Supabase

**Data**: 2025-01-27  
**Status**: Guida per caricare lezioni e corsi

---

## 📋 OVERVIEW

I corsi e le lezioni devono essere caricati manualmente su Supabase. Esistono già script SQL di seed pronti all'uso.

---

## 🗂️ STRUTTURA DATI

### Tabelle Principali

1. **`education_modules`** - Moduli formativi (corsi)
   - `id`, `title`, `description`, `slug`, `order_index`
   - `difficulty_level`, `estimated_hours`, `is_active`

2. **`education_lessons`** - Lezioni all'interno dei moduli
   - `id`, `module_id`, `title`, `content`, `content_type`
   - `order_index`, `estimated_minutes`, `is_active`

3. **`education_tests`** - Quiz/Test per moduli
   - `id`, `module_id`, `title`, `passing_score`, `max_attempts`

4. **`education_questions`** - Domande per i test
   - `id`, `test_id`, `question_text`, `question_type`, `options`, `correct_answer`

---

## 📝 SCRIPT DI SEED DISPONIBILI

Nella cartella `supabase/` sono disponibili i seguenti script:

### Script Principali

1. **`add-education-system-schema.sql`**
   - Crea tutte le tabelle necessarie
   - **Eseguire PRIMA di tutto**

2. **`seed-education-content-tradelia.sql`**
   - Seed completo con contenuti Tradelia AI
   - Modulo 1: Fondamenti di Investimento

3. **`seed-education-all-lessons-tradelia.sql`**
   - Tutte le lezioni per tutti i moduli

4. **Moduli Specifici:**
   - `seed-education-module-2-risk-management.sql`
   - `seed-education-module-3-psychology.sql`
   - `seed-education-module-3-saving.sql`
   - `seed-education-module-4-instruments.sql`
   - `seed-education-module-4-wealth-management.sql`
   - `seed-education-module-5-speculation.sql`

5. **Pathway Completi:**
   - `seed-education-pathway-pac-tradelia.sql`
   - `seed-education-pathway-pac-complete.sql`

---

## 🚀 PROCEDURA DI CARICAMENTO

### Opzione 1: Via Supabase Dashboard (Raccomandato)

1. **Accedi a Supabase Dashboard**
   - Vai su https://supabase.com/dashboard
   - Seleziona il tuo progetto

2. **Apri SQL Editor**
   - Clicca su "SQL Editor" nel menu laterale
   - Clicca su "New query"

3. **Esegui Script in Ordine:**
   ```sql
   -- 1. Prima crea lo schema (se non esiste)
   -- Copia e incolla il contenuto di: supabase/add-education-system-schema.sql
   
   -- 2. Poi carica i dati
   -- Copia e incolla il contenuto di: supabase/seed-education-content-tradelia.sql
   
   -- 3. Carica lezioni aggiuntive (opzionale)
   -- Copia e incolla il contenuto di: supabase/seed-education-all-lessons-tradelia.sql
   ```

4. **Verifica i Dati**
   ```sql
   -- Conta moduli
   SELECT COUNT(*) FROM education_modules;
   
   -- Conta lezioni
   SELECT COUNT(*) FROM education_lessons;
   
   -- Vedi moduli
   SELECT id, title, slug, order_index FROM education_modules ORDER BY order_index;
   ```

### Opzione 2: Via CLI Supabase

```bash
# Se hai Supabase CLI installato
supabase db reset  # Reset database (ATTENZIONE: cancella tutti i dati)
supabase db push   # Applica migrazioni

# Oppure esegui script specifici
psql -h <your-db-host> -U postgres -d postgres -f supabase/add-education-system-schema.sql
psql -h <your-db-host> -U postgres -d postgres -f supabase/seed-education-content-tradelia.sql
```

### Opzione 3: Via API (Programmatico)

Puoi creare uno script Node.js/TypeScript per caricare i dati:

```typescript
// scripts/seed-courses.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Usa service role key per bypass RLS
);

async function seedCourses() {
  // Carica moduli
  const { data: modules, error: modulesError } = await supabase
    .from('education_modules')
    .insert([
      {
        title: 'Fondamenti di Investimento',
        slug: 'fondamenti-investimento',
        description: '...',
        order_index: 1,
        difficulty_level: 'beginner',
        estimated_hours: 3,
        is_active: true,
      },
      // ... altri moduli
    ]);

  // Carica lezioni per ogni modulo
  // ...
}
```

---

## 📊 VERIFICA DATI CARICATI

### Query di Verifica

```sql
-- 1. Verifica moduli attivi
SELECT 
  id, 
  title, 
  slug, 
  order_index,
  difficulty_level,
  estimated_hours,
  is_active
FROM education_modules
WHERE is_active = true
ORDER BY order_index;

-- 2. Verifica lezioni per modulo
SELECT 
  m.title as module_title,
  l.title as lesson_title,
  l.order_index,
  l.estimated_minutes,
  l.content_type,
  l.is_active
FROM education_modules m
LEFT JOIN education_lessons l ON l.module_id = m.id
WHERE m.is_active = true
ORDER BY m.order_index, l.order_index;

-- 3. Conta lezioni per modulo
SELECT 
  m.title,
  COUNT(l.id) as lesson_count,
  SUM(l.estimated_minutes) as total_minutes
FROM education_modules m
LEFT JOIN education_lessons l ON l.module_id = m.id AND l.is_active = true
WHERE m.is_active = true
GROUP BY m.id, m.title
ORDER BY m.order_index;
```

---

## ⚠️ NOTE IMPORTANTI

1. **RLS Policies**: Assicurati che le RLS policies siano configurate correttamente per permettere agli utenti di leggere i corsi.

2. **Slug Unici**: Ogni modulo deve avere uno `slug` unico. Gli script usano `ON CONFLICT` per evitare duplicati.

3. **Order Index**: Mantieni `order_index` sequenziale per ogni modulo e lezione.

4. **Content Type**: Le lezioni possono essere:
   - `text` - Contenuto markdown
   - `video` - URL video (YouTube, Vimeo, etc.)
   - `interactive` - Contenuto interattivo
   - `pdf` - URL PDF

5. **Backup**: Fai sempre un backup del database prima di eseguire script di seed.

---

## 🔄 AGGIUNGERE NUOVI CORSI

Per aggiungere nuovi corsi:

1. **Crea il Modulo:**
   ```sql
   INSERT INTO education_modules (
     title, description, slug, order_index,
     difficulty_level, estimated_hours, is_active
   ) VALUES (
     'Nuovo Corso',
     'Descrizione corso',
     'nuovo-corso',
     6, -- order_index (dopo gli esistenti)
     'intermediate',
     5,
     true
   ) RETURNING id;
   ```

2. **Aggiungi Lezioni:**
   ```sql
   INSERT INTO education_lessons (
     module_id, title, content, content_type,
     order_index, estimated_minutes, is_active
   ) VALUES (
     '<module_id_from_above>',
     'Lezione 1',
     'Contenuto markdown...',
     'text',
     1,
     15,
     true
   );
   ```

---

## 📚 RISORSE

- **Schema Completo**: `supabase/add-education-system-schema.sql`
- **Seed Tradelia**: `supabase/seed-education-content-tradelia.sql`
- **API Endpoint**: `/api/courses/[slug]` - Recupera corso con lezioni
- **Documentazione Corsi**: `docs/COURSE-SYSTEM-IMPLEMENTATION.md`

---

**Nota**: Dopo aver caricato i dati, verifica che l'API `/api/courses/[slug]` restituisca correttamente i corsi e le lezioni.

