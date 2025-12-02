-- System Tables Migration
-- Crea tutte le tabelle di sistema (favorites, etc.)
-- Version: 010
-- Date: 2025-01-27
--
-- IMPORTANT: This migration is idempotent - safe to run multiple times
--
-- Set search_path for security
SET search_path = public;

-- ============================================================================
-- FAVORITES (Preferiti utente)
-- ============================================================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('report', 'course', 'module', 'lesson')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    href VARCHAR(255),
    icon VARCHAR(50),
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_id, item_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item_type ON favorites(item_type);
CREATE INDEX IF NOT EXISTS idx_favorites_item_id ON favorites(item_id);

-- RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;

CREATE POLICY "Users can manage own favorites"
    ON favorites FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ADMIN USERS (Tabella admin completa - se necessaria)
-- ============================================================================
-- Nota: Se admin_users ha solo email, non crearla (usa admin_emails)
-- Se ha campi aggiuntivi, creala qui
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
    permissions JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read admin users" ON admin_users;

CREATE POLICY "Admins can read admin users"
    ON admin_users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at on admin_users
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

