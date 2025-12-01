import { NextResponse } from 'next/server';
import { logError } from '@/lib/monitoring/error-logger';

/**
 * API endpoint per loggare errori dal client
 * Non richiede autenticazione per permettere logging anche in caso di errori di auth
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log l'errore
    logError(
      body.message || 'Client error',
      body.error ? new Error(body.error.message || body.error) : undefined,
      {
        path: body.context?.path || body.path,
        component: body.context?.component,
        userId: body.context?.userId,
        userEmail: body.context?.userEmail,
        session: body.context?.session,
        metadata: body.context?.metadata || body.metadata,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    // Non loggare errori nel logger stesso
    console.error('Error in error logger API:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

