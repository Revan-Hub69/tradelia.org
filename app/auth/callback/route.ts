import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { logError, logRedirect } from '@/lib/monitoring/error-logger';

/**
 * Callback route per conferma email Supabase
 * Gestisce il token di conferma email e reindirizza l'utente
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (token_hash && type) {
    const supabase = await createClient();

    // Verifica il token di conferma email
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (!error) {
      // Conferma riuscita - reindirizza alla dashboard
      const redirectUrl = new URL(next, requestUrl.origin);
      const shouldRedirect = logRedirect('/auth/callback', redirectUrl.toString(), 'Email verification success');
      if (shouldRedirect) {
        return redirect(redirectUrl.toString());
      }
      // Se c'è un loop, vai comunque alla dashboard senza redirect
      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  // In caso di errore, NON reindirizzare automaticamente al login
  // Invece, vai alla dashboard e mostra il messaggio di errore
  logError('Email verification failed in callback', undefined, {
    component: 'AuthCallback',
    path: '/auth/callback',
    metadata: { error: 'email_verification_failed' },
  });
  
  // Vai alla dashboard invece del login per evitare loop
  const dashboardUrl = new URL('/dashboard', requestUrl.origin);
  dashboardUrl.searchParams.set('error', 'email_verification_failed');
  const shouldRedirect = logRedirect('/auth/callback', dashboardUrl.toString(), 'Email verification failed - going to dashboard');
  if (shouldRedirect) {
    return redirect(dashboardUrl.toString());
  }
  return NextResponse.redirect(dashboardUrl.toString());
}

