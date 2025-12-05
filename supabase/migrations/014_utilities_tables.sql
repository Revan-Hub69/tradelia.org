-- Utilities Tables for Financial Calculator and PAC Simulator
-- Creates tables for saving calculations and simulations
-- Version: 014
-- Date: 2025-01-27
--
-- IMPORTANT: This migration is idempotent - safe to run multiple times
SET search_path = public;

-- Table for financial calculations
CREATE TABLE IF NOT EXISTS financial_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calculation_type VARCHAR(50) NOT NULL CHECK (calculation_type IN ('compound', 'present', 'future', 'annuity')),
  inputs JSONB NOT NULL DEFAULT '{}',
  result NUMERIC(15, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for PAC simulations
-- Note: Table may already exist from migration 009, so we check and add missing columns
DO $$
BEGIN
  -- Create table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pac_simulations') THEN
    CREATE TABLE pac_simulations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      monthly_amount NUMERIC(15, 2) NOT NULL,
      annual_return NUMERIC(5, 2) NOT NULL,
      years INTEGER NOT NULL CHECK (years > 0 AND years <= 100),
      frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'yearly')),
      future_value NUMERIC(15, 2) NOT NULL,
      total_invested NUMERIC(15, 2) NOT NULL,
      total_return NUMERIC(15, 2) NOT NULL,
      return_percentage NUMERIC(5, 2) NOT NULL,
      yearly_data JSONB,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  ELSE
    -- Table exists, add missing columns from new schema
    -- Add yearly_data if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'pac_simulations' 
      AND column_name = 'yearly_data'
    ) THEN
      ALTER TABLE pac_simulations ADD COLUMN yearly_data JSONB;
    END IF;
    
    -- Add other new columns if they don't exist (for migration from 009 to 014)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'pac_simulations' 
      AND column_name = 'annual_return'
    ) THEN
      ALTER TABLE pac_simulations ADD COLUMN annual_return NUMERIC(5, 2);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'pac_simulations' 
      AND column_name = 'years'
    ) THEN
      ALTER TABLE pac_simulations ADD COLUMN years INTEGER;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'pac_simulations' 
      AND column_name = 'frequency'
    ) THEN
      ALTER TABLE pac_simulations ADD COLUMN frequency VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'pac_simulations' 
      AND column_name = 'future_value'
    ) THEN
      ALTER TABLE pac_simulations ADD COLUMN future_value NUMERIC(15, 2);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'pac_simulations' 
      AND column_name = 'total_invested'
    ) THEN
      ALTER TABLE pac_simulations ADD COLUMN total_invested NUMERIC(15, 2);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'pac_simulations' 
      AND column_name = 'total_return'
    ) THEN
      ALTER TABLE pac_simulations ADD COLUMN total_return NUMERIC(15, 2);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'pac_simulations' 
      AND column_name = 'return_percentage'
    ) THEN
      ALTER TABLE pac_simulations ADD COLUMN return_percentage NUMERIC(5, 2);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'pac_simulations' 
      AND column_name = 'notes'
    ) THEN
      ALTER TABLE pac_simulations ADD COLUMN notes TEXT;
    END IF;
  END IF;
END
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_calculations_user_id ON financial_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_calculations_type ON financial_calculations(calculation_type);
CREATE INDEX IF NOT EXISTS idx_financial_calculations_created_at ON financial_calculations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pac_simulations_user_id ON pac_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_pac_simulations_created_at ON pac_simulations(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE financial_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pac_simulations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial_calculations
DROP POLICY IF EXISTS "Users can view their own calculations" ON financial_calculations;
CREATE POLICY "Users can view their own calculations"
  ON financial_calculations
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own calculations" ON financial_calculations;
CREATE POLICY "Users can insert their own calculations"
  ON financial_calculations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own calculations" ON financial_calculations;
CREATE POLICY "Users can update their own calculations"
  ON financial_calculations
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own calculations" ON financial_calculations;
CREATE POLICY "Users can delete their own calculations"
  ON financial_calculations
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for pac_simulations
-- Drop old policy from 009 if it exists and create new granular policies
DROP POLICY IF EXISTS "Users can manage own PAC simulations" ON pac_simulations;
DROP POLICY IF EXISTS "Users can view their own simulations" ON pac_simulations;
DROP POLICY IF EXISTS "Users can insert their own simulations" ON pac_simulations;
DROP POLICY IF EXISTS "Users can update their own simulations" ON pac_simulations;
DROP POLICY IF EXISTS "Users can delete their own simulations" ON pac_simulations;

-- Create new granular policies
CREATE POLICY "Users can view their own simulations"
  ON pac_simulations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own simulations"
  ON pac_simulations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own simulations"
  ON pac_simulations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own simulations"
  ON pac_simulations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_financial_calculations_updated_at ON financial_calculations;
CREATE TRIGGER update_financial_calculations_updated_at
  BEFORE UPDATE ON financial_calculations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pac_simulations_updated_at ON pac_simulations;
CREATE TRIGGER update_pac_simulations_updated_at
  BEFORE UPDATE ON pac_simulations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE financial_calculations IS 'Saved financial calculations for users';
COMMENT ON TABLE pac_simulations IS 'Saved PAC (Piano di Accumulo Capitale) simulations for users';
COMMENT ON COLUMN financial_calculations.calculation_type IS 'Type of calculation: compound, present, future, annuity';
COMMENT ON COLUMN financial_calculations.inputs IS 'JSON object with input parameters used for the calculation';
-- Add comment only if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'pac_simulations' 
    AND column_name = 'yearly_data'
  ) THEN
    COMMENT ON COLUMN pac_simulations.yearly_data IS 'JSON array with yearly progression data';
  END IF;
END
$$;
