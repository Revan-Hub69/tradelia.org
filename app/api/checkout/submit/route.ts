import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  sendBrevoEmail,
  generateAdminCheckoutEmail,
  generateUserRequestConfirmationEmail,
} from "@/lib/email/brevo";

/**
 * API Route per processare checkout (workflow manuale)
 * WORKFLOW:
 * 1. Utente compila form → Submit
 * 2. Sistema crea payment record (status: pending)
 * 3. Email all'admin con tutti i dati
 * 4. Email all'utente: "Richiesta ricevuta, in elaborazione"
 * 5. Admin inserisce manualmente utente in Xolo Go
 * 6. Admin invia fattura manualmente
 * 7. Utente paga
 * 8. Admin conferma pagamento via /api/checkout/xolo PUT
 * 9. Sistema attiva piano (con valid_until basato su billingCycle)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, customerType, billingCycle, price, currency, customerData } = body;

    // Validazione
    if (!planId || !customerType || !billingCycle || typeof price !== "number") {
      console.error("Validazione fallita:", { planId, customerType, billingCycle, price });
      return NextResponse.json({ error: "Dati mancanti o non validi" }, { status: 400 });
    }

    const userEmail = customerData?.email || customerData?.contactEmail;
    if (!userEmail) {
      console.error("Email mancante:", customerData);
      return NextResponse.json({ error: "Email richiesta" }, { status: 400 });
    }

    // 1. Crea payment record (NON attiviamo ancora il piano)
    // L'admin dovrà inserire manualmente in Xolo Go e inviare fattura
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: null, // Sarà associato quando admin crea account
        amount: price,
        currency: currency || "EUR",
        provider: "xolo_manual",
        status: "pending",
        metadata: {
          planId,
          customerType,
          billingCycle,
          customerData,
          requestType: "checkout_submission",
          workflow: "manual", // Indica workflow manuale
          requiresAdminAction: true, // Admin deve inserire in Xolo Go
        },
      })
      .select("*")
      .single();

    if (paymentError) {
      console.error("Errore creazione payment:", paymentError);
      return NextResponse.json({ 
        error: "Errore creazione richiesta",
        details: process.env.NODE_ENV === 'development' ? paymentError.message : undefined
      }, { status: 500 });
    }

    if (!payment || !payment.id) {
      console.error("Payment non creato correttamente:", payment);
      return NextResponse.json({ error: "Errore creazione richiesta" }, { status: 500 });
    }

    // 2. Invia email all'admin con tutti i dati (per inserimento manuale in Xolo Go)
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@tradelia.org";
      await sendBrevoEmail({
        to: adminEmail,
        subject: `[AZIONE RICHIESTA] Nuova richiesta checkout - ${planId.toUpperCase()} ${customerType}`,
        html: generateAdminCheckoutEmail({
          requestId: payment.id,
          planId,
          customerType,
          billingCycle,
          price,
          currency,
          customerData,
        }),
      });
    } catch (emailError) {
      console.error("Errore invio email admin:", emailError);
      // Non blocchiamo se l'email fallisce
    }

    // 3. Invia email all'utente: "Richiesta ricevuta, in elaborazione"
    // NON diciamo che account è attivo (lo sarà solo dopo pagamento)
    try {
      await sendBrevoEmail({
        to: userEmail,
        subject: `Richiesta ${planId.toUpperCase()} ricevuta - In elaborazione`,
        html: generateUserRequestConfirmationEmail({
          planId,
          customerType,
          billingCycle,
          price,
          currency,
          requestId: payment.id,
        }),
      });
    } catch (emailError) {
      console.error("Errore invio email utente:", emailError);
      // Non blocchiamo se l'email fallisce
    }

    return NextResponse.json({
      success: true,
      requestId: payment.id,
      message: "Richiesta inviata. Riceverai una risposta via email entro 24-48 ore.",
    });
  } catch (error) {
    console.error("Errore submit checkout:", error);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}
