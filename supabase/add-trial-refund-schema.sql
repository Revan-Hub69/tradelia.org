-- ============================================
-- Trial Period e Refund Schema
-- Supporto per 14 giorni trial gratuito e money-back guarantee
-- ============================================

-- Migliora tabella subscriptions per supportare trial
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS refund_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_ends_at 
  ON subscriptions(trial_ends_at) 
  WHERE status = 'trial';

CREATE INDEX IF NOT EXISTS idx_subscriptions_refund_requested 
  ON subscriptions(refund_requested_at) 
  WHERE refund_requested_at IS NOT NULL;

-- Tabella per tracking trial usage (evita abusi)
CREATE TABLE IF NOT EXISTS trial_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('pro', 'desk')),
  trial_started_at TIMESTAMPTZ NOT NULL,
  trial_ends_at TIMESTAMPTZ NOT NULL,
  converted_to_paid BOOLEAN DEFAULT false,
  cancelled_during_trial BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_type) -- Un solo trial per tipo piano per utente
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_trial_usage_user_id ON trial_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_usage_email ON trial_usage(email);
CREATE INDEX IF NOT EXISTS idx_trial_usage_trial_ends_at ON trial_usage(trial_ends_at);

-- Tabella per tracking refunds
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  xolo_refund_id TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_refunds_user_id ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_subscription_id ON refunds(subscription_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON refunds(created_at);

-- Funzione per verificare se utente può usare trial
CREATE OR REPLACE FUNCTION can_use_trial(p_user_id UUID, p_plan_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_trial_count INTEGER;
BEGIN
  -- Verifica se ha già usato trial per questo tipo di piano
  SELECT COUNT(*) INTO v_trial_count
  FROM trial_usage
  WHERE user_id = p_user_id
    AND plan_type = p_plan_type;
  
  RETURN v_trial_count = 0; -- True se non ha mai usato trial
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per verificare eligibilità rimborso (14 giorni)
CREATE OR REPLACE FUNCTION can_refund(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_order_created_at TIMESTAMPTZ;
  v_order_status TEXT;
  v_days_since_payment INTEGER;
BEGIN
  SELECT created_at, status INTO v_order_created_at, v_order_status
  FROM orders
  WHERE id = p_order_id;
  
  IF NOT FOUND OR v_order_status != 'paid' THEN
    RETURN false;
  END IF;
  
  -- Calcola giorni da pagamento
  v_days_since_payment := EXTRACT(EPOCH FROM (NOW() - v_order_created_at)) / 86400;
  
  RETURN v_days_since_payment <= 14; -- Entro 14 giorni
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_refunds_updated_at
  BEFORE UPDATE ON refunds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commenti per documentazione
COMMENT ON TABLE trial_usage IS 'Tracking trial period usage per evitare abusi';
COMMENT ON TABLE refunds IS 'Tracking refunds per money-back guarantee 14 giorni';
COMMENT ON FUNCTION can_use_trial IS 'Verifica se utente può usare trial (solo prima volta)';
COMMENT ON FUNCTION can_refund IS 'Verifica se ordine è eligibile per rimborso (entro 14 giorni)';
