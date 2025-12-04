import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Paper Trading Positions API
 * 
 * Best Practice: Academic standards per trading simulation
 * References: Prado (2018), Chan (2013)
 */

/**
 * GET /api/paper-trading/positions
 * Get all open positions for user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: positions, error } = await supabase
      .from('paper_trading_positions')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_time', { ascending: false });

    if (error) {
      console.error('Error fetching positions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(positions || []);
  } catch (error) {
    console.error('Error in GET /api/paper-trading/positions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/paper-trading/positions
 * Create new position
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      symbol,
      assetType,
      side,
      quantity,
      entryPrice,
      currentPrice,
      strategy,
      notes,
    } = body;

    // Validation
    if (!symbol || !assetType || !side || !quantity || !entryPrice || !currentPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['stock', 'crypto', 'forex', 'commodity'].includes(assetType)) {
      return NextResponse.json({ error: 'Invalid asset type' }, { status: 400 });
    }

    if (!['long', 'short'].includes(side)) {
      return NextResponse.json({ error: 'Invalid side' }, { status: 400 });
    }

    const qty = parseFloat(quantity);
    const entry = parseFloat(entryPrice);
    const current = parseFloat(currentPrice);

    if (isNaN(qty) || isNaN(entry) || isNaN(current) || qty <= 0 || entry <= 0 || current <= 0) {
      return NextResponse.json({ error: 'Invalid numeric values' }, { status: 400 });
    }

    // Calculate unrealized P&L
    const unrealizedPnL = side === 'long'
      ? (current - entry) * qty
      : (entry - current) * qty;
    const unrealizedPnLPercent = (unrealizedPnL / (entry * qty)) * 100;

    const { data: position, error } = await supabase
      .from('paper_trading_positions')
      .insert({
        user_id: user.id,
        symbol: symbol.toUpperCase().trim(),
        asset_type: assetType,
        side,
        quantity: qty,
        entry_price: entry,
        current_price: current,
        strategy: strategy || null,
        notes: notes || null,
        unrealized_pnl: unrealizedPnL,
        unrealized_pnl_percent: unrealizedPnLPercent,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating position:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(position, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/paper-trading/positions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
