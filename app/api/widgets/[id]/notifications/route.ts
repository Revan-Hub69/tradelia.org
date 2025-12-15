import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit';
import { headers } from 'next/headers';

/**
 * Widget Notifications API
 * 
 * GET: Lista notifiche per un widget specifico
 * POST: Crea nuova notifica (solo sistema interno)
 * 
 * Best Practice 2025:
 * - Rate limiting
 * - RLS enforced
 * - Auto-cleanup expired
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get widget to verify ownership
    const { data: widget } = await supabase
      .from('user_widgets')
      .select('widget_type')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!widget) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
    }

    // Get notifications for this widget
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('widget_notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('widget_type', widget.widget_type)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    // Exclude expired notifications
    query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching widget notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('widget_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('widget_type', widget.widget_type)
      .eq('is_read', false)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    return NextResponse.json(
      {
        notifications: notifications || [],
        unreadCount: unreadCount || 0,
      },
      {
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMITS.widgets.maxRequests),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetAt),
        },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/widgets/[id]/notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: Create notification (internal use only)
 * Used by background jobs/cron to create notifications
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify widget ownership
    const { data: widget } = await supabase
      .from('user_widgets')
      .select('widget_type')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!widget) {
      return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
    }

    const body = await request.json();
    const { notification_type, title, message, data, priority, expires_at } = body;

    // Check user preferences
    const { data: preference } = await supabase
      .from('widget_notification_preferences')
      .select('enabled, channels')
      .eq('user_id', user.id)
      .eq('widget_type', widget.widget_type)
      .eq('notification_type', notification_type)
      .maybeSingle();

    // If preference exists and disabled, don't create notification
    if (preference && !preference.enabled) {
      return NextResponse.json({ message: 'Notification disabled by user preference' }, { status: 200 });
    }

    // Create notification
    const { data: notification, error } = await supabase
      .from('widget_notifications')
      .insert({
        user_id: user.id,
        widget_type: widget.widget_type,
        notification_type,
        title,
        message,
        data: data || {},
        priority: priority || 'normal',
        expires_at: expires_at || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating widget notification:', error);
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }

    // TODO: Send push notification if enabled in preferences
    // TODO: Send email if enabled in preferences

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error in POST /api/widgets/[id]/notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
