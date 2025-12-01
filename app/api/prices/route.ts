import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/prices
 * Ottiene prezzi aggiornati per una lista di simboli
 * 
 * Query params:
 * - symbols: comma-separated list of symbols (e.g., "AAPL,TSLA,BTC-USD")
 * 
 * Response:
 * {
 *   "AAPL": { price: 150.25, change: 2.5, changePercent: 1.69 },
 *   "TSLA": { price: 250.50, change: -5.0, changePercent: -1.96 }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Permetti anche accesso non autenticato per prezzi pubblici
    // (ma con rate limiting più severo)

    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');

    if (!symbolsParam) {
      return NextResponse.json({ error: 'symbols parameter is required' }, { status: 400 });
    }

    const symbols = symbolsParam.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);

    if (symbols.length === 0) {
      return NextResponse.json({ error: 'At least one symbol is required' }, { status: 400 });
    }

    // Limite: max 50 simboli per richiesta
    if (symbols.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 symbols per request' }, { status: 400 });
    }

    // Ottieni prezzi da price-apis
    const { getCurrentPriceCached } = await import('@/lib/price-apis');

    const pricePromises = symbols.map(async (symbol) => {
      try {
        // Determina asset type (semplificato: se contiene "-" è crypto, altrimenti stock)
        const assetType = symbol.includes('-') ? 'crypto' : 'stock';

        const result = await getCurrentPriceCached(
          symbol,
          assetType as 'stock' | 'crypto' | 'forex' | 'commodity' | 'other'
        );

        if (result.price !== null) {
          // Calcola change e changePercent (semplificato, in produzione usare dati storici)
          return {
            symbol,
            price: result.price,
            change: 0, // TODO: Calcola da dati storici
            changePercent: 0, // TODO: Calcola da dati storici
            source: result.source,
          };
        }

        return {
          symbol,
          price: null,
          error: 'Price not available',
        };
      } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
        return {
          symbol,
          price: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const results = await Promise.all(pricePromises);

    // Formatta response come mappa
    const priceMap: Record<string, { price: number; change: number; changePercent: number } | { error: string }> = {};

    for (const result of results) {
      if (result.price !== null) {
        priceMap[result.symbol] = {
          price: result.price,
          change: result.change || 0,
          changePercent: result.changePercent || 0,
        };
      } else {
        priceMap[result.symbol] = {
          error: result.error || 'Price not available',
        };
      }
    }

    return NextResponse.json(priceMap);
  } catch (error) {
    console.error('Error in GET /api/prices:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

