'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock, Search, Filter, Download } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { supabase } from '@/lib/supabase/client';

interface Payment {
  id: string;
  user_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  provider: string;
  metadata: any;
  created_at: string;
}

export function PaymentsManagement() {
  const { t } = useTranslations();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentId: string) => {
    if (!confirm('Confermare il pagamento come completato?')) return;

    setConfirming(true);
    try {
      const response = await fetch('/api/checkout/xolo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Errore conferma pagamento');
      }

      await fetchPayments();
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Errore durante la conferma del pagamento');
    } finally {
      setConfirming(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter !== 'all' && payment.status !== filter) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        payment.id.toLowerCase().includes(searchLower) ||
        payment.metadata?.customerData?.email?.toLowerCase().includes(searchLower) ||
        payment.metadata?.customerData?.companyName?.toLowerCase().includes(searchLower) ||
        payment.metadata?.customerData?.firstName?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'failed':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary">
            {t('admin.payments.title') || 'Gestione Pagamenti'}
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            {t('admin.payments.description') || 'Gestisci i pagamenti manuali e conferma i pagamenti completati'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder={t('admin.payments.search') || 'Cerca per ID, email, nome...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-bg-soft border border-border-subtle text-text-primary focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'completed', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === f
                  ? 'bg-accent text-white'
                  : 'bg-bg-soft text-text-secondary hover:bg-bg-elevated'
              )}
            >
              {t(`admin.payments.filters.${f}`) || f}
            </button>
          ))}
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
            {t('admin.payments.empty') || 'Nessun pagamento trovato'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-soft border-b border-border-subtle">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    {t('admin.payments.table.id') || 'ID'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    {t('admin.payments.table.customer') || 'Cliente'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    {t('admin.payments.table.amount') || 'Importo'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    {t('admin.payments.table.status') || 'Stato'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    {t('admin.payments.table.date') || 'Data'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    {t('admin.payments.table.actions') || 'Azioni'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-bg-soft/50 transition-colors">
                    <td className="px-6 py-4">
                      <code className="text-xs text-text-secondary font-mono">
                        {payment.id.slice(0, 8)}...
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-primary">
                        {payment.metadata?.customerData?.companyName ||
                          `${payment.metadata?.customerData?.firstName || ''} ${payment.metadata?.customerData?.lastName || ''}`.trim() ||
                          payment.metadata?.customerData?.email ||
                          'Guest'}
                      </div>
                      <div className="text-xs text-text-tertiary">
                        {payment.metadata?.customerData?.email || payment.metadata?.customerData?.contactEmail || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-text-primary">
                        €{payment.amount} {payment.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                          getStatusColor(payment.status)
                        )}
                      >
                        {getStatusIcon(payment.status)}
                        {t(`admin.payments.status.${payment.status}`) || payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {new Date(payment.created_at).toLocaleDateString('it-IT')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => handleConfirmPayment(payment.id)}
                          disabled={confirming}
                          className="px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-400 text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {t('admin.payments.confirm') || 'Conferma'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

