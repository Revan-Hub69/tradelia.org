import { Metadata } from 'next';
import { WidgetsContent } from '@/components/widgets/WidgetsContent';

export const metadata: Metadata = {
  title: 'Widget | Tradelia',
  description: 'Widget e strumenti interattivi per la dashboard',
};

export default function WidgetsPage() {
  return <WidgetsContent />;
}

