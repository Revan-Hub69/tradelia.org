import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/metrics/time-series
 * Time series data per business metrics
 * 
 * Query params:
 * - range: '7d' | '30d' | '90d' | '1y'
 * 
 * Response:
 * {
 *   "users": [{ "date": "2025-01-27", "count": 100 }],
 *   "revenue": [{ "date": "2025-01-27", "amount": 1000 }],
 *   "engagement": [{ "date": "2025-01-27", "value": 50 }]
 * }
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

    // Verifica admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calcola date range
    const now = new Date();
    const ranges: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };
    const days = ranges[range] || 30;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Fetch user growth
    const { data: usersData } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Group by date
    const usersByDate = new Map<string, number>();
    if (usersData) {
      for (const user of usersData) {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        usersByDate.set(date, (usersByDate.get(date) || 0) + 1);
      }
    }

    // Cumulative count
    let cumulative = 0;
    const users = Array.from(usersByDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => {
        cumulative += count;
        return { date, count: cumulative };
      });

    // Fetch engagement (daily active users)
    const { data: activitiesData } = await supabase
      .from('user_activities')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    const engagementByDate = new Map<string, number>();
    if (activitiesData) {
      for (const activity of activitiesData) {
        const date = new Date(activity.created_at).toISOString().split('T')[0];
        engagementByDate.set(date, (engagementByDate.get(date) || 0) + 1);
      }
    }

    const engagement = Array.from(engagementByDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ date, value }));

    // Revenue (if payments table exists)
    let revenue: Array<{ date: string; amount: number }> = [];
    try {
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount, created_at, status')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (paymentsData) {
        const revenueByDate = new Map<string, number>();
        for (const payment of paymentsData) {
          const date = new Date(payment.created_at).toISOString().split('T')[0];
          revenueByDate.set(date, (revenueByDate.get(date) || 0) + (payment.amount || 0));
        }

        revenue = Array.from(revenueByDate.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, amount]) => ({ date, amount }));
      }
    } catch (error) {
      // Payments table might not exist
      console.warn('Payments table not available:', error);
    }

    return NextResponse.json({
      users,
      revenue: revenue.length > 0 ? revenue : undefined,
      engagement,
    });
  } catch (error) {
    console.error('Error in GET /api/metrics/time-series:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

