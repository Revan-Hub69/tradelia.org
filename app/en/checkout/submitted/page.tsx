import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutSubmitted } from '@/components/checkout/CheckoutSubmitted';

export const metadata: Metadata = {
  title: 'Request Sent · Tradelia',
  description: 'Your request has been sent successfully.',
};

export default function CheckoutSubmittedPageEN() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutSubmitted />
    </Suspense>
  );
}
