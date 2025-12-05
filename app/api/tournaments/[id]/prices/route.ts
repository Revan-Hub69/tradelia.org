import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentPrice } from '@/lib/price-apis';

/**
 * Tournament Prices API
 * Update prices for all positions in tournament (server-side, shared across participants)
 * Best Practice: Batch updates, caching, rate limiting
 */

// Simple in-memory cache for prices
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds cache

/**
 * POST /api/tournaments/[id]/prices
 * Update prices for all positions in tournament
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get tournament
    const { data: tournament } = await supabase
      .from('paper_trading_tournaments')
      .select('status')
      .eq('id', params.id)
      .single();

    if (!tournament || tournament.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Tournament not in progress' },
        { status: 400 }
      );
    }

    // Get all unique symbols in tournament
    const { data: positions } = await supabase
      .from('paper_trading_tournament_positions')
      .select('symbol, asset_type')
      .eq('tournament_id', params.id);

    if (!positions || positions.length === 0) {
      return NextResponse.json({ updated: 0 });
    }

    // Get unique symbols
    const uniqueSymbols = Array.from(
      new Map(
        positions.map(p => [`${p.symbol}-${p.asset_type}`, { symbol: p.symbol, assetType: p.asset_type }])
      ).values()
    );

    // Fetch prices (with caching and rate limiting)
    const priceUpdates: Record<string, number> = {};
    const now = Date.now();

    for (const { symbol, assetType } of uniqueSymbols) {
      const cacheKey = `${symbol}-${assetType}`;
      const cached = priceCache.get(cacheKey);

      // Use cache if valid
      if (cached && now - cached.timestamp < CACHE_TTL) {
        priceUpdates[cacheKey] = cached.price;
        continue;
      }

      try {
        // Fetch new price
        const priceResult = await getCurrentPrice(symbol, assetType as 'stock' | 'crypto' | 'forex');
        
        if (priceResult.price !== null && priceResult.price > 0) {
          priceUpdates[cacheKey] = priceResult.price;
          priceCache.set(cacheKey, { price: priceResult.price, timestamp: now });
        }

        // Rate limiting: small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error);
        // Use cached price if available, even if expired
        if (cached) {
          priceUpdates[cacheKey] = cached.price;
        }
      }
    }

    // Update all positions with new prices
    let updatedCount = 0;
    for (const position of positions) {
      const cacheKey = `${position.symbol}-${position.asset_type}`;
      const newPrice = priceUpdates[cacheKey];

      if (newPrice && newPrice > 0) {
        // Get position details
        const { data: pos } = await supabase
          .from('paper_trading_tournament_positions')
          .select('entry_price, quantity, side')
          .eq('tournament_id', params.id)
          .eq('symbol', position.symbol)
          .eq('asset_type', position.asset_type)
          .limit(1)
          .single();

        if (pos) {
          // Calculate unrealized P&L
          const unrealizedPnL = pos.side === 'long'
            ? (newPrice - parseFloat(pos.entry_price.toString())) * parseFloat(pos.quantity.toString())
            : (parseFloat(pos.entry_price.toString()) - newPrice) * parseFloat(pos.quantity.toString());
          const unrealizedPnLPercent = (unrealizedPnL / (parseFloat(pos.entry_price.toString()) * parseFloat(pos.quantity.toString()))) * 100;

          // Update position
          const { error: updateError } = await supabase
            .from('paper_trading_tournament_positions')
            .update({
              current_price: newPrice,
              unrealized_pnl: unrealizedPnL,
              unrealized_pnl_percent: unrealizedPnLPercent,
            })
            .eq('tournament_id', params.id)
            .eq('symbol', position.symbol)
            .eq('asset_type', position.asset_type);

          if (!updateError) {
            updatedCount++;
          }
        }
      }
    }

    // Update participant equity and stats
    const { data: participants } = await supabase
      .from('paper_trading_tournament_participants')
      .select('id')
      .eq('tournament_id', params.id)
      .eq('is_active', true);

    if (participants) {
      for (const participant of participants) {
        // Calculate total equity from positions
        const { data: participantPositions } = await supabase
          .from('paper_trading_tournament_positions')
          .select('unrealized_pnl, entry_price, quantity')
          .eq('tournament_id', params.id)
          .eq('participant_id', participant.id);

        if (participantPositions) {
          const totalUnrealizedPnL = participantPositions.reduce(
            (sum, p) => sum + parseFloat(p.unrealized_pnl?.toString() || '0'),
            0
          );

          // Get participant initial capital
          const { data: participantData } = await supabase
            .from('paper_trading_tournament_participants')
            .select('initial_capital, total_pnl')
            .eq('id', participant.id)
            .single();

          if (participantData) {
            const newEquity = parseFloat(participantData.initial_capital.toString()) + 
                            parseFloat(participantData.total_pnl.toString()) + 
                            totalUnrealizedPnL;
            const newReturnPercent = ((newEquity - parseFloat(participantData.initial_capital.toString())) / 
                                    parseFloat(participantData.initial_capital.toString())) * 100;

            await supabase
              .from('paper_trading_tournament_participants')
              .update({
                current_equity: newEquity,
                total_return_percent: newReturnPercent,
                last_update: new Date().toISOString(),
              })
              .eq('id', participant.id);
          }
        }
      }

      // Update rankings after equity updates
      await supabase.rpc('update_tournament_rankings', {
        p_tournament_id: params.id,
      });
    }

    return NextResponse.json({
      updated: updatedCount,
      symbolsUpdated: Object.keys(priceUpdates).length,
    });
  } catch (error) {
    console.error('Error in POST /api/tournaments/[id]/prices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
