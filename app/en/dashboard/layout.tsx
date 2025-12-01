import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { logError } from '@/lib/monitoring/error-logger';

export default async function DashboardEnLayout({ children }: { children: ReactNode }) {
  try {
    const supabase = await createClient();
    let session = null;
    
    try {
      const { data } = await supabase.auth.getSession();
      session = data?.session || null;
    } catch (sessionError) {
      logError('Error getting session in EN dashboard layout', sessionError as Error, {
        component: 'DashboardEnLayout',
        path: '/en/dashboard',
        session: false,
      });
    }

    // NON fare redirect al login - permettere accesso guest
    // Il componente dashboard gestirà cosa mostrare in base alla sessione
    // IMPORTANTE: Rimuoviamo il redirect per evitare loop infiniti

    return <>{children}</>;
  } catch (error) {
    logError('Error in EN dashboard layout', error as Error, {
      component: 'DashboardEnLayout',
      path: '/en/dashboard',
      session: false,
    });
    // Non reindirizzare, permettere comunque l'accesso
    return <>{children}</>;
  }
}
