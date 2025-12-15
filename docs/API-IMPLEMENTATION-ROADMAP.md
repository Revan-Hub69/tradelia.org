# Roadmap Implementazione API - Free Tier + RSS
## Cosa Implementare ORA e DOPO (Senza Scraping)

**Data:** 2025-01-27  
**Obiettivo:** Roadmap operativa per implementazione API free tier + RSS

---

## 🎯 PRIORITÀ 1: Implementazione Immediata (Questa Settimana)

### 1.1 RSS Feeds - News Aggregato Multi-Source ⭐⭐⭐
**Costo:** $0  
**Tempo:** 1-2 giorni  
**Valore:** ALTO  
**Stabilità:** ALTA

**Fonti RSS:**
```typescript
const RSS_FEEDS = [
  {
    name: 'Bloomberg Markets',
    url: 'https://www.bloomberg.com/feeds/bloomberg/markets.rss',
    category: 'markets',
    priority: 'high'
  },
  {
    name: 'Reuters Markets',
    url: 'https://www.reuters.com/rssFeed/marketsNews',
    category: 'markets',
    priority: 'high'
  },
  {
    name: 'Financial Times',
    url: 'https://www.ft.com/?format=rss',
    category: 'markets',
    priority: 'high'
  },
  {
    name: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    category: 'crypto',
    priority: 'high'
  },
  {
    name: 'The Block',
    url: 'https://www.theblock.co/rss.xml',
    category: 'crypto',
    priority: 'high'
  },
  {
    name: 'MarketWatch',
    url: 'https://feeds.marketwatch.com/marketwatch/markets/',
    category: 'markets',
    priority: 'medium'
  },
  {
    name: 'Yahoo Finance',
    url: 'https://feeds.finance.yahoo.com/rss/2.0/headline',
    category: 'markets',
    priority: 'medium'
  }
];
```

**Cosa Implementare:**
- ✅ API endpoint: `/api/news/rss/route.ts`
- ✅ Component: `components/dashboard/NewsFeed.tsx`
- ✅ Caching: 5 minuti (RSS non cambia spesso)
- ✅ Sentiment analysis: VADER (free, npm: `vader-sentiment`)
- ✅ Impact score: Basato su keywords + sentiment
- ✅ Categorizzazione: Markets, Crypto, Forex, Commodities

**Features:**
- News aggregato da 7+ fonti
- Sentiment analysis automatico
- Impact score per ogni news
- Filtri per categoria
- Search interno
- Link esterni

**Dependencies:**
```bash
npm install rss-parser vader-sentiment
```

---

### 1.2 Glassnode Exchange Flows - Dati Reali ⭐⭐⭐
**Costo:** $0 (free tier: 1 call/sec)  
**Tempo:** 1 giorno  
**Valore:** ALTO  
**Stabilità:** ALTA

**Cosa Sostituisce:**
- ❌ Mock exchange flows in `MarketDashboardWidget`
- ✅ Dati reali da Glassnode

**API Endpoint:**
```typescript
// GET https://api.glassnode.com/v1/metrics/transactions/transfers_volume_exchanges_net
// Params: a=BTC, i=24h, api_key=xxx
```

**Cosa Implementare:**
- ✅ API endpoint: `/api/crypto/exchange-flows/route.ts`
- ✅ Update: `components/dashboard/MarketDashboardWidget.tsx`
- ✅ Caching: 1 ora (exchange flows cambiano lentamente)
- ✅ Multi-asset: BTC, ETH, USDT

**Features:**
- Exchange deposits (inflows)
- Exchange withdrawals (outflows)
- Net flow (deposits - withdrawals)
- Historical trend (7d, 30d)
- Alert quando net flow > threshold

**Dependencies:**
```bash
# Nessuna nuova dependency, usa fetch
```

---

### 1.3 Trading Economics Calendar - Economic Events ⭐⭐⭐
**Costo:** $0 (free tier: 2 calls/min)  
**Tempo:** 1 giorno  
**Valore:** ALTO  
**Stabilità:** ALTA

**Cosa Offre:**
- Economic calendar (GDP, CPI, Unemployment, etc.)
- Eventi FOMC, ECB, BOJ
- Forecasts vs Actual
- Impact rating

**API Endpoint:**
```typescript
// GET https://api.tradingeconomics.com/calendar
// Params: c=YOUR_CLIENT_KEY, d=YOUR_CLIENT_SECRET
```

**Cosa Implementare:**
- ✅ API endpoint: `/api/economic/calendar/route.ts`
- ✅ Component: `components/dashboard/EconomicCalendar.tsx`
- ✅ Caching: 1 ora (calendar cambia giornalmente)
- ✅ Filtri: Country, Importance, Date range

**Features:**
- Economic calendar (prossimi 7 giorni)
- Impact rating (High, Medium, Low)
- Forecast vs Actual
- Eventi passati (ultimi 30 giorni)
- Alert per eventi importanti

**Dependencies:**
```bash
# Nessuna nuova dependency, usa fetch
```

---

## 🎯 PRIORITÀ 2: Short Term (Prossima Settimana)

### 2.1 CoinGecko Trending - Early Signals ⭐⭐
**Costo:** $0  
**Tempo:** 1 giorno  
**Valore:** MEDIO  
**Stabilità:** ALTA

**Cosa Offre:**
- Trending coins (ultime 24h)
- Search trends
- Interest metrics

**API Endpoint:**
```typescript
// GET https://api.coingecko.com/api/v3/search/trending
```

**Cosa Implementare:**
- ✅ API endpoint: `/api/crypto/trending/route.ts`
- ✅ Component: `components/dashboard/TrendingCoins.tsx`
- ✅ Caching: 15 minuti
- ✅ Integration: Aggiungere a `MarketDashboardWidget`

**Features:**
- Top 10 trending coins
- Price change 24h
- Volume change 24h
- Link a dettagli coin

---

### 2.2 Santiment Social Sentiment - Social Metrics ⭐⭐
**Costo:** $0 (free tier: 100 calls/day)  
**Tempo:** 1 giorno  
**Valore:** MEDIO  
**Stabilità:** ALTA

**Cosa Offre:**
- Social sentiment (Twitter, Reddit, Telegram)
- Social volume
- Developer activity

**API Endpoint:**
```graphql
# GraphQL endpoint
POST https://api.santiment.net/graphql
```

**Cosa Implementare:**
- ✅ API endpoint: `/api/crypto/social-sentiment/route.ts`
- ✅ Component: `components/dashboard/SocialSentiment.tsx`
- ✅ Caching: 1 ora
- ✅ Multi-asset: BTC, ETH, Top 10 coins

**Features:**
- Social sentiment score (-100 to +100)
- Social volume (mentions)
- Trend (7d, 30d)
- Correlation con price

---

### 2.3 Reddit Sentiment - Retail Sentiment ⭐⭐
**Costo:** $0  
**Tempo:** 1 giorno  
**Valore:** MEDIO  
**Stabilità:** MEDIA

**Cosa Offre:**
- Reddit posts/comments
- Upvotes/downvotes
- Discussion volume

**API Endpoint:**
```typescript
// GET https://www.reddit.com/r/cryptocurrency/hot.json
// GET https://www.reddit.com/r/wallstreetbets/hot.json
```

**Cosa Implementare:**
- ✅ API endpoint: `/api/social/reddit-sentiment/route.ts`
- ✅ Component: `components/dashboard/RedditSentiment.tsx`
- ✅ Caching: 30 minuti
- ✅ Sentiment analysis: VADER

**Features:**
- Top posts r/cryptocurrency
- Top posts r/wallstreetbets
- Sentiment score per post
- Discussion volume
- Upvote ratio

**Dependencies:**
```bash
# Nessuna nuova dependency, usa fetch + vader-sentiment (già installato)
```

---

### 2.4 GitHub Developer Activity - Dev Metrics ⭐⭐
**Costo:** $0  
**Tempo:** 1-2 giorni  
**Valore:** MEDIO  
**Stabilità:** ALTA

**Cosa Offre:**
- Repository data
- Commit activity
- Contributor stats
- Release data

**API Endpoint:**
```typescript
// GET https://api.github.com/repos/{owner}/{repo}/commits
// GET https://api.github.com/repos/{owner}/{repo}/stats/contributors
```

**Cosa Implementare:**
- ✅ API endpoint: `/api/crypto/developer-activity/route.ts`
- ✅ Component: `components/dashboard/DeveloperActivity.tsx`
- ✅ Caching: 6 ore (dev activity cambia lentamente)
- ✅ Multi-project: Bitcoin, Ethereum, Solana, Cardano, etc.

**Features:**
- Commit frequency (7d, 30d)
- Contributor count
- Release frequency
- Repository stars
- Correlation dev activity → price

**Dependencies:**
```bash
# Nessuna nuova dependency, usa fetch
```

---

### 2.5 Multi-Exchange Order Book - Estende L400 ⭐⭐⭐
**Costo:** $0 (tutti free)  
**Tempo:** 2-3 giorni  
**Valore:** ALTO  
**Stabilità:** ALTA

**Cosa Offre:**
- Order book da multiple exchanges
- Cross-exchange comparison
- Aggregated depth

**Exchanges:**
1. Binance (già usato)
2. Coinbase Pro
3. Kraken
4. OKX

**Cosa Implementare:**
- ✅ API endpoint: `/api/crypto/multi-exchange-depth/route.ts`
- ✅ Update: `components/dashboard/L400SupportResistance.tsx`
- ✅ Caching: 30 secondi (order book cambia velocemente)
- ✅ Aggregation: Weighted average per price level

**Features:**
- Multi-exchange order book (L400 per exchange)
- Aggregated support/resistance
- Cross-exchange arbitrage opportunities
- Exchange-specific depth analysis
- Volume-weighted average price (VWAP)

**Dependencies:**
```bash
# Nessuna nuova dependency, usa fetch
```

---

## 📋 IMPLEMENTAZIONE DETTAGLIATA

### Step 1: Setup Dependencies
```bash
npm install rss-parser vader-sentiment
```

### Step 2: RSS Feeds Implementation

**File:** `app/api/news/rss/route.ts`
```typescript
import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { SentimentAnalyzer } from 'vader-sentiment';

const parser = new Parser();
const analyzer = new SentimentAnalyzer();

export async function GET(request: Request) {
  // Fetch da tutte le RSS feeds
  // Parse RSS
  // Sentiment analysis
  // Impact score
  // Return aggregated news
}
```

**File:** `components/dashboard/NewsFeed.tsx`
```typescript
'use client';
// Component per display news aggregato
// Filtri per categoria
// Search interno
// Link esterni
```

### Step 3: Glassnode Exchange Flows

**File:** `app/api/crypto/exchange-flows/route.ts`
```typescript
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Fetch da Glassnode API
  // Cache 1 ora
  // Return exchange flows (BTC, ETH, USDT)
}
```

**Update:** `components/dashboard/MarketDashboardWidget.tsx`
```typescript
// Sostituire mock con dati reali da /api/crypto/exchange-flows
```

### Step 4: Trading Economics Calendar

**File:** `app/api/economic/calendar/route.ts`
```typescript
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Fetch da Trading Economics API
  // Cache 1 ora
  // Return economic calendar (prossimi 7 giorni)
}
```

**File:** `components/dashboard/EconomicCalendar.tsx`
```typescript
'use client';
// Component per display economic calendar
// Filtri per country, importance, date
// Impact rating visualization
```

### Step 5: Altri Componenti (Priorità 2)

Implementare in ordine:
1. CoinGecko Trending
2. Santiment Social Sentiment
3. Reddit Sentiment
4. GitHub Developer Activity
5. Multi-Exchange Order Book

---

## 🎯 PRIORITÀ 3: Post-MVP (Con Budget)

### 3.1 TipRanks - Analyst Ratings ⭐⭐⭐⭐⭐
**Costo:** $29.95/mese  
**Valore:** ALTO (unico nel mercato)  
**ROI:** Valutare dopo MVP+

**Cosa Offre:**
- Analyst ratings con track record
- Price targets
- Analyst accuracy
- Historical performance

**Quando Implementare:**
- Dopo validazione MVP
- Se budget disponibile
- Se ROI positivo

---

### 3.2 Glassnode Pro - On-Chain Avanzato
**Costo:** $29/mese  
**Valore:** MEDIO-ALTO  
**ROI:** Valutare se free tier insufficiente

**Cosa Offre:**
- On-chain metrics avanzate
- Historical data completa
- Exchange flows dettagliati

**Quando Implementare:**
- Se free tier insufficiente
- Se necessari dati storici completi

---

## 📊 SUMMARY IMPLEMENTAZIONE

### Fase 1: Questa Settimana (3 componenti)
1. ✅ RSS Feeds (news aggregato)
2. ✅ Glassnode Exchange Flows (dati reali)
3. ✅ Trading Economics Calendar (economic events)

**Tempo Totale:** 3-4 giorni  
**Costo:** $0  
**Valore:** ALTO

### Fase 2: Prossima Settimana (5 componenti)
4. ✅ CoinGecko Trending
5. ✅ Santiment Social Sentiment
6. ✅ Reddit Sentiment
7. ✅ GitHub Developer Activity
8. ✅ Multi-Exchange Order Book

**Tempo Totale:** 5-7 giorni  
**Costo:** $0  
**Valore:** MEDIO-ALTO

### Fase 3: Post-MVP (Paid APIs)
9. 💰 TipRanks ($30/mese) - Se budget disponibile
10. 💰 Glassnode Pro ($29/mese) - Se necessario

**Costo Totale:** $59/mese (se implementati entrambi)  
**Valore:** ALTO (se ROI positivo)

---

## 🚀 NEXT STEPS

1. **Conferma Priorità:** RSS, Glassnode, Trading Economics
2. **Setup Dependencies:** `npm install rss-parser vader-sentiment`
3. **Implementazione Fase 1:** 3 componenti questa settimana
4. **Test & Deploy:** Verificare rate limits e caching
5. **Fase 2:** Implementare 5 componenti prossima settimana

---

**Documento preparato per:** Roadmap Implementazione API  
**Versione:** 1.0  
**Stato:** Pronto per implementazione
