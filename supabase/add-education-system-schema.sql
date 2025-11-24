-- =====================================================
-- EDUCATION SYSTEM SCHEMA
-- Sistema formativo con gamification per retail
-- Best Practice Accademica 2025
-- =====================================================

-- ===== TABELLE PRINCIPALI =====

-- Moduli formativi (4 moduli principali)
CREATE TABLE IF NOT EXISTS education_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  order_index INTEGER NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  estimated_hours INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  requires_previous_module BOOLEAN DEFAULT true,
  previous_module_id UUID REFERENCES education_modules(id) ON DELETE SET NULL,
  prerequisites JSONB, -- Array di slug dei moduli prerequisiti (es. ["fondamenti-investimento"])
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lezioni all'interno dei moduli
CREATE TABLE IF NOT EXISTS education_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES education_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT, -- Markdown content
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'video', 'interactive', 'pdf')),
  video_url TEXT,
  pdf_url TEXT,
  order_index INTEGER NOT NULL,
  estimated_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, order_index)
);

-- Test/Quiz per moduli (Bloom Taxonomy: Remember, Understand, Apply, Analyze, Evaluate, Create)
CREATE TABLE IF NOT EXISTS education_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES education_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70, -- Percentuale minima per superare
  max_attempts INTEGER DEFAULT 3, -- Numero massimo di tentativi
  time_limit_minutes INTEGER, -- NULL = no time limit
  bloom_level TEXT CHECK (bloom_level IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Domande dei test
CREATE TABLE IF NOT EXISTS education_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES education_tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'case_study')),
  order_index INTEGER NOT NULL,
  points INTEGER DEFAULT 1,
  explanation TEXT, -- Spiegazione della risposta corretta
  bloom_level TEXT CHECK (bloom_level IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, order_index)
);

-- Risposte possibili per domande multiple choice
CREATE TABLE IF NOT EXISTS education_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES education_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  explanation TEXT, -- Perché questa risposta è corretta/sbagliata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, order_index)
);

-- Progressi utente nei moduli
CREATE TABLE IF NOT EXISTS education_user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES education_modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'locked')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Progressi utente nelle lezioni
CREATE TABLE IF NOT EXISTS education_user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES education_lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  time_spent_minutes INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Tentativi test utente
CREATE TABLE IF NOT EXISTS education_user_test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES education_tests(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN DEFAULT false,
  time_spent_seconds INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  answers JSONB, -- {question_id: {option_id: ..., is_correct: ...}}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, test_id, attempt_number)
);

-- ===== GAMIFICATION =====

-- Badge/Achievements
CREATE TABLE IF NOT EXISTS education_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  badge_type TEXT CHECK (badge_type IN ('module_completion', 'test_perfect', 'streak', 'milestone', 'special')),
  criteria JSONB, -- Criteri per ottenere il badge
  points_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badge ottenuti dagli utenti
CREATE TABLE IF NOT EXISTS education_user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES education_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Punti e livelli utente
CREATE TABLE IF NOT EXISTS education_user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  modules_completed INTEGER DEFAULT 0,
  tests_passed INTEGER DEFAULT 0,
  perfect_tests INTEGER DEFAULT 0,
  total_study_time_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificati di completamento
CREATE TABLE IF NOT EXISTS education_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES education_modules(id) ON DELETE SET NULL,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('module', 'pathway', 'mastery')),
  certificate_number TEXT UNIQUE NOT NULL, -- Numero certificato univoco
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT,
  verification_code TEXT UNIQUE, -- Codice per verifica esterna
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== PERCORSI SPECIALIZZATI =====

-- Percorsi specializzati (dopo i 4 moduli base)
CREATE TABLE IF NOT EXISTS education_pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  target_audience TEXT, -- 'savings', 'wealth_management', 'trading', 'general'
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moduli/lezioni associati ai percorsi
CREATE TABLE IF NOT EXISTS education_pathway_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_id UUID NOT NULL REFERENCES education_pathways(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES education_modules(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pathway_id, module_id)
);

-- Progressi utente nei percorsi
CREATE TABLE IF NOT EXISTS education_user_pathway_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pathway_id UUID NOT NULL REFERENCES education_pathways(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pathway_id)
);

-- ===== INDICI PER PERFORMANCE =====

CREATE INDEX IF NOT EXISTS idx_education_modules_order ON education_modules(order_index);
CREATE INDEX IF NOT EXISTS idx_education_lessons_module ON education_lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_education_tests_module ON education_tests(module_id);
CREATE INDEX IF NOT EXISTS idx_education_questions_test ON education_questions(test_id, order_index);
CREATE INDEX IF NOT EXISTS idx_education_user_progress_user ON education_user_progress(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_education_user_progress_status ON education_user_progress(status);
CREATE INDEX IF NOT EXISTS idx_education_user_test_attempts_user ON education_user_test_attempts(user_id, test_id);
CREATE INDEX IF NOT EXISTS idx_education_user_badges_user ON education_user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_education_certificates_user ON education_certificates(user_id);

-- ===== FUNZIONI UTILITY =====

-- Funzione per calcolare progresso modulo
CREATE OR REPLACE FUNCTION calculate_module_progress(p_user_id UUID, p_module_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  progress_pct INTEGER;
BEGIN
  -- Conta lezioni totali del modulo
  SELECT COUNT(*) INTO total_lessons
  FROM education_lessons
  WHERE module_id = p_module_id AND is_active = true;

  IF total_lessons = 0 THEN
    RETURN 0;
  END IF;

  -- Conta lezioni completate
  SELECT COUNT(*) INTO completed_lessons
  FROM education_user_lesson_progress
  WHERE user_id = p_user_id
    AND lesson_id IN (SELECT id FROM education_lessons WHERE module_id = p_module_id AND is_active = true)
    AND status = 'completed';

  progress_pct := (completed_lessons * 100) / total_lessons;
  RETURN progress_pct;
END;
$$ LANGUAGE plpgsql;

-- Funzione per verificare se utente può accedere a un modulo
CREATE OR REPLACE FUNCTION can_access_module(p_user_id UUID, p_module_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  module_record RECORD;
  previous_completed BOOLEAN;
BEGIN
  SELECT * INTO module_record FROM education_modules WHERE id = p_module_id;

  IF NOT module_record.is_active THEN
    RETURN false;
  END IF;

  IF NOT module_record.requires_previous_module OR module_record.previous_module_id IS NULL THEN
    RETURN true;
  END IF;

  -- Verifica se modulo precedente è completato
  SELECT status = 'completed' INTO previous_completed
  FROM education_user_progress
  WHERE user_id = p_user_id AND module_id = module_record.previous_module_id;

  RETURN COALESCE(previous_completed, false);
END;
$$ LANGUAGE plpgsql;

-- Funzione per aggiornare statistiche utente
CREATE OR REPLACE FUNCTION update_user_education_stats(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO education_user_stats (user_id, modules_completed, tests_passed, total_points, updated_at)
  SELECT 
    p_user_id,
    COUNT(*) FILTER (WHERE status = 'completed'),
    0, -- TODO: calcolare tests passed
    0, -- TODO: calcolare punti
    NOW()
  FROM education_user_progress
  WHERE user_id = p_user_id
  ON CONFLICT (user_id) DO UPDATE SET
    modules_completed = EXCLUDED.modules_completed,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ===== ROW LEVEL SECURITY (RLS) =====

-- Abilita RLS
ALTER TABLE education_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_pathway_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Tutti possono leggere moduli/lezioni/test attivi (gratuito ma verificato)
CREATE POLICY "Public can view active education content"
  ON education_modules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active lessons"
  ON education_lessons FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active tests"
  ON education_tests FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active questions"
  ON education_questions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view question options"
  ON education_question_options FOR SELECT
  USING (true);

-- Policy: Utenti autenticati possono vedere i propri progressi
CREATE POLICY "Users can view own progress"
  ON education_user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON education_user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON education_user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy simili per altre tabelle user_*
CREATE POLICY "Users can manage own lesson progress"
  ON education_user_lesson_progress FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own test attempts"
  ON education_user_test_attempts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own badges"
  ON education_user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own stats"
  ON education_user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own certificates"
  ON education_certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own pathway progress"
  ON education_user_pathway_progress FOR ALL
  USING (auth.uid() = user_id);

-- Policy: Tutti possono vedere percorsi attivi
CREATE POLICY "Public can view active pathways"
  ON education_pathways FOR SELECT
  USING (is_active = true);

-- ===== TRIGGER PER AUTO-UPDATE =====

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_education_modules_updated_at
  BEFORE UPDATE ON education_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_lessons_updated_at
  BEFORE UPDATE ON education_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_tests_updated_at
  BEFORE UPDATE ON education_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_user_progress_updated_at
  BEFORE UPDATE ON education_user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===== DATI INIZIALI (SEED) =====

-- Inserisci i 4 moduli principali
INSERT INTO education_modules (title, description, slug, order_index, difficulty_level, estimated_hours, requires_previous_module, previous_module_id) VALUES
  ('Fondamenti di Finanza Personale', 
   'Introduzione completa alla finanza personale per neofiti assoluti. Impara i concetti base di risparmio, investimento e gestione del denaro.',
   'fondamenti-finanza-personale',
   1,
   'beginner',
   8,
   false,
   NULL),
  
  ('Gestione del Rischio e Analisi dei Rischi',
   'Comprendi come identificare, misurare e gestire i rischi finanziari. Essenziale per prendere decisioni informate.',
   'gestione-rischio',
   2,
   'intermediate',
   10,
   true,
   (SELECT id FROM education_modules WHERE slug = 'fondamenti-finanza-personale')),
  
  ('Approfondimento Universitario',
   'Approfondisci i concetti finanziari con un approccio universitario. Analisi più dettagliate e casi studio pratici.',
   'approfondimento-universitario',
   3,
   'advanced',
   12,
   true,
   (SELECT id FROM education_modules WHERE slug = 'gestione-rischio')),
  
  ('Livello Accademico e Scientifico',
   'Livello avanzato per professionisti. Metodologie scientifiche, ricerca accademica e applicazioni pratiche avanzate.',
   'livello-accademico-scientifico',
   4,
   'expert',
   15,
   true,
   (SELECT id FROM education_modules WHERE slug = 'approfondimento-universitario'))
ON CONFLICT (slug) DO NOTHING;

-- Inserisci percorsi specializzati
INSERT INTO education_pathways (title, description, slug, target_audience, is_active) VALUES
  ('Mi Interessa',
   'Percorso generale per chi vuole comprendere meglio la finanza personale e gli investimenti.',
   'mi-interessa',
   'general',
   true),
  
  ('Mettere da Parte ogni Mese',
   'Percorso dedicato al risparmio e all''accumulo di capitale. Impara strategie per mettere da parte denaro regolarmente.',
   'mettere-da-parte',
   'savings',
   true),
  
  ('Gestire il Mio Patrimonio',
   'Percorso per chi ha già un patrimonio da gestire. Wealth management, diversificazione e pianificazione finanziaria.',
   'gestire-patrimonio',
   'wealth_management',
   true),
  
  ('Speculare e Trading',
   'Percorso avanzato per chi vuole operare nei mercati finanziari. Trading, analisi tecnica e gestione del rischio operativo.',
   'speculare-trading',
   'trading',
   true)
ON CONFLICT (slug) DO NOTHING;

-- Inserisci badge iniziali
INSERT INTO education_badges (name, description, badge_type, points_reward, criteria) VALUES
  ('Primo Passo', 'Hai completato la prima lezione', 'milestone', 10, '{"type": "lesson_completed", "count": 1}'),
  ('Studente Dedicato', 'Hai completato un modulo', 'module_completion', 100, '{"type": "module_completed"}'),
  ('Perfetto', 'Hai superato un test con 100%', 'test_perfect', 50, '{"type": "test_perfect_score"}'),
  ('Streak 7 Giorni', 'Hai studiato 7 giorni consecutivi', 'streak', 25, '{"type": "streak", "days": 7}'),
  ('Maestro', 'Hai completato tutti i 4 moduli base', 'milestone', 500, '{"type": "all_modules_completed"}')
ON CONFLICT (name) DO NOTHING;
