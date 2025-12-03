import { Suspense } from 'react';
import { PaymentInstructions } from '@/components/checkout/PaymentInstructions';
import { Loading } from '@/components/ui';
import { getDictionary } from '@/lib/i18n/dictionaries';

export async function generateMetadata() {
  const dict = await getDictionary('en');
  return {
    title: dict.checkout.instructions?.title || 'Payment Instructions · Tradelia',
    description: dict.checkout.instructions?.subtitle || 'Complete your payment by following the instructions.',
  };
}

export default function PaymentInstructionsPageEN() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <PaymentInstructions />
    </Suspense>
  );
}
