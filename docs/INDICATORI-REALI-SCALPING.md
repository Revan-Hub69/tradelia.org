# Indicatori Reali per Scalping/Intraday Crypto

## ❌ PROBLEMA ATTUALE

### Indicatori Implementati (Non Ottimali per Scalping)
Gli indicatori attualmente implementati (RSI, MACD, Bollinger Bands, etc.) sono **utili per swing trading**, ma **NON per scalping/intraday**:

- **RSI**: Lento, ritardato, non adatto a timeframe <5min
- **MACD**: Troppo lento per scalping
- **Bollinger Bands**: Utile ma non sufficiente
- **Ichimoku**: Troppo complesso per scalping veloce
- **Fibonacci**: Utile ma più per swing trading

### Indicatori MANCANTI (Critici per Scalping)
Per scalping/intraday crypto servono indicatori **real-time** e **order flow based**:

1. **Order Flow Imbalance** ✅ (già implementato)
2. **Funding Rates** ✅ (già implementato)
3. **Liquidation Clusters** ✅ (già implementato)
4. **Volume Profile** ✅ (già implementato)
5. **Order Book Depth** ✅ (già implementato)
6. **VWAP** ✅ (già implementato)
7. **Realized Volatility** ✅ (già implementato)

**MANCANO**:
- ❌ **Time & Sales** (Trade flow in tempo reale)
- ❌ **Delta** (Buy vs Sell pressure)
- ❌ **Taker Buy/Sell Ratio** (Aggressività ordini)
- ❌ **Order Book Imbalance Real-time** (Bid/Ask imbalance)
- ❌ **Market Depth Imbalance** (Cumulative depth)
- ❌ **Footprint Chart** (Order flow visualization)
- ❌ **Cumulative Volume Delta (CVD)** (Volume netto)
- ❌ **Volume-Weighted Delta** (Delta ponderato)

---

## ✅ INDICATORI REALMENTE UTILI PER SCALPING

### 1. Order Flow Indicators (Priorità Alta)

#### Time & Sales
- **Cosa**: Flusso di trade in tempo reale
- **Utilità**: Vedi aggressività compratori/venditori
- **Fonte**: Binance WebSocket `/ws/{symbol}@trade`
- **Implementazione**: WebSocket stream

#### Delta (Buy vs Sell Pressure)
- **Cosa**: Differenza tra volume buy e sell
- **Formula**: Delta = Buy Volume - Sell Volume
- **Utilità**: Indica pressione direzionale immediata
- **Fonte**: Binance trades stream

#### Taker Buy/Sell Ratio
- **Cosa**: Rapporto tra ordini aggressivi (taker) buy vs sell
- **Formula**: Taker Buy Volume / Taker Sell Volume
- **Utilità**: Sentiment immediato
- **Fonte**: Binance 24h ticker statistics

#### Cumulative Volume Delta (CVD)
- **Cosa**: Volume netto cumulativo (buy - sell)
- **Utilità**: Trend accumulazione/distribuzione
- **Calcolo**: Somma delta nel tempo

### 2. Order Book Indicators (Priorità Alta)

#### Order Book Imbalance Real-time
- **Cosa**: Imbalance bid/ask in tempo reale
- **Formula**: (Bid Volume - Ask Volume) / (Bid Volume + Ask Volume)
- **Utilità**: Pressione immediata
- **Fonte**: Binance WebSocket `/ws/{symbol}@depth20`

#### Market Depth Imbalance
- **Cosa**: Imbalance a diversi livelli di profondità
- **Utilità**: Support/resistance dinamici
- **Fonte**: Order book depth

### 3. Volume Indicators (Priorità Media)

#### Volume-Weighted Delta
- **Cosa**: Delta ponderato per volume
- **Utilità**: Delta più accurato
- **Calcolo**: Σ(Delta × Volume) / Σ(Volume)

#### Volume Rate of Change
- **Cosa**: Velocità cambio volume
- **Utilità**: Identifica breakout
- **Formula**: (Volume(t) - Volume(t-n)) / Volume(t-n)

### 4. Price Action Indicators (Priorità Media)

#### VWAP ✅ (già implementato)
- **Utilità**: Prezzo medio ponderato per volume
- **Scalping**: Utile per entry/exit

#### Realized Volatility ✅ (già implementato)
- **Utilità**: Volatilità realizzata
- **Scalping**: Utile per stop loss dinamici

---

## 📊 DATI: DA DOVE VENGONO?

### Attualmente
- **Fonte**: Binance API (spot + futures)
- **Crypto Supportate**: Solo 15 hardcoded
  - BTC, ETH, BNB, SOL, XRP, ADA, DOGE, AVAX, MATIC, LINK, DOT, UNI, ATOM, LTC, NEAR

### Problemi
1. ❌ Solo 15 crypto (dovremmo supportare top 50+)
2. ❌ Lista hardcoded (dovrebbe essere dinamica)
3. ❌ Nessuna verifica se crypto esiste su Binance
4. ❌ Nessun fallback se crypto non disponibile

### Soluzione
1. ✅ Fetch top 50 crypto da CoinGecko/CoinMarketCap
2. ✅ Verifica disponibilità su Binance
3. ✅ Supporto dinamico per tutte le crypto su Binance
4. ✅ Fallback per crypto non su Binance

---

## 🎯 PRIORITÀ IMPLEMENTAZIONE

### Settimana 1 (Critico)
1. **Time & Sales** - WebSocket stream
2. **Delta** - Buy vs Sell pressure
3. **Taker Buy/Sell Ratio** - 24h statistics
4. **Order Book Imbalance Real-time** - WebSocket depth

### Settimana 2 (Alto)
5. **Cumulative Volume Delta (CVD)**
6. **Market Depth Imbalance**
7. **Volume-Weighted Delta**
8. **Top 50 Crypto Support** - Fetch dinamico

### Settimana 3 (Medio)
9. **Footprint Chart** - Visualization
10. **Volume Rate of Change**
11. **Order Flow Heatmap**

---

## 📈 INDICATORI PER TIMEFRAME

### Scalping (1m-5m)
- ✅ Order Flow Imbalance
- ✅ Delta
- ✅ Taker Buy/Sell Ratio
- ✅ Order Book Imbalance
- ✅ Time & Sales
- ✅ VWAP
- ⚠️ RSI (solo se <5m, ma non ideale)
- ❌ MACD (troppo lento)
- ❌ Ichimoku (troppo complesso)

### Intraday (15m-1h)
- ✅ VWAP
- ✅ Volume Profile
- ✅ Order Flow Imbalance
- ✅ Funding Rates
- ✅ Liquidation Clusters
- ✅ RSI (utile)
- ✅ MACD (utile)
- ✅ Bollinger Bands (utile)
- ✅ ATR (utile per stop loss)

### Swing Trading (4h-1d)
- ✅ Tutti gli indicatori classici
- ✅ Fibonacci
- ✅ Ichimoku
- ✅ ADX
- ✅ Parabolic SAR

---

## 🔧 AZIONI RICHIESTE

1. **Rimuovere/Marcare come "Swing Trading"** indicatori non adatti a scalping
2. **Implementare indicatori order flow** (Time & Sales, Delta, etc.)
3. **Espandere crypto supportate** a top 50+ (dinamico)
4. **Aggiungere WebSocket** per dati real-time
5. **Documentare** quali indicatori usare per quale timeframe

