import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchDashboardContent } from '@/lib/supabase/server-services';
import { getLocaleFromRequest, getApiMessages } from '@/lib/i18n/api-messages';
import { localizeContentArray } from '@/lib/i18n/dynamic-content';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Detect locale from request
    const locale = getLocaleFromRequest(request);
    const messages = getApiMessages(locale);

    if (authError || !user) {
      return NextResponse.json({ error: messages.errors.unauthorized }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ data: { reports: [], courses: [], modules: [] } });
    }

    const results = await searchDashboardContent(user.id, query.trim());

    // Localize dynamic content if multilingual fields exist
    const localizedResults = {
      reports: localizeContentArray(results.reports || [], locale),
      courses: localizeContentArray(results.courses || [], locale),
      modules: localizeContentArray(results.modules || [], locale),
    };

    return NextResponse.json({ data: localizedResults });
  } catch (error) {
    console.error('Error in search API:', error);
    const locale = getLocaleFromRequest(request);
    const messages = getApiMessages(locale);
    return NextResponse.json(
      { error: messages.errors.serverError },
      { status: 500 }
    );
  }
}

