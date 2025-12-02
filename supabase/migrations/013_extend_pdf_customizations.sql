-- Extend PDF Customizations for Professional PDF Generation
-- Adds fields needed for serious PDF generation (logo, header, footer, etc.)
-- Version: 013
-- Date: 2025-01-27
--
-- IMPORTANT: This migration is idempotent - safe to run multiple times
SET search_path = public;

-- Add missing columns for professional PDF customization
ALTER TABLE pdf_customizations
  ADD COLUMN IF NOT EXISTS logo_width INTEGER DEFAULT 120,
  ADD COLUMN IF NOT EXISTS logo_height INTEGER DEFAULT 40,
  ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7) DEFAULT '#3b82f6',
  ADD COLUMN IF NOT EXISTS accent_color VARCHAR(7) DEFAULT '#2563eb',
  ADD COLUMN IF NOT EXISTS text_color VARCHAR(7) DEFAULT '#0f172a',
  ADD COLUMN IF NOT EXISTS background_color VARCHAR(7) DEFAULT '#FFFFFF',
  ADD COLUMN IF NOT EXISTS heading_font_family VARCHAR(50) DEFAULT 'Helvetica-Bold',
  ADD COLUMN IF NOT EXISTS font_size_base INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS font_size_heading INTEGER DEFAULT 16,
  ADD COLUMN IF NOT EXISTS font_size_title INTEGER DEFAULT 24,
  ADD COLUMN IF NOT EXISTS footer_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS footer_contact_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS footer_contact_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS footer_website VARCHAR(255),
  ADD COLUMN IF NOT EXISTS footer_address TEXT,
  ADD COLUMN IF NOT EXISTS show_academic_disclaimer BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS academic_disclaimer_text TEXT DEFAULT 'Questo documento è a scopo informativo e non costituisce consulenza finanziaria. Le informazioni sono basate su fonti accademiche verificate.';

-- Add constraints for color validation
ALTER TABLE pdf_customizations
  DROP CONSTRAINT IF EXISTS valid_primary_color,
  DROP CONSTRAINT IF EXISTS valid_secondary_color,
  DROP CONSTRAINT IF EXISTS valid_accent_color,
  DROP CONSTRAINT IF EXISTS valid_text_color,
  DROP CONSTRAINT IF EXISTS valid_background_color,
  DROP CONSTRAINT IF EXISTS valid_logo_dimensions;

ALTER TABLE pdf_customizations
  ADD CONSTRAINT valid_primary_color CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  ADD CONSTRAINT valid_secondary_color CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  ADD CONSTRAINT valid_accent_color CHECK (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  ADD CONSTRAINT valid_text_color CHECK (text_color ~ '^#[0-9A-Fa-f]{6}$'),
  ADD CONSTRAINT valid_background_color CHECK (background_color ~ '^#[0-9A-Fa-f]{6}$'),
  ADD CONSTRAINT valid_logo_dimensions CHECK (logo_width > 0 AND logo_height > 0);

-- Update header_text default to be more professional
ALTER TABLE pdf_customizations
  ALTER COLUMN header_text SET DEFAULT 'Report Analisi Finanziaria';

-- Comments
COMMENT ON COLUMN pdf_customizations.logo_width IS 'Logo width in PDF (pixels)';
COMMENT ON COLUMN pdf_customizations.logo_height IS 'Logo height in PDF (pixels)';
COMMENT ON COLUMN pdf_customizations.footer_enabled IS 'Enable custom footer in PDF documents';
COMMENT ON COLUMN pdf_customizations.show_academic_disclaimer IS 'Show academic disclaimer to maintain professional standards';

