'use client';

import useSWR from 'swr';
import { Invoice, Payment } from './types';
import { formatCurrency } from '@/lib/utils/format';
import { useState } from 'react';

async function fetcher(url: string) {
  const response = await fetch(url, {
    credentials: 'include', // CRITICAL: Include cookies for authentication
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }
  
  return response.json();
}

export function BillingSummary() {
  const [view, setView] = useState<'payments' | 'invoices'>('payments');

  const { data: paymentsData, isLoading: paymentsLoading, error: paymentsError } = useSWR<{ data: Payment[] }>(
    view === 'payments' ? '/api/billing/payments' : null,
    fetcher
  );

  const { data: invoicesData, isLoading: invoicesLoading, error: invoicesError } = useSWR<{ data: Invoice[] }>(
    view === 'invoices' ? '/api/billing/invoices' : null,
    fetcher
  );

  const isLoading = paymentsLoading || invoicesLoading;
  const hasError = paymentsError || invoicesError;

  return (
    <section className="bg-bg-surface/80 border border-border-subtle/80 rounded-3xl p-6 shadow-lg shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-text-tertiary">Fatturazione</p>
          <h3 className="text-2xl font-semibold text-text-primary mt-2">Storico transazioni</h3>
          <p className="text-sm text-text-secondary max-w-2xl mt-1">
            Monitora i pagamenti e le fatture emesse. Tutti i dati sono sincronizzati con lo schema Supabase (`payments`, `invoices`) e rispettano le policy RLS per la consultazione sicura.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['payments', 'invoices'] as const).map((option) => (
            <button
              key={option}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                view === option ? 'bg-accent text-white' : 'bg-bg-soft text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => setView(option)}
            >
              {option === 'payments' ? 'Pagamenti' : 'Fatture'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {isLoading && (
          <div className="py-12 text-center text-text-tertiary">
            Caricamento in corso...
          </div>
        )}

        {hasError && (
          <div className="py-10 text-center">
            <div className="inline-block p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 font-semibold mb-2">Errore durante il caricamento</p>
              <p className="text-sm text-text-secondary">
                {paymentsError?.message || invoicesError?.message || 'Errore sconosciuto'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
              >
                Ricarica pagina
              </button>
            </div>
          </div>
        )}

        {!isLoading && !hasError && (
          <div className="space-y-4">
            {view === 'payments' && paymentsData?.data?.length === 0 && (
              <p className="text-sm text-text-secondary">Nessun pagamento registrato.</p>
            )}
            {view === 'payments' &&
              paymentsData?.data?.map((payment) => (
                <div key={payment.id} className="border border-border-subtle rounded-2xl p-4 flex justify-between items-center bg-bg-base/70">
                  <div>
                    <p className="text-text-primary font-semibold">
                      {formatCurrency(payment.amount, payment.currency)} · {payment.provider}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {new Date(payment.created_at).toLocaleString()} · {payment.status}
                    </p>
                  </div>
                  <span className="text-sm text-text-secondary">
                    {payment.metadata?.reference || 'Rif. automatico'}
                  </span>
                </div>
              ))}

            {view === 'invoices' && invoicesData?.data?.length === 0 && (
              <p className="text-sm text-text-secondary">Nessuna fattura disponibile.</p>
            )}
            {view === 'invoices' &&
              invoicesData?.data?.map((invoice) => (
                <div key={invoice.id} className="border border-border-subtle rounded-2xl p-4 flex justify-between items-center bg-bg-base/70">
                  <div>
                    <p className="text-text-primary font-semibold">
                      {invoice.invoice_number || 'Invoice'} · {formatCurrency(invoice.amount, invoice.currency)}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      Emessa il {invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString() : 'N/D'} · Stato: {invoice.status}
                    </p>
                  </div>
                  <span className="text-sm text-text-secondary">
                    Scadenza: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/D'}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
