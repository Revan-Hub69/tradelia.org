import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/expenses/export?month=2024-01&format=csv
 * Esporta spese in CSV
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
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
    const format = searchParams.get('format') || 'csv';

    const startDate = `${month}-01T00:00:00Z`;
    const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0).toISOString();

    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!expenses || expenses.length === 0) {
      return NextResponse.json({ error: 'No expenses found' }, { status: 404 });
    }

    if (format === 'csv') {
      const csvRows = [
        ['Data', 'Categoria', 'Descrizione', 'Importo'].join(','),
        ...expenses.map((e) =>
          [
            e.date,
            e.category,
            `"${(e.description || '').replace(/"/g, '""')}"`,
            e.amount.toFixed(2),
          ].join(',')
        ),
      ];

      const csv = csvRows.join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="spese_${month}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Error in GET /api/expenses/export:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

