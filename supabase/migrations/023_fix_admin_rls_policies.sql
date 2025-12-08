-- Fix Admin RLS Policies
-- Aggiunge bypass per admin su user_roles e user_preferences
-- Version: 023
-- Date: 2025-01-27
--
-- IMPORTANT: This migration fixes RLS policies to allow admin access
-- Fixes 500/406 errors for admin users

SET search_path = public;

-- ============================================================================
-- FIX: user_roles RLS Policies - Admin Bypass
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;

-- Admins can read all roles (must be first to check admin status)
CREATE POLICY "Admins can read all roles"
    ON user_roles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
        OR
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
    );

-- Users can read their own role
CREATE POLICY "Users can read own role"
    ON user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================================================
-- FIX: user_preferences RLS Policies - Admin Bypass
-- ============================================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;

-- Admins can read all preferences (for support/debugging)
CREATE POLICY "Admins can read all preferences"
    ON user_preferences FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
        OR
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
    );

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences"
    ON user_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can manage all preferences (for support/debugging)
CREATE POLICY "Admins can manage all preferences"
    ON user_preferences FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
        OR
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
        OR
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'admin'
        )
    );

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON POLICY "Admins can read all roles" ON user_roles IS 'Allows admins (via admin_emails or user_roles) to read all user roles.';
COMMENT ON POLICY "Users can read own role" ON user_roles IS 'Allows users to read their own role.';
COMMENT ON POLICY "Admins can read all preferences" ON user_preferences IS 'Allows admins to read all user preferences for support/debugging.';
COMMENT ON POLICY "Admins can manage all preferences" ON user_preferences IS 'Allows admins to manage all user preferences for support/debugging.';
COMMENT ON POLICY "Users can manage own preferences" ON user_preferences IS 'Allows users to manage their own preferences.';
