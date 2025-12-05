import { Metadata } from 'next';
import { WidgetsContent } from '@/components/widgets/WidgetsContent';

export const metadata: Metadata = {
  title: 'Widget | Tradelia',
  description: 'Widget installabili per telefono e desktop - Portfolio, Watchlist, Alert',
};

export default function WidgetsPage() {
  return <WidgetsContent />;
}

