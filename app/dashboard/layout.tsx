import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard · Tradelia',
  description: 'Dashboard principale Tradelia: accedi a report, corsi, analisi e tutte le funzionalità della piattaforma.',
  openGraph: {
    title: 'Dashboard Tradelia',
    description: 'Dashboard principale con accesso a tutte le funzionalità',
    type: 'website',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
