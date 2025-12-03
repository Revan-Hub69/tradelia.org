import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutSubmitted } from '@/components/checkout/CheckoutSubmitted';

export const metadata: Metadata = {
  title: 'Richiesta Inviata · Tradelia',
  description: 'La tua richiesta è stata inviata con successo.',
};

export default function CheckoutSubmittedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Caricamento...</div>}>
      <CheckoutSubmitted />
    </Suspense>
  );
}
