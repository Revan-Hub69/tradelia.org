import { Metadata } from 'next';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';

export const metadata: Metadata = {
  title: 'Watchlist | Tradelia',
  description: 'Monitora i tuoi asset preferiti con alert personalizzati',
};

export default function WatchlistPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardTabs />
      <div className="p-6 max-w-7xl mx-auto">
        <ComingSoon
          title="Watchlist"
          description="Monitora i tuoi asset preferiti con alert personalizzati"
          reason="Questa funzionalità richiede integrazione con API real-time per prezzi di mercato. Stiamo lavorando per integrare provider gratuiti e affidabili."
          estimatedDate="Q2 2025"
        />
      </div>
    </div>
  );
}

