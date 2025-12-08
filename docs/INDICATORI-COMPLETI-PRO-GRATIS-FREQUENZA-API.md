# 📊 INDICATORI COMPLETI - PRO/GRATIS, FREQUENZA, API

## 🎯 DOCUMENTO COMPLETO CON TUTTI GLI 87 INDICATORI

**Suddivisi per categorie, con indicazione Pro/Gratis, frequenza aggiornamento richiesta e API usata.**

---

## 📊 **1. INDICATORI BASE - ECONOMICI E MACRO**

| # | Indicatore | Status | Pro/Gratis | Frequenza Aggiornamento | API Usata | Route API |
|---|------------|--------|------------|-------------------------|-----------|-----------|
| 1 | **Economic Indicators** (GDP, CPI, Unemployment, Fed Rate) | ✅ Implementato | 🟢 **GRATIS** | 1 ora (dati economici aggiornati giornalmente) | FRED API (GRATIS, illimitato) | `/api/market-indicators/economic` |
| 2 | **Bond Yields** (10Y, 2Y Treasury) | ✅ Implementato | 🟢 **GRATIS** | 1 ora (yield aggiornati giornalmente) | FRED API (GRATIS, illimitato) | `/api/market-indicators/bond-yields` |
| 3 | **Yield Curve** (10Y - 2Y Spread) | ✅ Implementato | 🟢 **GRATIS** | 1 ora | FRED API (GRATIS, illimitato) | `/api/market-indicators/yield-curve` |
| 4 | **Credit Spreads** (Corporate vs Treasury) | ✅ Implementato | 🟢 **GRATIS** | 1 ora | FRED API (GRATIS, illimitato) | `/api/market-indicators/credit-spreads` |
| 5 | **Leading Economic Indicators** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora | FRED API (GRATIS, illimitato) | `/api/market-indicators/leading-indicators` |
| 6 | **PMI (Purchasing Managers Index)** | ⚠️ Da Implementare | 🟢 **GRATIS** (USA) / 🟡 **PRO** (globale) | 1 ora | FRED (USA - GRATIS) / Trading Economics (globale - FREE: 2 calls/min) | `/api/market-indicators/pmi` |
| 7 | **Business Cycle Composite** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora | FRED API (GRATIS, illimitato) | `/api/market-indicators/business-cycle` |
| 8 | **Financial Stress Composite** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora | FRED API (GRATIS, illimitato) | `/api/market-indicators/financial-stress` |
| 9 | **Economic Indicators Globali** (Europa, Italia, Asia) | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora | ECB, Eurostat, FRED, World Bank, IMF (tutti GRATIS) | `/api/market-indicators/economic-global` |

---

## 📈 **2. INDICATORI STOCK MARKET - USA**

| # | Indicatore | Status | Pro/Gratis | Frequenza Aggiornamento | API Usata | Route API |
|---|------------|--------|------------|-------------------------|-----------|-----------|
| 10 | **Stock Indexes** (S&P 500, Dow, NASDAQ) | ✅ Implementato | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/stock-indexes` |
| 11 | **Market Breadth** (Advance/Decline) | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/market-breadth` |
| 12 | **McClellan Oscillator** | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/mcclellan-oscillator` |
| 13 | **McClellan Summation Index** | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/mcclellan-summation` |
| 14 | **Arms Index (TRIN)** | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/arms-index` |
| 15 | **Short Interest** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora | Finnhub (da verificare) o SEC EDGAR (GRATIS, parsing complesso) | `/api/market-indicators/short-interest` |
| 16 | **ETF Settoriali** (SPY, QQQ, XLK, XLF, XLE, XLV, XLY, XLP) | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/etf-sector` |
| 17 | **ETF Flows** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora | Finnhub (da verificare) o calcolo da volume/prezzo | `/api/market-indicators/etf-flows` |
| 18 | **Stock Market Fear & Greed (CNN)** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora | CNN (scraping?) - da verificare | `/api/market-indicators/stock-fear-greed` |
| 19 | **Real Estate Indicators** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora | FRED (GRATIS) + Finnhub (GRATIS) | `/api/market-indicators/real-estate` |

---

## 🌍 **3. INDICATORI GLOBALI - EUROPA, ASIA, EMERGENTI**

| # | Indicatore | Status | Pro/Gratis | Frequenza Aggiornamento | API Usata | Route API |
|---|------------|--------|------------|-------------------------|-----------|-----------|
| 20 | **European Indexes** (DAX, CAC, FTSE, FTSE MIB, Euro Stoxx, IBEX, AEX) | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/european-indexes` |
| 21 | **Asian Indexes** (Nikkei, Shanghai, Hang Seng, Nifty, KOSPI, ASX) | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/asian-indexes` |
| 22 | **Emerging Markets** (Bovespa, JSE, MSCI EM) | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/emerging-indexes` |
| 23 | **European Stocks** (Top 20: Germania, Francia, UK, Italia) | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/european-stocks` |
| 24 | **Asian Stocks** (Top 15: Japan, China, India) | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/asian-stocks` |
| 25 | **Emerging Stocks** (Top 10: BRICS) | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/emerging-stocks` |
| 26 | **ETF Geografici** (VGK, EEM, VWO, VPL, EWJ) | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/etf-geographic` |
| 27 | **Regional Rotation Composite** | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/regional-rotation` |

---

## 💱 **4. INDICATORI FOREX**

| # | Indicatore | Status | Pro/Gratis | Frequenza Aggiornamento | API Usata | Route API |
|---|------------|--------|------------|-------------------------|-----------|-----------|
| 28 | **Forex Major Pairs** (EUR/USD, GBP/USD, USD/JPY, USD/CHF) | ✅ Implementato | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/forex` |
| 29 | **Forex Esteso** (Emergenti, Europee, Commodity Currencies) | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/forex-extended` |
| 30 | **DXY (Dollar Index)** | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | FRED (GRATIS) o Yahoo Finance (GRATIS) | `/api/market-indicators/dxy` |
| 31 | **Currency Strength Composite** | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/currency-strength` |
| 32 | **Carry Trade Composite** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora | FRED (Interest Rates - GRATIS) + Finnhub (Forex - GRATIS) | `/api/market-indicators/carry-trade` |

---

## 🏭 **5. INDICATORI COMMODITIES**

| # | Indicatore | Status | Pro/Gratis | Frequenza Aggiornamento | API Usata | Route API |
|---|------------|--------|------------|-------------------------|-----------|-----------|
| 33 | **Commodities** (Gold, Oil, Silver) | ✅ Implementato | 🟢 **GRATIS** | 10 minuti (per rispettare Alpha Vantage: 500 calls/day) | Alpha Vantage (GRATIS, 500 calls/day) | `/api/market-indicators/commodities` |
| 34 | **Commodity Rotation Composite** | ⚠️ Da Implementare | 🟢 **GRATIS** | 10 minuti | Alpha Vantage (GRATIS, 500 calls/day) | `/api/market-indicators/commodity-rotation` |
| 35 | **Commitment of Traders (COT)** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora (settimanale) | CFTC (GRATIS, no key, parsing complesso) | `/api/market-indicators/cot` |

---

## 📊 **6. INDICATORI VOLATILITÀ E SENTIMENT**

| # | Indicatore | Status | Pro/Gratis | Frequenza Aggiornamento | API Usata | Route API |
|---|------------|--------|------------|-------------------------|-----------|-----------|
| 36 | **VIX** | ✅ Implementato | 🟢 **GRATIS** | 1 minuto | Yahoo Finance (GRATIS, non ufficiale) | `/api/market-indicators/vix` |
| 37 | **VIX Term Structure** | ✅ Implementato (simulato) | 🟢 **GRATIS** | 1 minuto | Yahoo Finance (GRATIS, non ufficiale) - da implementare reale | `/api/market-indicators/vix-term-structure` |
| 38 | **Volatility Composite** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Yahoo Finance (GRATIS) + calcolo Realized Vol | `/api/market-indicators/volatility-composite` |
| 39 | **Put/Call Ratio** | ✅ Implementato (simulato) | 🟢 **GRATIS** | 1 minuto | Yahoo Finance (GRATIS, non ufficiale) - da implementare reale | `/api/market-indicators/put-call-ratio` |
| 40 | **Fear & Greed Index** | ✅ Implementato | 🟢 **GRATIS** | 1 ora | Alternative.me (GRATIS, no key) | `/api/market-indicators/fear-greed` |
| 41 | **AAII Sentiment Survey** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora (settimanale) | AAII (scraping o API pubblica?) - da verificare | `/api/market-indicators/aaii-sentiment` |
| 42 | **Sentiment Composite Avanzato** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Multiple (Fear & Greed, Put/Call, VIX, Short Interest, AAII) | `/api/market-indicators/sentiment-composite` |

---

## 🎯 **7. INDICATORI COMPOSITI MULTI-ASSET**

| # | Indicatore | Status | Pro/Gratis | Frequenza Aggiornamento | API Usata | Route API |
|---|------------|--------|------------|-------------------------|-----------|-----------|
| 43 | **Global Risk-On/Risk-Off Composite** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Multiple (VIX, Credit Spreads, Yield Curve, Stocks, Gold, Crypto, DXY, Forex) | `/api/market-indicators/risk-on-off` |
| 44 | **Risk-On/Risk-Off Score** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Multiple (tutte già disponibili - GRATIS) | `/api/market-indicators/risk-score` |
| 45 | **Cross-Asset Correlation Matrix** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora | Multiple (Finnhub, FRED, Alpha Vantage, CoinGecko - tutti GRATIS) | `/api/market-indicators/correlation-matrix` |
| 46 | **Risk Parity Composite** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora | Tutte già disponibili (GRATIS) | `/api/market-indicators/risk-parity` |
| 47 | **All-Weather Portfolio Composite** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora | Tutte già disponibili (GRATIS) | `/api/market-indicators/all-weather` |
| 48 | **Inflation Hedge Composite** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora | FRED (CPI - GRATIS) + Alpha Vantage (Commodities - GRATIS) + Finnhub (Stocks - GRATIS) | `/api/market-indicators/inflation-hedge` |
| 49 | **Momentum Composite Multi-Timeframe** | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/momentum-composite` |
| 50 | **Sector Rotation Composite** | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Finnhub (GRATIS, 60 calls/min) | `/api/market-indicators/sector-rotation` |

---

## 🔧 **8. INDICATORI TECNICI AVANZATI**

| # | Indicatore | Status | Pro/Gratis | Frequenza Aggiornamento | API Usata | Route API |
|---|------------|--------|------------|-------------------------|-----------|-----------|
| 51 | **VWAP** (Volume-Weighted Average Price) | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Finnhub Candlestick (GRATIS, 60 calls/min) | `/api/market-indicators/vwap` |
| 52 | **OBV** (On-Balance Volume) | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Finnhub Candlestick (GRATIS, 60 calls/min) | `/api/market-indicators/obv` |
| 53 | **Accumulation/Distribution Line** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Finnhub Candlestick (GRATIS, 60 calls/min) | `/api/market-indicators/accumulation-distribution` |
| 54 | **Money Flow Index (MFI)** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Finnhub Candlestick (GRATIS, 60 calls/min) | `/api/market-indicators/mfi` |
| 55 | **Chaikin Oscillator** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Finnhub Candlestick (GRATIS, 60 calls/min) | `/api/market-indicators/chaikin-oscillator` |
| 56 | **Ease of Movement (EOM)** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Finnhub Candlestick (GRATIS, 60 calls/min) | `/api/market-indicators/eom` |

---

## 🔬 **9. MICROSTRUTTURE DI MERCATO**

| # | Indicatore | Status | Pro/Gratis | Frequenza Aggiornamento | API Usata | Route API |
|---|------------|--------|------------|-------------------------|-----------|-----------|
| 57 | **Order Flow Imbalance** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Binance/Coinbase Public API (GRATIS, no key) | `/api/market-indicators/order-flow-imbalance` |
| 58 | **Cumulative Delta** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Binance Recent Trades (GRATIS, no key) | `/api/market-indicators/cumulative-delta` |
| 59 | **Volume Profile** | ⚠️ Da Implementare | 🟢 **GRATIS** | 5 minuti | Binance Candlestick Data (GRATIS, no key) | `/api/market-indicators/volume-profile` |
| 60 | **Time & Sales Analysis** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Binance Recent Trades (GRATIS, no key) | `/api/market-indicators/time-sales` |
| 61 | **Market Depth Heatmap** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Binance/Coinbase Order Book (GRATIS, no key) | `/api/market-indicators/depth-heatmap` |
| 62 | **Bid-Ask Spread Analysis** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Binance/Coinbase Order Book (GRATIS, no key) | `/api/market-indicators/spread-analysis` |
| 63 | **Large Order Detection** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Binance/Coinbase Order Book (GRATIS, no key) | `/api/market-indicators/large-orders` |
| 64 | **Order Book Imbalance Zones** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Binance/Coinbase Order Book (GRATIS, no key) | `/api/market-indicators/imbalance-zones` |
| 65 | **Liquidity Composite** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Binance/Coinbase Order Book (GRATIS) + Finnhub Volume (GRATIS) | `/api/market-indicators/liquidity-composite` |

---

## 💰 **10. INDICATORI CRYPTO**

| # | Indicatore | Status | Pro/Gratis | Frequenza Aggiornamento | API Usata | Route API |
|---|------------|--------|------------|-------------------------|-----------|-----------|
| 66 | **L400 Depth** | ✅ Implementato | 🟢 **GRATIS** | 1 minuto | Binance Public API (GRATIS, no key) | `/api/crypto/top-400-depth` |
| 67 | **Aggregated Depth** | ✅ Implementato | 🟢 **GRATIS** | 1 minuto | Binance + Coinbase Public API (GRATIS, no key) | `/api/crypto/aggregated-depth` |
| 68 | **Multi-Exchange Depth** | ✅ Implementato | 🟢 **GRATIS** | 1 minuto | Binance + Coinbase Public API (GRATIS, no key) | `/api/crypto/multi-exchange-depth` |
| 69 | **Top 400 Monitor** | ✅ Implementato | 🟢 **GRATIS** | 1 minuto | Binance Public API (GRATIS, no key) | `/api/crypto/top-400-monitor` |
| 70 | **Top Movers** | ✅ Implementato | 🟢 **GRATIS** | 5 minuti | CoinGecko (GRATIS, no key) | `/api/crypto/top-movers` |
| 71 | **Whale Analysis** | ✅ Implementato | 🟢 **GRATIS** | 5 minuti | CoinGecko (GRATIS, no key) | `/api/crypto/whale-analysis` |
| 72 | **Exchange Flows** | ✅ Implementato | 🟢 **GRATIS** | 1 ora | CoinGecko (GRATIS, no key) | `/api/crypto/exchange-flows` |
| 73 | **Social Sentiment** | ✅ Implementato | 🟢 **GRATIS** | 1 ora | CoinGecko (GRATIS, no key) | `/api/crypto/social-sentiment` |
| 74 | **Trending** | ✅ Implementato | 🟢 **GRATIS** | 5 minuti | CoinGecko (GRATIS, no key) | `/api/crypto/trending` |
| 75 | **Developer Activity** | ✅ Implementato | 🟢 **GRATIS** | 1 ora | CoinGecko (GRATIS, no key) | `/api/crypto/developer-activity` |
| 76 | **L400 History** | ✅ Implementato | 🟢 **GRATIS** | 1 minuto | Binance Public API (GRATIS, no key) | `/api/crypto/l400-history` |
| 77 | **Bitcoin Dominance** | ✅ Implementato | 🟢 **GRATIS** | 5 minuti | CoinGecko (GRATIS, no key) | `/api/market-indicators/bitcoin-dominance` |
| 78 | **Crypto Market Cap** | ✅ Implementato | 🟢 **GRATIS** | 5 minuti | CoinGecko (GRATIS, no key) | `/api/market-indicators/crypto-market-cap` |
| 79 | **NVT Ratio** (Network Value to Transactions) | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora | CoinGecko (GRATIS, no key) | `/api/crypto/nvt-ratio` |
| 80 | **MVRV Ratio** (Market Value to Realized Value) | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora | CoinGecko (GRATIS, parziale) | `/api/crypto/mvrv-ratio` |
| 81 | **Active Addresses** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 ora | CoinGecko (GRATIS, parziale) | `/api/crypto/active-addresses` |

---

## 📅 **11. CALENDARI**

| # | Indicatore | Status | Pro/Gratis | Frequenza Aggiornamento | API Usata | Route API |
|---|------------|--------|------------|-------------------------|-----------|-----------|
| 82 | **IPO Calendar** | ✅ Implementato | 🟢 **GRATIS** | 1 ora | Finnhub (GRATIS, 60 calls/min) | `/api/market/ipo-calendar` |
| 83 | **Corporate Events** (Earnings, Dividends, Splits) | ✅ Implementato | 🟢 **GRATIS** | 1 ora | Finnhub (GRATIS, 60 calls/min) | `/api/market/corporate-events` |
| 84 | **Economic Calendar** | ✅ Implementato | 🟢 **GRATIS** | 1 ora | Finnhub (GRATIS, 60 calls/min) | Component implementato |

---

## 🎯 **12. INDICATORI OPZIONI E FUTURES**

| # | Indicatore | Status | Pro/Gratis | Frequenza Aggiornamento | API Usata | Route API |
|---|------------|--------|------------|-------------------------|-----------|-----------|
| 85 | **Options Flow** | ⚠️ Da Implementare | 🟡 **PRO** (FREE limitato) | 1 minuto | Polygon.io (FREE: 5 calls/min) o IEX Cloud (FREE: 50k messages/mese) | `/api/market-indicators/options-flow` |
| 86 | **Futures Term Structure** | ⚠️ Da Implementare | 🟢 **GRATIS** | 1 minuto | Alpha Vantage (GRATIS, limitato) o Yahoo Finance (non ufficiale) | `/api/market-indicators/futures-term-structure` |

---

## 📊 **13. RIEPILOGO COMPLETO**

### ✅ **IMPLEMENTATI** (27 indicatori):
- 13 indicatori base
- 11 indicatori crypto
- 3 calendari

### ⚠️ **DA IMPLEMENTARE** (60 indicatori):
- 8 microstrutture
- 16 compositi
- 6 tecnici avanzati
- 10 globali
- 4 globali avanzati
- 3 on-chain
- 3 multi-asset compositi
- 10 base mancanti

**TOTALE**: **87 INDICATORI**

---

## 🎯 **14. DISTRIBUZIONE PRO/GRATIS**

### 🟢 **GRATIS** (85 indicatori):
- Tutti gli indicatori implementati (27)
- Quasi tutti gli indicatori da implementare (58)
- Solo 2 indicatori richiedono PRO (Options Flow, PMI globale)

### 🟡 **PRO** (2 indicatori):
1. **Options Flow** - Polygon.io FREE (5 calls/min) o IEX Cloud FREE (50k/mese)
2. **PMI Globale** - Trading Economics FREE (2 calls/min, richiede key)

---

## ⏱️ **15. DISTRIBUZIONE FREQUENZE AGGIORNAMENTO**

### **1 minuto** (25 indicatori):
- VIX, VIX Term Structure, Volatility Composite
- Put/Call Ratio, Sentiment Composite
- Risk-On/Risk-Off Composite, Risk Score
- VWAP, OBV, A/D, MFI, Chaikin Oscillator, EOM
- Order Flow Imbalance, Cumulative Delta, Time & Sales
- Market Depth Heatmap, Bid-Ask Spread, Large Orders, Imbalance Zones
- L400 Depth, Aggregated Depth, Multi-Exchange Depth, L400 History
- Options Flow, Futures Term Structure

### **5 minuti** (15 indicatori):
- Stock Indexes, Market Breadth, McClellan Oscillator/Summation, Arms Index
- Forex Major Pairs, Forex Esteso, DXY
- ETF Settoriali, ETF Geografici
- European/Asian/Emerging Indexes, European/Asian/Emerging Stocks
- Regional Rotation, Sector Rotation, Currency Strength
- Momentum Composite Multi-Timeframe
- Top Movers, Whale Analysis, Trending
- Bitcoin Dominance, Crypto Market Cap

### **10 minuti** (2 indicatori):
- Commodities, Commodity Rotation

### **1 ora** (45 indicatori):
- Economic Indicators, Bond Yields, Yield Curve, Credit Spreads
- Leading Economic Indicators, PMI, Business Cycle, Financial Stress
- Economic Indicators Globali
- Short Interest, ETF Flows, Stock Market Fear & Greed, Real Estate
- Carry Trade Composite
- COT (settimanale)
- Fear & Greed Index, AAII Sentiment (settimanale)
- Cross-Asset Correlation Matrix, Risk Parity, All-Weather, Inflation Hedge
- Volume Profile
- Liquidity Composite
- Exchange Flows, Social Sentiment, Developer Activity
- NVT Ratio, MVRV Ratio, Active Addresses
- IPO Calendar, Corporate Events, Economic Calendar

---

## 🔑 **16. API UTILIZZATE**

### 🟢 **GRATIS - No Key Required**:
- **CoinGecko** - Crypto data (no key, no limit)
- **Alternative.me** - Fear & Greed Index (no key, no limit)
- **Binance Public API** - Crypto order book, trades (no key, no limit)
- **Coinbase Public API** - Crypto order book (no key, no limit)
- **Yahoo Finance** - VIX, VIX Term Structure, Put/Call Ratio (non ufficiale, no key)
- **CFTC** - COT Reports (no key, parsing complesso)
- **ECB** - European economic data (no key, API pubblica)
- **Eurostat** - European statistics (no key, API pubblica)
- **World Bank** - Global economic data (no key, API pubblica)
- **IMF** - Global economic data (no key, API pubblica)

### 🟢 **GRATIS - Key Required**:
- **FRED API** - Economic data, bond yields (GRATIS, illimitato, key richiesta)
- **Finnhub** - Stock indexes, forex, stocks, ETFs, calendars (GRATIS, 60 calls/min, key richiesta)
- **Alpha Vantage** - Commodities (GRATIS, 500 calls/day, key richiesta)
- **Groq** - AI readings (GRATIS, 30 req/min, key richiesta)

### 🟡 **PRO - FREE Tier Limitato**:
- **Polygon.io** - Options Flow (FREE: 5 calls/min, key richiesta)
- **IEX Cloud** - Options Flow (FREE: 50k messages/mese, key richiesta)
- **Trading Economics** - PMI globale (FREE: 2 calls/min, key richiesta)

---

## ✅ **17. CONCLUSIONE**

### **87 INDICATORI TOTALI**:
- ✅ **27 implementati** (tutti GRATIS)
- ⚠️ **60 da implementare** (58 GRATIS, 2 PRO/FREE limitato)

### **DISTRIBUZIONE**:
- 🟢 **GRATIS**: 85 indicatori (97.7%)
- 🟡 **PRO/FREE limitato**: 2 indicatori (2.3%)

### **FREQUENZE**:
- **1 minuto**: 25 indicatori (28.7%)
- **5 minuti**: 15 indicatori (17.2%)
- **10 minuti**: 2 indicatori (2.3%)
- **1 ora**: 45 indicatori (51.7%)

### **API PRINCIPALI**:
- **FRED**: 15+ indicatori (economic, bonds, yields)
- **Finnhub**: 30+ indicatori (stocks, indexes, forex, ETFs, calendars)
- **CoinGecko**: 15+ indicatori (crypto)
- **Binance/Coinbase**: 10+ indicatori (crypto microstrutture)
- **Alpha Vantage**: 2 indicatori (commodities)
- **Yahoo Finance**: 3 indicatori (VIX, Put/Call)

---

## 🚀 **18. PROSSIMI PASSI**

**Vuoi che implementi SUBITO**:
1. ✅ Indici Globali (Europa, Italia, Asia, Emergenti) - 6-8 ore
2. ✅ Forex Esteso + DXY - 4-5 ore
3. ✅ ETF Geografici - 3-4 ore

**Questo ci porta da "solo USA" a "mercati globali completi" in 13-17 ore!**
