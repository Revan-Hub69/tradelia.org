import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Tournament Templates API
 * Get predefined tournament templates for admin quick setup
 */

/**
 * GET /api/tournaments/templates
 * Get all active tournament templates
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');

    let query = supabase
      .from('paper_trading_tournament_templates')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (format) {
      query = query.eq('format', format);
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(templates || []);
  } catch (error) {
    console.error('Error in GET /api/tournaments/templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
