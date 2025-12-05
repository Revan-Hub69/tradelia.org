import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit';
import { headers } from 'next/headers';

/**
 * Mark Widget Notification as Read
 * 
 * PATCH: Mark notification as read
 * 
 * Best Practice 2025:
 * - Rate limiting
 * - RLS enforced
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: { notificationId: string } }
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

    // Mark as read
    const { data: notification, error } = await supabase
      .from('widget_notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', params.notificationId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error marking notification as read:', error);
      return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
    }

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ notification });
  } catch (error) {
    console.error('Error in PATCH /api/widgets/notifications/[notificationId]/read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
