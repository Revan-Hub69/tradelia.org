import { Metadata } from 'next';
import { WidgetsContent } from '@/components/widgets/WidgetsContent';

export const metadata: Metadata = {
  title: 'Widgets | Tradelia',
  description: 'Installable widgets for phone and desktop - Portfolio, Watchlist, Alerts',
};

export default function WidgetsPage() {
  return <WidgetsContent />;
}
