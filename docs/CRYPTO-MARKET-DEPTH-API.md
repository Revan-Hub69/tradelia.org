# Top 400 Crypto Market Depth API

## Overview
API per ottenere profondità di mercato (order book depth) delle top 400 crypto con analisi Groq AI.

## Endpoint

### GET /api/crypto/top-400-depth

Ottiene order book depth per top 400 crypto da Binance e analizza con Groq AI.

**Query Parameters:**
- `limit` (optional): Numero di crypto da analizzare (default: 400, max: 400)
- `depth` (optional): Numero di livelli order book (default: 20)
- `cache` (optional): Usa cache (default: true)

**Response:**
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "depths": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "bids": [
        { "price": 45000.00, "quantity": 1.5 },
        { "price": 44999.50, "quantity": 2.3 },
        ...
      ],
      "asks": [
        { "price": 45001.00, "quantity": 1.2 },
        { "price": 45001.50, "quantity": 3.1 },
        ...
      ],
      "bidTotal": 150.5,
      "askTotal": 120.3,
      "spread": 0.0022,
      "imbalance": 11.2,
      "depthScore": 85.5
    },
    ...
  ],
  "summary": {
    "totalTracked": 400,
    "avgSpread": 0.015,
    "avgImbalance": 2.5,
    "highDepth": [
      { "symbol": "BTC", "depthScore": 95.2 },
      ...
    ],
    "lowDepth": [
      { "symbol": "XYZ", "depthScore": 12.3 },
      ...
    ],
    "aiAnalysis": {
      "analysis": "Analisi generale del mercato...",
      "insights": ["Insight 1", "Insight 2", ...],
      "liquidityAnalysis": "Analisi liquidità...",
      "marketStructure": "Struttura mercato...",
      "alerts": ["Alert 1", "Alert 2", ...]
    }
  }
}
```

## Market Depth Metrics

### Spread
- **Formula**: `((bestAsk - bestBid) / midPrice) * 100`
- **Interpretazione**: 
  - < 0.01%: Spread molto stretto (alta liquidità)
  - 0.01-0.1%: Spread stretto
  - 0.1-0.5%: Spread moderato
  - > 0.5%: Spread ampio (bassa liquidità)

### Imbalance
- **Formula**: `((bidTotal - askTotal) / totalVolume) * 100`
- **Interpretazione**:
  - > 10%: Forte domanda (più bid che ask)
  - 5-10%: Domanda moderata
  - -5% a +5%: Bilanciato
  - -10% a -5%: Offerta moderata
  - < -10%: Forte offerta (più ask che bid)

### Depth Score
- **Formula**: `volumeScore + spreadScore` (0-100)
- **Components**:
  - Volume Score: Max 50 points (based on total volume)
  - Spread Score: Max 50 points (inverse of spread)
- **Interpretazione**:
  - 80-100: Eccellente liquidità
  - 60-80: Buona liquidità
  - 40-60: Liquidità moderata
  - 20-40: Bassa liquidità
  - 0-20: Molto bassa liquidità

## Groq AI Analysis

### Analysis Components
1. **General Analysis**: Stato liquidità, spread, struttura mercato
2. **Insights**: Pattern identificati, correlazioni, osservazioni
3. **Liquidity Analysis**: Analisi liquidità aggregata, distribuzione
4. **Market Structure**: Struttura order book, market makers, pattern
5. **Alerts**: Spread anomali, imbalance, bassa liquidità, rischi

### Academic References
- **Market Microstructure Theory**: Analisi struttura order book
- **Order Book Dynamics**: Pattern bid-ask
- **Liquidity Analysis**: Metriche liquidità
- **Market Impact Theory**: Impatto ordini grandi

## Data Sources

### Binance Order Book API
- **Endpoint**: `https://api.binance.com/api/v3/depth`
- **Rate Limit**: 1200 calls/minute (FREE)
- **Limit**: Max 5000 levels (default: 20)
- **Cost**: FREE

### CoinGecko (for crypto list)
- **Endpoint**: `/api/v3/coins/markets`
- **Rate Limit**: 50 calls/minute (FREE)
- **Cost**: FREE

## Caching Strategy

- **Cache Duration**: 2 minutes (order books change frequently)
- **Cache Key**: Symbol
- **Invalidation**: Automatic after TTL

## Rate Limiting

- **Binance**: 1200 calls/min (very generous)
- **Strategy**: 50ms delay between requests
- **Batching**: Process in batches of 20
- **Result**: ~400 crypto in ~20 seconds

## Use Cases

### 1. Liquidity Analysis
- Identificare crypto più/meno liquide
- Analizzare spread per trading decisions
- Monitorare cambiamenti liquidità

### 2. Market Structure
- Identificare presenza market makers
- Analizzare pattern order book
- Rilevare anomalie strutturali

### 3. Trading Insights
- Imbalance bid/ask per sentiment
- Spread analysis per entry/exit
- Depth score per selezione asset

### 4. Risk Management
- Alert su bassa liquidità
- Monitoraggio spread anomali
- Identificazione potenziali slippage

## Best Practices

### Performance
- Use caching (2 min TTL)
- Batch requests (20 at a time)
- Rate limit delays (50ms)

### Error Handling
- Skip symbols not on Binance
- Fallback to cached data if available
- Graceful degradation

### AI Analysis
- Structured JSON response
- Academic references when relevant
- MIFID compliant (no investment advice)

## Example Usage

```typescript
// Get market depth for top 100 crypto
const response = await fetch('/api/crypto/top-400-depth?limit=100&depth=20');
const data = await response.json();

// Access depth data
data.depths.forEach(depth => {
  console.log(`${depth.symbol}: Spread ${depth.spread.toFixed(4)}%, Score ${depth.depthScore.toFixed(1)}`);
});

// Access AI analysis
console.log(data.summary.aiAnalysis.analysis);
console.log(data.summary.aiAnalysis.insights);
console.log(data.summary.aiAnalysis.alerts);
```

## Conclusion

L'API fornisce:
- ✅ **Order Book Depth**: Dati reali da Binance (FREE)
- ✅ **Liquidity Metrics**: Spread, imbalance, depth score
- ✅ **AI Analysis**: Groq AI insights (FREE tier)
- ✅ **Academic Compliance**: Market microstructure theory
- ✅ **MIFID Compliance**: Educational, no investment advice
- ✅ **Zero Cost**: Tutto gratis!

Pronto per implementazione UI! 🚀
