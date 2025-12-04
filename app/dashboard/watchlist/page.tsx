import { Metadata } from 'next';
import { WatchlistContent } from '@/components/watchlist/WatchlistContent';
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
        <WatchlistContent />
      </div>
    </div>
  );
}

