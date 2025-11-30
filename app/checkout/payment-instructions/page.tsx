import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaymentInstructions } from '@/components/checkout/PaymentInstructions';

export const metadata: Metadata = {
  title: 'Istruzioni Pagamento · Tradelia',
  description: 'Completa il pagamento seguendo le istruzioni.',
};

export default function PaymentInstructionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Caricamento...</div>}>
      <PaymentInstructions />
    </Suspense>
  );
}

