import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ServiceWorkerProvider } from '@/components/notifications/ServiceWorkerProvider';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      redirect('/login');
    }

    return (
      <>
        <ServiceWorkerProvider />
        <InstallPrompt />
        {children}
      </>
    );
  } catch (error) {
    // Se c'è un errore (es. variabili d'ambiente mancanti), reindirizza al login
    console.error('Error in dashboard layout:', error);
    redirect('/login');
  }
}
