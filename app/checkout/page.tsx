import type { Metadata } from 'next';
import { CheckoutContent } from '@/components/checkout/CheckoutContent';

export const metadata: Metadata = {
  title: 'Checkout · Tradelia',
  description: 'Completa il tuo acquisto e scegli il metodo di pagamento.',
};

export default function CheckoutPage() {
  return <CheckoutContent />;
}

