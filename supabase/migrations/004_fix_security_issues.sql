-- Security Fixes Migration
-- Fixes RLS and function security issues
-- Version: 004
-- Date: 2025-01-27
--
-- IMPORTANT: Run this AFTER migrations 001 and 002
-- Fixes:
-- 1. Enables RLS on schema_migrations table
-- 2. Fixes function search_path security issues

-- Enable RLS on schema_migrations (if not already enabled)
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (idempotent)
DROP POLICY IF EXISTS "Admins can read schema migrations" ON schema_migrations;

-- Only admins can read schema_migrations
CREATE POLICY "Admins can read schema migrations"
  ON schema_migrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Fix function search_path security issues
-- Recreate update_updated_at_column with secure search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate update_proposal_votes_count with secure search_path
CREATE OR REPLACE FUNCTION update_proposal_votes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE asset_proposals
  SET votes_count = (
    SELECT COUNT(*) FROM asset_votes
    WHERE proposal_id = NEW.proposal_id AND vote_type = 'up'
  ) - (
    SELECT COUNT(*) FROM asset_votes
    WHERE proposal_id = NEW.proposal_id AND vote_type = 'down'
  )
  WHERE id = NEW.proposal_id;
  RETURN NEW;
END;
$$;

