-- Utilities & Alliance Migration
-- Crea tutte le tabelle per utilities, calcoli, alliance/oslo
-- Version: 009
-- Date: 2025-01-27
--
-- IMPORTANT: This migration is idempotent - safe to run multiple times
--
-- Set search_path for security
SET search_path = public;

-- ============================================================================
-- FINANCIAL CALCULATIONS (Calcoli finanziari)
-- ============================================================================
CREATE TABLE IF NOT EXISTS financial_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    calculation_type VARCHAR(50) NOT NULL,
    inputs JSONB NOT NULL,
    results JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_financial_calculations_user_id ON financial_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_calculations_calculation_type ON financial_calculations(calculation_type);
CREATE INDEX IF NOT EXISTS idx_financial_calculations_created_at ON financial_calculations(created_at DESC);

-- RLS
ALTER TABLE financial_calculations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own financial calculations" ON financial_calculations;

CREATE POLICY "Users can manage own financial calculations"
    ON financial_calculations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PAC SIMULATIONS (Simulazioni PAC)
-- ============================================================================
CREATE TABLE IF NOT EXISTS pac_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    simulation_name VARCHAR(255) NOT NULL,
    monthly_amount DECIMAL(18, 2) NOT NULL,
    duration_years INTEGER NOT NULL,
    expected_return_percentage DECIMAL(5, 2),
    asset_allocation JSONB,
    results JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pac_simulations_user_id ON pac_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_pac_simulations_created_at ON pac_simulations(created_at DESC);

-- RLS
ALTER TABLE pac_simulations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own PAC simulations" ON pac_simulations;

CREATE POLICY "Users can manage own PAC simulations"
    ON pac_simulations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ALLIANCE MEMBERS (Membri alliance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS alliance_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    alliance_id VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'admin', 'moderator')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, alliance_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_alliance_members_user_id ON alliance_members(user_id);
CREATE INDEX IF NOT EXISTS idx_alliance_members_alliance_id ON alliance_members(alliance_id);
CREATE INDEX IF NOT EXISTS idx_alliance_members_is_active ON alliance_members(is_active);

-- RLS
ALTER TABLE alliance_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own alliance memberships" ON alliance_members;
DROP POLICY IF EXISTS "Alliance members are viewable by members" ON alliance_members;

CREATE POLICY "Users can read own alliance memberships"
    ON alliance_members FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Alliance members are viewable by members"
    ON alliance_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM alliance_members am
            WHERE am.alliance_id = alliance_members.alliance_id
            AND am.user_id = auth.uid()
            AND am.is_active = true
        )
    );

-- ============================================================================
-- ALLIANCE EVENTS (Eventi alliance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS alliance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alliance_id VARCHAR(100) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_alliance_events_alliance_id ON alliance_events(alliance_id);
CREATE INDEX IF NOT EXISTS idx_alliance_events_start_date ON alliance_events(start_date);
CREATE INDEX IF NOT EXISTS idx_alliance_events_event_type ON alliance_events(event_type);

-- RLS
ALTER TABLE alliance_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Alliance events are viewable by members" ON alliance_events;
DROP POLICY IF EXISTS "Alliance admins can manage events" ON alliance_events;

CREATE POLICY "Alliance events are viewable by members"
    ON alliance_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM alliance_members am
            WHERE am.alliance_id = alliance_events.alliance_id
            AND am.user_id = auth.uid()
            AND am.is_active = true
        )
    );

CREATE POLICY "Alliance admins can manage events"
    ON alliance_events FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM alliance_members am
            WHERE am.alliance_id = alliance_events.alliance_id
            AND am.user_id = auth.uid()
            AND am.role IN ('admin', 'moderator')
            AND am.is_active = true
        )
    );

-- ============================================================================
-- EVENT NOTIFICATIONS (Notifiche eventi)
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES alliance_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false,
    metadata JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_notifications_event_id ON event_notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_event_notifications_user_id ON event_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_event_notifications_is_read ON event_notifications(is_read);

-- RLS
ALTER TABLE event_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own event notifications" ON event_notifications;
DROP POLICY IF EXISTS "System can insert event notifications" ON event_notifications;

CREATE POLICY "Users can read own event notifications"
    ON event_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert event notifications"
    ON event_notifications FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at on financial_calculations
DROP TRIGGER IF EXISTS update_financial_calculations_updated_at ON financial_calculations;
CREATE TRIGGER update_financial_calculations_updated_at
    BEFORE UPDATE ON financial_calculations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on pac_simulations
DROP TRIGGER IF EXISTS update_pac_simulations_updated_at ON pac_simulations;
CREATE TRIGGER update_pac_simulations_updated_at
    BEFORE UPDATE ON pac_simulations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on alliance_events
DROP TRIGGER IF EXISTS update_alliance_events_updated_at ON alliance_events;
CREATE TRIGGER update_alliance_events_updated_at
    BEFORE UPDATE ON alliance_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

