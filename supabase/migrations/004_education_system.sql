-- Education System Migration
-- Crea tutte le tabelle per sistema educativo (corsi, lezioni, quiz, progresso)
-- Version: 004
-- Date: 2025-01-27
--
-- IMPORTANT: This migration is idempotent - safe to run multiple times
--
-- Set search_path for security
SET search_path = public;

-- ============================================================================
-- COURSES (Corsi disponibili)
-- ============================================================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    thumbnail_url TEXT,
    total_lessons INTEGER DEFAULT 0,
    duration_minutes INTEGER,
    difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    is_published BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_order_index ON courses(order_index);

-- RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Courses are viewable by everyone" ON courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;

CREATE POLICY "Courses are viewable by everyone"
    ON courses FOR SELECT
    USING (is_published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage courses"
    ON courses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- ============================================================================
-- EDUCATION MODULES (Moduli educativi)
-- ============================================================================
CREATE TABLE IF NOT EXISTS education_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_education_modules_course_id ON education_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_education_modules_order_index ON education_modules(order_index);

-- RLS
ALTER TABLE education_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Education modules are viewable by everyone" ON education_modules;

CREATE POLICY "Education modules are viewable by everyone"
    ON education_modules FOR SELECT
    USING (true);

-- ============================================================================
-- EDUCATION LESSONS (Lezioni)
-- ============================================================================
CREATE TABLE IF NOT EXISTS education_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES education_modules(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    duration_minutes INTEGER,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_education_lessons_module_id ON education_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_education_lessons_course_id ON education_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_education_lessons_order_index ON education_lessons(order_index);

-- RLS
ALTER TABLE education_lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Education lessons are viewable by everyone" ON education_lessons;

CREATE POLICY "Education lessons are viewable by everyone"
    ON education_lessons FOR SELECT
    USING (is_published = true OR auth.uid() IS NOT NULL);

-- ============================================================================
-- EDUCATION LESSON QUIZZES (Quiz lezioni)
-- ============================================================================
CREATE TABLE IF NOT EXISTS education_lesson_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES education_lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70,
    time_limit_minutes INTEGER,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_education_lesson_quizzes_lesson_id ON education_lesson_quizzes(lesson_id);

-- RLS
ALTER TABLE education_lesson_quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Education lesson quizzes are viewable by everyone" ON education_lesson_quizzes;

CREATE POLICY "Education lesson quizzes are viewable by everyone"
    ON education_lesson_quizzes FOR SELECT
    USING (true);

-- ============================================================================
-- EDUCATION LESSON QUIZ QUESTIONS (Domande quiz)
-- ============================================================================
CREATE TABLE IF NOT EXISTS education_lesson_quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES education_lesson_quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'text')),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_education_lesson_quiz_questions_quiz_id ON education_lesson_quiz_questions(quiz_id);

-- RLS
ALTER TABLE education_lesson_quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Education lesson quiz questions are viewable by everyone" ON education_lesson_quiz_questions;

CREATE POLICY "Education lesson quiz questions are viewable by everyone"
    ON education_lesson_quiz_questions FOR SELECT
    USING (true);

-- ============================================================================
-- EDUCATION LESSON QUIZ OPTIONS (Opzioni quiz)
-- ============================================================================
CREATE TABLE IF NOT EXISTS education_lesson_quiz_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES education_lesson_quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_education_lesson_quiz_options_question_id ON education_lesson_quiz_options(question_id);

-- RLS
ALTER TABLE education_lesson_quiz_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Education lesson quiz options are viewable by everyone" ON education_lesson_quiz_options;

CREATE POLICY "Education lesson quiz options are viewable by everyone"
    ON education_lesson_quiz_options FOR SELECT
    USING (true);

-- ============================================================================
-- COURSE MATERIALS (Materiali corsi)
-- ============================================================================
CREATE TABLE IF NOT EXISTS course_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES education_lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size_bytes INTEGER,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_course_materials_course_id ON course_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_lesson_id ON course_materials(lesson_id);

-- RLS
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Course materials are viewable by everyone" ON course_materials;

CREATE POLICY "Course materials are viewable by everyone"
    ON course_materials FOR SELECT
    USING (true);

-- ============================================================================
-- EDUCATION USER PROGRESS (Progresso corsi utente)
-- ============================================================================
CREATE TABLE IF NOT EXISTS education_user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_lessons_count INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_education_user_progress_user_id ON education_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_education_user_progress_course_id ON education_user_progress(course_id);

-- RLS
ALTER TABLE education_user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own progress" ON education_user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON education_user_progress;

CREATE POLICY "Users can read own progress"
    ON education_user_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
    ON education_user_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- EDUCATION USER LESSON PROGRESS (Progresso lezioni utente)
-- ============================================================================
CREATE TABLE IF NOT EXISTS education_user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES education_lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    watched_duration_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_education_user_lesson_progress_user_id ON education_user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_education_user_lesson_progress_lesson_id ON education_user_lesson_progress(lesson_id);

-- RLS
ALTER TABLE education_user_lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own lesson progress" ON education_user_lesson_progress;

CREATE POLICY "Users can manage own lesson progress"
    ON education_user_lesson_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- EDUCATION USER LESSON QUIZ ATTEMPTS (Tentativi quiz)
-- ============================================================================
CREATE TABLE IF NOT EXISTS education_user_lesson_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES education_lesson_quizzes(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    answers JSONB,
    is_passed BOOLEAN DEFAULT false,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_education_user_lesson_quiz_attempts_user_id ON education_user_lesson_quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_education_user_lesson_quiz_attempts_quiz_id ON education_user_lesson_quiz_attempts(quiz_id);

-- RLS
ALTER TABLE education_user_lesson_quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own quiz attempts" ON education_user_lesson_quiz_attempts;

CREATE POLICY "Users can manage own quiz attempts"
    ON education_user_lesson_quiz_attempts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- LESSON NOTES (Note lezioni)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lesson_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES education_lessons(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lesson_notes_user_id ON lesson_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_lesson_id ON lesson_notes(lesson_id);

-- RLS
ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own lesson notes" ON lesson_notes;

CREATE POLICY "Users can manage own lesson notes"
    ON lesson_notes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- MATERIAL DOWNLOADS (Download materiali)
-- ============================================================================
CREATE TABLE IF NOT EXISTS material_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES course_materials(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_material_downloads_user_id ON material_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_material_downloads_material_id ON material_downloads(material_id);

-- RLS
ALTER TABLE material_downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own downloads" ON material_downloads;
DROP POLICY IF EXISTS "Users can insert own downloads" ON material_downloads;

CREATE POLICY "Users can read own downloads"
    ON material_downloads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own downloads"
    ON material_downloads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ACHIEVEMENTS (Achievement disponibili)
-- ============================================================================
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_type VARCHAR(50),
    xp_reward INTEGER DEFAULT 0,
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);

-- RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON achievements;

CREATE POLICY "Achievements are viewable by everyone"
    ON achievements FOR SELECT
    USING (true);

-- ============================================================================
-- LEGACY TABLES (per retrocompatibilità)
-- ============================================================================

-- course_progress (legacy - mantieni per retrocompatibilità)
CREATE TABLE IF NOT EXISTS course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID,
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for course_progress
CREATE INDEX IF NOT EXISTS idx_course_progress_user_id ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_course_id ON course_progress(course_id);

-- RLS for course_progress
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own course progress" ON course_progress;
DROP POLICY IF EXISTS "Users can manage own course progress" ON course_progress;
DROP POLICY IF EXISTS "Admins can read all course progress" ON course_progress;

-- Users can read their own course progress
CREATE POLICY "Users can read own course progress"
    ON course_progress FOR SELECT
    USING (auth.uid() = user_id);

-- Users can manage their own course progress
CREATE POLICY "Users can manage own course progress"
    ON course_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can read all course progress
CREATE POLICY "Admins can read all course progress"
    ON course_progress FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- modules (legacy - mantieni per retrocompatibilità)
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    href VARCHAR(255),
    icon VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'secondary',
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    badge_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for modules
CREATE INDEX IF NOT EXISTS idx_modules_is_active ON modules(is_active);
CREATE INDEX IF NOT EXISTS idx_modules_order_index ON modules(order_index);

-- RLS for modules
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active modules" ON modules;
DROP POLICY IF EXISTS "Admins can manage modules" ON modules;

-- Anyone can read active modules (public read access)
CREATE POLICY "Anyone can read active modules"
    ON modules FOR SELECT
    USING (is_active = true);

-- Only admins can manage modules
CREATE POLICY "Admins can manage modules"
    ON modules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at on courses
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on education_modules
DROP TRIGGER IF EXISTS update_education_modules_updated_at ON education_modules;
CREATE TRIGGER update_education_modules_updated_at
    BEFORE UPDATE ON education_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on education_lessons
DROP TRIGGER IF EXISTS update_education_lessons_updated_at ON education_lessons;
CREATE TRIGGER update_education_lessons_updated_at
    BEFORE UPDATE ON education_lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on education_lesson_quizzes
DROP TRIGGER IF EXISTS update_education_lesson_quizzes_updated_at ON education_lesson_quizzes;
CREATE TRIGGER update_education_lesson_quizzes_updated_at
    BEFORE UPDATE ON education_lesson_quizzes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on education_user_progress
DROP TRIGGER IF EXISTS update_education_user_progress_updated_at ON education_user_progress;
CREATE TRIGGER update_education_user_progress_updated_at
    BEFORE UPDATE ON education_user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on education_user_lesson_progress
DROP TRIGGER IF EXISTS update_education_user_lesson_progress_updated_at ON education_user_lesson_progress;
CREATE TRIGGER update_education_user_lesson_progress_updated_at
    BEFORE UPDATE ON education_user_lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on lesson_notes
DROP TRIGGER IF EXISTS update_lesson_notes_updated_at ON lesson_notes;
CREATE TRIGGER update_lesson_notes_updated_at
    BEFORE UPDATE ON lesson_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on course_progress
DROP TRIGGER IF EXISTS update_course_progress_updated_at ON course_progress;
CREATE TRIGGER update_course_progress_updated_at
    BEFORE UPDATE ON course_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on modules
DROP TRIGGER IF EXISTS update_modules_updated_at ON modules;
CREATE TRIGGER update_modules_updated_at
    BEFORE UPDATE ON modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

