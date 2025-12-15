import { Suspense } from 'react';
import { CheckoutSuccess } from '@/components/checkout/CheckoutSuccess';
import { Loading } from '@/components/ui';

export async function generateMetadata() {
  return {
    title: 'Pagamento Completato · Tradelia',
    description: 'Il tuo pagamento è stato completato con successo.',
  };
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <CheckoutSuccess />
    </Suspense>
  );
}

