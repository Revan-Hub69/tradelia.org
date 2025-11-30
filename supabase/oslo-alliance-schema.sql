-- ============================================
-- OSLO - Schema Database per Alleanze e Eventi
-- ============================================

-- Estensione per UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELLE PRINCIPALI
-- ============================================

-- Tabelle Alleanze
CREATE TABLE IF NOT EXISTS alliances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Membri Alleanza
CREATE TABLE IF NOT EXISTS alliance_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alliance_id UUID NOT NULL REFERENCES alliances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'officer', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alliance_id, user_id)
);

-- Eventi Alleanza
CREATE TABLE IF NOT EXISTS alliance_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alliance_id UUID NOT NULL REFERENCES alliances(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) DEFAULT 'general' CHECK (event_type IN ('raid', 'war', 'donation', 'meeting', 'general', 'other')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern VARCHAR(50) CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', NULL)),
  recurrence_end_date TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifiche Eventi (log notifiche inviate)
CREATE TABLE IF NOT EXISTS event_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alliance_id UUID REFERENCES alliances(id) ON DELETE CASCADE,
  event_id UUID REFERENCES alliance_events(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('daily_summary', 'pre_event_40min', 'event_started', 'event_ended', 'immediate_push')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  recipients_count INTEGER DEFAULT 0,
  error_message TEXT
);

-- Partecipazioni Eventi
CREATE TABLE IF NOT EXISTS event_participations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES alliance_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('confirmed', 'declined', 'pending', 'maybe')),
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(event_id, user_id)
);

-- ============================================
-- INDICI per Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_alliance_members_alliance ON alliance_members(alliance_id);
CREATE INDEX IF NOT EXISTS idx_alliance_members_user ON alliance_members(user_id);
CREATE INDEX IF NOT EXISTS idx_alliance_events_alliance ON alliance_events(alliance_id);
CREATE INDEX IF NOT EXISTS idx_alliance_events_start_time ON alliance_events(start_time);
CREATE INDEX IF NOT EXISTS idx_alliance_events_recurring ON alliance_events(is_recurring, recurrence_pattern);
CREATE INDEX IF NOT EXISTS idx_event_notifications_event ON event_notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_event_notifications_type ON event_notifications(notification_type, sent_at);
CREATE INDEX IF NOT EXISTS idx_event_participations_event ON event_participations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participations_user ON event_participations(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Abilita RLS su tutte le tabelle
ALTER TABLE alliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE alliance_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE alliance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participations ENABLE ROW LEVEL SECURITY;

-- Policies per ALLIANCES
CREATE POLICY "Users can view alliances they belong to"
  ON alliances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM alliance_members
      WHERE alliance_members.alliance_id = alliances.id
      AND alliance_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create alliances"
  ON alliances FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update their alliances"
  ON alliances FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM alliance_members
      WHERE alliance_members.alliance_id = alliances.id
      AND alliance_members.user_id = auth.uid()
      AND alliance_members.role IN ('admin', 'officer')
    )
  );

-- Policies per ALLIANCE_MEMBERS
CREATE POLICY "Users can view members of their alliances"
  ON alliance_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM alliance_members am
      WHERE am.alliance_id = alliance_members.alliance_id
      AND am.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can add members"
  ON alliance_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM alliance_members
      WHERE alliance_id = alliance_members.alliance_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'officer')
    )
  );

CREATE POLICY "Users can update their own membership"
  ON alliance_members FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can remove members"
  ON alliance_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM alliance_members am
      WHERE am.alliance_id = alliance_members.alliance_id
      AND am.user_id = auth.uid()
      AND am.role IN ('admin', 'officer')
    )
  );

-- Policies per ALLIANCE_EVENTS
CREATE POLICY "Members can view events of their alliances"
  ON alliance_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM alliance_members
      WHERE alliance_members.alliance_id = alliance_events.alliance_id
      AND alliance_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and officers can create events"
  ON alliance_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM alliance_members
      WHERE alliance_members.alliance_id = alliance_events.alliance_id
      AND alliance_members.user_id = auth.uid()
      AND alliance_members.role IN ('admin', 'officer')
    )
  );

CREATE POLICY "Admins and officers can update events"
  ON alliance_events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM alliance_members
      WHERE alliance_members.alliance_id = alliance_events.alliance_id
      AND alliance_members.user_id = auth.uid()
      AND alliance_members.role IN ('admin', 'officer')
    )
  );

CREATE POLICY "Admins and officers can delete events"
  ON alliance_events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM alliance_members
      WHERE alliance_members.alliance_id = alliance_events.alliance_id
      AND alliance_members.user_id = auth.uid()
      AND alliance_members.role IN ('admin', 'officer')
    )
  );

-- Policies per EVENT_NOTIFICATIONS
CREATE POLICY "Admins can view notifications"
  ON event_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM alliance_events ae
      JOIN alliance_members am ON am.alliance_id = ae.alliance_id
      WHERE ae.id = event_notifications.event_id
      AND am.user_id = auth.uid()
      AND am.role IN ('admin', 'officer')
    )
  );

-- Policies per EVENT_PARTICIPATIONS
CREATE POLICY "Members can view participations of their alliance events"
  ON event_participations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM alliance_events ae
      JOIN alliance_members am ON am.alliance_id = ae.alliance_id
      WHERE ae.id = event_participations.event_id
      AND am.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own participations"
  ON event_participations FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- FUNZIONI UTILITY
-- ============================================

-- Funzione per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per updated_at
CREATE TRIGGER update_alliances_updated_at
  BEFORE UPDATE ON alliances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alliance_events_updated_at
  BEFORE UPDATE ON alliance_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Funzione per aggiornare last_active
CREATE OR REPLACE FUNCTION update_member_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_alliance_members_last_active
  BEFORE UPDATE ON alliance_members
  FOR EACH ROW
  EXECUTE FUNCTION update_member_last_active();

-- ============================================
-- FUNZIONI per NOTIFICHE
-- ============================================

-- Funzione per ottenere membri alleanza con push subscriptions
CREATE OR REPLACE FUNCTION get_alliance_members_with_push(alliance_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  subscription JSONB,
  role VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    am.user_id,
    ps.subscription,
    am.role
  FROM alliance_members am
  LEFT JOIN push_subscriptions ps ON ps.user_id = am.user_id
  WHERE am.alliance_id = alliance_uuid
  AND ps.subscription IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere eventi del giorno
CREATE OR REPLACE FUNCTION get_today_events(alliance_uuid UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  start_time TIMESTAMPTZ,
  event_type VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ae.id,
    ae.title,
    ae.start_time,
    ae.event_type
  FROM alliance_events ae
  WHERE ae.alliance_id = alliance_uuid
  AND DATE(ae.start_time) = CURRENT_DATE
  AND (ae.is_recurring = FALSE OR ae.recurrence_end_date IS NULL OR ae.recurrence_end_date >= CURRENT_DATE)
  ORDER BY ae.start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere eventi nei prossimi 40 minuti
CREATE OR REPLACE FUNCTION get_events_in_40min(alliance_uuid UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  start_time TIMESTAMPTZ,
  event_type VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ae.id,
    ae.title,
    ae.start_time,
    ae.event_type
  FROM alliance_events ae
  WHERE ae.alliance_id = alliance_uuid
  AND ae.start_time BETWEEN NOW() AND NOW() + INTERVAL '40 minutes'
  AND (ae.is_recurring = FALSE OR ae.recurrence_end_date IS NULL OR ae.recurrence_end_date >= NOW())
  AND NOT EXISTS (
    SELECT 1 FROM event_notifications en
    WHERE en.event_id = ae.id
    AND en.notification_type = 'pre_event_40min'
    AND en.sent_at > NOW() - INTERVAL '1 hour'
  )
  ORDER BY ae.start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTI
-- ============================================

COMMENT ON TABLE alliances IS 'Tabelle delle alleanze di gioco';
COMMENT ON TABLE alliance_members IS 'Membri delle alleanze con ruoli';
COMMENT ON TABLE alliance_events IS 'Eventi organizzati dalle alleanze';
COMMENT ON TABLE event_notifications IS 'Log delle notifiche inviate per eventi';
COMMENT ON TABLE event_participations IS 'Partecipazioni dei membri agli eventi';

