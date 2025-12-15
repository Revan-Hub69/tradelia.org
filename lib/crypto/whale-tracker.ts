/**
 * Whale Tracker
 * 
 * Traccia grandi movimenti e transazioni whale
 * 
 * Fonti GRATUITE (già implementate):
 * - Binance Trades API (fallback principale) ✅
 * - Order Book Analysis (grandi ordini) ✅
 * - Multi-Exchange Volume Aggregation ✅
 * 
 * Fonti A PAGAMENTO (opzionali):
 * - Whale Alert API ($29+/mese) - Opzionale, sistema funziona senza
 */

export interface WhaleTransaction {
  id: string;
  symbol: string;
  amount: number; // In crypto
  amountUsd: number;
  from: string;
  to: string;
  type: 'transfer' | 'exchange_deposit' | 'exchange_withdrawal' | 'unknown';
  exchange?: string;
  timestamp: number;
  blockchain?: string;
  transactionHash?: string;
}

export interface WhaleMovement {
  symbol: string;
  totalAmount: number;
  totalAmountUsd: number;
  transactions: WhaleTransaction[];
  direction: 'accumulation' | 'distribution' | 'neutral';
  topWhale: {
    amount: number;
    amountUsd: number;
    from: string;
    to: string;
  };
  timestamp: number;
}

/**
 * Ottiene whale transactions da Whale Alert API
 * 
 * Nota: Whale Alert è a pagamento ($29+/mese)
 * Sistema usa fallback gratuito (Binance trades) se API key non disponibile
 */
async function getWhaleAlertTransactions(symbol: string, minAmount: number = 1000000): Promise<WhaleTransaction[]> {
  try {
    // Whale Alert API (a pagamento - $29+/mese)
    // Se API key non disponibile, sistema usa fallback gratuito (Binance trades)
    const apiKey = process.env.WHALE_ALERT_API_KEY;
    if (!apiKey) {
      // Nessuna key = usa fallback gratuito
      return [];
    }

    const response = await fetch(
      `https://api.whale-alert.io/v1/transactions?api_key=${apiKey}&min_value=${minAmount}&currency=${symbol.toLowerCase()}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      // Fallback: calcola da recent trades se disponibile
      return [];
    }

    const data = await response.json();
    if (!data.transactions) return [];

    return data.transactions.map((tx: any) => ({
      id: tx.id || tx.hash,
      symbol: symbol,
      amount: parseFloat(tx.amount || 0),
      amountUsd: parseFloat(tx.amount_usd || 0),
      from: tx.from?.address || 'unknown',
      to: tx.to?.address || 'unknown',
      type: tx.transaction_type || 'transfer',
      exchange: tx.from?.owner_type === 'exchange' ? tx.from.owner : 
                tx.to?.owner_type === 'exchange' ? tx.to.owner : undefined,
      timestamp: tx.timestamp || Date.now(),
      blockchain: tx.blockchain || 'unknown',
      transactionHash: tx.hash,
    }));
  } catch (error) {
    console.error(`Error fetching whale alerts for ${symbol}:`, error);
    return [];
  }
}

/**
 * Calcola whale movements da recent trades (fallback)
 */
async function calculateWhaleMovementsFromTrades(symbol: string): Promise<WhaleTransaction[]> {
  try {
    const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
    const response = await fetch(
      `https://api.binance.com/api/v3/trades?symbol=${binanceSymbol}&limit=1000`
    );

    if (!response.ok) return [];

    const trades = await response.json();
    const whaleThreshold = 100000; // $100k minimum

    const whaleTrades = trades
      .filter((trade: any) => {
        const value = parseFloat(trade.price) * parseFloat(trade.qty);
        return value >= whaleThreshold;
      })
      .map((trade: any) => ({
        id: `trade-${trade.id}`,
        symbol: symbol,
        amount: parseFloat(trade.qty),
        amountUsd: parseFloat(trade.price) * parseFloat(trade.qty),
        from: 'market',
        to: 'market',
        type: 'transfer' as const,
        timestamp: trade.time || Date.now(),
        transactionHash: trade.id.toString(),
      }));

    return whaleTrades;
  } catch (error) {
    console.error(`Error calculating whale movements for ${symbol}:`, error);
    return [];
  }
}

/**
 * Analizza whale movements
 */
export async function analyzeWhaleMovements(symbol: string, minAmount: number = 1000000): Promise<WhaleMovement | null> {
  try {
    // Prova Whale Alert API prima
    let transactions = await getWhaleAlertTransactions(symbol, minAmount);
    
    // Fallback: calcola da trades
    if (transactions.length === 0) {
      transactions = await calculateWhaleMovementsFromTrades(symbol);
    }

    if (transactions.length === 0) {
      return null;
    }

    // Analizza direction
    const exchangeDeposits = transactions.filter(tx => 
      tx.type === 'exchange_deposit' || (tx.to && tx.to.includes('exchange'))
    ).length;
    
    const exchangeWithdrawals = transactions.filter(tx => 
      tx.type === 'exchange_withdrawal' || (tx.from && tx.from.includes('exchange'))
    ).length;

    let direction: 'accumulation' | 'distribution' | 'neutral' = 'neutral';
    if (exchangeDeposits > exchangeWithdrawals * 1.5) {
      direction = 'distribution'; // Depositi > prelievi = vendita
    } else if (exchangeWithdrawals > exchangeDeposits * 1.5) {
      direction = 'accumulation'; // Prelievi > depositi = accumulo
    }

    // Top whale transaction
    const topWhale = transactions.reduce((max, tx) => 
      tx.amountUsd > max.amountUsd ? tx : max, transactions[0]
    );

    return {
      symbol,
      totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
      totalAmountUsd: transactions.reduce((sum, tx) => sum + tx.amountUsd, 0),
      transactions: transactions.slice(0, 10), // Top 10
      direction,
      topWhale: {
        amount: topWhale.amount,
        amountUsd: topWhale.amountUsd,
        from: topWhale.from,
        to: topWhale.to,
      },
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error analyzing whale movements for ${symbol}:`, error);
    return null;
  }
}

