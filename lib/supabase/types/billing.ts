/**
 * Database types for billing tables
 * These match the actual Supabase schema
 */

export interface CreditsLogRow {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'expiration';
  description: string | null;
  related_payment_id: string | null;
  related_report_id: string | null;
  balance_after: number;
  created_at: string;
}

export interface PaymentRow {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  payment_provider: string | null;
  provider_payment_id: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface InvoiceRow {
  id: string;
  user_id: string;
  payment_id: string | null;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string | null;
  issued_at: string | null;
  paid_at: string | null;
  file_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}
