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
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Permetti accesso anche senza sessione (guest access)
    // Il componente dashboard gestirà cosa mostrare in base alla sessione
    // Non blocchiamo l'accesso, ma permettiamo guest

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
