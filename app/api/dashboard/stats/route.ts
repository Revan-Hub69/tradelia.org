import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDashboardStats } from '@/lib/supabase/server-services';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Permetti accesso guest - restituisci statistiche vuote invece di 401
    if (authError || !user) {
      return NextResponse.json({
        totalReports: 0,
        pendingRequests: 0,
        recentActivity: null,
      });
    }

    const stats = await getDashboardStats(user.id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in stats API:', error);
    // In caso di errore, restituisci statistiche vuote invece di 500
    return NextResponse.json({
      totalReports: 0,
      pendingRequests: 0,
      recentActivity: null,
    });
  }
}

