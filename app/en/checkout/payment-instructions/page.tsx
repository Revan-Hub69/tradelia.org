import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaymentInstructions } from '@/components/checkout/PaymentInstructions';

export const metadata: Metadata = {
  title: 'Payment Instructions · Tradelia',
  description: 'Complete your payment by following the instructions.',
};

export default function PaymentInstructionsPageEN() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentInstructions />
    </Suspense>
  );
}
