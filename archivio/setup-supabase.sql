-- ============================================
-- Supabase - Setup Database Tradelia Archivio
-- ============================================
-- Eseguire in Supabase Dashboard → SQL Editor
-- ============================================

-- ===== TABELLA ABBONATI =====
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== TABELLA PUSH SUBSCRIPTIONS =====
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== INDICI PER PERFORMANCE =====
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscription_id ON subscribers(subscription_id);

-- ===== TRIGGER PER UPDATED_AT =====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===== ROW LEVEL SECURITY (RLS) =====
-- Abilita RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Gli utenti autenticati possono vedere solo i propri dati
-- Nota: auth.uid() restituisce l'UUID dell'utente autenticato
-- Dobbiamo aggiungere un campo auth_user_id per collegare auth.users a subscribers
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Policy per subscribers
CREATE POLICY "Users can view own data" ON subscribers
  FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own data" ON subscribers
  FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own data" ON subscribers
  FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Policy per push subscriptions
CREATE POLICY "Users can view own subscriptions" ON push_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM subscribers 
      WHERE subscribers.id = push_subscriptions.user_id 
      AND subscribers.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own subscriptions" ON push_subscriptions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM subscribers 
      WHERE subscribers.id = push_subscriptions.user_id 
      AND subscribers.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own subscriptions" ON push_subscriptions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM subscribers 
      WHERE subscribers.id = push_subscriptions.user_id 
      AND subscribers.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own subscriptions" ON push_subscriptions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM subscribers 
      WHERE subscribers.id = push_subscriptions.user_id 
      AND subscribers.auth_user_id = auth.uid()
    )
  );

-- ===== TABELLA VOTI =====
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticker TEXT NOT NULL,
  votes INTEGER NOT NULL CHECK (votes >= 1 AND votes <= 10),
  user_id UUID REFERENCES subscribers(id) ON DELETE SET NULL,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_votes_ticker ON votes(ticker);
CREATE INDEX IF NOT EXISTS idx_votes_date ON votes(date);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_auth_user_id ON votes(auth_user_id);

-- Trigger per updated_at (se necessario in futuro)
-- CREATE TRIGGER update_votes_updated_at
--   BEFORE UPDATE ON votes
--   FOR EACH ROW
--   EXECUTE FUNCTION update_updated_at_column();

-- RLS per votes (tutti possono vedere, solo autenticati possono votare)
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policy: Tutti possono vedere i voti (per ranking pubblico)
CREATE POLICY "Anyone can view votes" ON votes
  FOR SELECT
  USING (true);

-- Policy: Solo utenti autenticati possono votare
CREATE POLICY "Authenticated users can vote" ON votes
  FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- Policy: Utenti possono aggiornare solo i propri voti
CREATE POLICY "Users can update own votes" ON votes
  FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Policy: Utenti possono cancellare solo i propri voti
CREATE POLICY "Users can delete own votes" ON votes
  FOR DELETE
  USING (auth.uid() = auth_user_id);

-- ===== VERIFICA TABELLE =====
-- Eseguire per verificare che tutto sia stato creato correttamente
SELECT 
  'subscribers' as table_name,
  COUNT(*) as row_count
FROM subscribers
UNION ALL
SELECT 
  'push_subscriptions' as table_name,
  COUNT(*) as row_count
FROM push_subscriptions
UNION ALL
SELECT 
  'votes' as table_name,
  COUNT(*) as row_count
FROM votes;

