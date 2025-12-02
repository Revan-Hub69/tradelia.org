-- Partner White Label Configuration Migration
-- Creates tables for academic white label branding for professional partners
-- Version: 012
-- Date: 2025-01-27
--
-- IMPORTANT: This migration is idempotent - safe to run multiple times
-- Best Practice: Academic white label maintains professional standards while allowing partner branding
SET search_path = public;

-- ============================================================================
-- PARTNER WHITELABEL CONFIGS TABLE
-- Stores white label configurations for professional partners
-- Best Practice: Separate table for partner configs (not in profiles) for scalability
-- ============================================================================
CREATE TABLE IF NOT EXISTS partner_whitelabel_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Branding Assets
    logo_url TEXT, -- Logo partner (base64 or URL)
    logo_width INTEGER DEFAULT 120, -- Logo width in PDF (px)
    logo_height INTEGER DEFAULT 40, -- Logo height in PDF (px)
    
    -- Color Scheme (Academic Best Practice: Subtle, professional colors)
    primary_color VARCHAR(7) DEFAULT '#1e40af', -- Primary brand color (hex)
    secondary_color VARCHAR(7) DEFAULT '#3b82f6', -- Secondary brand color (hex)
    accent_color VARCHAR(7) DEFAULT '#2563eb', -- Accent color (hex)
    text_color VARCHAR(7) DEFAULT '#0f172a', -- Primary text color
    background_color VARCHAR(7) DEFAULT '#FFFFFF', -- Background color
    
    -- Typography (Academic Best Practice: Readable, professional fonts)
    font_family VARCHAR(100) DEFAULT 'Helvetica', -- Primary font family
    heading_font_family VARCHAR(100) DEFAULT 'Helvetica-Bold', -- Heading font
    font_size_base INTEGER DEFAULT 10, -- Base font size (pt)
    font_size_heading INTEGER DEFAULT 16, -- Heading font size (pt)
    font_size_title INTEGER DEFAULT 24, -- Title font size (pt)
    
    -- Footer Configuration (Academic Best Practice: Professional footer with contact info)
    footer_enabled BOOLEAN DEFAULT true,
    footer_text TEXT, -- Custom footer text
    footer_contact_email VARCHAR(255), -- Contact email
    footer_contact_phone VARCHAR(50), -- Contact phone
    footer_website VARCHAR(255), -- Partner website
    footer_address TEXT, -- Physical address (optional)
    
    -- Watermark (Optional - Academic Best Practice: Subtle, non-intrusive)
    watermark_enabled BOOLEAN DEFAULT false,
    watermark_text VARCHAR(100), -- Watermark text (e.g., "CONFIDENTIAL", "DRAFT")
    watermark_opacity DECIMAL(3,2) DEFAULT 0.1, -- Watermark opacity (0.0-1.0)
    
    -- Academic Standards
    show_academic_disclaimer BOOLEAN DEFAULT true, -- Show academic disclaimer
    academic_disclaimer_text TEXT DEFAULT 'Questo documento è a scopo informativo e non costituisce consulenza finanziaria. Le informazioni sono basate su fonti accademiche verificate.',
    
    -- Metadata
    is_active BOOLEAN DEFAULT true, -- Enable/disable white label
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_primary_color CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT valid_secondary_color CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT valid_accent_color CHECK (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT valid_text_color CHECK (text_color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT valid_background_color CHECK (background_color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT valid_watermark_opacity CHECK (watermark_opacity >= 0 AND watermark_opacity <= 1),
    CONSTRAINT valid_logo_dimensions CHECK (logo_width > 0 AND logo_height > 0),
    
    -- One config per partner (can be extended later for multiple configs)
    UNIQUE(partner_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_partner_whitelabel_partner_id ON partner_whitelabel_configs(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_whitelabel_active ON partner_whitelabel_configs(is_active) WHERE is_active = true;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_partner_whitelabel_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_partner_whitelabel_updated_at_trigger ON partner_whitelabel_configs;
CREATE TRIGGER update_partner_whitelabel_updated_at_trigger
    BEFORE UPDATE ON partner_whitelabel_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_partner_whitelabel_updated_at();

-- RLS Policies
ALTER TABLE partner_whitelabel_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can read own whitelabel config" ON partner_whitelabel_configs;
DROP POLICY IF EXISTS "Partners can update own whitelabel config" ON partner_whitelabel_configs;
DROP POLICY IF EXISTS "Partners can insert own whitelabel config" ON partner_whitelabel_configs;
DROP POLICY IF EXISTS "Admins can manage all whitelabel configs" ON partner_whitelabel_configs;
DROP POLICY IF EXISTS "Service role can manage whitelabel configs" ON partner_whitelabel_configs;

-- Partners can read their own config
CREATE POLICY "Partners can read own whitelabel config"
    ON partner_whitelabel_configs FOR SELECT
    USING (
        auth.uid() = partner_id OR
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Partners can update their own config
CREATE POLICY "Partners can update own whitelabel config"
    ON partner_whitelabel_configs FOR UPDATE
    USING (
        auth.uid() = partner_id OR
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Partners can insert their own config
CREATE POLICY "Partners can insert own whitelabel config"
    ON partner_whitelabel_configs FOR INSERT
    WITH CHECK (
        auth.uid() = partner_id OR
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Admins can manage all configs
CREATE POLICY "Admins can manage all whitelabel configs"
    ON partner_whitelabel_configs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Service role can manage all configs (for migrations and system operations)
CREATE POLICY "Service role can manage whitelabel configs"
    ON partner_whitelabel_configs FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- HELPER FUNCTION: Get active whitelabel config for partner
-- Best Practice: Centralized function for retrieving config with fallback
-- ============================================================================
CREATE OR REPLACE FUNCTION get_partner_whitelabel_config(p_partner_id UUID)
RETURNS TABLE (
    id UUID,
    partner_id UUID,
    logo_url TEXT,
    logo_width INTEGER,
    logo_height INTEGER,
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    accent_color VARCHAR(7),
    text_color VARCHAR(7),
    background_color VARCHAR(7),
    font_family VARCHAR(100),
    heading_font_family VARCHAR(100),
    font_size_base INTEGER,
    font_size_heading INTEGER,
    font_size_title INTEGER,
    footer_enabled BOOLEAN,
    footer_text TEXT,
    footer_contact_email VARCHAR(255),
    footer_contact_phone VARCHAR(50),
    footer_website VARCHAR(255),
    footer_address TEXT,
    watermark_enabled BOOLEAN,
    watermark_text VARCHAR(100),
    watermark_opacity DECIMAL(3,2),
    show_academic_disclaimer BOOLEAN,
    academic_disclaimer_text TEXT,
    is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pwc.id,
        pwc.partner_id,
        pwc.logo_url,
        pwc.logo_width,
        pwc.logo_height,
        pwc.primary_color,
        pwc.secondary_color,
        pwc.accent_color,
        pwc.text_color,
        pwc.background_color,
        pwc.font_family,
        pwc.heading_font_family,
        pwc.font_size_base,
        pwc.font_size_heading,
        pwc.font_size_title,
        pwc.footer_enabled,
        pwc.footer_text,
        pwc.footer_contact_email,
        pwc.footer_contact_phone,
        pwc.footer_website,
        pwc.footer_address,
        pwc.watermark_enabled,
        pwc.watermark_text,
        pwc.watermark_opacity,
        pwc.show_academic_disclaimer,
        pwc.academic_disclaimer_text,
        pwc.is_active
    FROM partner_whitelabel_configs pwc
    WHERE pwc.partner_id = p_partner_id
    AND pwc.is_active = true
    LIMIT 1;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_partner_whitelabel_config(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_partner_whitelabel_config(UUID) TO service_role;

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================
COMMENT ON TABLE partner_whitelabel_configs IS 'White label configurations for professional partners - Academic best practice branding';
COMMENT ON COLUMN partner_whitelabel_configs.partner_id IS 'Reference to partner profile (must be Desk/Business tier)';
COMMENT ON COLUMN partner_whitelabel_configs.logo_url IS 'Partner logo (base64 data URI or URL)';
COMMENT ON COLUMN partner_whitelabel_configs.primary_color IS 'Primary brand color (hex format: #RRGGBB)';
COMMENT ON COLUMN partner_whitelabel_configs.footer_enabled IS 'Enable custom footer in PDF documents';
COMMENT ON COLUMN partner_whitelabel_configs.watermark_enabled IS 'Enable watermark (e.g., CONFIDENTIAL, DRAFT)';
COMMENT ON COLUMN partner_whitelabel_configs.show_academic_disclaimer IS 'Show academic disclaimer to maintain professional standards';

