import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Paper Trading Order API (Single)
 * Update or cancel order
 */

/**
 * PATCH /api/paper-trading/orders/[id]
 * Update order (e.g., mark as filled, cancelled)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, executionPrice, executionTime } = body;

    if (!status || !['pending', 'filled', 'cancelled', 'expired'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: any = { status };

    if (status === 'filled') {
      if (!executionPrice || isNaN(parseFloat(executionPrice)) || parseFloat(executionPrice) <= 0) {
        return NextResponse.json({ error: 'Execution price required for filled orders' }, { status: 400 });
      }
      updateData.execution_price = parseFloat(executionPrice);
      updateData.execution_time = executionTime || new Date().toISOString();
    }

    const { data: updated, error } = await supabase
      .from('paper_trading_orders')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error in PATCH /api/paper-trading/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/paper-trading/orders/[id]
 * Cancel order
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('paper_trading_orders')
      .update({ status: 'cancelled' })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .eq('status', 'pending'); // Only cancel pending orders

    if (error) {
      console.error('Error cancelling order:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/paper-trading/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
