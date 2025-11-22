-- ============================================
-- SCHEMA SERVIZI UNA TANTUM - Tradelia AI
-- ============================================
-- Best Practice: Tutti i servizi sono una tantum
-- Accessi temporanei (30 giorni) + Servizi immediati
-- ============================================

-- ===============================
-- 1. TABELLA ORDERS (Tutti gli ordini)
-- ============================================
-- Centralizza tutti gli ordini una tantum
-- ============================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  access_token TEXT, -- Per compatibilità con dashboard tokens
  order_type TEXT NOT NULL CHECK (order_type IN (
    'access_pro',           -- Accesso Pro 30 giorni (€19)
    'access_desk',          -- Accesso Desk 30 giorni (€149)
    'analysis_standalone',  -- Analisi standalone (€49)
    'analysis_extra_pro',   -- Analisi extra Pro (€29)
    'analysis_extra_desk',  -- Analisi extra Desk (€49)
    'pdf_download'          -- PDF download (€10)
  )),
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN (
    'pending_payment',
    'paid',
    'processing',
    'completed',
    'cancelled',
    'refunded',
    'failed'
  )),
  payment_method TEXT CHECK (payment_method IN ('stripe', 'xolo', 'manual')),
  payment_id TEXT, -- Stripe payment intent ID o Xolo invoice ID
  metadata JSONB DEFAULT '{}'::jsonb, -- Dati aggiuntivi (ticker, report_id, analysis_id, ecc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_token ON public.orders(access_token) WHERE access_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_type ON public.orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(payment_id) WHERE payment_id IS NOT NULL;

CREATE TRIGGER orders_set_timestamp
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE PROCEDURE public.moddatetime();

-- ===============================
-- 2. TABELLA ACCESS_GRANTS (Accessi temporanei)
-- ============================================
-- Traccia accessi Pro/Desk attivi (30 giorni)
-- ============================================

CREATE TABLE IF NOT EXISTS public.access_grants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  access_token TEXT, -- Per compatibilità
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  grant_type TEXT NOT NULL CHECK (grant_type IN ('pro', 'desk')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL, -- started_at + 30 giorni
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_grants_user ON public.access_grants(user_id, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_grants_token ON public.access_grants(access_token) WHERE access_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_access_grants_status ON public.access_grants(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_access_grants_expires ON public.access_grants(expires_at) WHERE status = 'active';

CREATE TRIGGER access_grants_set_timestamp
BEFORE UPDATE ON public.access_grants
FOR EACH ROW EXECUTE PROCEDURE public.moddatetime();

-- ===============================
-- 3. TABELLA SERVICE_DELIVERIES (Servizi erogati)
-- ============================================
-- Traccia servizi erogati (analisi, PDF)
-- ============================================

CREATE TABLE IF NOT EXISTS public.service_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  access_token TEXT,
  service_type TEXT NOT NULL CHECK (service_type IN ('analysis', 'pdf_download')),
  service_data JSONB NOT NULL, -- { ticker, report_id, analysis_id, file_url, ecc. }
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_deliveries_order ON public.service_deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_service_deliveries_user ON public.service_deliveries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_deliveries_token ON public.service_deliveries(access_token) WHERE access_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_service_deliveries_status ON public.service_deliveries(status);

CREATE TRIGGER service_deliveries_set_timestamp
BEFORE UPDATE ON public.service_deliveries
FOR EACH ROW EXECUTE PROCEDURE public.moddatetime();

-- ===============================
-- 4. TABELLA USAGE_TRACKING (Tracciamento utilizzo)
-- ============================================
-- Traccia utilizzo analisi incluse/extra e PDF
-- ============================================

CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  access_token TEXT,
  access_grant_id UUID REFERENCES public.access_grants(id) ON DELETE SET NULL,
  usage_type TEXT NOT NULL CHECK (usage_type IN (
    'analysis_included',  -- Analisi inclusa (Pro: 1, Desk: 2)
    'analysis_extra',     -- Analisi extra (Pro: max 3, Desk: illimitate)
    'pdf_download'        -- PDF scaricato
  )),
  service_delivery_id UUID REFERENCES public.service_deliveries(id) ON DELETE SET NULL,
  month_year TEXT NOT NULL, -- YYYY-MM per aggregazioni
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user ON public.usage_tracking(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_grant ON public.usage_tracking(access_grant_id) WHERE access_grant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_usage_tracking_type ON public.usage_tracking(usage_type, month_year);

-- ===============================
-- 5. FUNZIONI HELPER
-- ============================================

-- Funzione: Ottiene access grant attivo per utente
CREATE OR REPLACE FUNCTION public.get_active_access_grant(p_user_id UUID, p_token TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  grant_type TEXT,
  expires_at TIMESTAMPTZ,
  days_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ag.id,
    ag.grant_type,
    ag.expires_at,
    GREATEST(0, EXTRACT(DAY FROM (ag.expires_at - NOW()))::INTEGER) as days_remaining
  FROM public.access_grants ag
  WHERE ag.status = 'active'
    AND ag.expires_at > NOW()
    AND (
      (p_user_id IS NOT NULL AND ag.user_id = p_user_id) OR
      (p_token IS NOT NULL AND ag.access_token = p_token)
    )
  ORDER BY ag.expires_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione: Conta utilizzo per tipo
-- NOTA: Parametri riordinati per rispettare regola SQL (default dopo parametri senza default)
CREATE OR REPLACE FUNCTION public.get_usage_count(
  p_user_id UUID,
  p_usage_type TEXT,
  p_token TEXT DEFAULT NULL,
  p_month_year TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.usage_tracking ut
  WHERE ut.usage_type = p_usage_type
    AND (
      (p_user_id IS NOT NULL AND ut.user_id = p_user_id) OR
      (p_token IS NOT NULL AND ut.access_token = p_token)
    )
    AND (p_month_year IS NULL OR ut.month_year = p_month_year);
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione: Verifica se può usare analisi inclusa
CREATE OR REPLACE FUNCTION public.can_use_included_analysis(
  p_user_id UUID,
  p_token TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_grant RECORD;
  v_used INTEGER;
  v_max INTEGER;
BEGIN
  -- Ottieni access grant attivo
  SELECT * INTO v_grant
  FROM public.get_active_access_grant(p_user_id, p_token);
  
  IF v_grant IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Determina max in base al tipo
  v_max := CASE WHEN v_grant.grant_type = 'pro' THEN 1 ELSE 2 END;
  
  -- Conta utilizzo (parametri riordinati: user_id, usage_type, token, month_year)
  v_used := public.get_usage_count(p_user_id, 'analysis_included', p_token);
  
  RETURN v_used < v_max;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione: Verifica se può usare analisi extra
CREATE OR REPLACE FUNCTION public.can_use_extra_analysis(
  p_user_id UUID,
  p_token TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_grant RECORD;
  v_used INTEGER;
  v_max INTEGER;
BEGIN
  -- Ottieni access grant attivo
  SELECT * INTO v_grant
  FROM public.get_active_access_grant(p_user_id, p_token);
  
  IF v_grant IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Determina max in base al tipo (Desk: illimitate = 999)
  v_max := CASE WHEN v_grant.grant_type = 'pro' THEN 3 ELSE 999 END;
  
  -- Conta utilizzo (parametri riordinati: user_id, usage_type, token, month_year)
  v_used := public.get_usage_count(p_user_id, 'analysis_extra', p_token);
  
  RETURN v_used < v_max;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- 6. RLS POLICIES
-- ============================================

-- Orders: Utenti vedono solo i propri ordini
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    access_token = current_setting('request.jwt.claims', true)::json->>'token'
  );

CREATE POLICY "Service role can manage orders" ON public.orders
  FOR ALL
  USING (auth.role() = 'service_role');

-- Access Grants: Utenti vedono solo i propri accessi
ALTER TABLE public.access_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own access grants" ON public.access_grants
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    access_token = current_setting('request.jwt.claims', true)::json->>'token'
  );

CREATE POLICY "Service role can manage access grants" ON public.access_grants
  FOR ALL
  USING (auth.role() = 'service_role');

-- Service Deliveries: Utenti vedono solo i propri servizi
ALTER TABLE public.service_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own service deliveries" ON public.service_deliveries
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    access_token = current_setting('request.jwt.claims', true)::json->>'token'
  );

CREATE POLICY "Service role can manage service deliveries" ON public.service_deliveries
  FOR ALL
  USING (auth.role() = 'service_role');

-- Usage Tracking: Utenti vedono solo il proprio utilizzo
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON public.usage_tracking
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    access_token = current_setting('request.jwt.claims', true)::json->>'token'
  );

CREATE POLICY "Service role can manage usage tracking" ON public.usage_tracking
  FOR ALL
  USING (auth.role() = 'service_role');

-- ===============================
-- 7. CRON JOB (Supabase Edge Function)
-- ============================================
-- Scade automaticamente access grants scaduti
-- ============================================

-- Nota: Questo va implementato come Supabase Edge Function
-- che viene chiamata da Vercel Cron o Supabase Cron
-- Vedi: supabase/functions/expire-access-grants/index.ts

-- ===============================
-- 8. VERIFICA
-- ============================================

-- Verifica che tutte le tabelle siano state create
SELECT 
  'orders' as table_name,
  COUNT(*) as row_count
FROM public.orders
UNION ALL
SELECT 
  'access_grants' as table_name,
  COUNT(*) as row_count
FROM public.access_grants
UNION ALL
SELECT 
  'service_deliveries' as table_name,
  COUNT(*) as row_count
FROM public.service_deliveries
UNION ALL
SELECT 
  'usage_tracking' as table_name,
  COUNT(*) as row_count
FROM public.usage_tracking;

