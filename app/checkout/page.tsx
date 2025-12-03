import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutContent } from '@/components/checkout/CheckoutContent';
import { Loading } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Checkout · Tradelia',
  description: 'Completa il tuo acquisto e scegli il metodo di pagamento.',
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

