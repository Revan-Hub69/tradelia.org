import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ServiceWorkerProvider } from '@/components/notifications/ServiceWorkerProvider';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { ProUtilities } from '@/components/dashboard/ProUtilities';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Permetti accesso anche senza sessione (guest access)
    // Il componente dashboard gestirà cosa mostrare in base alla sessione
    // Non blocchiamo l'accesso, ma permettiamo guest

    return (
      <>
        <ServiceWorkerProvider />
        <InstallPrompt />
        <ProUtilities />
        {children}
      </>
    );
  } catch (error) {
    // Se c'è un errore (es. variabili d'ambiente mancanti), logga ma non blocca
    console.error('Error in dashboard layout:', error);
    // Non reindirizziamo, permettiamo comunque l'accesso
    return (
      <>
        <ServiceWorkerProvider />
        <InstallPrompt />
        <ProUtilities />
        {children}
      </>
    );
  }
}
