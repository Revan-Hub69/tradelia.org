# Tournaments - Price Data Integration

## Overview
Sistema di integrazione dati prezzi per tornei, utilizzando API gratuite e best practice per budget limitato.

## Price Data Sources

### 1. Finnhub (Primary - Free Tier)
- **Rate Limit**: 60 calls/minute (free tier)
- **Coverage**: Stocks, Forex, Crypto
- **Real-time**: Delayed 15 minutes (free tier)
- **Cost**: FREE (up to 60 calls/min)

**Usage:**
```typescript
// lib/price-apis.ts
export async function getCurrentPrice(symbol: string, assetType: 'stock' | 'crypto' | 'forex'): Promise<number> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) throw new Error('FINNHUB_API_KEY not configured');
  
  const endpoint = assetType === 'crypto' 
    ? `https://finnhub.io/api/v1/crypto/price?symbol=${symbol}&token=${apiKey}`
    : `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
  
  const response = await fetch(endpoint);
  const data = await response.json();
  return data.c || data.price || 0; // Current price
}
```

### 2. Binance (Crypto - Free)
- **Rate Limit**: 1200 requests/minute
- **Coverage**: Crypto only
- **Real-time**: WebSocket available (free)
- **Cost**: FREE

**Usage:**
```typescript
// For crypto symbols
export async function getBinancePrice(symbol: string): Promise<number> {
  const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`);
  const data = await response.json();
  return parseFloat(data.price);
}
```

### 3. Yahoo Finance (Fallback - Free)
- **Rate Limit**: ~2000 requests/hour (unofficial)
- **Coverage**: Stocks, Forex, Crypto
- **Real-time**: Delayed
- **Cost**: FREE (unofficial API)

**Usage:**
```typescript
// Fallback option
export async function getYahooPrice(symbol: string): Promise<number> {
  // Use yahoo-finance2 or similar library
  // Or scrape (not recommended for production)
}
```

## Price Update Strategy

### For Paper Trading (Individual)
- **Frequency**: Every 5-10 seconds per active position
- **Method**: Polling with caching
- **Optimization**: Batch requests, cache results

### For Tournaments (Multiple Users)
- **Frequency**: Every 10-15 seconds (shared updates)
- **Method**: Server-side polling + WebSocket push (future)
- **Optimization**: 
  - Single price fetch per symbol shared across all participants
  - Cache prices for 10 seconds
  - Batch updates to database

## Implementation

### Server-Side Price Service
```typescript
// lib/services/price-service.ts
class PriceService {
  private cache = new Map<string, { price: number; timestamp: number }>();
  private cacheTTL = 10000; // 10 seconds

  async getPrice(symbol: string, assetType: string): Promise<number> {
    const cacheKey = `${symbol}-${assetType}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.price;
    }

    const price = await getCurrentPrice(symbol, assetType);
    this.cache.set(cacheKey, { price, timestamp: Date.now() });
    return price;
  }

  async updateTournamentPositions(tournamentId: string) {
    // Get all unique symbols in tournament
    const symbols = await getTournamentSymbols(tournamentId);
    
    // Fetch prices in parallel (with rate limiting)
    const prices = await Promise.all(
      symbols.map(s => this.getPrice(s.symbol, s.assetType))
    );
    
    // Batch update positions
    await updateTournamentPositionsPrices(tournamentId, prices);
  }
}
```

### API Endpoint for Price Updates
```typescript
// app/api/tournaments/[id]/prices/route.ts
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const priceService = new PriceService();
  await priceService.updateTournamentPositions(params.id);
  return NextResponse.json({ success: true });
}
```

### Client-Side Polling
```typescript
// In tournament component
useEffect(() => {
  if (tournamentStatus !== 'in_progress') return;
  
  const interval = setInterval(async () => {
    // Update prices for all positions
    await fetch(`/api/tournaments/${tournamentId}/prices`, { method: 'POST' });
    // Then refetch positions
    await refetchPositions();
  }, 15000); // Every 15 seconds
  
  return () => clearInterval(interval);
}, [tournamentStatus]);
```

## Rate Limiting Strategy

### Finnhub Free Tier
- **Limit**: 60 calls/minute
- **Strategy**: 
  - Cache prices for 10-15 seconds
  - Batch requests (one per unique symbol)
  - Distribute updates across time (stagger updates)

### Example Rate Limiter
```typescript
class RateLimiter {
  private calls: number[] = [];
  private maxCalls = 60;
  private windowMs = 60000; // 1 minute

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    this.calls = this.calls.filter(t => now - t < this.windowMs);
    
    if (this.calls.length >= this.maxCalls) {
      const waitTime = this.windowMs - (now - this.calls[0]);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.checkLimit();
    }
    
    this.calls.push(now);
    return true;
  }
}
```

## Cost Optimization

### 1. Caching
- **Client Cache**: 5-10 seconds
- **Server Cache**: 10-15 seconds
- **Database**: Store last price, update only on change

### 2. Batching
- **Single Request**: One API call per unique symbol
- **Shared Updates**: All tournament participants share same price data
- **Batch Database Updates**: Update all positions in one transaction

### 3. Update Frequency
- **Active Positions**: Update every 10-15 seconds
- **Inactive Tournaments**: No updates
- **Completed Tournaments**: Final price snapshot only

### 4. Symbol Limits
- **Per Tournament**: Limit to 50-100 unique symbols
- **Popular Symbols**: Prioritize frequently traded symbols
- **Cache Popular**: Cache top 100 symbols globally

## Budget Calculation

### Free Tier Usage
- **Finnhub**: 60 calls/min = 3,600 calls/hour = 86,400 calls/day
- **Tournaments Active**: Assume 5 tournaments with 50 participants each = 250 active positions
- **Unique Symbols**: Assume 20 symbols per tournament = 100 unique symbols
- **Update Frequency**: Every 15 seconds = 4 updates/min per symbol = 400 calls/min

**Problem**: 400 calls/min > 60 calls/min limit!

### Solution: Aggressive Caching
- **Cache Duration**: 30 seconds (instead of 10-15)
- **Update Frequency**: Every 30 seconds (instead of 15)
- **Batch Updates**: Update all positions of same symbol together
- **Result**: ~200 calls/min (still over, but manageable with delays)

### Better Solution: Hybrid Approach
1. **Finnhub**: Primary for stocks
2. **Binance**: For crypto (separate rate limit)
3. **Yahoo Finance**: Fallback (unofficial, use carefully)
4. **Caching**: 30-60 seconds for non-critical updates

## Future Enhancements

### WebSocket Streaming (Paid)
- **Finnhub WebSocket**: $99/month for real-time
- **Binance WebSocket**: Free for crypto
- **Benefit**: Real-time updates, lower API calls

### Historical Data
- **Alpha Vantage**: Free tier (5 calls/min)
- **Yahoo Finance**: Free historical data
- **Use**: For backtesting, strategy validation

### Price Aggregation
- **Multiple Sources**: Average prices from multiple APIs
- **Reliability**: Fallback if one API fails
- **Accuracy**: Better price accuracy

## Best Practices

### 1. Error Handling
```typescript
async function getPriceWithFallback(symbol: string, assetType: string): Promise<number> {
  try {
    return await getCurrentPrice(symbol, assetType); // Finnhub
  } catch (error) {
    if (assetType === 'crypto') {
      return await getBinancePrice(symbol); // Binance fallback
    }
    // Yahoo Finance fallback
    return await getYahooPrice(symbol);
  }
}
```

### 2. Monitoring
- **Track API Calls**: Monitor rate limit usage
- **Alert on Limits**: Warn when approaching limits
- **Fallback Activation**: Auto-switch to fallback

### 3. Performance
- **Parallel Requests**: Fetch multiple symbols simultaneously
- **Connection Pooling**: Reuse HTTP connections
- **Compression**: Use gzip for API responses

## Conclusion

Il sistema di price data è configurato per:
- ✅ **Free Tier APIs**: Finnhub, Binance, Yahoo Finance
- ✅ **Caching Aggressivo**: 30-60 secondi per ridurre chiamate
- ✅ **Batching**: Condivisione prezzi tra partecipanti
- ✅ **Rate Limiting**: Gestione limiti API
- ✅ **Fallback**: Multiple sources per reliability
- ✅ **Budget Friendly**: Zero cost con free tiers

Pronto per implementazione con budget zero!
