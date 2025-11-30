import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * API Route per creare una sessione di checkout
 * Gestisce la creazione del payment record e prepara l'integrazione con Xolo Go
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Per checkout non richiediamo autenticazione (guest checkout)
    // Ma se l'utente è loggato, usiamo il suo ID

    const body = await request.json();
    const {
      planId,
      planType,
      billingCycle,
      price,
      currency,
      customerData,
    } = body;

    // Validazione
    if (!planId || !planType || !billingCycle || typeof price !== 'number') {
      return NextResponse.json(
        { error: 'Dati mancanti o non validi' },
        { status: 400 }
      );
    }

    // Crea payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: user?.id || null, // Null se guest
        amount: price,
        currency: currency || 'EUR',
        provider: 'xolo',
        status: 'pending',
        metadata: {
          planId,
          planType,
          billingCycle,
          customerData,
          guest: !user,
        },
      })
      .select('*')
      .single();

    if (paymentError) {
      console.error('Errore creazione payment:', paymentError);
      return NextResponse.json(
        { error: 'Errore creazione pagamento' },
        { status: 500 }
      );
    }

    // Se business e richiede fattura, crea invoice draft
    if (planType === 'business' && customerData?.requireInvoice) {
      const { error: invoiceError } = await supabaseAdmin
        .from('invoices')
        .insert({
          user_id: user?.id || null,
          payment_id: payment.id,
          amount: price,
          currency: currency || 'EUR',
          status: 'draft',
          metadata: {
            customerData,
            billingCycle,
            planId,
          },
        });

      if (invoiceError) {
        console.error('Errore creazione invoice:', invoiceError);
        // Non blocchiamo il checkout se l'invoice fallisce
      }
    }

    // TODO: Integrare Xolo Go API
    // Per ora restituiamo il payment ID
    return NextResponse.json({
      paymentId: payment.id,
      checkoutUrl: `/checkout/payment?payment=${payment.id}`, // URL per completare pagamento
    });
  } catch (error) {
    console.error('Errore checkout:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

