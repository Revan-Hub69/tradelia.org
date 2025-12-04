import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Paper Trading Orders API
 * 
 * Best Practice: Order Management System per paper trading
 */

/**
 * GET /api/paper-trading/orders
 * Get all orders (pending, filled, cancelled)
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('paper_trading_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(orders || []);
  } catch (error) {
    console.error('Error in GET /api/paper-trading/orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/paper-trading/orders
 * Create new order
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
      orderType,
      side,
      quantity,
      limitPrice,
      stopPrice,
      trailingStopPercent,
    } = body;

    // Validation
    if (!symbol || !assetType || !orderType || !side || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['market', 'limit', 'stop', 'trailing_stop'].includes(orderType)) {
      return NextResponse.json({ error: 'Invalid order type' }, { status: 400 });
    }

    if (!['buy', 'sell'].includes(side)) {
      return NextResponse.json({ error: 'Invalid side' }, { status: 400 });
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    // Validate order-specific fields
    if (orderType === 'limit' && (!limitPrice || isNaN(parseFloat(limitPrice)))) {
      return NextResponse.json({ error: 'Limit price required for limit orders' }, { status: 400 });
    }

    if (orderType === 'stop' && (!stopPrice || isNaN(parseFloat(stopPrice)))) {
      return NextResponse.json({ error: 'Stop price required for stop orders' }, { status: 400 });
    }

    if (orderType === 'trailing_stop' && (!trailingStopPercent || isNaN(parseFloat(trailingStopPercent)))) {
      return NextResponse.json({ error: 'Trailing stop percent required' }, { status: 400 });
    }

    const { data: order, error } = await supabase
      .from('paper_trading_orders')
      .insert({
        user_id: user.id,
        symbol: symbol.toUpperCase().trim(),
        asset_type: assetType,
        order_type: orderType,
        side,
        quantity: qty,
        limit_price: limitPrice ? parseFloat(limitPrice) : null,
        stop_price: stopPrice ? parseFloat(stopPrice) : null,
        trailing_stop_percent: trailingStopPercent ? parseFloat(trailingStopPercent) : null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/paper-trading/orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
