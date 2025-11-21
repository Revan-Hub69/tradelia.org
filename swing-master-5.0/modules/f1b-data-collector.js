// F1B Data Collector - ETF Proxy + Free APIs
// Collects market data for F1B processor using ETF proxies and free APIs

/**
 * Sector ETF Mapping (SPDR Select Sector ETFs)
 * Maps GICS sectors to ETF tickers
 */
export const SECTOR_ETF_MAP = {
  Technology: 'XLK',
  'Communication Services': 'XLC',
  'Consumer Discretionary': 'XLY',
  'Consumer Staples': 'XLP',
  Energy: 'XLE',
  Financials: 'XLF',
  Healthcare: 'XLV',
  Industrials: 'XLI',
  Materials: 'XLB',
  'Real Estate': 'XLRE',
  Utilities: 'XLU',
};

/**
 * Size Bucket ETF Mapping
 */
export const SIZE_ETF_MAP = {
  MegaCap: 'SPY', // S&P 500
  Large: 'QQQ', // NASDAQ-100 (tech bias, but best proxy)
  Mid: 'MDY', // Mid-Cap S&P 400
  Small: 'IWM', // Russell 2000
  Micro: 'IWC', // Micro-Cap
};

/**
 * Fetch ETF data from Yahoo Finance (free, no API key needed)
 * @param {string} ticker - ETF ticker symbol
 * @param {string} period - '1d', '1w', '1m', '3m', '6m', '1y'
 * @returns {Promise<Object>} Performance data
 */
export async function fetchETFData(ticker, period = '1m') {
  try {
    // Yahoo Finance API endpoint (free, no key needed)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=${period}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const result = data.chart.result[0];

    if (!result || !result.meta) {
      throw new Error('Invalid data structure');
    }

    // Calculate performance
    const prices = result.indicators.quote[0].close;
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[0];
    const performance = (currentPrice - previousPrice) / previousPrice;

    return {
      ticker,
      currentPrice,
      previousPrice,
      performance,
      period,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetch sector performance using ETF proxies
 * @param {string} period - '1d', '1w', '1m'
 * @returns {Promise<Object>} Sector performance data
 */
export async function fetchSectorPerformance(period = '1m') {
  const sectors = {};
  const promises = [];

  // Fetch all sector ETFs in parallel
  for (const [sector, ticker] of Object.entries(SECTOR_ETF_MAP)) {
    promises.push(
      fetchETFData(ticker, period).then((data) => {
        if (data) {
          sectors[sector] = data.performance;
        }
      })
    );
  }

  await Promise.all(promises);

  return {
    sectors,
    period,
    method: 'ETF_Proxy',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetch size bucket performance
 * @param {string} period - '1d', '1w', '1m'
 * @returns {Promise<Object>} Size bucket performance
 */
export async function fetchSizeBucketPerformance(period = '1w') {
  const buckets = {};
  const promises = [];

  for (const [size, ticker] of Object.entries(SIZE_ETF_MAP)) {
    promises.push(
      fetchETFData(ticker, period).then((data) => {
        if (data) {
          buckets[size] = data.performance;
        }
      })
    );
  }

  await Promise.all(promises);

  return {
    buckets,
    period,
    method: 'ETF_Proxy',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetch VIX from CBOE (free, public data)
 * @returns {Promise<Object>} VIX data
 */
export async function fetchVIX() {
  try {
    // CBOE VIX data via Yahoo Finance
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=7d';

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const result = data.chart.result[0];

    const prices = result.indicators.quote[0].close;
    const current = prices[prices.length - 1];
    const weekAgo = prices[0];
    const change7d = (current - weekAgo) / weekAgo;

    return {
      level: current,
      change7d: change7d,
      timestamp: new Date().toISOString(),
      source: 'CBOE_VIA_YAHOO',
    };
  } catch (error) {
    console.error('Error fetching VIX:', error);
    return null;
  }
}

/**
 * Fetch Treasury yields from FRED (Federal Reserve Economic Data)
 * Note: FRED API is free but requires registration for API key
 * Alternative: Use Yahoo Finance for Treasury ETFs as proxy
 * @returns {Promise<Object>} Treasury yield data
 */
export async function fetchTreasuryYields(apiKey = null) {
  try {
    if (apiKey) {
      // Use FRED API if key provided
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=DGS2&series_id=DGS10&api_key=${apiKey}&file_type=json&limit=1&sort_order=desc`;
      const response = await fetch(url);
      const data = await response.json();

      // Process FRED data
      return {
        UST2Y: parseFloat(data.observations[0].value),
        UST10Y: parseFloat(data.observations[0].value),
        source: 'FRED',
        timestamp: new Date().toISOString(),
      };
    } else {
      // Fallback: Use Treasury ETF proxies (TLT for 10Y, SHY for 2Y)
      const [tlt10y, shy2y] = await Promise.all([
        fetchETFData('TLT', '1d'), // 20+ Year Treasury ETF (proxy for 10Y)
        fetchETFData('SHY', '1d'), // 1-3 Year Treasury ETF (proxy for 2Y)
      ]);

      // Approximate yields from ETF prices (inverse relationship)
      // This is a rough approximation - not exact but usable
      const UST10Y = tlt10y ? (100 - tlt10y.currentPrice) / 10 : null;
      const UST2Y = shy2y ? (100 - shy2y.currentPrice) / 2 : null;

      return {
        UST2Y,
        UST10Y,
        source: 'ETF_PROXY',
        note: 'Approximate yields from Treasury ETFs',
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('Error fetching Treasury yields:', error);
    return null;
  }
}

/**
 * Fetch commodities (Oil, Gold) from Yahoo Finance
 * @returns {Promise<Object>} Commodities data
 */
export async function fetchCommodities() {
  try {
    // WTI Crude Oil futures (CL=F)
    // Gold futures (GC=F)
    const [oil, gold] = await Promise.all([
      fetchETFData('CL=F', '1w'), // WTI Crude Oil
      fetchETFData('GC=F', '1w'), // Gold
    ]);

    return {
      oil1w: oil ? oil.performance : null,
      gold1w: gold ? gold.performance : null,
      source: 'YAHOO_FINANCE',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching commodities:', error);
    return null;
  }
}

/**
 * Fetch FX data (DXY - Dollar Index)
 * @returns {Promise<Object>} FX data
 */
export async function fetchFX() {
  try {
    const dxy = await fetchETFData('DX-Y.NYB', '1w'); // DXY via Yahoo

    return {
      dxy1w: dxy ? dxy.performance : null,
      source: 'YAHOO_FINANCE',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching FX:', error);
    return null;
  }
}

/**
 * Collect all market data for F1B processor
 * @param {Object} config - Configuration options
 * @returns {Promise<Object>} Complete market data for F1B
 */
export async function collectF1BMarketData(config = {}) {
  const {
    fredApiKey = null, // Optional FRED API key for better Treasury data
    period1m = '1m',
    period1w = '1w',
  } = config;

  // Collect all data in parallel
  const [sectors, sizeBuckets, vix, treasury, commodities, fx] = await Promise.all([
    fetchSectorPerformance(period1m),
    fetchSizeBucketPerformance(period1w),
    fetchVIX(),
    fetchTreasuryYields(fredApiKey),
    fetchCommodities(),
    fetchFX(),
  ]);

  // Format for F1B processor
  return {
    sectors_1M: sectors?.sectors || {},
    size_buckets: sizeBuckets?.buckets || {},
    VIX: vix?.level || null,
    VIX_change_7d: vix?.change7d || null,
    UST_2Y: treasury?.UST2Y || null,
    UST_10Y: treasury?.UST10Y || null,
    Oil_1W: commodities?.oil1w || null,
    Gold_1W: commodities?.gold1w || null,
    USD_1W: fx?.dxy1w || null,

    // Metadata
    meta: {
      timestamp: new Date().toISOString(),
      dataSource: 'ETF_Proxy_Free_APIs',
      sectorsMethod: sectors?.method || 'ETF_Proxy',
      sizeBucketsMethod: sizeBuckets?.method || 'ETF_Proxy',
      treasurySource: treasury?.source || 'ETF_PROXY',
      confidence: calculateConfidence({
        sectors,
        sizeBuckets,
        vix,
        treasury,
        commodities,
        fx,
      }),
    },
  };
}

/**
 * Calculate confidence score based on data completeness
 */
function calculateConfidence(data) {
  let score = 1.0;
  let missing = 0;

  if (!data.sectors || Object.keys(data.sectors.sectors || {}).length < 8) {
    missing++;
    score -= 0.1;
  }

  if (!data.sizeBuckets || Object.keys(data.sizeBuckets.buckets || {}).length < 3) {
    missing++;
    score -= 0.1;
  }

  if (!data.vix) {
    missing++;
    score -= 0.15;
  }

  if (!data.treasury || !data.treasury.UST2Y || !data.treasury.UST10Y) {
    missing++;
    score -= 0.15;
  }

  if (!data.commodities) {
    missing++;
    score -= 0.1;
  }

  if (missing >= 3) {
    score = Math.max(0.5, score); // Minimum 0.5
  }

  return Math.min(1.0, Math.max(0.0, score));
}
