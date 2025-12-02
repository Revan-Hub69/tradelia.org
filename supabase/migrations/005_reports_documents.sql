-- Reports & Documents Migration
-- Crea tutte le tabelle per report, documenti, download, audit
-- Version: 005
-- Date: 2025-01-27
--
-- IMPORTANT: This migration is idempotent - safe to run multiple times
--
-- Set search_path for security
SET search_path = public;

-- ============================================================================
-- REPORTS (Report generati)
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    asset_symbol VARCHAR(20),
    asset_name VARCHAR(255),
    report_type VARCHAR(50) DEFAULT 'analysis',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_url TEXT,
    file_format VARCHAR(20) DEFAULT 'pdf' CHECK (file_format IN ('pdf', 'excel', 'json')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_asset_symbol ON reports(asset_symbol);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own reports" ON reports;
DROP POLICY IF EXISTS "Users can create own reports" ON reports;
DROP POLICY IF EXISTS "Users can update own reports" ON reports;
DROP POLICY IF EXISTS "Admins can read all reports" ON reports;

CREATE POLICY "Users can read own reports"
    ON reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports"
    ON reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
    ON reports FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all reports"
    ON reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- ============================================================================
-- REPORT MODULES (Moduli report)
-- ============================================================================
CREATE TABLE IF NOT EXISTS report_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    module_type VARCHAR(50) NOT NULL,
    module_data JSONB,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_report_modules_report_id ON report_modules(report_id);
CREATE INDEX IF NOT EXISTS idx_report_modules_module_type ON report_modules(module_type);

-- RLS
ALTER TABLE report_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read report modules for own reports" ON report_modules;
DROP POLICY IF EXISTS "Users can create report modules for own reports" ON report_modules;

CREATE POLICY "Users can read report modules for own reports"
    ON report_modules FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM reports
            WHERE reports.id = report_modules.report_id
            AND reports.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create report modules for own reports"
    ON report_modules FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM reports
            WHERE reports.id = report_modules.report_id
            AND reports.user_id = auth.uid()
        )
    );

-- ============================================================================
-- REPORT DOWNLOADS (Download report)
-- ============================================================================
CREATE TABLE IF NOT EXISTS report_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_report_downloads_report_id ON report_downloads(report_id);
CREATE INDEX IF NOT EXISTS idx_report_downloads_user_id ON report_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_report_downloads_downloaded_at ON report_downloads(downloaded_at DESC);

-- RLS
ALTER TABLE report_downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own report downloads" ON report_downloads;
DROP POLICY IF EXISTS "Users can insert own report downloads" ON report_downloads;

CREATE POLICY "Users can read own report downloads"
    ON report_downloads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own report downloads"
    ON report_downloads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- REPORT AUDIT LOG (Audit report)
-- ============================================================================
CREATE TABLE IF NOT EXISTS report_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_report_audit_log_report_id ON report_audit_log(report_id);
CREATE INDEX IF NOT EXISTS idx_report_audit_log_user_id ON report_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_report_audit_log_action ON report_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_report_audit_log_created_at ON report_audit_log(created_at DESC);

-- RLS
ALTER TABLE report_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read audit log for own reports" ON report_audit_log;
DROP POLICY IF EXISTS "Admins can read all audit logs" ON report_audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON report_audit_log;

CREATE POLICY "Users can read audit log for own reports"
    ON report_audit_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM reports
            WHERE reports.id = report_audit_log.report_id
            AND reports.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can read all audit logs"
    ON report_audit_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "System can insert audit logs"
    ON report_audit_log FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at on reports
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

