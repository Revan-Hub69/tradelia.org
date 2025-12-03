/**
 * Brevo (ex SendinBlue) Email Service
 * Utility per inviare email tramite Brevo API
 */

interface BrevoEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface BrevoResponse {
  messageId: string;
}

/**
 * Invia email tramite Brevo API
 */
export async function sendBrevoEmail(options: BrevoEmailOptions): Promise<BrevoResponse> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY non configurata");
  }

  const fromEmail = options.from || process.env.BREVO_FROM_EMAIL || "noreply@tradelia.org";
  const fromName = process.env.BREVO_FROM_NAME || "Tradelia";

  // Normalizza destinatari (array o stringa)
  const recipients = Array.isArray(options.to) ? options.to : [options.to];

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: fromName,
        email: fromEmail,
      },
      to: recipients.map((email) => ({ email })),
      subject: options.subject,
      htmlContent: options.html,
      replyTo: options.replyTo ? { email: options.replyTo } : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Errore invio email Brevo:", error);
    throw new Error(`Errore invio email: ${response.status} ${error}`);
  }

  const data = await response.json();
  return {
    messageId: data.messageId || "unknown",
  };
}

/**
 * Genera template HTML per email admin (nuova richiesta checkout)
 */
export function generateAdminCheckoutEmail(data: {
  requestId: string;
  planId: string;
  customerType: string;
  billingCycle: string;
  price: number;
  currency: string;
  customerData: any;
}): string {
  const planNames: Record<string, string> = {
    pro: "Pro",
    desk: "Desk",
  };

  const customerTypeNames: Record<string, string> = {
    retail: "Retail (Privato)",
    professionale: "Professionale (Azienda)",
  };

  const billingCycleNames: Record<string, string> = {
    monthly: "Mensile",
    yearly: "Annuale",
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; color: #1f2937; }
        .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; }
        .footer { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
        .highlight { background: #fef3c7; padding: 15px; border-radius: 4px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nuova Richiesta Checkout</h1>
        </div>
        <div class="content">
          <div class="section">
            <div class="label">Request ID:</div>
            <div class="value">${data.requestId}</div>
          </div>

          <div class="section">
            <h2>Dettagli Piano</h2>
            <table>
              <tr><td><strong>Piano</strong></td><td>${planNames[data.planId] || data.planId}</td></tr>
              <tr><td><strong>Tipo Cliente</strong></td><td>${customerTypeNames[data.customerType] || data.customerType}</td></tr>
              <tr><td><strong>Ciclo Fatturazione</strong></td><td>${billingCycleNames[data.billingCycle] || data.billingCycle}</td></tr>
              <tr><td><strong>Prezzo</strong></td><td>€${data.price} ${data.currency}</td></tr>
            </table>
          </div>

          <div class="section">
            <h2>Dati Cliente</h2>
            ${
              data.customerType === "retail"
                ? `
              <table>
                <tr><td><strong>Nome</strong></td><td>${data.customerData.firstName || "-"}</td></tr>
                <tr><td><strong>Cognome</strong></td><td>${data.customerData.lastName || "-"}</td></tr>
                <tr><td><strong>Email</strong></td><td>${data.customerData.email || "-"}</td></tr>
                <tr><td><strong>Telefono</strong></td><td>${data.customerData.phone || "-"}</td></tr>
                <tr><td><strong>Indirizzo</strong></td><td>${data.customerData.address || "-"}</td></tr>
                <tr><td><strong>Città</strong></td><td>${data.customerData.city || "-"}</td></tr>
                <tr><td><strong>CAP</strong></td><td>${data.customerData.zipCode || "-"}</td></tr>
                <tr><td><strong>Paese</strong></td><td>${data.customerData.country || "-"}</td></tr>
                <tr><td><strong>Codice Fiscale</strong></td><td>${data.customerData.taxCode || "-"}</td></tr>
              </table>
            `
                : `
              <table>
                <tr><td><strong>Ragione Sociale</strong></td><td>${data.customerData.companyName || "-"}</td></tr>
                <tr><td><strong>P.IVA</strong></td><td>${data.customerData.vatNumber || "-"}</td></tr>
                <tr><td><strong>Indirizzo Aziendale</strong></td><td>${data.customerData.companyAddress || "-"}</td></tr>
                <tr><td><strong>Città</strong></td><td>${data.customerData.companyCity || "-"}</td></tr>
                <tr><td><strong>CAP</strong></td><td>${data.customerData.companyZipCode || "-"}</td></tr>
                <tr><td><strong>Paese</strong></td><td>${data.customerData.companyCountry || "-"}</td></tr>
                <tr><td><strong>Persona di Contatto</strong></td><td>${data.customerData.contactPerson || "-"}</td></tr>
                <tr><td><strong>Email Contatto</strong></td><td>${data.customerData.contactEmail || "-"}</td></tr>
                <tr><td><strong>Telefono Contatto</strong></td><td>${data.customerData.contactPhone || "-"}</td></tr>
                <tr><td><strong>Richiede Fattura</strong></td><td>${data.customerData.requireInvoice ? "Sì" : "No"}</td></tr>
              </table>
            `
            }
          </div>

          <div class="highlight">
            <strong>⚠️ AZIONE RICHIESTA - Workflow Manuale:</strong><br>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li><strong>Verifica i dati del cliente</strong> (sopra)</li>
              <li><strong>Inserisci manualmente l'utente in Xolo Go</strong> con i dati forniti</li>
              <li><strong>Genera e invia la fattura</strong> tramite Xolo Go</li>
              <li><strong>Dopo che l'utente paga</strong>, conferma il pagamento tramite:<br>
                <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">PUT /api/checkout/xolo</code><br>
                Con body: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">{"paymentId": "${data.requestId}", "xoloPaymentId": "..."}</code>
              </li>
              <li>Il sistema attiverà automaticamente il piano dopo la conferma</li>
            </ol>
            <p style="margin-top: 10px;"><small><strong>Nota:</strong> L'account NON è ancora attivo. Verrà attivato solo dopo conferma pagamento.</small></p>
          </div>
        </div>
        <div class="footer">
          <p>Questa email è stata generata automaticamente dal sistema Tradelia.</p>
          <p>Request ID: ${data.requestId}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Genera template HTML per email utente (richiesta ricevuta, in elaborazione)
 * BEST PRACTICE: Email immediata di conferma, NON attivazione
 */
export function generateUserRequestConfirmationEmail(data: {
  planId: string;
  customerType: string;
  billingCycle: string;
  price: number;
  currency: string;
  requestId: string;
}): string {
  const planNames: Record<string, string> = {
    pro: "Pro",
    desk: "Desk",
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .highlight { background: #dbeafe; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #2563eb; }
        .footer { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Richiesta Ricevuta!</h1>
        </div>
        <div class="content">
          <p>Ciao,</p>
          <p>Grazie per la tua richiesta di sottoscrizione del piano <strong>${planNames[data.planId] || data.planId}</strong>.</p>
          
          <div class="highlight">
            <strong>📋 Cosa succede ora?</strong><br>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>Il nostro team ha ricevuto la tua richiesta</li>
              <li>Verificheremo i dati e inseriremo la tua richiesta nel sistema</li>
              <li>Riceverai la fattura da pagare via email entro 24-48 ore</li>
              <li>Dopo il pagamento, il tuo account verrà attivato</li>
            </ol>
          </div>

          <p><strong>Dettagli Richiesta:</strong></p>
          <ul>
            <li>Piano: ${planNames[data.planId] || data.planId}</li>
            <li>Importo: €${data.price} ${data.currency}</li>
            <li>Ciclo: ${data.billingCycle === "monthly" ? "Mensile" : "Annuale"}</li>
          </ul>

          <p>Riceverai una email con la fattura e le istruzioni per il pagamento non appena la richiesta sarà processata.</p>

          <p>Se hai domande, non esitare a contattarci.</p>
          <p>Grazie per aver scelto Tradelia!</p>
        </div>
        <div class="footer">
          <p>Tradelia - Il tuo partner per l'analisi finanziaria</p>
          <p>Request ID: ${data.requestId}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Genera template HTML per email utente (account attivato, 48h per pagare)
 * NOTA: Questa email viene inviata DOPO che admin conferma pagamento
 */
export function generateUserActivationEmail(data: {
  planId: string;
  customerType: string;
  billingCycle: string;
  price: number;
  currency: string;
  paymentDeadline: string;
  paymentId: string;
}): string {
  const planNames: Record<string, string> = {
    pro: "Pro",
    desk: "Desk",
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .highlight { background: #fef3c7; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .footer { margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Account ${planNames[data.planId] || data.planId} Attivato!</h1>
        </div>
        <div class="content">
          <p>Ciao,</p>
          <p>La tua richiesta è stata processata e il tuo account <strong>${planNames[data.planId] || data.planId}</strong> è stato attivato con successo!</p>
          
          <p><strong>🎉 Il tuo account è già attivo</strong> e puoi iniziare a usare tutte le funzionalità ${planNames[data.planId] || data.planId}.</p>
          
          <div class="highlight">
            <strong>⏰ Importante - Tempo per Pagare:</strong><br>
            Per mantenere l'accesso, hai <strong>48 ore</strong> per completare il pagamento.<br>
            Scadenza: <strong>${new Date(data.paymentDeadline).toLocaleString("it-IT")}</strong><br>
            <small>Dopo la scadenza, l'account verrà sospeso fino al completamento del pagamento.</small>
          </div>

          <p><strong>Dettagli Ordine:</strong></p>
          <ul>
            <li>Piano: ${planNames[data.planId] || data.planId}</li>
            <li>Importo: €${data.price} ${data.currency}</li>
            <li>Ciclo: ${data.billingCycle === "monthly" ? "Mensile" : "Annuale"}</li>
          </ul>

          <p>Per completare il pagamento, segui le istruzioni che riceverai via email o accedi alla dashboard.</p>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://tradelia.org"}/checkout/payment-instructions?payment=${data.paymentId}" class="button">
              Vai alle Istruzioni di Pagamento
            </a>
          </div>

          <p>Se hai domande, non esitare a contattarci.</p>
          <p>Grazie per aver scelto Tradelia!</p>
        </div>
        <div class="footer">
          <p>Tradelia - Il tuo partner per l'analisi finanziaria</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
