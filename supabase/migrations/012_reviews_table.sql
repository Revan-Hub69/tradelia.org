-- Migration: Reviews Table
-- Description: Tabella per recensioni utenti verificate e pubbliche
-- Best Practice: Solo utenti loggati possono vedere recensioni

-- Tabella reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL CHECK (user_role IN ('trial', 'pro', 'desk', 'admin')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK (char_length(comment) >= 10 AND char_length(comment) <= 1000),
  verified BOOLEAN DEFAULT false,
  public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_reviews_public ON reviews(public) WHERE public = true;
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- RLS Policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Tutti possono leggere recensioni pubbliche e verificate
CREATE POLICY "Anyone can view verified public reviews"
  ON reviews
  FOR SELECT
  USING (public = true AND verified = true);

-- Policy: Solo utenti autenticati possono creare recensioni
CREATE POLICY "Authenticated users can create reviews"
  ON reviews
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Utenti possono aggiornare solo le proprie recensioni
CREATE POLICY "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Utenti possono eliminare solo le proprie recensioni
CREATE POLICY "Users can delete their own reviews"
  ON reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- Commenti per documentazione
COMMENT ON TABLE reviews IS 'Recensioni utenti verificate e pubbliche. Solo utenti loggati possono vedere le recensioni.';
COMMENT ON COLUMN reviews.verified IS 'Recensione verificata da admin';
COMMENT ON COLUMN reviews.public IS 'Recensione pubblica e visibile a tutti gli utenti loggati';
