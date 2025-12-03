import { Suspense } from 'react';
import { PaymentInstructions } from '@/components/checkout/PaymentInstructions';
import { Loading } from '@/components/ui';
import { getDictionary } from '@/lib/i18n/dictionaries';

export async function generateMetadata() {
  const dict = await getDictionary('it');
  return {
    title: dict.checkout.instructions?.title || 'Istruzioni Pagamento · Tradelia',
    description: dict.checkout.instructions?.subtitle || 'Completa il pagamento seguendo le istruzioni.',
  };
}

export default function PaymentInstructionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <PaymentInstructions />
    </Suspense>
  );
}

