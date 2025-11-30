import type { Metadata } from 'next';
import { CheckoutSuccess } from '@/components/checkout/CheckoutSuccess';

export const metadata: Metadata = {
  title: 'Pagamento Completato · Tradelia',
  description: 'Il tuo pagamento è stato completato con successo.',
};

export default function CheckoutSuccessPage() {
  return <CheckoutSuccess />;
}

