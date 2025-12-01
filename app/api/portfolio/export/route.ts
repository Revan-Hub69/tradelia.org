import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/portfolio/export?format=csv|pdf
 * Esporta portfolio in CSV o PDF
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

    // Recupera posizioni portfolio
    const { data: positions, error } = await supabase
      .from('portfolio_positions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching portfolio:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (format === 'csv') {
      // Genera CSV
      const headers = ['Symbol', 'Quantity', 'Entry Price', 'Current Price', 'Total Value', 'Current Value', 'P&L', 'P&L %', 'Notes'];
      const rows = (positions || []).map((p) => [
        p.symbol,
        p.quantity.toString(),
        p.price.toFixed(2),
        (p.current_price || p.price).toFixed(2),
        p.total_value.toFixed(2),
        (p.current_value || p.total_value).toFixed(2),
        (p.change_amount || 0).toFixed(2),
        (p.change_percent || 0).toFixed(2),
        p.notes || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="portfolio-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'pdf') {
      // TODO: Implementare PDF export usando il sistema PDF esistente
      // Per ora ritorna JSON con dati per generazione PDF lato client
      const totalValue = (positions || []).reduce((sum, p) => sum + (p.current_value || p.total_value), 0);
      const totalChange = (positions || []).reduce((sum, p) => sum + (p.change_amount || 0), 0);
      const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

      return NextResponse.json({
        positions: positions || [],
        summary: {
          totalValue,
          totalChange,
          totalChangePercent,
          positionCount: (positions || []).length,
        },
        exportDate: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Formato non supportato' }, { status: 400 });
  } catch (error) {
    console.error('Error in GET /api/portfolio/export:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

