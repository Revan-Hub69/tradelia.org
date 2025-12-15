-- Fix Admin RLS Policies - Simplified Version
-- Versione semplificata che evita query circolari
-- Version: 024
-- Date: 2025-01-27
--
-- IMPORTANT: This migration fixes RLS policies to avoid circular queries
-- Fixes 500 errors for admin users by simplifying admin checks

SET search_path = public;

-- ============================================================================
-- FIX: user_roles RLS Policies - Simplified Admin Check
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;

-- Create helper function to check if user is admin (avoids circular queries)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
    v_user_email TEXT;
    v_is_admin BOOLEAN := FALSE;
BEGIN
    -- Get current user email
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = auth.uid();
    
    IF v_user_email IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if email is in admin_emails
    SELECT EXISTS (
        SELECT 1 FROM admin_emails
        WHERE email = v_user_email
    ) INTO v_is_admin;
    
    -- Also check if user has admin role (but avoid circular query)
    IF NOT v_is_admin THEN
        SELECT EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        ) INTO v_is_admin;
    END IF;
    
    RETURN v_is_admin;
END;
$$;

-- Admins can read all roles (using helper function)
CREATE POLICY "Admins can read all roles"
    ON user_roles FOR SELECT
    USING (is_admin_user() = TRUE);

-- Users can read their own role
CREATE POLICY "Users can read own role"
    ON user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================================================
-- FIX: user_preferences RLS Policies - Simplified Admin Check
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Admins can read all preferences" ON user_preferences;
DROP POLICY IF EXISTS "Admins can manage all preferences" ON user_preferences;

-- Admins can read all preferences
CREATE POLICY "Admins can read all preferences"
    ON user_preferences FOR SELECT
    USING (is_admin_user() = TRUE);

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences"
    ON user_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can manage all preferences
CREATE POLICY "Admins can manage all preferences"
    ON user_preferences FOR ALL
    USING (is_admin_user() = TRUE)
    WITH CHECK (is_admin_user() = TRUE);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON FUNCTION is_admin_user() IS 'Helper function to check if current user is admin. Uses SECURITY DEFINER to avoid RLS issues.';
COMMENT ON POLICY "Admins can read all roles" ON user_roles IS 'Allows admins to read all user roles using is_admin_user() helper.';
COMMENT ON POLICY "Users can read own role" ON user_roles IS 'Allows users to read their own role.';
COMMENT ON POLICY "Admins can read all preferences" ON user_preferences IS 'Allows admins to read all user preferences.';
COMMENT ON POLICY "Admins can manage all preferences" ON user_preferences IS 'Allows admins to manage all user preferences.';
COMMENT ON POLICY "Users can manage own preferences" ON user_preferences IS 'Allows users to manage their own preferences.';
