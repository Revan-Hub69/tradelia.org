-- Widget Notifications System
-- Sistema notifiche specifico per widget installabili

CREATE TABLE IF NOT EXISTS widget_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL, -- 'crypto-whale', 'crypto-depth', 'crypto-movers'
  notification_type TEXT NOT NULL, -- 'threshold', 'alert', 'update', 'milestone'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb, -- Dati aggiuntivi (es: valore threshold, asset, etc.)
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_sent BOOLEAN NOT NULL DEFAULT false, -- Se inviata via push/email
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- Notifiche temporanee (es: alert prezzo)
  CONSTRAINT valid_widget_type CHECK (widget_type IN ('crypto-whale', 'crypto-depth', 'crypto-movers', 'portfolio', 'watchlist', 'alerts')),
  CONSTRAINT valid_notification_type CHECK (notification_type IN ('threshold', 'alert', 'update', 'milestone', 'error')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Index per performance
CREATE INDEX IF NOT EXISTS idx_widget_notifications_user_id ON widget_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_notifications_widget_type ON widget_notifications(widget_type);
CREATE INDEX IF NOT EXISTS idx_widget_notifications_unread ON widget_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_widget_notifications_created_at ON widget_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_widget_notifications_expires_at ON widget_notifications(expires_at) WHERE expires_at IS NOT NULL;

-- RLS Policies
ALTER TABLE widget_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notifications
CREATE POLICY "Users can view their own widget notifications"
  ON widget_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own notifications (via API only)
CREATE POLICY "Users can insert their own widget notifications"
  ON widget_notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own widget notifications"
  ON widget_notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete their own widget notifications"
  ON widget_notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger per updated_at (se esiste la funzione)
CREATE TRIGGER update_widget_notifications_updated_at
  BEFORE UPDATE ON widget_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Tabella per preferenze notifiche widget
CREATE TABLE IF NOT EXISTS widget_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  channels TEXT[] NOT NULL DEFAULT ARRAY['in-app']::TEXT[], -- 'in-app', 'push', 'email'
  threshold_config JSONB DEFAULT '{}'::jsonb, -- Configurazione threshold (es: valore minimo per notifica)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, widget_type, notification_type),
  CONSTRAINT valid_widget_type_pref CHECK (widget_type IN ('crypto-whale', 'crypto-depth', 'crypto-movers', 'portfolio', 'watchlist', 'alerts')),
  CONSTRAINT valid_notification_type_pref CHECK (notification_type IN ('threshold', 'alert', 'update', 'milestone', 'error')),
  CONSTRAINT valid_channels CHECK (
    array_length(channels, 1) > 0 AND
    channels <@ ARRAY['in-app', 'push', 'email']::TEXT[]
  )
);

-- Index per preferenze
CREATE INDEX IF NOT EXISTS idx_widget_notification_preferences_user_id ON widget_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_notification_preferences_widget ON widget_notification_preferences(user_id, widget_type);

-- RLS Policies per preferenze
ALTER TABLE widget_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own widget notification preferences"
  ON widget_notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own widget notification preferences"
  ON widget_notification_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger per updated_at
CREATE TRIGGER update_widget_notification_preferences_updated_at
  BEFORE UPDATE ON widget_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Funzione per pulire notifiche scadute (eseguita periodicamente)
CREATE OR REPLACE FUNCTION cleanup_expired_widget_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM widget_notifications
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND is_read = true; -- Rimuovi solo quelle lette e scadute
END;
$$;

COMMENT ON TABLE widget_notifications IS 'Notifiche specifiche per widget installabili';
COMMENT ON TABLE widget_notification_preferences IS 'Preferenze utente per notifiche widget';
COMMENT ON FUNCTION cleanup_expired_widget_notifications IS 'Pulisce notifiche widget scadute e lette';
