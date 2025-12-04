import type { Metadata } from 'next';
import { BillingSummary } from '@/components/billing/BillingSummary';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';

export const metadata: Metadata = {
  title: 'Billing & Crediti · Tradelia',
  description: 'Consulta il tuo saldo crediti, i pagamenti e le fatture emesse dalla dashboard Tradelia.',
};

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardTabs />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.45em] text-text-tertiary">Financial Operations</p>
        <h1 className="text-4xl font-semibold text-text-primary">Billing & Crediti</h1>
        <p className="text-text-secondary max-w-3xl">
          Monitora i movimenti economici del tuo account, dal saldo crediti alle fatture generate, con i dati sincronizzati in tempo reale da Supabase.
        </p>
      </div>
        <BillingSummary />
      </div>
    </div>
  );
}
