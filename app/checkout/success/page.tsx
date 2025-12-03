import { Suspense } from 'react';
import { CheckoutSuccess } from '@/components/checkout/CheckoutSuccess';
import { Loading } from '@/components/ui';
import { getDictionary } from '@/lib/i18n/dictionaries';

export async function generateMetadata() {
  const dict = await getDictionary('it');
  return {
    title: dict.checkout.success.title || 'Pagamento Completato · Tradelia',
    description: dict.checkout.success.description || 'Il tuo pagamento è stato completato con successo.',
  };
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <CheckoutSuccess />
    </Suspense>
  );
}

