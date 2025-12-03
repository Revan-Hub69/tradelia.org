import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutContent } from '@/components/checkout/CheckoutContent';

export const metadata: Metadata = {
  title: 'Checkout · Tradelia',
  description: 'Complete your purchase and choose your payment method.',
};

export default function CheckoutPageEN() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
