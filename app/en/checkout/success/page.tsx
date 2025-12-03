import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutSuccess } from '@/components/checkout/CheckoutSuccess';

export const metadata: Metadata = {
  title: 'Payment Completed · Tradelia',
  description: 'Your payment has been completed successfully.',
};

export default function CheckoutSuccessPageEN() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutSuccess />
    </Suspense>
  );
}
