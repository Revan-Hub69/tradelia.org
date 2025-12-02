-- Initial Schema Migration
-- Creates core tables for Tradelia application
-- Version: 001
-- Date: 2025-01-27

-- User Roles Table
-- Stores user subscription roles and validity
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('trial', 'pro', 'desk', 'admin')),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Admin Emails Table
-- Whitelist of admin email addresses
CREATE TABLE IF NOT EXISTS admin_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_admin_emails_email ON admin_emails(email);

-- PDF Customizations Table (Desk only)
-- Stores PDF customization settings for Desk users
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

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_pdf_customizations_user_id ON pdf_customizations(user_id);

-- Schema Migrations Table
-- Tracks applied migrations
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
-- Drop existing policies if they exist (idempotent)
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

-- RLS Policies for pdf_customizations
-- Drop existing policy if it exists (idempotent)
DROP POLICY IF EXISTS "Users can manage own PDF customizations" ON pdf_customizations;

-- Users can read/write their own customizations
CREATE POLICY "Users can manage own PDF customizations"
  ON pdf_customizations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for admin_emails
-- Drop existing policy if it exists (idempotent)
DROP POLICY IF EXISTS "Admins can read admin emails" ON admin_emails;

-- Only admins can read admin_emails
CREATE POLICY "Admins can read admin emails"
  ON admin_emails FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_emails
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- RLS Policies for schema_migrations
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

-- Function to update updated_at timestamp
-- Security: Set search_path to prevent search path attacks
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

-- Triggers for updated_at
-- Drop existing triggers if they exist (idempotent)
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
DROP TRIGGER IF EXISTS update_pdf_customizations_updated_at ON pdf_customizations;

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pdf_customizations_updated_at
  BEFORE UPDATE ON pdf_customizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


