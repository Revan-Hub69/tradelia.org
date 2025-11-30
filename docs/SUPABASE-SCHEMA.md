# Schema Database Supabase

## Tabelle Richieste per Dashboard Dinamica

### user_activities
Traccia tutte le attività degli utenti nella dashboard.

```sql
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'report_viewed', 'course_started', 'course_completed', 'analysis_requested'
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_type ON user_activities(type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at DESC);
```

### course_progress
Traccia il progresso degli utenti nei corsi.

```sql
CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_lessons INTEGER DEFAULT 0,
  last_lesson_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_course_progress_user_id ON course_progress(user_id);
CREATE INDEX idx_course_progress_course_id ON course_progress(course_id);
```

### courses
Tabella corsi disponibili.

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  total_lessons INTEGER DEFAULT 0,
  duration_minutes INTEGER,
  difficulty TEXT, -- 'beginner', 'intermediate', 'advanced'
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_published ON courses(is_published);
```

### user_achievements
Achievement sbloccati dagli utenti.

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked);
```

### achievements
Definizione degli achievement disponibili.

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon_type TEXT DEFAULT 'award', -- 'check', 'book', 'award'
  condition_type TEXT, -- 'lessons_completed', 'course_completed', 'reports_viewed', 'days_streak', 'total_xp'
  condition_value INTEGER,
  xp_reward INTEGER DEFAULT 0, -- XP guadagnati quando sbloccato
  rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_stats
Statistiche utente per gamification (XP, livelli, streak).

```sql
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  xp_to_next_level INTEGER DEFAULT 100,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_stats_level ON user_stats(current_level DESC);
CREATE INDEX idx_user_stats_xp ON user_stats(total_xp DESC);
```

### xp_transactions
Log transazioni XP per analytics.

```sql
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'lesson_completed', 'course_completed', 'report_viewed', 'achievement_unlocked', 'daily_login'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created_at ON xp_transactions(created_at DESC);
```

### reports
Report disponibili per gli utenti.

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL per report pubblici
  title TEXT NOT NULL,
  description TEXT,
  type TEXT, -- 'market_analysis', 'technical', 'fundamental'
  content JSONB,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_public ON reports(is_public);
CREATE INDEX idx_reports_type ON reports(type);
```

### analysis_requests
Richieste di analisi personalizzate.

```sql
CREATE TABLE analysis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analysis_requests_user_id ON analysis_requests(user_id);
CREATE INDEX idx_analysis_requests_status ON analysis_requests(status);
```

### modules
Moduli disponibili nella dashboard.

```sql
CREATE TABLE modules (
  id TEXT PRIMARY KEY, -- 'reports', 'education', etc.
  title TEXT NOT NULL,
  description TEXT,
  href TEXT NOT NULL,
  icon TEXT, -- nome icona lucide-react
  priority TEXT DEFAULT 'secondary', -- 'primary', 'secondary'
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  badge_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_modules_priority ON modules(priority);
CREATE INDEX idx_modules_active ON modules(is_active);
CREATE INDEX idx_modules_order ON modules(order_index);
```

### favorites
Preferiti degli utenti.

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('report', 'course', 'module')),
  title TEXT NOT NULL,
  description TEXT,
  href TEXT NOT NULL,
  icon TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_item ON favorites(item_id, item_type);
CREATE INDEX idx_favorites_added_at ON favorites(added_at DESC);
```

## RLS (Row Level Security)

### user_activities
```sql
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities"
  ON user_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
  ON user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### course_progress
```sql
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON course_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON course_progress FOR UPDATE
  USING (auth.uid() = user_id);
```

### reports
```sql
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports or public reports"
  ON reports FOR SELECT
  USING (
    auth.uid() = user_id OR 
    (is_public = true AND user_id IS NULL)
  );
```

### analysis_requests
```sql
ALTER TABLE analysis_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requests"
  ON analysis_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
  ON analysis_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### modules
```sql
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active modules"
  ON modules FOR SELECT
  USING (is_active = true);
```

### favorites
```sql
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
```

## Funzioni Utili

### Trigger per updated_at
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_activities_updated_at
  BEFORE UPDATE ON user_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_progress_updated_at
  BEFORE UPDATE ON course_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Note

- Tutte le tabelle devono avere `created_at` e `updated_at`
- Usare `JSONB` per metadata flessibili
- Implementare RLS per sicurezza
- Creare indici per query frequenti
- Usare foreign keys per integrità referenziale

