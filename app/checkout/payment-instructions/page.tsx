import { Suspense } from 'react';
import { PaymentInstructions } from '@/components/checkout/PaymentInstructions';
import { Loading } from '@/components/ui';

export async function generateMetadata() {
  return {
    title: 'Istruzioni Pagamento · Tradelia',
    description: 'Completa il pagamento seguendo le istruzioni.',
  };
}

export default function PaymentInstructionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <PaymentInstructions />
    </Suspense>
  );
}

