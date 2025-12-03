import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  sendBrevoEmail,
  generateAdminCheckoutEmail,
  generateUserActivationEmail,
} from "@/lib/email/brevo";

/**
 * API Route per processare checkout e attivare subito il piano
 * - Crea/attiva account utente
 * - Attiva piano con 48h per pagare
 * - Invia email all'admin e all'utente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, customerType, billingCycle, price, currency, customerData } = body;

    // Validazione
    if (!planId || !customerType || !billingCycle || typeof price !== "number") {
      return NextResponse.json({ error: "Dati mancanti o non validi" }, { status: 400 });
    }

    const userEmail = customerData.email || customerData.contactEmail;
    if (!userEmail) {
      return NextResponse.json({ error: "Email richiesta" }, { status: 400 });
    }

    // 1. Cerca o crea utente
    let userId: string | null = null;

    // Cerca utente esistente per email
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const user = existingUser?.users.find((u) => u.email === userEmail);

    if (user) {
      userId = user.id;
    } else {
      // Crea nuovo utente (senza password, dovrà fare reset password)
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        email_confirm: false, // Dovrà confermare email
        user_metadata: {
          firstName: customerData.firstName || customerData.contactPerson,
          lastName: customerData.lastName,
          customerType,
        },
      });

      if (createError || !newUser.user) {
        console.error("Errore creazione utente:", createError);
        return NextResponse.json({ error: "Errore creazione account" }, { status: 500 });
      }

      userId = newUser.user.id;
    }

    // 2. Calcola valid_until (48 ore da ora)
    const validUntil = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    // 3. Attiva subito il piano con 48h per pagare
    const roleMap: Record<string, string> = {
      pro: "pro",
      desk: "desk",
    };

    if (!roleMap[planId]) {
      return NextResponse.json({ error: "Piano non valido" }, { status: 400 });
    }

    const { error: roleError } = await supabaseAdmin.from("user_roles").upsert(
      {
        user_id: userId,
        role: roleMap[planId],
        plan_source: "checkout_auto",
        valid_until: validUntil,
      },
      { onConflict: "user_id" }
    );

    if (roleError) {
      console.error("Errore attivazione ruolo:", roleError);
      return NextResponse.json({ error: "Errore attivazione piano" }, { status: 500 });
    }

    // 4. Crea payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: userId,
        amount: price,
        currency: currency || "EUR",
        provider: "manual",
        status: "pending",
        metadata: {
          planId,
          customerType,
          billingCycle,
          customerData,
          requestType: "checkout_submission",
          activated: true,
          paymentDeadline: validUntil,
        },
      })
      .select("*")
      .single();

    if (paymentError) {
      console.error("Errore creazione payment:", paymentError);
      return NextResponse.json({ error: "Errore creazione pagamento" }, { status: 500 });
    }

    // 5. Invia email all'admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@tradelia.org";
      await sendBrevoEmail({
        to: adminEmail,
        subject: `Nuova richiesta checkout - ${planId.toUpperCase()} ${customerType}`,
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

    // 6. Invia email all'utente (BEST PRACTICE: email immediata dopo attivazione)
    // L'email viene inviata subito perché:
    // - Account è già attivo (miglior UX)
    // - Utente deve sapere subito che ha 48h per pagare
    // - Comunicazione tempestiva aumenta conversione
    try {
      await sendBrevoEmail({
        to: userEmail,
        subject: `Account ${planId.toUpperCase()} attivato - 48h per pagare`,
        html: generateUserActivationEmail({
          planId,
          customerType,
          billingCycle,
          price,
          currency,
          paymentDeadline: validUntil,
          paymentId: payment.id,
        }),
      });
    } catch (emailError) {
      console.error("Errore invio email utente:", emailError);
      // Non blocchiamo se l'email fallisce
    }

    // TODO: Aggiungere promemoria automatici:
    // - Email dopo 24h se pagamento ancora pending
    // - Email 2h prima scadenza se pagamento ancora pending
    // Questo può essere fatto con cron job o scheduled tasks

    return NextResponse.json({
      success: true,
      requestId: payment.id,
      userId,
      validUntil,
    });
  } catch (error) {
    console.error("Errore submit checkout:", error);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}
