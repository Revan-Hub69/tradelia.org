import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/watchlist/alerts/export?format=csv
 * Esporta alert in CSV
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

    // Recupera alert
    const { data: alerts, error } = await supabase
      .from('watchlist_alerts')
      .select('*, watchlist(asset_symbol, asset_name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching alerts:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (format === 'csv') {
      // Genera CSV
      const headers = [
        'Asset Symbol',
        'Asset Name',
        'Alert Type',
        'Target Value',
        'Comparison Operator',
        'Active',
        'Triggered',
        'Triggered At',
        'Push Notification',
        'Email Notification',
        'SMS Notification',
        'Notes',
        'Created At',
      ];

      const rows = (alerts || []).map((a) => [
        a.watchlist?.asset_symbol || '',
        a.watchlist?.asset_name || '',
        a.alert_type,
        a.target_value.toString(),
        a.comparison_operator || '',
        a.is_active ? 'Yes' : 'No',
        a.is_triggered ? 'Yes' : 'No',
        a.triggered_at ? new Date(a.triggered_at).toLocaleString('it-IT') : '',
        a.notify_via_push ? 'Yes' : 'No',
        a.notify_via_email ? 'Yes' : 'No',
        a.notify_via_sms ? 'Yes' : 'No',
        (a.notes || '').replace(/"/g, '""'),
        new Date(a.created_at).toLocaleString('it-IT'),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="alerts-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Formato non supportato' }, { status: 400 });
  } catch (error) {
    console.error('Error in GET /api/watchlist/alerts/export:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

