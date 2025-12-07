import { redirect } from 'next/navigation';

// Billing è stato spostato in Settings > Fatturazione
export default function BillingPage() {
  redirect('/dashboard/settings');
}
