-- User Preferences and Legal Compliance Migration
-- Aggiunge supporto per preferenze utente e audit trail legale
-- Version: 020
-- Date: 2025-01-27
--
-- IMPORTANT: This migration is idempotent - safe to run multiple times
--
-- Set search_path for security
SET search_path = public;

-- ============================================================================
-- ADD CURRENCY TO PROFILES
-- ============================================================================
-- Aggiunge campo currency a profiles se non esiste
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'currency'
    ) THEN
        ALTER TABLE profiles ADD COLUMN currency VARCHAR(3) DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD'));
    END IF;
END
$$;

-- ============================================================================
-- LEGAL CONSENTS TABLE (Audit Trail GDPR/Legal)
-- ============================================================================
CREATE TABLE IF NOT EXISTS legal_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN ('legal', 'analytics', 'marketing', 'cookies')),
    consent_value VARCHAR(20) NOT NULL CHECK (consent_value IN ('accepted', 'rejected', 'pending')),
    ip_address INET,
    user_agent TEXT,
    consent_date TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Allow one consent per type per user (or anonymous)
    UNIQUE(user_id, consent_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_legal_consents_user_id ON legal_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_consents_consent_type ON legal_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_legal_consents_consent_date ON legal_consents(consent_date DESC);

-- RLS
ALTER TABLE legal_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own legal consents" ON legal_consents;
DROP POLICY IF EXISTS "Users can insert own legal consents" ON legal_consents;
DROP POLICY IF EXISTS "Admins can read all legal consents" ON legal_consents;

-- Users can read their own consents
CREATE POLICY "Users can read own legal consents"
    ON legal_consents FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can insert their own consents
CREATE POLICY "Users can insert own legal consents"
    ON legal_consents FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can read all consents (for audit)
CREATE POLICY "Admins can read all legal consents"
    ON legal_consents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- ============================================================================
-- AI CHAT MESSAGES TABLE (Optional backup for logged-in users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL DEFAULT gen_random_uuid(),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_user_id ON ai_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_conversation_id ON ai_chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_created_at ON ai_chat_messages(created_at DESC);

-- RLS
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own chat messages" ON ai_chat_messages;

-- Users can only access their own chat messages
CREATE POLICY "Users can manage own chat messages"
    ON ai_chat_messages FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- USER PREFERENCES TABLE (Extended preferences beyond profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    -- UI Preferences
    theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    reduced_motion BOOLEAN DEFAULT false,
    -- Feature Preferences
    show_welcome_tour BOOLEAN DEFAULT true,
    show_tooltips BOOLEAN DEFAULT true,
    -- Dashboard Preferences
    dashboard_layout JSONB, -- Store full component configuration (visibility, order, etc.)
    widgets_order JSONB,
    -- Other preferences as JSONB for flexibility
    other_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;

CREATE POLICY "Users can manage own preferences"
    ON user_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at on legal_consents
DROP TRIGGER IF EXISTS update_legal_consents_updated_at ON legal_consents;
CREATE TRIGGER update_legal_consents_updated_at
    BEFORE UPDATE ON legal_consents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on user_preferences
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE legal_consents IS 'Audit trail per consensi legali (GDPR compliance)';
COMMENT ON TABLE ai_chat_messages IS 'Backup opzionale messaggi chat AI per utenti loggati';
COMMENT ON TABLE user_preferences IS 'Preferenze estese utente (oltre profiles)';
