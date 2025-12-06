import { Suspense } from 'react';
import { CheckoutSubmitted } from '@/components/checkout/CheckoutSubmitted';
import { Loading } from '@/components/ui';

export async function generateMetadata() {
  return {
    title: 'Richiesta Inviata · Tradelia',
    description: 'La tua richiesta è stata inviata con successo.',
  };
}

export default function CheckoutSubmittedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <CheckoutSubmitted />
    </Suspense>
  );
}
