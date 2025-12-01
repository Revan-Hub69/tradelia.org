import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/trading-journal/export?format=csv|pdf
 * Esporta trading journal in CSV o PDF
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const symbol = searchParams.get('symbol');
    const isClosed = searchParams.get('isClosed');

    // Recupera trade
    let query = supabase
      .from('trading_journal')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false });

    if (symbol) {
      query = query.eq('symbol', symbol.toUpperCase());
    }

    if (isClosed !== null) {
      query = query.eq('is_closed', isClosed === 'true');
    }

    const { data: trades, error } = await query;

    if (error) {
      console.error('Error fetching trades:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (format === 'csv') {
      // Genera CSV
      const headers = [
        'Symbol',
        'Type',
        'Entry Date',
        'Exit Date',
        'Entry Price',
        'Exit Price',
        'Quantity',
        'P&L',
        'P&L %',
        'Fees',
        'Strategy',
        'Setup',
        'Timeframe',
        'Holding Days',
        'Entry Reason',
        'Exit Reason',
        'Notes',
      ];

      const rows = (trades || []).map((t) => [
        t.symbol,
        t.trade_type,
        new Date(t.entry_date).toLocaleDateString('it-IT'),
        t.exit_date ? new Date(t.exit_date).toLocaleDateString('it-IT') : '',
        t.entry_price.toFixed(2),
        t.exit_price ? t.exit_price.toFixed(2) : '',
        t.quantity.toString(),
        t.profit_loss ? t.profit_loss.toFixed(2) : '',
        t.profit_loss_percent ? t.profit_loss_percent.toFixed(2) : '',
        t.total_fees ? t.total_fees.toFixed(2) : '0.00',
        t.strategy || '',
        t.setup_type || '',
        t.timeframe || '',
        t.holding_period_days ? t.holding_period_days.toString() : '',
        t.entry_reason || '',
        t.exit_reason || '',
        (t.notes || '').replace(/"/g, '""'), // Escape quotes per CSV
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="trading-journal-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'pdf') {
      // Calcola statistiche
      const closedTrades = (trades || []).filter((t) => t.is_closed && t.profit_loss !== null);
      const totalTrades = closedTrades.length;
      const winningTrades = closedTrades.filter((t) => (t.profit_loss || 0) > 0).length;
      const losingTrades = closedTrades.filter((t) => (t.profit_loss || 0) < 0).length;
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
      const totalProfit = closedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
      const avgProfit = winningTrades > 0
        ? closedTrades.filter((t) => (t.profit_loss || 0) > 0).reduce((sum, t) => sum + (t.profit_loss || 0), 0) / winningTrades
        : 0;
      const avgLoss = losingTrades > 0
        ? closedTrades.filter((t) => (t.profit_loss || 0) < 0).reduce((sum, t) => sum + (t.profit_loss || 0), 0) / losingTrades
        : 0;

      return NextResponse.json({
        trades: trades || [],
        statistics: {
          totalTrades,
          winningTrades,
          losingTrades,
          winRate,
          totalProfit,
          avgProfit,
          avgLoss,
        },
        exportDate: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Formato non supportato' }, { status: 400 });
  } catch (error) {
    console.error('Error in GET /api/trading-journal/export:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

