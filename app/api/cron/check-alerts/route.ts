import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/cron/check-alerts
 * Endpoint per cron job che controlla alert attivi
 * 
 * Questo endpoint dovrebbe essere chiamato periodicamente (es. ogni 5 minuti)
 * da un servizio esterno (Vercel Cron, Supabase Edge Function, etc.)
 * 
 * Headers richiesti:
 * - Authorization: Bearer <CRON_SECRET>
 * 
 * Environment variables:
 * - CRON_SECRET: Secret per autenticare chiamate cron
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica secret (protezione base contro chiamate non autorizzate)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Chiama endpoint check-alerts
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/watchlist/check-alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error in check-alerts:', errorData);
      return NextResponse.json(
        { error: 'Failed to check alerts', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...data,
    });
  } catch (error) {
    console.error('Error in POST /api/cron/check-alerts:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

