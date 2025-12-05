import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Widgets API
 * 
 * GET: Lista widget installati dall'utente
 * POST: Installa nuovo widget
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

    return NextResponse.json({ widgets: widgets || [] });
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
