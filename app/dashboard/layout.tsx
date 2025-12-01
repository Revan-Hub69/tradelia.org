import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ServiceWorkerProvider } from '@/components/notifications/ServiceWorkerProvider';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DailyLoginCheck } from '@/components/gamification/DailyLoginCheck';
import { ModalProviders } from '@/components/dashboard/ModalProviders';
import dynamic from 'next/dynamic';

// Lazy load non-critical components
const ProUtilities = dynamic(() => import('@/components/dashboard/ProUtilities').then(mod => ({ default: mod.ProUtilities })), {
  ssr: false,
  loading: () => null, // Non mostra loading per floating button
});

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  try {
    const supabase = await createClient();
    
    // Prova a ottenere la sessione, ma non bloccare se fallisce
    let session = null;
    try {
      const { data } = await supabase.auth.getSession();
      session = data?.session || null;
    } catch (sessionError) {
      // Non bloccare se c'è un errore nella sessione
      console.error('Error getting session in dashboard layout:', sessionError);
    }

    // Permetti accesso anche senza sessione (guest access)
    // Il componente dashboard gestirà cosa mostrare in base alla sessione
    // Non blocchiamo l'accesso, ma permettiamo guest
    // NON fare redirect al login, anche se non c'è sessione

    return (
      <>
        <DashboardHeader />
        <ServiceWorkerProvider />
        <InstallPrompt />
        <ProUtilities />
        <ModalProviders />
        {children}
      </>
    );
  } catch (error) {
    // Se c'è un errore (es. variabili d'ambiente mancanti), logga ma non blocca
    console.error('Error in dashboard layout:', error);
    // Non reindirizziamo, permettiamo comunque l'accesso
    // NON fare redirect al login anche in caso di errore
    return (
      <>
        <DashboardHeader />
        <ServiceWorkerProvider />
        <InstallPrompt />
        <ProUtilities />
        <ModalProviders />
        {children}
      </>
    );
  }
}
