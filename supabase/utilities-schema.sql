-- Schema per Utilities Pro: Financial Calculator, PAC Simulator, Expense Tracker

-- Financial Calculator History
CREATE TABLE IF NOT EXISTS financial_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calculation_type TEXT NOT NULL CHECK (calculation_type IN ('compound', 'present', 'future', 'annuity')),
  inputs JSONB NOT NULL, -- { principal, rate, time, payment, futureValue }
  result NUMERIC(15, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PAC Simulator History
CREATE TABLE IF NOT EXISTS pac_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_amount NUMERIC(15, 2) NOT NULL,
  annual_return NUMERIC(5, 2) NOT NULL,
  years INTEGER NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'yearly')),
  future_value NUMERIC(15, 2) NOT NULL,
  total_invested NUMERIC(15, 2) NOT NULL,
  total_return NUMERIC(15, 2) NOT NULL,
  return_percentage NUMERIC(5, 2) NOT NULL,
  yearly_data JSONB, -- Array di { year, invested, value, return }
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes per performance
CREATE INDEX IF NOT EXISTS idx_financial_calculations_user_id ON financial_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_calculations_created_at ON financial_calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pac_simulations_user_id ON pac_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_pac_simulations_created_at ON pac_simulations(created_at DESC);

-- RLS Policies
ALTER TABLE financial_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pac_simulations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own calculations
CREATE POLICY "Users can view own financial calculations"
  ON financial_calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial calculations"
  ON financial_calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial calculations"
  ON financial_calculations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial calculations"
  ON financial_calculations FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Users can only see their own PAC simulations
CREATE POLICY "Users can view own PAC simulations"
  ON pac_simulations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own PAC simulations"
  ON pac_simulations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own PAC simulations"
  ON pac_simulations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own PAC simulations"
  ON pac_simulations FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers per updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_financial_calculations_updated_at
  BEFORE UPDATE ON financial_calculations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pac_simulations_updated_at
  BEFORE UPDATE ON pac_simulations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

