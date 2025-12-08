import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/metrics
 * Application metrics endpoint (protetto, solo admin)
 * 
 * Headers:
 * - Authorization: Bearer <admin-token>
 * 
 * Response:
 * {
 *   "users": { "total": 100, "active": 50 },
 *   "reports": { "total": 200, "published": 150 },
 *   "courses": { "total": 10, "enrollments": 500 }
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

    // Raccogli metrics
    const [usersCount, activeUsers, newUsers, reportsCount, publishedReports, reportsViews] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('last_seen_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()), // Ultimi 30 giorni
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()), // Nuovi ultimi 30 giorni
      supabase.from('reports').select('id', { count: 'exact', head: true }),
      supabase
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('reports')
        .select('views', { count: 'exact', head: false })
        .then(({ data }) => ({ count: data?.reduce((sum, r) => sum + (r.views || 0), 0) || 0 })),
    ]);

    // Calculate revenue metrics (if payments table exists)
    let revenue: { mrr: number; arr: number; churn: number } | undefined;
    try {
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, created_at, status')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (payments && payments.length > 0) {
        const monthlyRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const mrr = monthlyRevenue;
        const arr = mrr * 12;

        // Calculate churn (simplified - would need subscription data)
        const churn = 0; // TODO: Calculate from subscription cancellations

        revenue = { mrr, arr, churn };
      }
    } catch (error) {
      // Payments table might not exist
      console.warn('Payments table not available:', error);
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      users: {
        total: usersCount.count || 0,
        active: activeUsers.count || 0,
        new: newUsers.count || 0,
      },
      reports: {
        total: reportsCount.count || 0,
        published: publishedReports.count || 0,
        views: reportsViews.count || 0,
      },
      revenue,
    });
  } catch (error) {
    console.error('Error in GET /api/metrics:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

