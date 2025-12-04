import { Metadata } from 'next';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';

export const metadata: Metadata = {
  title: 'Widget | Tradelia',
  description: 'Widget e strumenti interattivi per la dashboard',
};

export default function WidgetsPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardTabs />
      <div className="p-6 max-w-7xl mx-auto">
        <ComingSoon
          title="Widgets"
          description="Widget personalizzabili per watchlist, portfolio e alert"
          reason="Questa funzionalità richiede integrazione con API real-time per prezzi di mercato. Stiamo lavorando per integrare provider gratuiti e affidabili."
          estimatedDate="Q2 2025"
        />
      </div>
    </div>
  );
}

