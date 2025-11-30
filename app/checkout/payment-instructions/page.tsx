import type { Metadata } from 'next';
import { PaymentInstructions } from '@/components/checkout/PaymentInstructions';

export const metadata: Metadata = {
  title: 'Istruzioni Pagamento · Tradelia',
  description: 'Completa il pagamento seguendo le istruzioni.',
};

export default function PaymentInstructionsPage() {
  return <PaymentInstructions />;
}

