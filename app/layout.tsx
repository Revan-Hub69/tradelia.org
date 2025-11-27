import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardFooter } from '@/components/dashboard/DashboardFooter';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tradelia AI · Dashboard',
  description: 'Dashboard professionale per analisi finanziarie istituzionali, report conformi MiFID II e tutorial educativi.',
};

export const viewport = {
  themeColor: '#050910',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" data-theme="dark">
      <body className={inter.className}>
        <div className="dashboard-container">
          <DashboardHeader />
          <main id="main-content">{children}</main>
          <DashboardFooter />
        </div>
      </body>
    </html>
  );
}
