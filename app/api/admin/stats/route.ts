/**
 * Admin API - Statistics
 * Statistiche generali del sistema
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isAdmin } from '@/lib/middleware/admin-auth';

export async function GET() {
  // Verifica autenticazione admin
  const adminCheck = await isAdmin();
  if (!adminCheck.isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    // Conta utenti totali
    const { count: totalUsers } = await supabaseAdmin
      .from('user_roles')
      .select('*', { count: 'exact', head: true });

    // Conta utenti per ruolo
    const { data: rolesData } = await supabaseAdmin
      .from('user_roles')
      .select('role');

    const usersByRole = rolesData?.reduce((acc: Record<string, number>, r: { role: string }) => {
      acc[r.role] = (acc[r.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Conta reports (include anche richieste di analisi che diventano pubbliche per Pro)
    const { count: totalReports } = await supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .catch(() => ({ count: 0 }));

    // Conta richieste di analisi (diventano pubbliche per Pro, quindi vanno nei totali)
    const { count: totalAnalysisRequests } = await supabaseAdmin
      .from('analysis_requests')
      .select('*', { count: 'exact', head: true })
      .catch(() => ({ count: 0 }));

    // Report totali = reports + analysis_requests (entrambi pubblici per Pro)
    const totalPublicReports = (totalReports || 0) + (totalAnalysisRequests || 0);

    // Conta watchlist
    const { count: totalWatchlist } = await supabaseAdmin
      .from('watchlist')
      .select('*', { count: 'exact', head: true })
      .catch(() => ({ count: 0 }));

    // Conta notifiche
    const { count: totalNotifications } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .catch(() => ({ count: 0 }));


    return NextResponse.json({
      users: {
        total: totalUsers || 0,
        byRole: usersByRole,
      },
      reports: totalPublicReports, // Report pubblici + richieste analisi (entrambi pubblici per Pro)
      reportsGenerated: totalReports || 0, // Solo report generati direttamente
      analysisRequests: totalAnalysisRequests || 0, // Richieste analisi (diventano pubbliche)
      watchlist: totalWatchlist || 0,
      notifications: totalNotifications || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
