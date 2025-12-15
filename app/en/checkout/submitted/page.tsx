import { Suspense } from 'react';
import { CheckoutSubmitted } from '@/components/checkout/CheckoutSubmitted';
import { Loading } from '@/components/ui';

export async function generateMetadata() {
  return {
    title: 'Request Sent · Tradelia',
    description: 'Your request has been sent successfully.',
  };
}

export default function CheckoutSubmittedPageEN() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <CheckoutSubmitted />
    </Suspense>
  );
}
