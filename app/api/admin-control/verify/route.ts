import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runVerification } from '@/lib/supabase/verification';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const { isAdmin } = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin-control/whoami`, {
    headers: { Authorization: request.headers.get('authorization') || '' },
  }).then((res) => res.json());

  if (!isAdmin) {
    return NextResponse.json({ error: 'Permesso negato' }, { status: 403 });
  }

  const payload = await request.json().catch(() => ({}));
  const target = payload.target ?? 'all';

  try {
    const results = await runVerification(target);
    return NextResponse.json({ ok: true, results });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
