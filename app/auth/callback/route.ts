import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

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
      return redirect(redirectUrl.toString());
    }
  }

  // In caso di errore, reindirizza al login con messaggio
  const loginUrl = new URL('/login', requestUrl.origin);
  loginUrl.searchParams.set('error', 'email_verification_failed');
  return redirect(loginUrl.toString());
}

