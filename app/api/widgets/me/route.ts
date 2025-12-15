import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit';
import { headers } from 'next/headers';

/**
 * Get User's Widgets with IDs
 * 
 * GET: Lista widget installati con ID per integrazione notifiche
 * 
 * Best Practice 2025:
 * - Rate limiting
 * - RLS enforced
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const rateLimitKey = getRateLimitKey(`${ip}:${user.id}`, 'widgets');
    const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.widgets);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', resetAt: rateLimit.resetAt },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(RATE_LIMITS.widgets.maxRequests),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.resetAt),
            'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    // Get user's installed widgets
    const { data: widgets, error } = await supabase
      .from('user_widgets')
      .select('id, widget_type, position, is_enabled, config')
      .eq('user_id', user.id)
      .eq('is_enabled', true)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching widgets:', error);
      return NextResponse.json({ error: 'Failed to fetch widgets' }, { status: 500 });
    }

    return NextResponse.json(
      { widgets: widgets || [] },
      {
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMITS.widgets.maxRequests),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetAt),
        },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/widgets/me:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
