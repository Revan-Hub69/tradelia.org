# Dashboard MVP - Design Completo
## Cosa Possiamo Fare BENE con API Free/Public

**Data:** 2025-01-27  
**Obiettivo:** Dashboard MVP spettacolare ma realistica con API free tier

---

## 🔍 Analisi API Disponibili (Free Tier)

### ✅ API Free/Public Disponibili

#### 1. **Crypto APIs (Free Tier)**
- ✅ **CoinGecko** - Free tier: 50 calls/min
  - Market data (prices, market cap, volume)
  - Top 400 crypto
  - Historical data (limitato)
  
- ✅ **Binance Public API** - Completamente free
  - Order book (L400)
  - Recent trades
  - 24h ticker
  - Kline/candlestick data
  
- ✅ **Whale Alert** - Free tier: 100 calls/day
  - Whale transactions >$1M
  - Last 100 transactions
  
- ✅ **Alternative.me** - Free
  - Fear & Greed Index
  - Aggiornato giornalmente

#### 2. **Stocks APIs (Free Tier)**
- ✅ **Finnhub** - Free tier: 60 calls/min
  - Stock prices (S&P 500, NASDAQ, Dow)
  - Forex rates
  - Basic company info
  
- ✅ **Alpha Vantage** - Free tier: 5 calls/min, 500/day
  - Stock prices
  - Commodities (Gold, Oil)
  - Economic indicators (limitato)

#### 3. **Economic Data (Free)**
- ✅ **FRED (Federal Reserve)** - Completamente free
  - GDP, CPI, Unemployment
  - Bond yields (10Y, 2Y)
  - Fed Funds Rate
  - DXY (Dollar Index)

#### 4. **VIX (Free)**
- ✅ **CBOE** - Dati pubblici
  - VIX index
  - Historical data

#### 5. **News (Free Tier)**
- ✅ **NewsAPI** - Free tier: 100 requests/day
  - News multi-source
  - Categorizzazione
  
- ✅ **RSS Feeds** - Completamente free
  - CoinDesk, The Block, Bloomberg RSS
  - Reuters, Financial Times RSS

---

## 🎯 Dashboard MVP - Design Completo

### Layout Generale

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Logo, User Menu, Notifications                         │
├─────────────────────────────────────────────────────────────────┤
│  TABS: Overview | Market Data | Reports | Utilities | Settings  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  SECTION 1: MARKET PULSE (Cruscotto Operativo)            │ │
│  │                                                             │ │
│  │  ┌──────────┬──────────┬──────────┬──────────┐          │ │
│  │  │  VIX     │ Fear&Gr  │ BTC Dom  │ Crypto$  │          │ │
│  │  │  18.5    │   65     │  52.3%   │  $2.4T   │          │ │
│  │  │  ↓ 2.3%  │  Greed   │  ↑ 0.5%  │  ↑ 3.2%  │          │ │
│  │  └──────────┴──────────┴──────────┴──────────┘          │ │
│  │                                                             │ │
│  │  ┌──────────┬──────────┬──────────┬──────────┐          │ │
│  │  │ Whale R  │ Ex Flow  │ L400 Imb │ Top Move │          │ │
│  │  │  1.25    │  +$50M   │  +2.3%   │ BTC +5%  │          │ │
│  │  │  [PRO]   │  [PRO]   │  [PRO]   │  [PRO]   │          │ │
│  │  └──────────┴──────────┴──────────┴──────────┘          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  SECTION 2: MULTI-ASSET CHARTS (4 Chart Correlati)      │ │
│  │                                                             │ │
│  │  ┌──────────────┬──────────────┬──────────────┬────────┐ │ │
│  │  │   CRYPTO     │    STOCKS    │    FOREX     │ COMMOD │ │ │
│  │  │   BTC/USD    │   S&P 500    │   EUR/USD    │  Gold  │ │ │
│  │  │              │              │              │        │ │ │
│  │  │  [Chart 24h] │  [Chart 24h] │  [Chart 24h] │[Chart] │ │ │
│  │  │              │              │              │        │ │ │
│  │  │  Corr: +0.65 │  Corr: -0.32 │  Corr: +0.78 │ -0.45  │ │ │
│  │  └──────────────┴──────────────┴──────────────┴────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  SECTION 3: L400 SUPPORT/RESISTANCE (Order Book Reale)   │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  BTC/USDT Price Chart                               │ │ │
│  │  │                                                       │ │ │
│  │  │  [Price Chart con Support/Resistance Lines]          │ │ │
│  │  │                                                       │ │ │
│  │  │  Support Levels (Bid L400):                         │ │ │
│  │  │  • $95,000 - $12.5M bid                             │ │ │
│  │  │  • $94,500 - $8.2M bid                              │ │ │
│  │  │                                                       │ │ │
│  │  │  Resistance Levels (Ask L400):                       │ │ │
│  │  │  • $96,500 - $15.3M ask                             │ │ │
│  │  │  • $97,000 - $9.8M ask                              │ │ │
│  │  │                                                       │ │ │
│  │  │  Imbalance: +2.3% (more bids than asks)             │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  SECTION 4: NEWS & IMPACT                                 │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  🔴 HIGH IMPACT (8/10)                              │ │ │
│  │  │  "Bitcoin ETF Sees Record Inflows"                 │ │ │
│  │  │  Impact: +2.3% on BTC, +1.5% on crypto market      │ │ │
│  │  │  Sentiment: 🟢 Positive | 2h ago • CoinDesk        │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  🟡 MEDIUM IMPACT (5/10)                           │ │ │
│  │  │  "Fed Keeps Rates Unchanged"                       │ │ │
│  │  │  Impact: +0.5% on S&P 500, -0.3% on Gold          │ │ │
│  │  │  Sentiment: 🟡 Neutral | 4h ago • Reuters         │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  │  [View All News →]                                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  SECTION 5: WHALE ACTIVITY (Last 10 Transactions)         │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  🐋 $12.5M BTC moved from exchange to wallet        │ │ │
│  │  │  2h ago • Bullish signal (accumulation)            │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  🐋 $8.3M ETH moved from wallet to exchange        │ │ │
│  │  │  3h ago • Bearish signal (distribution)            │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  │  Exchange Flow: +$50M (net inflow)                       │ │
│  │  Whale Ratio: 1.25 (above average)                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  SECTION 6: TOP MOVERS (Crypto)                           │ │
│  │                                                             │ │
│  │  ┌──────────┬──────────┬──────────┬──────────┐          │ │
│  │  │  BTC     │  ETH     │  SOL     │  AVAX    │          │ │
│  │  │  +5.2%   │  +3.8%   │  +8.1%   │  +12.3%  │          │ │
│  │  │  $95,000 │  $3,200  │  $145    │  $38     │          │ │
│  │  └──────────┴──────────┴──────────┴──────────┘          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Sezioni Dashboard MVP - Dettaglio

### Sezione 1: Market Pulse (Cruscotto Operativo)
**Status:** ✅ Già implementato (MarketDashboardWidget)

**Indicatori:**
- VIX (Free - CBOE)
- Fear & Greed (Free - Alternative.me)
- BTC Dominance (Free - CoinGecko)
- Crypto Market Cap (Free - CoinGecko)
- Whale Ratio (Free - Whale Alert, 100 calls/day)
- Exchange Flow (Free - Whale Alert)
- L400 Imbalance (Free - Binance Public API)
- Top Mover (Free - CoinGecko)

**API:**
- ✅ Tutte free tier disponibili

---

### Sezione 2: Multi-Asset Charts
**Status:** 🔨 Da implementare

**Chart:**
- Crypto: BTC/USD (Free - CoinGecko/Binance)
- Stocks: S&P 500 (Free - Finnhub)
- Forex: EUR/USD (Free - Finnhub)
- Commodities: Gold (Free - Alpha Vantage)

**Correlazioni:**
- Pearson Correlation (calcolo lato client)
- Rolling 30-day correlation
- Visualizzazione heatmap

**API:**
- ✅ Tutte free tier disponibili
- Chart library: Recharts o Chart.js (free)

**Implementazione:**
```typescript
// Fetch prices per asset
const btcPrice = await fetch('/api/market-indicators/bitcoin-price')
const sp500Price = await fetch('/api/market-indicators/sp500-price')
const eurusdPrice = await fetch('/api/market-indicators/forex?pair=EURUSD')
const goldPrice = await fetch('/api/market-indicators/commodities?symbol=GOLD')

// Calcola correlazione (client-side)
const correlation = calculatePearsonCorrelation(btcPrices, sp500Prices)
```

---

### Sezione 3: L400 Support/Resistance
**Status:** 🔨 Da implementare (KILLER FEATURE)

**Features:**
- Order book L400 da Binance (Free - Public API)
- Support levels: Top 5 livelli con più bid volume
- Resistance levels: Top 5 livelli con più ask volume
- Imbalance: (Total Bid - Total Ask) / (Total Bid + Total Ask)
- Visualizzazione su price chart

**API:**
- ✅ Binance Public API - Completamente free
- Endpoint: `/api/v3/depth?symbol=BTCUSDT&limit=400`

**Implementazione:**
```typescript
// Fetch order book L400
const orderBook = await fetch('https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=400')

// Calcola support levels (bid volume > 2σ sopra media)
const supportLevels = calculateSupportLevels(orderBook.bids)
// Returns: [{ price: 95000, bidVolume: 12500000 }, ...]

// Calcola resistance levels (ask volume > 2σ sopra media)
const resistanceLevels = calculateResistanceLevels(orderBook.asks)
// Returns: [{ price: 96500, askVolume: 15300000 }, ...]

// Calcola imbalance
const imbalance = (totalBid - totalAsk) / (totalBid + totalAsk)
```

**Visualizzazione:**
- Price chart con linee support/resistance
- Tooltip con volume per livello
- Color coding (verde = support, rosso = resistance)

---

### Sezione 4: News & Impact
**Status:** 🔨 Da implementare

**Features:**
- News feed multi-source (Free - NewsAPI + RSS)
- Impact Score (1-10) basato su:
  - Source credibility (Bloomberg > Twitter)
  - Asset mention frequency
  - Historical correlation (se disponibile)
- Sentiment Analysis (VADER - free library)
- Categorizzazione: Crypto, Stocks, Forex, Macro

**API:**
- ✅ NewsAPI - Free tier: 100 requests/day
- ✅ RSS Feeds - Completamente free:
  - CoinDesk RSS
  - The Block RSS
  - Bloomberg RSS
  - Reuters RSS

**Implementazione:**
```typescript
// Fetch news
const news = await fetch('/api/news/multi-asset')

// Calculate impact score
const impactScore = calculateImpactScore(news, {
  sourceCredibility: getSourceCredibility(news.source),
  assetMentions: countAssetMentions(news.content),
  historicalCorrelation: getHistoricalCorrelation(news)
})

// Sentiment analysis (VADER - free)
const sentiment = vaderSentimentAnalyzer.polarity_scores(news.content)
```

**Limiti Free Tier:**
- NewsAPI: 100 requests/day (sufficiente per MVP)
- RSS: Unlimited (ma parsing necessario)

---

### Sezione 5: Whale Activity
**Status:** ✅ Parzialmente implementato

**Features:**
- Last 10 whale transactions (Free - Whale Alert)
- Exchange Flow (net deposits - withdrawals)
- Whale Ratio
- Smart Money Indicators (se disponibile)

**API:**
- ✅ Whale Alert - Free tier: 100 calls/day
- Endpoint: `/v1/transactions?min_value=1000000&limit=100`

**Implementazione:**
- ✅ Già fatto in `/api/crypto/whale-analysis`

**Limiti Free Tier:**
- 100 calls/day (sufficiente per MVP)
- Max 100 transactions per call

---

### Sezione 6: Top Movers
**Status:** ✅ Parzialmente implementato

**Features:**
- Top 4 gainers (Free - CoinGecko)
- Top 4 losers (Free - CoinGecko)
- High volume crypto (Free - CoinGecko)

**API:**
- ✅ CoinGecko - Free tier: 50 calls/min
- Endpoint: `/api/v3/coins/markets?vs_currency=usd&order=price_change_percentage_24h_desc&per_page=10`

**Implementazione:**
- ✅ Già fatto in `/api/crypto/top-movers`

---

## 🚀 Implementazione MVP - Priorità

### Fase 1: Foundation (Settimana 1)
**Priorità:** ALTA

1. ✅ Market Pulse Widget (già fatto)
2. 🔨 L400 Support/Resistance (KILLER FEATURE)
3. 🔨 Multi-Asset Charts (4 chart correlati)
4. 🔨 News Feed Base (RSS + NewsAPI)

### Fase 2: Core Features (Settimana 2)
**Priorità:** ALTA

1. 🔨 News Impact Analysis (Impact Score)
2. 🔨 Sentiment Analysis (VADER)
3. 🔨 Whale Activity Dashboard (estendere)
4. 🔨 Top Movers (estendere)

### Fase 3: Polish (Settimana 3)
**Priorità:** MEDIA

1. 🔨 Correlazioni visualizzate (heatmap)
2. 🔨 Chart interattivi (zoom, timeframe)
3. 🔨 Mobile optimization
4. 🔨 Performance optimization

---

## 📊 Limiti Free Tier - Gestione

### Rate Limiting
- **CoinGecko:** 50 calls/min → Cache 5 minuti
- **Finnhub:** 60 calls/min → Cache 5 minuti
- **Alpha Vantage:** 5 calls/min → Cache 10 minuti
- **NewsAPI:** 100 calls/day → Cache 1 ora
- **Whale Alert:** 100 calls/day → Cache 30 minuti
- **Binance:** Unlimited → Cache 2 minuti

### Caching Strategy
```typescript
// Cache levels
const CACHE_TTL = {
  'market-indicators': 5 * 60 * 1000, // 5 minuti
  'order-book': 2 * 60 * 1000, // 2 minuti (order book cambia veloce)
  'news': 60 * 60 * 1000, // 1 ora
  'whale': 30 * 60 * 1000, // 30 minuti
}
```

---

## 🎯 Feature Avanzate (Post-MVP)

### Quando Aggiungere API a Pagamento

#### 1. **Analyst Ratings**
- **Free:** Limitato (Yahoo Finance scraping - fragile)
- **Paid:** Bloomberg Terminal API, FactSet
- **MVP:** Skip o versione limitata

#### 2. **Advanced Sentiment**
- **Free:** VADER (base)
- **Paid:** Groq AI (già abbiamo API key?)
- **MVP:** VADER sufficiente

#### 3. **Market Regime Analysis**
- **Free:** Calcolo lato client (Markov Regime Switching)
- **Paid:** Nessuno necessario
- **MVP:** Implementabile free

#### 4. **Risk Analysis (VaR)**
- **Free:** Calcolo lato client
- **Paid:** Nessuno necessario
- **MVP:** Implementabile free

#### 5. **DCC-GARCH Correlations**
- **Free:** Calcolo lato client (complesso ma possibile)
- **Paid:** Nessuno necessario
- **MVP:** Pearson correlation sufficiente

---

## ✅ Checklist MVP

### Must Have (MVP)
- [x] Market Pulse Widget (8 indicatori)
- [ ] L400 Support/Resistance (KILLER)
- [ ] Multi-Asset Charts (4 chart)
- [ ] News Feed con Impact Score
- [ ] Whale Activity (estendere)
- [ ] Top Movers (estendere)

### Nice to Have (Post-MVP)
- [ ] Analyst Ratings (richiede API paid)
- [ ] Advanced Sentiment (Groq AI)
- [ ] Market Regime Analysis
- [ ] Risk Analysis (VaR)
- [ ] DCC-GARCH Correlations

---

## 🎨 Design Principles MVP

### 1. **Real Data First**
- Solo dati reali, niente mock
- Se API non disponibile, non mostrare

### 2. **Academic Framework**
- Ogni feature con metodologia documentata
- Riferimenti accademici
- Disclaimer chiari

### 3. **Performance**
- Caching intelligente
- Lazy loading
- Progressive enhancement

### 4. **Mobile First**
- Responsive design
- Touch-friendly
- Fast loading

---

**Documento preparato per:** Dashboard MVP Design  
**Versione:** 1.0  
**Stato:** Pronto per implementazione
