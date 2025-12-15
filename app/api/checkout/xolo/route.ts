import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";

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
      return NextResponse.json({ error: "Payment ID richiesto" }, { status: 400 });
    }

    // Aggiorna payment record con informazioni Xolo
    const { data, error } = await supabaseAdmin
      .from("payments")
      .update({
        metadata: {
          xolo_payment_id: xoloPaymentId || null,
          xolo_payment_link: xoloPaymentLink || null,
          manual_payment: true,
        },
      })
      .eq("id", paymentId)
      .select()
      .single();

    if (error) {
      console.error("Errore aggiornamento payment:", error);
      return NextResponse.json({ error: "Errore aggiornamento payment" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Errore Xolo integration:", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
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
      return NextResponse.json({ error: "Payment ID richiesto" }, { status: 400 });
    }

    // Fetch payment data
    const { data: payment, error: fetchError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json({ error: "Payment non trovato" }, { status: 404 });
    }

    // Aggiorna payment status a completed
    const { error: updateError } = await supabaseAdmin
      .from("payments")
      .update({
        status: "completed",
        metadata: {
          ...payment.metadata,
          xolo_payment_id: xoloPaymentId || payment.metadata?.xolo_payment_id,
          completed_at: new Date().toISOString(),
          confirmed_by: "admin_manual",
        },
      })
      .eq("id", paymentId);

    if (updateError) {
      console.error("Errore aggiornamento payment status:", updateError);
      return NextResponse.json({ error: "Errore aggiornamento status" }, { status: 500 });
    }

    // Se business e richiede fattura, genera invoice
    if (payment.metadata?.customerData?.requireInvoice) {
      const { error: invoiceError } = await supabaseAdmin
        .from("invoices")
        .update({
          status: "issued",
          issued_at: new Date().toISOString(),
        })
        .eq("payment_id", paymentId);

      if (invoiceError) {
        console.error("Errore generazione invoice:", invoiceError);
        // Non blocchiamo se l'invoice fallisce
      }
    }

    // Aggiorna user role se necessario (DOPO conferma pagamento)
    // Se user_id è null, cerca o crea utente per email
    let userId = payment.user_id;

    if (!userId && payment.metadata?.customerData) {
      const userEmail =
        payment.metadata.customerData.email || payment.metadata.customerData.contactEmail;

      if (userEmail) {
        // Cerca utente esistente
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const user = existingUsers?.users?.find((u: User) => u.email === userEmail);

        if (user) {
          userId = user.id;
        } else {
          // Crea nuovo utente
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: userEmail,
            email_confirm: false,
            user_metadata: {
              firstName:
                payment.metadata.customerData.firstName ||
                payment.metadata.customerData.contactPerson,
              lastName: payment.metadata.customerData.lastName,
              customerType: payment.metadata.customerType,
            },
          });

          if (!createError && newUser.user) {
            userId = newUser.user.id;
          }
        }

        // Aggiorna payment con user_id
        if (userId) {
          await supabaseAdmin.from("payments").update({ user_id: userId }).eq("id", paymentId);
        }
      }
    }

    // Attiva piano solo se abbiamo user_id e planId
    if (payment.metadata?.planId && userId) {
      const roleMap: Record<string, string> = {
        pro: "pro",
        desk: "desk",
      };

      if (roleMap[payment.metadata.planId]) {
        // Calcola valid_until basato su billingCycle
        const validUntil =
          payment.metadata.billingCycle === "yearly"
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        await supabaseAdmin.from("user_roles").upsert(
          {
            user_id: userId,
            role: roleMap[payment.metadata.planId],
            plan_source: "xolo_manual",
            valid_until: validUntil,
          },
          { onConflict: "user_id" }
        );

        // TODO: Inviare email all'utente "Account attivato" dopo conferma pagamento
        // Questo può essere fatto qui o in un webhook separato
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore conferma pagamento:", error);
    return NextResponse.json({ error: "Errore processing pagamento" }, { status: 500 });
  }
}
