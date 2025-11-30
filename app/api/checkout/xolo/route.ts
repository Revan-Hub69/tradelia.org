import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * API Route per gestione pagamenti manuali Xolo Go
 * Xolo Go non ha API, quindi i pagamenti vengono gestiti manualmente
 */

/**
 * Aggiorna payment record con informazioni Xolo (chiamato manualmente dall'admin)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, xoloPaymentId, xoloPaymentLink } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID richiesto' },
        { status: 400 }
      );
    }

    // Aggiorna payment record con informazioni Xolo
    const { data, error } = await supabaseAdmin
      .from('payments')
      .update({
        metadata: {
          xolo_payment_id: xoloPaymentId || null,
          xolo_payment_link: xoloPaymentLink || null,
          manual_payment: true,
        },
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      console.error('Errore aggiornamento payment:', error);
      return NextResponse.json(
        { error: 'Errore aggiornamento payment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Errore Xolo integration:', error);
    return NextResponse.json(
      { error: 'Errore interno' },
      { status: 500 }
    );
  }
}

/**
 * Conferma pagamento manuale (chiamato dall'admin quando riceve conferma)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, xoloPaymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID richiesto' },
        { status: 400 }
      );
    }

    // Fetch payment data
    const { data: payment, error: fetchError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json(
        { error: 'Payment non trovato' },
        { status: 404 }
      );
    }

    // Aggiorna payment status a completed
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'completed',
        metadata: {
          ...payment.metadata,
          xolo_payment_id: xoloPaymentId || payment.metadata?.xolo_payment_id,
          completed_at: new Date().toISOString(),
          confirmed_by: 'admin_manual',
        },
      })
      .eq('id', paymentId);

    if (updateError) {
      console.error('Errore aggiornamento payment status:', updateError);
      return NextResponse.json(
        { error: 'Errore aggiornamento status' },
        { status: 500 }
      );
    }

    // Se business e richiede fattura, genera invoice
    if (payment.metadata?.customerData?.requireInvoice) {
      const { error: invoiceError } = await supabaseAdmin
        .from('invoices')
        .update({
          status: 'issued',
          issued_at: new Date().toISOString(),
        })
        .eq('payment_id', paymentId);

      if (invoiceError) {
        console.error('Errore generazione invoice:', invoiceError);
        // Non blocchiamo se l'invoice fallisce
      }
    }

    // Aggiorna user role se necessario
    if (payment.metadata?.planId && payment.user_id) {
      const roleMap: Record<string, string> = {
        pro: 'pro',
        // Desk sarà aggiunto in futuro
      };

      if (roleMap[payment.metadata.planId]) {
        await supabaseAdmin
          .from('user_roles')
          .upsert({
            user_id: payment.user_id,
            role: roleMap[payment.metadata.planId],
            plan_source: 'xolo_manual',
            valid_until: payment.metadata.billingCycle === 'yearly'
              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }, { onConflict: 'user_id' });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore conferma pagamento:', error);
    return NextResponse.json(
      { error: 'Errore processing pagamento' },
      { status: 500 }
    );
  }
}
