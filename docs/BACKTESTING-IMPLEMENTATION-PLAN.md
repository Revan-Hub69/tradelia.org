# Backtesting Implementation Plan - Strategy Builder

## 🎯 Obiettivo

Trasformare lo Strategy Builder da **demo con dati simulati** a **strumento professionale con backtesting reale** su dati storici OHLCV.

## ✅ Stato Attuale

- ❌ Dati simulati (non realistici)
- ❌ Nessun backtesting reale
- ❌ Metriche teoriche (non basate su dati reali)

## 🚀 Implementazione Necessaria

### 1. **Backtesting Engine** ✅ (Implementato)

File: `lib/backtesting/backtest-engine.ts`

- ✅ Engine per eseguire backtesting su dati OHLCV
- ✅ Supporto per slippage e commissioni
- ✅ Calcolo metriche reali (Sharpe, Calmar, Win Rate, etc.)
- ✅ Equity curve tracking

### 2. **Strategy Implementations** ✅ (Parziale)

File: `lib/backtesting/strategy-implementations.ts`

- ✅ MA Crossover
- ✅ RSI Mean Reversion
- ✅ MACD Trend
- ⚠️ Mancano: Bollinger Bands, Momentum, Mean Reversion, ATR Trailing Stop

### 3. **Historical Data API Integration** ⚠️ (Da Implementare)

**API Disponibili** (già integrate in Tradelia):
- ✅ **Finnhub**: 60 calls/min, dati storici OHLCV
- ✅ **Binance**: 1200 calls/min, dati storici crypto
- ✅ **Yahoo Finance**: Illimitato (non ufficiale), dati storici

**Cosa serve**:
1. API endpoint per fetch dati storici: `/api/market-data/historical`
2. Cache intelligente (evitare rate limits)
3. Supporto per multiple timeframe (1m, 5m, 1h, 1d, etc.)

### 4. **Integration con Strategy Builder** ⚠️ (Da Implementare)

Modifiche necessarie in `components/dashboard/utilities/StrategyBuilder.tsx`:

1. **Sostituire simulazione con backtesting reale**:
   ```typescript
   // PRIMA (simulato):
   const baseReturn = 12 + (kv * 2);
   
   // DOPO (reale):
   const historicalData = await fetchHistoricalData(symbol, startDate, endDate, timeframe);
   const backtestResult = backtestEngine.run();
   ```

2. **Aggiungere selezione simbolo**:
   - Input per simbolo (es. "AAPL", "BTC/USD", "EUR/USD")
   - Validazione simbolo disponibile

3. **Usare dati reali invece di simulati**:
   - Fetch dati storici dalle API
   - Applicare strategie ai dati reali
   - Calcolare metriche reali

## 📋 Step-by-Step Implementation

### Step 1: Completare Strategy Implementations ✅
- [x] MA Crossover
- [x] RSI Mean Reversion
- [x] MACD Trend
- [ ] Bollinger Bands
- [ ] Momentum
- [ ] Mean Reversion
- [ ] ATR Trailing Stop

### Step 2: Historical Data API ⚠️
- [ ] Creare `/api/market-data/historical`
- [ ] Integrare Finnhub/Binance/Yahoo Finance
- [ ] Implementare cache (Redis o in-memory)
- [ ] Supporto timeframe multipli

### Step 3: Integrare in Strategy Builder ⚠️
- [ ] Sostituire logica simulata con backtesting reale
- [ ] Aggiungere input simbolo
- [ ] Fetch dati storici
- [ ] Eseguire backtesting per ogni combinazione parametri
- [ ] Mostrare risultati reali

### Step 4: Testing & Validation ✅
- [ ] Test con dati reali
- [ ] Validazione metriche
- [ ] Performance optimization
- [ ] Error handling

## 🔧 API Endpoint Necessario

```typescript
// GET /api/market-data/historical
// Query params:
// - symbol: string (es. "AAPL", "BTC/USD")
// - startDate: string (ISO date)
// - endDate: string (ISO date)
// - timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w'
// - provider?: 'finnhub' | 'binance' | 'yahoo'

// Response:
{
  data: OHLCV[];
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
}
```

## 💡 Best Practices

1. **Cache Intelligente**:
   - Cache dati storici per 24h (dati storici non cambiano)
   - Cache per simbolo + timeframe + date range
   - Evitare rate limits

2. **Error Handling**:
   - Fallback tra provider (Finnhub → Binance → Yahoo)
   - Gestire simboli non disponibili
   - Gestire date range troppo grandi

3. **Performance**:
   - Backtesting può essere lento per molti parametri
   - Considerare Web Workers per calcoli pesanti
   - Progress indicator per utente

4. **Limiti**:
   - Rate limits API (60/min Finnhub, 1200/min Binance)
   - Date range massimo (es. 1 anno per free tier)
   - Timeout per calcoli lunghi

## 🎯 Priorità

**Alta**:
1. ✅ Backtesting Engine (fatto)
2. ⚠️ Historical Data API (da fare)
3. ⚠️ Integration Strategy Builder (da fare)

**Media**:
4. Completare tutte le strategie
5. Cache intelligente
6. Error handling robusto

**Bassa**:
7. Web Workers per performance
8. Progress indicator
9. Export risultati

## 📊 Conclusione

**Attualmente**: Strategy Builder è una demo con dati simulati

**Dopo implementazione**: Strategy Builder sarà uno strumento professionale con:
- ✅ Backtesting reale su dati storici
- ✅ Metriche accurate basate su dati reali
- ✅ Validazione strategie su mercati reali
- ✅ Walk-Forward Optimization con dati reali

**Tempo stimato**: 2-3 giorni di sviluppo per implementazione completa
