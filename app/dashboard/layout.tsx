import type { Metadata } from 'next';
import { DashboardStructuredData } from './structured-data';

export const metadata: Metadata = {
  title: 'Dashboard · Tradelia',
  description: 'Dashboard principale Tradelia: accedi a report, corsi, analisi e tutte le funzionalità della piattaforma.',
  openGraph: {
    title: 'Dashboard Tradelia',
    description: 'Dashboard principale con accesso a tutte le funzionalità',
    type: 'website',
    url: 'https://tradelia.org/dashboard',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard Tradelia',
    description: 'Dashboard principale con accesso a tutte le funzionalità',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardStructuredData />
      {children}
    </>
  );
}
