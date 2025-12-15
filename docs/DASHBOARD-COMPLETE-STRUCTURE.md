# Struttura Completa Dashboard Tradelia
## Riepilogo Dettagliato di Tutti i Componenti

**Data:** 2025-01-27  
**Versione:** Multi-Market Architecture

---

## 📊 ORDINE DI VISUALIZZAZIONE (Top to Bottom)

### 1. **Account Banner** (`AccountBanner.tsx`)
**Posizione:** Subito dopo Hero (se visibile)  
**Scopo:** Mostra stato account, subscription, upgrade prompts  
**Features:**
- Subscription status (Free/Pro)
- Upgrade prompts
- Account warnings/alerts

**Quando appare:** Sempre visibile

---

### 2. **Personalization Controls**
**Posizione:** Dopo Account Banner  
**Scopo:** Controlli utente per personalizzazione  
**Features:**
- Toggle Hero (Mostra/Nascondi)
- Toggle Compact View (Vista Compatta/Espansa)

**Quando appare:** Sempre visibile

---

### 3. **Dashboard Hero** (`DashboardHero.tsx`)
**Posizione:** Dopo controlli personalizzazione  
**Scopo:** Prima impressione, welcome message, CTA principale  
**Features:**
- Welcome message personalizzato
- CTA principale (link a market-data)
- Quick stats overview

**Quando appare:** Visibile di default, può essere nascosta dall'utente

---

### 4. **Module Grid** (`ModuleGrid.tsx`)
**Posizione:** Prima sezione principale  
**Scopo:** Organizzazione gerarchica - mostra tutte le funzionalità principali  
**Features:**
- Grid di moduli/funzionalità
- Link a sezioni principali
- Icone e descrizioni

**Quando appare:** Sempre visibile

---

### 5. **Market Dashboard Widget** (`MarketDashboardWidget.tsx`)
**Posizione:** Dopo Module Grid  
**Scopo:** Cruscotto operativo con indicatori di mercato principali  
**Layout:** Grid 2/4/6/8 colonne (responsive)

**Indicatori Multimarket (14 totali):**

#### Market-Wide Indicators:
- **VIX** (Stock) - Volatility Index
- **Fear & Greed** (Crypto) - Crypto Fear & Greed Index

#### Crypto Indicators:
- **BTC Dominance** - Bitcoin market dominance %
- **Crypto Market Cap** - Total crypto market cap (in trillions)

#### Stock Indicators:
- **S&P 500 (SPY)** - S&P 500 ETF price + change %
- **NASDAQ (QQQ)** - NASDAQ 100 ETF price + change %

#### Forex Indicators:
- **EUR/USD** - Euro/USD exchange rate + change %
- **DXY** - Dollar Index + change %

#### Commodity Indicators:
- **Gold** - Gold price (USD) + change %
- **Oil** - Crude oil price (USD) + change %

#### PRO Indicators (4):
- **Whale Ratio** (Crypto) - Whale transaction ratio
- **Exchange Flow** (Crypto) - Net exchange flow (Glassnode)
- **L400 Imbalance** (Crypto) - Order book imbalance
- **Top Mover** - Top gaining asset

**Features:**
- Badge colorati per asset type (C/S/F/C)
- Status color (green/red/neutral)
- Change % con icona trend
- PRO badge per indicatori premium
- Link a "Vedi tutti" → `/dashboard/market-data`

**Refresh:** Ogni 5 minuti

---

### 6. **Multi-Asset Charts** (`MultiAssetCharts.tsx`)
**Posizione:** Dopo Market Dashboard Widget  
**Scopo:** Correlazioni cross-asset in tempo reale  
**Layout:** Grid 1/2/4 colonne (responsive)

**Charts (4):**
1. **Bitcoin (BTC/USD)** - Crypto
2. **S&P 500 (SPX)** - Stocks
3. **EUR/USD** - Forex
4. **Gold (XAU/USD)** - Commodities

**Features:**
- Timeframe selector: 1h, 4h, 24h, 7d
- Pearson correlation tra asset
- Current price + 24h change %
- Color-coded trends (green/red)
- Academic reference: Longin & Solnik (2001)

**Data Source:**
- BTC: Binance klines API
- SPY: `/api/market/data?symbol=SPY&assetType=stock`
- EURUSD: `/api/market/data?symbol=EURUSD&assetType=forex`
- GOLD: `/api/market/data?symbol=GOLD&assetType=commodity`

**Refresh:** Ogni 5 minuti

---

### 7. **L400 Support/Resistance** (`L400SupportResistance.tsx`)
**Posizione:** Dopo Multi-Asset Charts  
**Scopo:** Supporti e resistenze reali basati su order book L400  
**Layout:** Full width con chart + side panels

**Features:**
- Real-time order book depth (L400)
- Multi-exchange aggregation (Binance, Coinbase, Kraken, OKX)
- Support levels (bid volume > 2σ)
- Resistance levels (ask volume > 2σ)
- Order book imbalance calculation
- Price chart con S/R lines
- Academic references: Glosten & Milgrom (1985), Kyle (1985)

**Data Source:**
- Primary: `/api/crypto/multi-exchange-depth?symbol=BTCUSDT`
- Fallback: Binance solo se multi-exchange fails

**Refresh:** Ogni 2 minuti

---

### 8. **News Feed** (`NewsFeed.tsx`)
**Posizione:** Dopo L400 Support/Resistance  
**Scopo:** News aggregato da multiple fonti finanziarie  
**Layout:** Lista scrollabile (max-height 600px)

**Fonti RSS (7):**
1. Bloomberg Markets
2. Reuters Markets
3. Financial Times
4. CoinDesk (Crypto)
5. The Block (Crypto)
6. MarketWatch
7. Yahoo Finance

**Features:**
- Sentiment analysis (VADER)
- Impact score (1-10) basato su keywords
- Category filtering: All, Markets, Crypto
- Search interno
- Filtri per categoria
- Link esterni a news originali
- Color-coded per impact (High/Medium/Low)

**Data Source:** `/api/news/rss`

**Refresh:** Ogni 5 minuti

---

### 9. **Economic Calendar** (`EconomicCalendar.tsx`)
**Posizione:** Dopo News Feed  
**Scopo:** Eventi economici in arrivo  
**Layout:** Lista scrollabile (max-height 600px)

**Features:**
- Prossimi 7 giorni di eventi
- Impact rating: High (3), Medium (2), Low (1)
- Forecast vs Actual comparison
- Country filtering (default: United States)
- Eventi passati (ultimi 30 giorni)
- Color-coded per importance

**Eventi Mostrati:**
- GDP, CPI, Unemployment
- FOMC, ECB, BOJ meetings
- Earnings releases
- Economic indicators

**Data Source:** `/api/economic/calendar`

**Refresh:** Ogni ora

---

### 10. **Trending Coins** (`TrendingCoins.tsx`)
**Posizione:** Dopo Economic Calendar  
**Scopo:** Top trending cryptocurrencies (early signals)  
**Layout:** Lista verticale

**Features:**
- Top 10 trending coins (ultime 24h)
- Price + 24h change %
- Volume 24h
- Market cap
- Market cap rank
- Trending score
- Link a CoinGecko

**Data Source:** `/api/crypto/trending?limit=10`

**Refresh:** Ogni 15 minuti

---

### 11. **Market Sentiment** (`MarketSentiment.tsx`)
**Posizione:** Dopo Trending Coins  
**Scopo:** Sentiment analysis multimarket  
**Layout:** Grid 1/2/3/4 colonne (responsive)

**Asset Coverage:**

#### Crypto (5):
- BTC, ETH, SOL, ADA, DOT

#### Stocks (5):
- SPY, QQQ, AAPL, MSFT, GOOGL

#### Forex (3):
- EURUSD, GBPUSD, USDJPY

#### Commodities (2):
- GOLD, OIL

**Features:**
- Sentiment score (-100 to +100)
- Social volume
- Filter per asset type: All, Crypto, Stock, Forex, Commodity
- Color-coded per asset type:
  - Crypto: Purple
  - Stock: Blue
  - Forex: Amber
  - Commodity: Yellow
- Source indicator (santiment/reddit)
- Sentiment icon (trending up/down/neutral)

**Data Source:** `/api/market/sentiment?asset={symbol}&assetType={type}`

**Refresh:** Ogni ora

---

### 12. **Reddit Sentiment** (`RedditSentiment.tsx`)
**Posizione:** Dopo Market Sentiment  
**Scopo:** Sentiment analysis da Reddit communities  
**Layout:** Lista verticale (2 subreddits)

**Subreddits:**
1. **r/cryptocurrency** - Crypto sentiment
2. **r/wallstreetbets** - Stock/meme sentiment

**Features:**
- Average sentiment score
- Total posts analyzed
- Average score (upvotes)
- Average upvote ratio
- Top 3 posts per subreddit
- Sentiment per post (VADER)
- Link a Reddit posts

**Data Source:** `/api/social/reddit-sentiment?subreddit={name}&limit=25`

**Refresh:** Ogni 30 minuti

---

### 13. **Developer Activity** (`DeveloperActivity.tsx`)
**Posizione:** Dopo Reddit Sentiment  
**Scopo:** GitHub activity metrics per progetti crypto  
**Layout:** Grid 1/2/3 colonne (responsive)

**Projects Tracked (5):**
- BTC (bitcoin/bitcoin)
- ETH (ethereum/go-ethereum)
- SOL (solana-labs/solana)
- ADA (input-output-hk/cardano-node)
- DOT (paritytech/polkadot)

**Metrics:**
- Commits (7d, 30d)
- Contributors count
- Stars
- Forks
- Release count
- Last commit date
- Last release date

**Data Source:** `/api/crypto/developer-activity?asset={symbol}`

**Refresh:** Ogni 6 ore

---

### 14. **Overview Stats** (`OverviewStats.tsx`)
**Posizione:** Dopo Developer Activity  
**Scopo:** Panoramica accademica - statistiche chiave  
**Layout:** Grid di statistiche

**Stats Mostrate:**
- Total reports
- Active analysis requests
- Favorites count
- Recent activity summary

**Features:**
- Link a sezioni correlate
- Quick access metrics

**Data Source:** `/api/dashboard/stats`

**Refresh:** On mount + user actions

---

## 🎨 LAYOUT RESPONSIVE

### Mobile (< 640px):
- 1 colonna per tutti i componenti
- Stack verticale completo
- Compact view disponibile

### Tablet (640px - 1024px):
- 2 colonne per grid components
- Side-by-side dove possibile

### Desktop (> 1024px):
- 3-4 colonne per grid components
- Full width per charts e L400
- Optimal spacing

### Large Desktop (> 1280px):
- 4-8 colonne per Market Dashboard Widget
- Maximum grid density
- All features visible

---

## 🔄 REFRESH INTERVALS

| Component | Interval | Reason |
|-----------|----------|--------|
| Market Dashboard Widget | 5 min | Market data changes frequently |
| Multi-Asset Charts | 5 min | Price data updates |
| L400 Support/Resistance | 2 min | Order book changes rapidly |
| News Feed | 5 min | News updates regularly |
| Economic Calendar | 1 hour | Events don't change often |
| Trending Coins | 15 min | Trending changes moderately |
| Market Sentiment | 1 hour | Sentiment changes slowly |
| Reddit Sentiment | 30 min | Reddit updates frequently |
| Developer Activity | 6 hours | GitHub activity changes slowly |
| Overview Stats | On demand | User-driven updates |

---

## 🎯 PRIORITÀ VISUALE

### Priorità ALTA (Sempre visibili):
1. Module Grid
2. Market Dashboard Widget
3. Multi-Asset Charts
4. L400 Support/Resistance

### Priorità MEDIA (Visibili di default):
5. News Feed
6. Economic Calendar
7. Market Sentiment

### Priorità BASSA (Scroll per vedere):
8. Trending Coins
9. Reddit Sentiment
10. Developer Activity
11. Overview Stats

---

## 📱 FEATURES GLOBALI

### Error Boundaries:
- Ogni componente wrappato in `<ErrorBoundary>`
- Graceful degradation su errori
- Fallback UI quando disponibile

### Loading States:
- Skeleton loaders per tutti i componenti
- Consistent loading experience
- Progressive data loading

### Caching:
- API responses cached (varie durate)
- Stale-while-revalidate strategy
- Client-side caching dove appropriato

### Accessibility:
- ARIA labels su tutte le sezioni
- Keyboard navigation support
- Screen reader friendly
- Semantic HTML

### Performance:
- Lazy loading per componenti non-critical
- Code splitting
- Image optimization
- Efficient re-renders

---

## 🔗 NAVIGATION FLOW

```
Dashboard Overview
├── Module Grid → Links to all sections
├── Market Dashboard Widget → /dashboard/market-data
├── Multi-Asset Charts → Embedded charts
├── L400 Support/Resistance → Embedded analysis
├── News Feed → External links
├── Economic Calendar → Embedded calendar
├── Trending Coins → CoinGecko links
├── Market Sentiment → Embedded sentiment
├── Reddit Sentiment → Reddit links
├── Developer Activity → GitHub links
└── Overview Stats → Links to reports/requests
```

---

## 📊 DATA FLOW

```
User → Dashboard Shell
  ├── Fetches from multiple APIs in parallel
  ├── Caches responses
  ├── Updates components independently
  └── Handles errors gracefully

APIs Used:
- /api/market-indicators/* (VIX, Fear & Greed, etc.)
- /api/market/data (unified market data)
- /api/crypto/* (crypto-specific)
- /api/news/rss (news aggregation)
- /api/economic/calendar (economic events)
- /api/market/sentiment (sentiment analysis)
- /api/social/reddit-sentiment (Reddit)
- /api/crypto/developer-activity (GitHub)
- /api/dashboard/stats (user stats)
```

---

## 🎨 COLOR CODING

### Asset Types:
- **Crypto**: Purple (`bg-purple-500/20 text-purple-400`)
- **Stock**: Blue (`bg-blue-500/20 text-blue-400`)
- **Forex**: Amber (`bg-amber-500/20 text-amber-400`)
- **Commodity**: Yellow (`bg-yellow-500/20 text-yellow-400`)

### Status Colors:
- **Positive**: Green (`text-green-400`, `border-green-500/30`)
- **Negative**: Red (`text-red-400`, `border-red-500/30`)
- **Neutral**: Gray (`text-gray-400`, `border-gray-500/30`)

### Impact/Importance:
- **High**: Red (`text-red-400 bg-red-400/10`)
- **Medium**: Amber (`text-amber-400 bg-amber-400/10`)
- **Low**: Blue (`text-blue-400 bg-blue-400/10`)

---

## 📝 SUMMARY

**Totale Componenti:** 14  
**Totale Indicatori:** 14 (Market Dashboard Widget)  
**Totale Charts:** 4 (Multi-Asset Charts)  
**Totale Fonti Dati:** 20+ APIs  
**Totale Asset Tracked:** 30+ (crypto, stocks, forex, commodities)

**Architettura:** Multi-market, unified types, consistent API structure  
**Design:** Responsive, accessible, performant  
**Data:** Real-time, cached, error-resilient

---

**Documento preparato per:** Riepilogo Completo Dashboard  
**Versione:** 1.0  
**Stato:** Completo e aggiornato
