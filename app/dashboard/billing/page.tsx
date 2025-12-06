import { redirect } from 'next/navigation';

/**
 * Billing page redirect - billing è ora integrato nelle impostazioni
 * Reindirizza automaticamente a /dashboard/settings con tab billing attivo
 */
export default function BillingPage() {
  // Reindirizza alle impostazioni con tab billing
  redirect('/dashboard/settings?tab=billing');
}
