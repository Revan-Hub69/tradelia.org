import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLogger } from '@/lib/logging/logger';

/**
 * GET /api/debug/logs
 * Get stored logs (development only, admin only)
 * 
 * Query params:
 * - level: 'debug' | 'info' | 'warn' | 'error'
 * - limit: number
 */
export async function GET(request: NextRequest) {
  // Only in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

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
    const level = searchParams.get('level') as 'debug' | 'info' | 'warn' | 'error' | null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const logger = getLogger();
    const logs = logger.getLogs(level || undefined, limit);

    return NextResponse.json({
      logs,
      count: logs.length,
      level: level || 'all',
    });
  } catch (error) {
    console.error('Error in GET /api/debug/logs:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/debug/logs
 * Clear stored logs (development only, admin only)
 */
export async function DELETE(request: NextRequest) {
  // Only in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

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

    const logger = getLogger();
    logger.clearLogs();

    return NextResponse.json({ success: true, message: 'Logs cleared' });
  } catch (error) {
    console.error('Error in DELETE /api/debug/logs:', error);
    return NextResponse.json(
      { error: 'Errore interno', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

