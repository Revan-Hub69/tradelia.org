export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  provider: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  payment_id: string | null;
  amount: number;
  currency: string;
  status: 'draft' | 'issued' | 'paid' | 'void';
  invoice_number: string | null;
  issued_at: string | null;
  due_date: string | null;
  metadata: Record<string, any> | null;
}

export interface CreditLog {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  metadata: Record<string, any> | null;
  created_at: string;
}
