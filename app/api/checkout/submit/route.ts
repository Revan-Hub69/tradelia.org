import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * API Route per inviare email all'admin con i dati del form checkout
 * Il form viene inviato via email, l'admin carica manualmente i dati e invia la fattura
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      planId,
      customerType,
      billingCycle,
      price,
      currency,
      customerData,
    } = body;

    // Validazione
    if (!planId || !customerType || !billingCycle || typeof price !== 'number') {
      return NextResponse.json(
        { error: 'Dati mancanti o non validi' },
        { status: 400 }
      );
    }

    // Crea record di richiesta in payments (fallback se checkout_requests non esiste)
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        amount: price,
        currency: currency || 'EUR',
        provider: 'manual',
        status: 'pending',
        metadata: {
          planId,
          customerType,
          billingCycle,
          customerData,
          requestType: 'checkout_submission',
        },
      })
      .select('*')
      .single();

    if (paymentError) {
      console.error('Errore creazione request:', paymentError);
      return NextResponse.json(
        { error: 'Errore creazione richiesta' },
        { status: 500 }
      );
    }

    // Invia email all'admin (TODO: implementare invio email)
    await sendEmailToAdmin({
      requestId: payment.id,
      planId,
      customerType,
      billingCycle,
      price,
      currency,
      customerData,
    });

    return NextResponse.json({
      success: true,
      requestId: payment.id,
    });
  } catch (error) {
    console.error('Errore submit checkout:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

/**
 * Invia email all'admin con i dati del form
 * TODO: Implementare invio email reale (Resend, SendGrid, etc.)
 */
async function sendEmailToAdmin(data: {
  requestId: string;
  planId: string;
  customerType: string;
  billingCycle: string;
  price: number;
  currency: string;
  customerData: any;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@tradelia.org';
  
  // Per ora loggiamo i dati (in produzione implementare invio email reale)
  console.log('=== NUOVA RICHIESTA CHECKOUT ===');
  console.log('Request ID:', data.requestId);
  console.log('Piano:', data.planId);
  console.log('Tipo Cliente:', data.customerType);
  console.log('Ciclo Fatturazione:', data.billingCycle);
  console.log('Prezzo:', data.price, data.currency);
  console.log('Dati Cliente:', JSON.stringify(data.customerData, null, 2));
  console.log('===============================');

  // TODO: Implementare invio email
  // Esempio con Resend:
  // await resend.emails.send({
  //   from: 'noreply@tradelia.org',
  //   to: adminEmail,
  //   subject: `Nuova richiesta checkout - ${data.planId.toUpperCase()} ${data.customerType}`,
  //   html: generateEmailTemplate(data),
  // });

  return { success: true };
}
