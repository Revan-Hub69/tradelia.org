-- Fix user_roles RLS Policies
-- This migration fixes RLS policies to handle cases where users don't have a record yet
-- Version: 022
-- Date: 2025-01-27
--
-- IMPORTANT: This migration is idempotent - safe to run multiple times
-- Fixes 500 errors when querying user_roles for authenticated users without records

SET search_path = public;

-- ============================================================================
-- FIX: user_roles RLS Policies
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON user_roles;

-- Users can read their own role
-- This policy allows SELECT queries when user_id matches current authenticated user
-- If no matching row exists, query returns empty result (not an error)
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

-- Comments
COMMENT ON POLICY "Users can read own role" ON user_roles IS 'Allows users to read their own role. Query will return null if no record exists, preventing 500 errors.';
COMMENT ON POLICY "Admins can read all roles" ON user_roles IS 'Allows admins to read all user roles.';
