import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutSuccess } from '@/components/checkout/CheckoutSuccess';

export const metadata: Metadata = {
  title: 'Pagamento Completato · Tradelia',
  description: 'Il tuo pagamento è stato completato con successo.',
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Caricamento...</div>}>
      <CheckoutSuccess />
    </Suspense>
  );
}

