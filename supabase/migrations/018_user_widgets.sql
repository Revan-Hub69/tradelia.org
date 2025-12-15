-- User Widgets System
-- Permette agli utenti Pro di installare/rimuovere widget personalizzati

CREATE TABLE IF NOT EXISTS user_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL, -- 'crypto-whale', 'crypto-depth', 'crypto-movers', 'futures', 'options', 'forex'
  position INTEGER NOT NULL DEFAULT 0, -- Ordine di visualizzazione
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb, -- Configurazione personalizzata del widget
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, widget_type)
);

-- Index per performance
CREATE INDEX IF NOT EXISTS idx_user_widgets_user_id ON user_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_widgets_enabled ON user_widgets(user_id, is_enabled) WHERE is_enabled = true;

-- RLS Policies
ALTER TABLE user_widgets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own widgets
CREATE POLICY "Users can view their own widgets"
  ON user_widgets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own widgets
CREATE POLICY "Users can insert their own widgets"
  ON user_widgets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own widgets
CREATE POLICY "Users can update their own widgets"
  ON user_widgets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own widgets
CREATE POLICY "Users can delete their own widgets"
  ON user_widgets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger per updated_at
CREATE TRIGGER update_user_widgets_updated_at
  BEFORE UPDATE ON user_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Widget types enum (per validazione)
-- Nota: Non creiamo un ENUM PostgreSQL perché vogliamo flessibilità per aggiungere nuovi widget types

COMMENT ON TABLE user_widgets IS 'Widget installati dagli utenti Pro per personalizzare la dashboard';
COMMENT ON COLUMN user_widgets.widget_type IS 'Tipo di widget: crypto-whale, crypto-depth, crypto-movers, futures, options, forex';
COMMENT ON COLUMN user_widgets.position IS 'Posizione del widget nella dashboard (0 = primo)';
COMMENT ON COLUMN user_widgets.config IS 'Configurazione personalizzata del widget (es: simboli preferiti, refresh rate, etc.)';
