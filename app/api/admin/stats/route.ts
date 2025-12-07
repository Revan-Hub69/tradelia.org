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

    // Conta reports
    const { count: totalReports } = await supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .catch(() => ({ count: 0 }));

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

    // Conta corsi completati
    const { count: completedCourses } = await supabaseAdmin
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('completed', true)
      .catch(() => ({ count: 0 }));

    return NextResponse.json({
      users: {
        total: totalUsers || 0,
        byRole: usersByRole,
      },
      reports: totalReports || 0,
      watchlist: totalWatchlist || 0,
      notifications: totalNotifications || 0,
      completedCourses: completedCourses || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
