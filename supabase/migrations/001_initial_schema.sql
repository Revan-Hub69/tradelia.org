-- Initial Schema Migration
-- Creates core tables for Tradelia application
-- Version: 001
-- Date: 2025-01-27
--
-- IMPORTANT: This migration is idempotent - safe to run multiple times
-- Set search_path for security (prevents function hijacking)
SET search_path = public;

-- ============================================================================
-- SCHEMA MIGRATIONS TABLE
-- Tracks applied migrations (must be first!)
-- ============================================================================
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for schema_migrations
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access to schema_migrations" ON schema_migrations;
CREATE POLICY "Public read access to schema_migrations"
    ON schema_migrations FOR SELECT
    USING (true);

-- ============================================================================
-- ADMIN EMAILS TABLE
-- Whitelist of admin email addresses (must be created before user_roles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_emails_email ON admin_emails(email);

-- RLS (temporarily allow service_role to insert initial data)
ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage admin emails initially" ON admin_emails;
DROP POLICY IF EXISTS "Admins can read admin emails" ON admin_emails;
DROP POLICY IF EXISTS "Admins can manage admin emails" ON admin_emails;

-- Allow service_role to manage admin_emails initially (for migrations)
CREATE POLICY "Service role can manage admin emails initially"
    ON admin_emails FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Only admins can read admin_emails
CREATE POLICY "Admins can read admin emails"
    ON admin_emails FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails ae
            WHERE ae.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- Only admins can manage admin_emails (INSERT/UPDATE/DELETE)
CREATE POLICY "Admins can manage admin emails"
    ON admin_emails FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails ae
            WHERE ae.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_emails ae
            WHERE ae.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- ============================================================================
-- USER ROLES TABLE
-- Stores user subscription roles and validity
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('trial', 'pro', 'desk', 'admin')),
    plan_source VARCHAR(50),
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_valid_until ON user_roles(valid_until);

-- RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;

-- Users can read their own role
CREATE POLICY "Users can read own role"
    ON user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can read all roles
CREATE POLICY "Admins can read all roles"
    ON user_roles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- ============================================================================
-- PROFILES TABLE (Standard Supabase)
-- User profiles extending auth.users
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    company TEXT,
    user_type VARCHAR(50) DEFAULT 'individual',
    language VARCHAR(10) DEFAULT 'it',
    timezone VARCHAR(50) DEFAULT 'Europe/Rome',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    business_logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Public profiles are viewable by everyone (for social features)
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

-- ============================================================================
-- PDF CUSTOMIZATIONS TABLE (Desk only)
-- Stores PDF customization settings for Desk users
-- ============================================================================
CREATE TABLE IF NOT EXISTS pdf_customizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template VARCHAR(50) DEFAULT 'default' CHECK (template IN ('default', 'minimal', 'detailed')),
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#2563eb',
    secondary_color VARCHAR(7) DEFAULT '#3b82f6',
    font_family VARCHAR(50) DEFAULT 'Helvetica',
    header_text VARCHAR(255) DEFAULT 'Tradelia Report',
    footer_text VARCHAR(255) DEFAULT 'Confidential - Tradelia AI',
    watermark_enabled BOOLEAN DEFAULT false,
    watermark_text VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pdf_customizations_user_id ON pdf_customizations(user_id);

-- RLS
ALTER TABLE pdf_customizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own PDF customizations" ON pdf_customizations;

-- Users can read/write their own customizations
CREATE POLICY "Users can manage own PDF customizations"
    ON pdf_customizations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FUNCTION: update_updated_at_column
-- Automatically updates updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pdf_customizations_updated_at ON pdf_customizations;
CREATE TRIGGER update_pdf_customizations_updated_at
    BEFORE UPDATE ON pdf_customizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
