import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit';
import { headers } from 'next/headers';

/**
 * Widgets API
 * 
 * GET: Lista widget installati dall'utente
 * POST: Installa nuovo widget
 * 
 * Best Practice 2025:
 * - Rate limiting (100 req/min)
 * - Authentication required
 * - RLS enforced
 */

interface WidgetConfig {
  widget_type: string;
  position?: number;
  config?: Record<string, any>;
}

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
      .select('*')
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
    console.error('Error in GET /api/widgets:', error);
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

    // Check if user is Pro
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    const isPro = roleData?.role === 'pro' || roleData?.role === 'desk';
    if (!isPro) {
      return NextResponse.json({ error: 'Pro access required' }, { status: 403 });
    }

    const body: WidgetConfig = await request.json();
    const { widget_type, position, config } = body;

    // Validate widget type
    const validWidgetTypes = ['crypto-whale', 'crypto-depth', 'crypto-movers', 'futures', 'options', 'forex'];
    if (!validWidgetTypes.includes(widget_type)) {
      return NextResponse.json({ error: 'Invalid widget type' }, { status: 400 });
    }

    // Get current max position
    const { data: existingWidgets } = await supabase
      .from('user_widgets')
      .select('position')
      .eq('user_id', user.id)
      .order('position', { ascending: false })
      .limit(1);

    const newPosition = position !== undefined ? position : (existingWidgets?.[0]?.position ?? -1) + 1;

    // Insert widget
    const { data: widget, error } = await supabase
      .from('user_widgets')
      .insert({
        user_id: user.id,
        widget_type,
        position: newPosition,
        config: config || {},
        is_enabled: true,
      })
      .select()
      .single();

    if (error) {
      // If duplicate, update instead
      if (error.code === '23505') {
        const { data: updatedWidget } = await supabase
          .from('user_widgets')
          .update({
            position: newPosition,
            config: config || {},
            is_enabled: true,
          })
          .eq('user_id', user.id)
          .eq('widget_type', widget_type)
          .select()
          .single();

        return NextResponse.json({ widget: updatedWidget });
      }

      console.error('Error installing widget:', error);
      return NextResponse.json({ error: 'Failed to install widget' }, { status: 500 });
    }

    return NextResponse.json({ widget });
  } catch (error) {
    console.error('Error in POST /api/widgets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
