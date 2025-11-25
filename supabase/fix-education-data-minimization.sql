-- ============================================
-- FIX: Minimizzazione Dati Educativi (GDPR Art. 5)
-- ============================================
-- Riduce dati salvati per conformità GDPR
-- Rimuove answers JSONB dettagliato, mantiene solo dati essenziali
-- ============================================

-- ===== 1. MODIFICA education_user_test_attempts =====
-- Rimuove answers JSONB dettagliato, aggiunge solo wrong_question_ids

-- Aggiungi colonna per question IDs sbagliate (più minimizzato)
ALTER TABLE education_user_test_attempts 
ADD COLUMN IF NOT EXISTS wrong_question_ids UUID[] DEFAULT '{}';

-- Migra dati esistenti (se presenti)
-- Estrae solo question_id delle risposte sbagliate da answers JSONB
UPDATE education_user_test_attempts
SET wrong_question_ids = (
  SELECT ARRAY_AGG(key::UUID)
  FROM jsonb_each(answers)
  WHERE (value->>'is_correct')::boolean = false
)
WHERE answers IS NOT NULL AND jsonb_typeof(answers) = 'object';

-- Rimuovi colonna answers (dopo migrazione, se necessario)
-- NOTA: Commentato per sicurezza - decommentare solo dopo verifica
-- ALTER TABLE education_user_test_attempts DROP COLUMN IF EXISTS answers;

-- ===== 2. AGGIUNGI TABELLA PREFERENZE TRACKING =====
-- Permette opt-out parziale per conformità GDPR

CREATE TABLE IF NOT EXISTS education_user_tracking_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Consensi tracking
  track_detailed_progress BOOLEAN DEFAULT true,  -- Progress dettagliato (lezioni, tempo)
  track_test_scores BOOLEAN DEFAULT true,        -- Punteggi test
  track_test_answers BOOLEAN DEFAULT false,      -- Risposte dettagliate (default: NO per minimizzazione)
  share_anonymous_analytics BOOLEAN DEFAULT true, -- Analytics anonimi aggregati
  -- Metadata
  consent_given_at TIMESTAMPTZ DEFAULT NOW(),
  consent_withdrawn_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracking_preferences_user ON education_user_tracking_preferences(user_id);

-- ===== 3. FUNZIONE PER VERIFICARE CONSENSO =====
-- Verifica se utente ha dato consenso per tipo di tracking

CREATE OR REPLACE FUNCTION has_tracking_consent(
  p_user_id UUID,
  p_tracking_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_preferences RECORD;
BEGIN
  SELECT * INTO v_preferences
  FROM education_user_tracking_preferences
  WHERE user_id = p_user_id;

  -- Se non ha preferenze, usa default (consenso implicito per retrocompatibilità)
  IF NOT FOUND THEN
    RETURN CASE 
      WHEN p_tracking_type = 'test_answers' THEN false  -- Default: NO per risposte dettagliate
      ELSE true  -- Default: SÌ per altri tracking
    END;
  END IF;

  -- Verifica consenso specifico
  CASE p_tracking_type
    WHEN 'detailed_progress' THEN
      RETURN v_preferences.track_detailed_progress;
    WHEN 'test_scores' THEN
      RETURN v_preferences.track_test_scores;
    WHEN 'test_answers' THEN
      RETURN v_preferences.track_test_answers;
    WHEN 'anonymous_analytics' THEN
      RETURN v_preferences.share_anonymous_analytics;
    ELSE
      RETURN true;  -- Default: consenso
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== 4. TRIGGER PER AGGIORNARE updated_at =====

CREATE TRIGGER update_tracking_preferences_updated_at
  BEFORE UPDATE ON education_user_tracking_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===== 5. RLS POLICIES =====

ALTER TABLE education_user_tracking_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own tracking preferences" ON education_user_tracking_preferences;
CREATE POLICY "Users can manage own tracking preferences"
  ON education_user_tracking_preferences FOR ALL
  USING (auth.uid() = user_id);

-- ===== 6. FUNZIONE PER ELIMINARE DATI UTENTE (GDPR Right to Deletion) =====
-- Elimina tutti i dati educativi di un utente

CREATE OR REPLACE FUNCTION delete_user_education_data(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_test_attempts INTEGER;
  v_lesson_progress INTEGER;
  v_module_progress INTEGER;
  v_xp_transactions INTEGER;
  v_badges INTEGER;
  v_stats INTEGER;
  v_streaks INTEGER;
  v_achievements INTEGER;
  v_quests INTEGER;
  v_reflections INTEGER;
  v_spaced_rep INTEGER;
  v_quiz_attempts INTEGER;
  v_question_perf INTEGER;
  v_tracking_prefs INTEGER;
BEGIN
  -- Elimina test attempts
  DELETE FROM education_user_test_attempts WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_test_attempts = ROW_COUNT;

  -- Elimina lesson progress
  DELETE FROM education_user_lesson_progress WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_lesson_progress = ROW_COUNT;

  -- Elimina module progress
  DELETE FROM education_user_progress WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_module_progress = ROW_COUNT;

  -- Elimina XP transactions
  DELETE FROM education_xp_transactions WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_xp_transactions = ROW_COUNT;

  -- Elimina badges
  DELETE FROM education_user_badges WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_badges = ROW_COUNT;

  -- Elimina stats
  DELETE FROM education_user_stats WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_stats = ROW_COUNT;

  -- Elimina streaks
  DELETE FROM education_user_streaks WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_streaks = ROW_COUNT;

  -- Elimina achievements
  DELETE FROM education_user_achievements WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_achievements = ROW_COUNT;

  -- Elimina quests
  DELETE FROM education_user_quests WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_quests = ROW_COUNT;

  -- Elimina reflections
  DELETE FROM education_user_reflections WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_reflections = ROW_COUNT;

  -- Elimina spaced repetition
  DELETE FROM education_spaced_repetition WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_spaced_rep = ROW_COUNT;

  -- Elimina lesson quiz attempts
  DELETE FROM education_user_lesson_quiz_attempts WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_quiz_attempts = ROW_COUNT;

  -- Elimina question performance
  DELETE FROM education_question_performance WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_question_perf = ROW_COUNT;

  -- Elimina tracking preferences
  DELETE FROM education_user_tracking_preferences WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_tracking_prefs = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'deleted', jsonb_build_object(
      'test_attempts', v_test_attempts,
      'lesson_progress', v_lesson_progress,
      'module_progress', v_module_progress,
      'xp_transactions', v_xp_transactions,
      'badges', v_badges,
      'stats', v_stats,
      'streaks', v_streaks,
      'achievements', v_achievements,
      'quests', v_quests,
      'reflections', v_reflections,
      'spaced_repetition', v_spaced_rep,
      'lesson_quiz_attempts', v_quiz_attempts,
      'question_performance', v_question_perf,
      'tracking_preferences', v_tracking_prefs
    ),
    'message', 'Tutti i dati educativi sono stati eliminati'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== 7. COMMENTI DOCUMENTAZIONE =====

COMMENT ON TABLE education_user_tracking_preferences IS 'Preferenze tracking utente per conformità GDPR - consenso esplicito e opt-out';
COMMENT ON FUNCTION has_tracking_consent IS 'Verifica consenso utente per tipo di tracking specifico';
COMMENT ON FUNCTION delete_user_education_data IS 'Elimina tutti i dati educativi utente (GDPR Right to Deletion Art. 17)';
