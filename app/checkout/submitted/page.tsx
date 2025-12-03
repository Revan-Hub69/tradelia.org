import { Suspense } from 'react';
import { CheckoutSubmitted } from '@/components/checkout/CheckoutSubmitted';
import { Loading } from '@/components/ui';
import { getDictionary } from '@/lib/i18n/dictionaries';

export async function generateMetadata() {
  const dict = await getDictionary('it');
  return {
    title: dict.checkout.submitted?.title || 'Richiesta Inviata · Tradelia',
    description: dict.checkout.submitted?.description || 'La tua richiesta è stata inviata con successo.',
  };
}

export default function CheckoutSubmittedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <CheckoutSubmitted />
    </Suspense>
  );
}
