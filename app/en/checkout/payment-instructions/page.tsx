import { Suspense } from 'react';
import { PaymentInstructions } from '@/components/checkout/PaymentInstructions';
import { Loading } from '@/components/ui';

export async function generateMetadata() {
  return {
    title: 'Payment Instructions · Tradelia',
    description: 'Complete your payment by following the instructions.',
  };
}

export default function PaymentInstructionsPageEN() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <PaymentInstructions />
    </Suspense>
  );
}
