# Database Schema Completo - Documentazione

**Data**: 2025-01-27  
**Versione**: 1.0.0  
**Status**: Production-Ready

---

## 📋 OVERVIEW

Documentazione completa di tutti gli schemi database implementati, con RLS policies, indexes e best practices PostgreSQL.

---

## 🗄️ TABELLE IMPLEMENTATE

### 1. Portfolio Positions (`portfolio_positions`)
**File**: `supabase/portfolio-schema.sql`

**Schema**:
```sql
CREATE TABLE portfolio_positions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  symbol TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  total_value NUMERIC NOT NULL,
  current_price NUMERIC,
  current_value NUMERIC,
  change_amount NUMERIC,
  change_percent NUMERIC,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**RLS Policies**:
- ✅ Users can view own positions
- ✅ Users can insert own positions
- ✅ Users can update own positions
- ✅ Users can delete own positions

**Indexes**:
- `idx_portfolio_positions_user` (user_id, created_at)
- `idx_portfolio_positions_symbol` (symbol)

**Triggers**:
- `update_portfolio_positions_updated_at` - Auto-update updated_at

---

### 2. Trading Journal (`trading_journal`)
**File**: `supabase/trading-journal-schema.sql`

**Schema**:
```sql
CREATE TABLE trading_journal (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  symbol TEXT NOT NULL,
  trade_type TEXT CHECK (trade_type IN ('buy', 'sell', 'long', 'short')),
  entry_date TIMESTAMPTZ NOT NULL,
  exit_date TIMESTAMPTZ,
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC,
  quantity NUMERIC NOT NULL,
  profit_loss NUMERIC,
  profit_loss_percent NUMERIC,
  entry_fee NUMERIC,
  exit_fee NUMERIC,
  total_fees NUMERIC,
  strategy TEXT,
  setup_type TEXT,
  timeframe TEXT,
  entry_reason TEXT,
  exit_reason TEXT,
  notes TEXT,
  emotions TEXT,
  tags TEXT[],
  category TEXT,
  risk_reward_ratio NUMERIC,
  max_drawdown NUMERIC,
  holding_period_days INTEGER,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**RLS Policies**:
- ✅ Users can view own trades
- ✅ Users can insert own trades
- ✅ Users can update own trades
- ✅ Users can delete own trades

**Indexes**:
- `idx_trading_journal_user` (user_id, entry_date)
- `idx_trading_journal_symbol` (symbol)
- `idx_trading_journal_closed` (user_id, is_closed)

**Triggers**:
- `update_trading_journal_updated_at` - Auto-update updated_at
- `calculate_trade_pnl_trigger` - Auto-calcola P&L, fees, holding period

---

### 3. User Alerts (`watchlist_alerts`)
**File**: `supabase/watchlist-schema.sql`

**Nota**: Usa `watchlist_alerts` esistente invece di creare `user_alerts` separato.

**Schema**:
```sql
CREATE TABLE watchlist_alerts (
  id UUID PRIMARY KEY,
  watchlist_id UUID REFERENCES watchlist,
  user_id UUID REFERENCES auth.users,
  alert_type TEXT CHECK (alert_type IN ('price_above', 'price_below', ...)),
  target_value NUMERIC NOT NULL,
  comparison_operator TEXT,
  notify_via_push BOOLEAN,
  notify_via_email BOOLEAN,
  notify_via_sms BOOLEAN,
  is_active BOOLEAN,
  is_triggered BOOLEAN,
  triggered_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**RLS Policies**: ✅ Implementate in watchlist-schema.sql

**Indexes**: ✅ Implementati in watchlist-schema.sql

---

### 4. Course Progress (`education_user_progress`)
**File**: `supabase/add-education-system-schema.sql`

**Nota**: Usa `education_user_progress` esistente invece di `course_progress`.

**Schema**:
```sql
CREATE TABLE education_user_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  module_id UUID REFERENCES education_modules,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'locked')),
  progress_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, module_id)
);
```

**RLS Policies**: ✅ Implementate in add-education-system-schema.sql

**Indexes**: ✅ Implementati in add-education-system-schema.sql

---

### 5. Quiz Results (`education_user_test_attempts`)
**File**: `supabase/add-education-system-schema.sql`

**Nota**: Usa `education_user_test_attempts` esistente invece di `quiz_results`.

**Schema**:
```sql
CREATE TABLE education_user_test_attempts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  test_id UUID REFERENCES education_tests,
  attempt_number INTEGER NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN DEFAULT false,
  time_spent_seconds INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  answers JSONB,
  created_at TIMESTAMPTZ,
  UNIQUE(user_id, test_id, attempt_number)
);
```

**RLS Policies**: ✅ Implementate in add-education-system-schema.sql

**Indexes**: ✅ Implementati in add-education-system-schema.sql

---

## 🔒 RLS POLICIES SUMMARY

### Pattern Standard
Tutte le tabelle user-specific seguono questo pattern:

```sql
-- View own data
CREATE POLICY "Users can view own data"
  ON table_name FOR SELECT
  USING (auth.uid() = user_id);

-- Insert own data
CREATE POLICY "Users can insert own data"
  ON table_name FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update own data
CREATE POLICY "Users can update own data"
  ON table_name FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Delete own data
CREATE POLICY "Users can delete own data"
  ON table_name FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 📊 INDEXES OPTIMIZATION

### Best Practices Applicate

1. **User Queries**: Index su `user_id` + campo di ordinamento
   ```sql
   CREATE INDEX idx_table_user ON table_name(user_id, created_at DESC);
   ```

2. **Filter Queries**: Index su campi filtrati frequentemente
   ```sql
   CREATE INDEX idx_table_status ON table_name(user_id, status) WHERE status = 'active';
   ```

3. **Foreign Keys**: Index automatici su foreign keys

4. **Composite Indexes**: Per query multi-campo
   ```sql
   CREATE INDEX idx_table_composite ON table_name(user_id, symbol, created_at);
   ```

---

## 🔄 TRIGGERS & FUNCTIONS

### Auto-Update Timestamps
Tutte le tabelle con `updated_at` hanno trigger:

```sql
CREATE TRIGGER update_table_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Auto-Calculate Fields
- `trading_journal`: Auto-calcola P&L, fees, holding period
- `portfolio_positions`: Calcolo `total_value` (può essere aggiunto)

---

## ✅ CHECKLIST COMPLETAMENTO

### Tabelle Core
- [x] `portfolio_positions` - Schema completo ✅
- [x] `trading_journal` - Schema completo ✅
- [x] `watchlist_alerts` - Schema esistente ✅
- [x] `education_user_progress` - Schema esistente ✅
- [x] `education_user_test_attempts` - Schema esistente ✅

### RLS Policies
- [x] Portfolio positions - ✅
- [x] Trading journal - ✅
- [x] Watchlist alerts - ✅
- [x] Education progress - ✅

### Indexes
- [x] Portfolio positions - ✅
- [x] Trading journal - ✅
- [x] Watchlist alerts - ✅
- [x] Education progress - ✅

### Triggers
- [x] Auto-update timestamps - ✅
- [x] Auto-calculate P&L - ✅

---

## 📚 BEST PRACTICES

### 1. Naming Conventions
- Tabelle: `snake_case`
- Colonne: `snake_case`
- Indexes: `idx_table_column`
- Policies: `"Users can action own data"`

### 2. Data Types
- UUID per IDs
- NUMERIC per valori monetari (precisione)
- TIMESTAMPTZ per date (timezone-aware)
- TEXT per stringhe variabili
- JSONB per dati strutturati

### 3. Constraints
- CHECK constraints per enum values
- NOT NULL per campi obbligatori
- UNIQUE per vincoli univoci
- FOREIGN KEY per relazioni

### 4. Performance
- Indexes su campi filtrati/ordinati
- Partial indexes per query comuni
- Composite indexes per query multi-campo

---

## 🚀 DEPLOYMENT

### Ordine di Esecuzione
1. `add-education-system-schema.sql` (se non già eseguito)
2. `watchlist-schema.sql` (se non già eseguito)
3. `portfolio-schema.sql`
4. `trading-journal-schema.sql`

### Verifica Post-Deploy
```sql
-- Verifica tabelle
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('portfolio_positions', 'trading_journal', 'watchlist_alerts', 'education_user_progress');

-- Verifica RLS
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('portfolio_positions', 'trading_journal');

-- Verifica Indexes
SELECT indexname, indexdef FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('portfolio_positions', 'trading_journal');
```

---

**Status**: Production-Ready  
**Last Updated**: 2025-01-27

