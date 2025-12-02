-- Notifications & Social Migration
-- Crea tutte le tabelle per notifiche, push, social, community
-- Version: 008
-- Date: 2025-01-27
--
-- IMPORTANT: This migration is idempotent - safe to run multiple times
-- REQUIRES: 001_initial_schema.sql, 002_community_tables.sql
--
-- Set search_path for security
SET search_path = public;

-- Prerequisite check
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
        RAISE EXCEPTION 'Migration 001_initial_schema.sql must be run first!';
    END IF;
END
$$;

-- ============================================================================
-- NOTIFICATIONS (Notifiche)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link_url TEXT,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

CREATE POLICY "Users can read own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- PUSH SUBSCRIPTIONS (Subscription push)
-- ============================================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_is_active ON push_subscriptions(is_active);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON push_subscriptions;

CREATE POLICY "Users can manage own push subscriptions"
    ON push_subscriptions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SOCIAL POSTS (Post social)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_is_published ON social_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_social_posts_published_at ON social_posts(published_at DESC);

-- RLS
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Social posts are viewable by everyone" ON social_posts;
DROP POLICY IF EXISTS "Users can create own posts" ON social_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON social_posts;
DROP POLICY IF EXISTS "Admins can manage all posts" ON social_posts;

CREATE POLICY "Social posts are viewable by everyone"
    ON social_posts FOR SELECT
    USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own posts"
    ON social_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
    ON social_posts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all posts"
    ON social_posts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- ============================================================================
-- SOCIAL CONFIGS (Config social)
-- ============================================================================
CREATE TABLE IF NOT EXISTS social_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_configs_key ON social_configs(key);

-- RLS
ALTER TABLE social_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Social configs are viewable by everyone" ON social_configs;
DROP POLICY IF EXISTS "Admins can manage social configs" ON social_configs;

CREATE POLICY "Social configs are viewable by everyone"
    ON social_configs FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage social configs"
    ON social_configs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- ============================================================================
-- ANALYSIS REQUESTS (Richieste analisi)
-- ============================================================================
CREATE TABLE IF NOT EXISTS analysis_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_symbol VARCHAR(20) NOT NULL,
    asset_name VARCHAR(255),
    request_type VARCHAR(50) DEFAULT 'analysis',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analysis_requests_user_id ON analysis_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_status ON analysis_requests(status);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_asset_symbol ON analysis_requests(asset_symbol);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_created_at ON analysis_requests(created_at DESC);

-- RLS
ALTER TABLE analysis_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own analysis requests" ON analysis_requests;
DROP POLICY IF EXISTS "Admins can read all analysis requests" ON analysis_requests;

CREATE POLICY "Users can manage own analysis requests"
    ON analysis_requests FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all analysis requests"
    ON analysis_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at on push_subscriptions
DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on social_posts
DROP TRIGGER IF EXISTS update_social_posts_updated_at ON social_posts;
CREATE TRIGGER update_social_posts_updated_at
    BEFORE UPDATE ON social_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on social_configs
DROP TRIGGER IF EXISTS update_social_configs_updated_at ON social_configs;
CREATE TRIGGER update_social_configs_updated_at
    BEFORE UPDATE ON social_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on analysis_requests
DROP TRIGGER IF EXISTS update_analysis_requests_updated_at ON analysis_requests;
CREATE TRIGGER update_analysis_requests_updated_at
    BEFORE UPDATE ON analysis_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

