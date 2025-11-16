// /api/webhook-stripe.js
// API Vercel - Webhook Stripe per abbonamenti (con supporto Xolo opzionale)
// Alternativa semplice a Paddle/LemonSqueezy - Integrazione diretta Stripe

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { syncUserRoleFromSubscription } from './webhook-role-sync.js';

// Inizializza Supabase (usa SERVICE_ROLE_KEY se disponibile per Xolo, altrimenti ANON_KEY)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://higkhlfjfhlecbtfnznx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw';
const supabase = SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Xolo API Configuration (opzionale)
const XOLO_API_KEY = process.env.XOLO_API_KEY;
const XOLO_API_URL = process.env.XOLO_API_URL || 'https://api.xolo.io/v1';
const ENABLE_XOLO = !!XOLO_API_KEY;

// Inizializza Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('[Webhook Stripe] STRIPE_WEBHOOK_SECRET non configurato');
      return res.status(500).json({ error: 'Webhook secret non configurato' });
    }
    
    // Verifica signature Stripe
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('[Webhook Stripe] Errore verifica signature:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
    
    console.log('[Webhook Stripe] Evento ricevuto:', event.type);
    
    // Gestisci eventi Stripe
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscription(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
        await handleSubscriptionCancelled(event.data.object);
        break;
      
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        // Se Xolo è abilitato, crea fattura
        if (ENABLE_XOLO) {
          await createXoloInvoice(event.data.object);
        }
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'invoice.finalized':
        // Fattura finalizzata e inviata automaticamente da Stripe Invoicing
        await handleInvoiceFinalized(event.data.object);
        break;
      
      default:
        console.log('[Webhook Stripe] Evento non gestito:', event.type);
    }
    
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Webhook Stripe] Errore:', err);
    return res.status(500).json({ error: 'Errore server', details: err.message });
  }
}

// ===== HANDLE SUBSCRIPTION =====
async function handleSubscription(subscription) {
  try {
    // subscription è un oggetto Stripe Subscription
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const status = subscription.status; // active, canceled, past_due, etc.
    
    // Recupera customer da Stripe per ottenere email
    const customer = await stripe.customers.retrieve(customerId);
    const email = customer.email;
    
    if (!email) {
      console.error('[Webhook] Email mancante nel customer Stripe');
      return;
    }
    
    console.log('[Webhook Stripe] Subscription gestita:', { email, subscriptionId, status });
    
    // Mappa status Stripe a status nostro
    let mappedStatus = 'cancelled';
    if (status === 'active' || status === 'trialing') {
      mappedStatus = 'active';
    } else if (status === 'past_due' || status === 'unpaid') {
      mappedStatus = 'expired';
    }
    
    // Estrai plan identifier da subscription (price_id o product_id)
    const priceId = subscription.items?.data[0]?.price?.id;
    const productId = subscription.items?.data[0]?.price?.product;
    const planIdentifier = priceId || productId || subscription.plan?.id || subscription.items?.data[0]?.plan?.id;
    
    // Calcola scadenza
    const expiresAt = subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000) 
      : null;
    
    console.log('[Webhook Stripe] Plan identifier:', planIdentifier, 'Expires:', expiresAt);
    
    // Sincronizza ruolo utente usando webhook-role-sync
    try {
      await syncUserRoleFromSubscription(email, mappedStatus, planIdentifier, expiresAt);
      console.log('[Webhook Stripe] ✅ Ruolo sincronizzato per:', email);
    } catch (roleSyncError) {
      console.error('[Webhook Stripe] Errore sincronizzazione ruolo:', roleSyncError);
    }
    
    // Aggiorna anche subscribers table (per compatibilità)
    const { data: existingSubscriber, error: selectError } = await supabase
      .from('subscribers')
      .select('id, email, auth_user_id, status')
      .eq('email', email)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('[Webhook Stripe] Errore ricerca subscriber:', selectError);
    }
    
    // Se subscriber esiste, aggiorna
    if (existingSubscriber) {
      const { error: updateError } = await supabase
        .from('subscribers')
        .update({
          subscription_id: subscriptionId,
          status: mappedStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscriber.id);
      
      if (updateError) {
        console.error('[Webhook Stripe] Errore aggiornamento subscriber:', updateError);
      } else {
        console.log('[Webhook Stripe] Subscriber aggiornato:', { id: existingSubscriber.id, email, status: mappedStatus });
      }
    } else {
      // Se subscriber non esiste, crea nuovo record
      const { data: newSubscriber, error: insertError } = await supabase
        .from('subscribers')
        .insert({
          email: email,
          subscription_id: subscriptionId,
          status: mappedStatus
        })
        .select('id')
        .single();
      
      if (insertError) {
        console.error('[Webhook Stripe] Errore creazione subscriber:', insertError);
      } else {
        console.log('[Webhook Stripe] Nuovo subscriber creato:', { id: newSubscriber.id, email, status: mappedStatus });
      }
    }
  } catch (err) {
    console.error('[Webhook] Errore handleSubscription:', err);
  }
}

// ===== HANDLE SUBSCRIPTION CANCELLED =====
async function handleSubscriptionCancelled(subscription) {
  try {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    
    // Recupera customer da Stripe per ottenere email
    const customer = await stripe.customers.retrieve(customerId);
    const email = customer.email;
    
    console.log('[Webhook Stripe] Subscription cancellata:', { email, subscriptionId });
    
    if (!email) {
      console.error('[Webhook Stripe] Email mancante nel customer Stripe');
      return;
    }
    
    // Estrai plan identifier per sincronizzazione
    const priceId = subscription.items?.data[0]?.price?.id;
    const productId = subscription.items?.data[0]?.price?.product;
    const planIdentifier = priceId || productId || subscription.plan?.id || subscription.items?.data[0]?.plan?.id;
    
    // Sincronizza ruolo utente (imposta scadenza)
    try {
      await syncUserRoleFromSubscription(email, 'cancelled', planIdentifier, new Date());
      console.log('[Webhook Stripe] ✅ Ruolo scaduto per:', email);
    } catch (roleSyncError) {
      console.error('[Webhook Stripe] Errore sincronizzazione ruolo:', roleSyncError);
    }
    
    // Aggiorna status abbonato in Supabase
    const { error: updateError } = await supabase
      .from('subscribers')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('email', email);
    
    if (updateError) {
      console.error('[Webhook Stripe] Errore aggiornamento status subscriber:', updateError);
    } else {
      console.log('[Webhook Stripe] Subscriber cancellato:', { email });
    }
  } catch (err) {
    console.error('[Webhook] Errore handleSubscriptionCancelled:', err);
  }
}

// ===== HANDLE CHECKOUT COMPLETED =====
async function handleCheckoutCompleted(session) {
  try {
    // Quando un checkout è completato, potrebbe creare una subscription
    // Questo evento viene gestito anche da customer.subscription.created
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    
    console.log('[Webhook] Checkout completato:', { customerId, subscriptionId });
    
    // Se c'è una subscription, gestiscila
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await handleSubscription(subscription);
    }
  } catch (err) {
    console.error('[Webhook] Errore handleCheckoutCompleted:', err);
  }
}

// ===== HANDLE PAYMENT SUCCEEDED =====
async function handlePaymentSucceeded(invoice) {
  try {
    // Quando un pagamento ha successo, assicurati che la subscription sia attiva
    const subscriptionId = invoice.subscription;
    
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await handleSubscription(subscription);
    }
  } catch (err) {
    console.error('[Webhook] Errore handlePaymentSucceeded:', err);
  }
}

// ===== HANDLE PAYMENT FAILED =====
async function handlePaymentFailed(invoice) {
  try {
    // Quando un pagamento fallisce, aggiorna lo status
    const subscriptionId = invoice.subscription;
    
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await handleSubscription(subscription);
    }
  } catch (err) {
    console.error('[Webhook Stripe] Errore handlePaymentFailed:', err);
  }
}

// ===== HANDLE INVOICE FINALIZED =====
async function handleInvoiceFinalized(invoice) {
  try {
    // Quando una fattura è finalizzata, Stripe Invoicing l'ha già inviata automaticamente
    // Questo evento serve per logging e tracking
    const invoiceId = invoice.id;
    const customerId = invoice.customer;
    const amount = invoice.amount_paid / 100; // Converti da centesimi
    const currency = invoice.currency.toUpperCase();
    const invoiceUrl = invoice.hosted_invoice_url;
    const invoicePdf = invoice.invoice_pdf;
    
    // Recupera customer per email
    const customer = await stripe.customers.retrieve(customerId);
    const email = customer.email;
    
    console.log('[Webhook Stripe] ✅ Fattura finalizzata e inviata:', {
      invoiceId,
      email,
      amount: `${amount} ${currency}`,
      invoiceUrl,
      invoicePdf
    });
    
    // Opzionale: Salva info fattura in Supabase per tracking
    if (supabase && email) {
      const { error } = await supabase
        .from('subscribers')
        .update({
          last_invoice_id: invoiceId,
          last_invoice_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('email', email);
      
      if (error) {
        console.warn('[Webhook Stripe] Errore aggiornamento invoice info (non critico):', error);
      }
    }
  } catch (err) {
    console.error('[Webhook Stripe] Errore handleInvoiceFinalized:', err);
  }
}

// ===== CREATE XOLO INVOICE (opzionale) =====
async function createXoloInvoice(stripeInvoice) {
  if (!ENABLE_XOLO) {
    return; // Xolo non configurato, skip
  }
  
  try {
    // Recupera customer da Stripe
    const customerId = stripeInvoice.customer;
    const customer = await stripe.customers.retrieve(customerId);
    
    const amount = stripeInvoice.amount_paid / 100;
    const currency = stripeInvoice.currency.toUpperCase();
    const description = stripeInvoice.description || stripeInvoice.lines?.data[0]?.description || 'Abbonamento Tradelia AI';
    
    // Determina se è B2C o B2B
    const isB2B = customer.metadata?.is_business === 'true' || customer.tax_ids?.data?.length > 0;
    const customerName = customer.name || customer.email?.split('@')[0] || 'Cliente';
    const customerEmail = customer.email;
    const customerVatId = customer.tax_ids?.data[0]?.value || null;
    
    // Prepara dati per Xolo
    const xoloInvoiceData = {
      customer_email: customerEmail,
      customer_name: customerName,
      amount: amount,
      currency: currency,
      description: description,
      date: new Date(stripeInvoice.created * 1000).toISOString().split('T')[0],
      metadata: {
        stripe_invoice_id: stripeInvoice.id,
        stripe_customer_id: customerId,
        source: 'tradelia_ai',
        subscription_id: stripeInvoice.subscription
      }
    };
    
    if (isB2B && customerVatId) {
      xoloInvoiceData.customer_vat_id = customerVatId;
      xoloInvoiceData.invoice_type = 'invoice';
    } else {
      xoloInvoiceData.invoice_type = 'receipt';
    }
    
    // Chiama API Xolo
    const response = await fetch(`${XOLO_API_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XOLO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(xoloInvoiceData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Webhook Stripe] Errore API Xolo:', response.status, errorText);
      // Non bloccare il flusso se Xolo fallisce
      return;
    }
    
    const xoloInvoice = await response.json();
    console.log('[Webhook Stripe] ✅ Fattura Xolo creata:', {
      xoloInvoiceId: xoloInvoice.id,
      stripeInvoiceId: stripeInvoice.id,
      customerEmail,
      amount: `${amount} ${currency}`,
      type: isB2B ? 'Invoice (B2B)' : 'Receipt (B2C)'
    });
    
    // Salva riferimento in metadata Stripe (opzionale)
    try {
      await stripe.invoices.update(stripeInvoice.id, {
        metadata: {
          ...stripeInvoice.metadata,
          xolo_invoice_id: xoloInvoice.id
        }
      });
    } catch (updateError) {
      console.warn('[Webhook Stripe] Errore aggiornamento metadata Stripe (non critico):', updateError);
    }
    
    return xoloInvoice;
  } catch (err) {
    console.error('[Webhook Stripe] Errore createXoloInvoice:', err);
    // Non bloccare il flusso se Xolo fallisce
  }
}

