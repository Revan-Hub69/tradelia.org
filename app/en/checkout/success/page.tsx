import { Suspense } from 'react';
import { CheckoutSuccess } from '@/components/checkout/CheckoutSuccess';
import { Loading } from '@/components/ui';

export async function generateMetadata() {
  return {
    title: 'Payment Completed · Tradelia',
    description: 'Your payment has been completed successfully.',
  };
}

export default function CheckoutSuccessPageEN() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <CheckoutSuccess />
    </Suspense>
  );
}
