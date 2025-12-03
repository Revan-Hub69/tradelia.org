import { Suspense } from 'react';
import { CheckoutSuccess } from '@/components/checkout/CheckoutSuccess';
import { Loading } from '@/components/ui';
import { getDictionary } from '@/lib/i18n/dictionaries';

export async function generateMetadata() {
  const dict = await getDictionary('en');
  return {
    title: dict.checkout.success.title || 'Payment Completed · Tradelia',
    description: dict.checkout.success.description || 'Your payment has been completed successfully.',
  };
}

export default function CheckoutSuccessPageEN() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <CheckoutSuccess />
    </Suspense>
  );
}
