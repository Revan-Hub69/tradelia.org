/**
 * On-Chain Data API Integration
 * 
 * Exchange Reserves, Whale Movements
 * 
 * Fonti:
 * - Glassnode (a pagamento, ma ha free tier limitato)
 * - CryptoQuant (a pagamento)
 * - Whale Alert (gratuito con limiti)
 * - Blockchain explorers (gratuito ma richiede parsing)
 * 
 * Per ora implementiamo con API gratuite disponibili.
 */

export interface ExchangeReserve {
  symbol: string;
  exchange: string;
  reserve: number; // Quantità in exchange
  reserveUSD: number; // Valore in USD
  change24h: number; // Variazione 24h
  changePercent24h: number;
  timestamp: number;
}

export interface WhaleMovement {
  symbol: string;
  amount: number;
  amountUSD: number;
  from: string; // Exchange o wallet
  to: string; // Exchange o wallet
  type: 'exchange_inflow' | 'exchange_outflow' | 'whale_transfer';
  timestamp: number;
  transactionHash?: string;
}

/**
 * Ottiene exchange reserves da Whale Alert (stima)
 * Nota: Whale Alert non ha API diretta per reserves, ma possiamo stimare da movimenti
 */
export async function getExchangeReserves(symbol: string): Promise<ExchangeReserve[] | null> {
  try {
    // Whale Alert API (gratuita con limiti)
    // Docs: https://docs.whale-alert.io/
    const apiKey = process.env.WHALE_ALERT_API_KEY;
    
    if (!apiKey) {
      console.warn('WHALE_ALERT_API_KEY non configurata');
      return null;
    }

    // Whale Alert non ha endpoint diretto per reserves
    // Possiamo usare gli ultimi movimenti per stimare
    // Per ora ritorniamo null e implementiamo una versione semplificata
    
    // TODO: Integrare con Glassnode o CryptoQuant se disponibili
    // Oppure usare blockchain explorers direttamente
    
    return null;
  } catch (error) {
    console.error(`Error fetching exchange reserves for ${symbol}:`, error);
    return null;
  }
}

/**
 * Ottiene whale movements da Whale Alert
 */
export async function getWhaleMovements(
  symbol: string,
  minValue: number = 1000000 // Min $1M
): Promise<WhaleMovement[] | null> {
  try {
    const apiKey = process.env.WHALE_ALERT_API_KEY;
    
    if (!apiKey) {
      console.warn('WHALE_ALERT_API_KEY non configurata');
      return null;
    }

    // Whale Alert API
    const response = await fetch(
      `https://api.whale-alert.io/v1/transactions?api_key=${apiKey}&min_value=${minValue}&currency=${symbol.toLowerCase()}&limit=10`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 }, // Cache 1 minuto
      }
    );

    if (!response.ok) {
      console.error(`Whale Alert API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.result !== 'success' || !data.transactions) {
      return null;
    }

    return data.transactions.map((tx: any) => {
      const isExchangeInflow = tx.to?.owner_type === 'exchange';
      const isExchangeOutflow = tx.from?.owner_type === 'exchange';
      
      let type: 'exchange_inflow' | 'exchange_outflow' | 'whale_transfer';
      if (isExchangeInflow) {
        type = 'exchange_inflow';
      } else if (isExchangeOutflow) {
        type = 'exchange_outflow';
      } else {
        type = 'whale_transfer';
      }

      return {
        symbol: tx.blockchain,
        amount: parseFloat(tx.amount),
        amountUSD: parseFloat(tx.amount_usd),
        from: tx.from?.address || 'Unknown',
        to: tx.to?.address || 'Unknown',
        type,
        timestamp: tx.timestamp * 1000, // Converti a ms
        transactionHash: tx.hash,
      };
    });
  } catch (error) {
    console.error(`Error fetching whale movements for ${symbol}:`, error);
    return null;
  }
}

/**
 * Calcola trend exchange reserves (semplificato)
 * Basato su movimenti whale degli ultimi 24h
 */
export async function getExchangeReservesTrend(
  symbol: string
): Promise<{
  netFlow24h: number; // USD
  netFlowPercent: number;
  inflow24h: number;
  outflow24h: number;
} | null> {
  try {
    const movements = await getWhaleMovements(symbol, 1000000);
    
    if (!movements || movements.length === 0) {
      return null;
    }

    // Filtra ultime 24h
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const recentMovements = movements.filter(m => m.timestamp >= dayAgo);

    let inflow24h = 0;
    let outflow24h = 0;

    for (const movement of recentMovements) {
      if (movement.type === 'exchange_inflow') {
        inflow24h += movement.amountUSD;
      } else if (movement.type === 'exchange_outflow') {
        outflow24h += movement.amountUSD;
      }
    }

    const netFlow24h = inflow24h - outflow24h;
    const totalFlow = inflow24h + outflow24h;
    const netFlowPercent = totalFlow > 0 ? (netFlow24h / totalFlow) * 100 : 0;

    return {
      netFlow24h,
      netFlowPercent,
      inflow24h,
      outflow24h,
    };
  } catch (error) {
    console.error(`Error calculating exchange reserves trend for ${symbol}:`, error);
    return null;
  }
}

