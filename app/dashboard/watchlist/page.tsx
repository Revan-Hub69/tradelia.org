import { Metadata } from 'next';
import { WatchlistContent } from '@/components/watchlist/WatchlistContent';

export const metadata: Metadata = {
  title: 'Watchlist | Tradelia',
  description: 'Monitora i tuoi asset preferiti con alert personalizzati',
};

export default function WatchlistPage() {
  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <WatchlistContent />
    </div>
  );
}

