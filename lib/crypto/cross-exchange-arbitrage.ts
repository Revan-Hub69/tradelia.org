/**
 * Cross-Exchange Arbitrage
 * 
 * Calcola differenze di prezzo tra exchange per opportunità arbitraggio
 */

export interface ExchangePrice {
  exchange: string;
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  spread: number;
  spreadPercent: number;
  volume24h: number;
  timestamp: number;
}

export interface ArbitrageOpportunity {
  symbol: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  profit: number;
  profitPercent: number;
  volume24h: number;
  confidence: 'high' | 'medium' | 'low';
  timestamp: number;
}

/**
 * Ottiene prezzo da Binance
 */
async function getBinancePrice(symbol: string): Promise<ExchangePrice | null> {
  try {
    const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
    
    const [ticker, orderBook] = await Promise.all([
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`),
      fetch(`https://api.binance.com/api/v3/depth?symbol=${binanceSymbol}&limit=5`),
    ]);

    if (!ticker.ok) return null;

    const tickerData = await ticker.json();
    const orderBookData = orderBook.ok ? await orderBook.json() : null;

    const price = parseFloat(tickerData.lastPrice || 0);
    const bid = orderBookData?.bids?.[0] ? parseFloat(orderBookData.bids[0][0]) : price;
    const ask = orderBookData?.asks?.[0] ? parseFloat(orderBookData.asks[0][0]) : price;
    const spread = ask - bid;
    const spreadPercent = price > 0 ? (spread / price) * 100 : 0;

    return {
      exchange: 'Binance',
      symbol,
      price,
      bid,
      ask,
      spread,
      spreadPercent,
      volume24h: parseFloat(tickerData.quoteVolume || 0),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching Binance price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene prezzo da OKX
 */
async function getOKXPrice(symbol: string): Promise<ExchangePrice | null> {
  try {
    const okxSymbol = symbol.includes('-') ? symbol : `${symbol}-USDT`;
    
    const [ticker, orderBook] = await Promise.all([
      fetch(`https://www.okx.com/api/v5/market/ticker?instId=${okxSymbol}`),
      fetch(`https://www.okx.com/api/v5/market/books?instId=${okxSymbol}&sz=5`),
    ]);

    if (!ticker.ok) return null;

    const tickerData = await ticker.json();
    const orderBookData = orderBook.ok ? await orderBook.json() : null;

    if (tickerData.code !== '0' || !tickerData.data || tickerData.data.length === 0) {
      return null;
    }

    const data = tickerData.data[0];
    const price = parseFloat(data.last || 0);
    const bid = parseFloat(data.bidPx || price);
    const ask = parseFloat(data.askPx || price);
    const spread = ask - bid;
    const spreadPercent = price > 0 ? (spread / price) * 100 : 0;

    return {
      exchange: 'OKX',
      symbol,
      price,
      bid,
      ask,
      spread,
      spreadPercent,
      volume24h: parseFloat(data.vol24h || 0) * price,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching OKX price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene prezzo da Bybit
 */
async function getBybitPrice(symbol: string): Promise<ExchangePrice | null> {
  try {
    const bybitSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
    
    const [ticker, orderBook] = await Promise.all([
      fetch(`https://api.bybit.com/v5/market/tickers?category=spot&symbol=${bybitSymbol}`),
      fetch(`https://api.bybit.com/v5/market/orderbook?category=spot&symbol=${bybitSymbol}&limit=5`),
    ]);

    if (!ticker.ok) return null;

    const tickerData = await ticker.json();
    const orderBookData = orderBook.ok ? await orderBook.json() : null;

    if (tickerData.retCode !== 0 || !tickerData.result?.list || tickerData.result.list.length === 0) {
      return null;
    }

    const data = tickerData.result.list[0];
    const price = parseFloat(data.lastPrice || 0);
    const bid = orderBookData?.result?.b?.[0] ? parseFloat(orderBookData.result.b[0][0]) : price;
    const ask = orderBookData?.result?.a?.[0] ? parseFloat(orderBookData.result.a[0][0]) : price;
    const spread = ask - bid;
    const spreadPercent = price > 0 ? (spread / price) * 100 : 0;

    return {
      exchange: 'Bybit',
      symbol,
      price,
      bid,
      ask,
      spread,
      spreadPercent,
      volume24h: parseFloat(data.turnover24h || 0),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching Bybit price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Trova opportunità arbitraggio
 */
export async function findArbitrageOpportunities(symbol: string): Promise<ArbitrageOpportunity[]> {
  try {
    const [binance, okx, bybit] = await Promise.allSettled([
      getBinancePrice(symbol),
      getOKXPrice(symbol),
      getBybitPrice(symbol),
    ]);

    const prices: ExchangePrice[] = [];
    if (binance.status === 'fulfilled' && binance.value) prices.push(binance.value);
    if (okx.status === 'fulfilled' && okx.value) prices.push(okx.value);
    if (bybit.status === 'fulfilled' && bybit.value) prices.push(bybit.value);

    if (prices.length < 2) return [];

    const opportunities: ArbitrageOpportunity[] = [];

    // Trova tutte le combinazioni buy/sell
    for (let i = 0; i < prices.length; i++) {
      for (let j = 0; j < prices.length; j++) {
        if (i === j) continue;

        const buyExchange = prices[i];
        const sellExchange = prices[j];

        // Compra al prezzo ask più basso, vendi al prezzo bid più alto
        const buyPrice = buyExchange.ask;
        const sellPrice = sellExchange.bid;

        if (sellPrice > buyPrice) {
          const profit = sellPrice - buyPrice;
          const profitPercent = (profit / buyPrice) * 100;
          const minVolume = Math.min(buyExchange.volume24h, sellExchange.volume24h);

          // Confidence basata su spread e volume
          let confidence: 'high' | 'medium' | 'low' = 'low';
          if (profitPercent > 0.5 && minVolume > 1000000) {
            confidence = 'high';
          } else if (profitPercent > 0.2 && minVolume > 500000) {
            confidence = 'medium';
          }

          opportunities.push({
            symbol,
            buyExchange: buyExchange.exchange,
            sellExchange: sellExchange.exchange,
            buyPrice,
            sellPrice,
            profit,
            profitPercent,
            volume24h: minVolume,
            confidence,
            timestamp: Date.now(),
          });
        }
      }
    }

    // Ordina per profit percent (decrescente)
    return opportunities.sort((a, b) => b.profitPercent - a.profitPercent);
  } catch (error) {
    console.error(`Error finding arbitrage opportunities for ${symbol}:`, error);
    return [];
  }
}

