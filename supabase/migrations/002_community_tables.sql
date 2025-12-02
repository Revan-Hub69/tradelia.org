-- Community Tables Migration
-- Creates tables for community proposals and voting (Pro feature)
-- Version: 002
-- Date: 2025-01-27
--
-- IMPORTANT: This migration is idempotent - safe to run multiple times
-- REQUIRES: 001_initial_schema.sql must be run first (creates user_roles table)

-- Check if user_roles table exists (required dependency)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles'
  ) THEN
    RAISE EXCEPTION 'Migration 001_initial_schema.sql must be run first! Table user_roles does not exist.';
  END IF;
END $$;

-- Asset Proposals Table (Pro only)
-- Stores community proposals for new assets/features
CREATE TABLE IF NOT EXISTS asset_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  asset_symbol VARCHAR(20),
  asset_name VARCHAR(255),
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')),
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_asset_proposals_user_id ON asset_proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_proposals_status ON asset_proposals(status);
CREATE INDEX IF NOT EXISTS idx_asset_proposals_created_at ON asset_proposals(created_at DESC);

-- Asset Votes Table (Pro only)
-- Stores votes on asset proposals
CREATE TABLE IF NOT EXISTS asset_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES asset_proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_asset_votes_proposal_id ON asset_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_asset_votes_user_id ON asset_votes(user_id);

-- Function to update votes count
-- Security: Set search_path to prevent search path attacks
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

-- Trigger to update votes count
-- Drop existing trigger if it exists (idempotent)
DROP TRIGGER IF EXISTS update_votes_count_on_vote ON asset_votes;

CREATE TRIGGER update_votes_count_on_vote
  AFTER INSERT OR UPDATE OR DELETE ON asset_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_votes_count();

-- Enable RLS
ALTER TABLE asset_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for asset_proposals
-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Pro users can read proposals" ON asset_proposals;
DROP POLICY IF EXISTS "Pro users can create proposals" ON asset_proposals;
DROP POLICY IF EXISTS "Users can update own proposals" ON asset_proposals;

-- Pro users can read all proposals
-- Note: This policy requires user_roles table to exist (created in migration 001)
CREATE POLICY "Pro users can read proposals"
  ON asset_proposals FOR SELECT
  USING (
    -- Allow if user_roles table exists and user has pro/desk/admin role
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('pro', 'desk', 'admin')
      AND (valid_until IS NULL OR valid_until > NOW())
    )
    OR
    -- Fallback: allow if user_roles table doesn't exist yet (shouldn't happen, but safe)
    NOT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_roles'
    )
  );

-- Pro users can create proposals
CREATE POLICY "Pro users can create proposals"
  ON asset_proposals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('pro', 'desk', 'admin')
      AND (valid_until IS NULL OR valid_until > NOW())
    )
    OR
    -- Fallback: allow if user_roles table doesn't exist yet
    NOT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_roles'
    )
  );

-- Users can update their own proposals
CREATE POLICY "Users can update own proposals"
  ON asset_proposals FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for asset_votes
-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Pro users can read votes" ON asset_votes;
DROP POLICY IF EXISTS "Pro users can vote" ON asset_votes;

-- Pro users can read all votes
CREATE POLICY "Pro users can read votes"
  ON asset_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('pro', 'desk', 'admin')
      AND (valid_until IS NULL OR valid_until > NOW())
    )
    OR
    -- Fallback: allow if user_roles table doesn't exist yet
    NOT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_roles'
    )
  );

-- Pro users can vote
CREATE POLICY "Pro users can vote"
  ON asset_votes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('pro', 'desk', 'admin')
      AND (valid_until IS NULL OR valid_until > NOW())
    )
    OR
    -- Fallback: allow if user_roles table doesn't exist yet
    NOT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_roles'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('pro', 'desk', 'admin')
      AND (valid_until IS NULL OR valid_until > NOW())
    )
    OR
    -- Fallback: allow if user_roles table doesn't exist yet
    NOT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'user_roles'
    )
  );


