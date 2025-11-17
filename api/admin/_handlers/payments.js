import { getServiceSupabase } from '../../_lib/supabase.js';
import { HttpError, methodNotAllowed, sendJSON } from '../../_lib/http.js';

const supabase = getServiceSupabase();

const addMonths = (date, months = 1) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result.toISOString();
};

export const handlePaymentsRequest = async (req, res) => {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST']);
  }

  const {
    userId,
    email,
    amount,
    currency = 'EUR',
    status = 'succeeded',
    invoiceNumber,
    pdfUrl,
    description,
    planRole = 'desk',
    plan = 'desk_manual',
    months = 1,
    gateway = 'manual'
  } = req.body || {};

  if (!userId || !email) {
    throw new HttpError(400, 'userId ed email sono obbligatori');
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    throw new HttpError(400, 'Importo non valido');
  }

  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      gateway,
      gateway_payment_id: invoiceNumber || null,
      amount: parsedAmount,
      currency,
      status,
      metadata: {
        source: 'admin_manual_payment',
        description: description || null,
        pdf_url: pdfUrl || null
      }
    })
    .select('id')
    .single();

  if (paymentError) {
    throw new HttpError(500, 'Errore durante la registrazione del pagamento', paymentError.message);
  }

  const now = new Date();
  const { data: currentRole, error: roleError } = await supabase
    .from('user_roles')
    .select('valid_until,email')
    .eq('user_id', userId)
    .maybeSingle();

  if (roleError) {
    throw new HttpError(500, 'Errore nel recupero del ruolo utente', roleError.message);
  }

  const currentExpiry = currentRole?.valid_until ? new Date(currentRole.valid_until) : null;
  const baseDate = currentExpiry && currentExpiry > now ? currentExpiry : now;
  const newValidUntil = addMonths(baseDate, months);

  const rolePayload = {
    user_id: userId,
    email: (currentRole?.email || email).toLowerCase(),
    role: planRole,
    plan_source: gateway,
    valid_until: newValidUntil
  };

  const { error: upsertRoleError } = await supabase.from('user_roles').upsert(rolePayload, { onConflict: 'email' });

  if (upsertRoleError) {
    throw new HttpError(500, 'Errore durante l\'aggiornamento del ruolo', upsertRoleError.message);
  }

  const subscriptionPayload = {
    user_id: userId,
    plan,
    status: status === 'succeeded' ? 'active' : status,
    gateway,
    started_at: now.toISOString(),
    renew_at: newValidUntil,
    metadata: {
      invoice_number: invoiceNumber || null
    }
  };

  const { error: subscriptionError } = await supabase.from('subscriptions').insert(subscriptionPayload);

  if (subscriptionError) {
    throw new HttpError(500, 'Errore durante la creazione dell\'abbonamento', subscriptionError.message);
  }

  if (invoiceNumber || pdfUrl) {
    const { error: invoiceError } = await supabase.from('invoices').insert({
      user_id: userId,
      subscription_id: null,
      invoice_number: invoiceNumber || `manual-${payment.id}`,
      status: status === 'succeeded' ? 'paid' : 'issued',
      issued_at: now.toISOString(),
      due_at: null,
      pdf_url: pdfUrl || null,
      metadata: {
        payment_id: payment.id,
        description: description || null
      }
    });

    if (invoiceError) {
      throw new HttpError(500, 'Errore durante la registrazione della fattura', invoiceError.message);
    }
  }

  await supabase
    .from('dashboard_access_tokens')
    .update({
      plan_role: planRole,
      valid_until: newValidUntil
    })
    .eq('email', email.toLowerCase())
    .eq('revoked', false);

  return sendJSON(res, 200, {
    ok: true,
    paymentId: payment.id,
    validUntil: newValidUntil
  });
};

