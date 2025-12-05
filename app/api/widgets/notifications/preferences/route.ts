import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit';
import { headers } from 'next/headers';

/**
 * Widget Notification Preferences API
 * 
 * GET: Get user preferences for widget notifications
 * POST: Create/update preferences
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

    const { searchParams } = new URL(request.url);
    const widgetType = searchParams.get('widget_type');

    let query = supabase
      .from('widget_notification_preferences')
      .select('*')
      .eq('user_id', user.id);

    if (widgetType) {
      query = query.eq('widget_type', widgetType);
    }

    const { data: preferences, error } = await query.order('widget_type', { ascending: true });

    if (error) {
      console.error('Error fetching notification preferences:', error);
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
    }

    return NextResponse.json(
      { preferences: preferences || [] },
      {
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMITS.widgets.maxRequests),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetAt),
        },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/widgets/notifications/preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { widget_type, notification_type, enabled, channels, threshold_config } = body;

    // Validate
    if (!widget_type || !notification_type) {
      return NextResponse.json({ error: 'widget_type and notification_type are required' }, { status: 400 });
    }

    // Upsert preference
    const { data: preference, error } = await supabase
      .from('widget_notification_preferences')
      .upsert({
        user_id: user.id,
        widget_type,
        notification_type,
        enabled: enabled !== undefined ? enabled : true,
        channels: channels || ['in-app'],
        threshold_config: threshold_config || {},
      }, {
        onConflict: 'user_id,widget_type,notification_type',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving notification preference:', error);
      return NextResponse.json({ error: 'Failed to save preference' }, { status: 500 });
    }

    return NextResponse.json({ preference });
  } catch (error) {
    console.error('Error in POST /api/widgets/notifications/preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
