// /api/webhook-stripe.js
// API Vercel - Webhook Stripe per abbonamenti
// Best practices accademiche: validazione firma, idempotenza, logging strutturato
// Riferimenti: Stripe Webhooks Best Practices (2025), PCI DSS compliance

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { syncUserRoleFromSubscription, recordPaymentAndInvoice, getUserIdByEmail } from './webhook-role-sync.js';

// Inizializza Supabase con service role per operazioni webhook
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://higkhlfjfhlecbtfnznx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Inizializza Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Mapping Stripe Price IDs a ruoli applicativi
 * 
 * CONFIGURAZIONE:
 * 1. Vai su Stripe Dashboard > Products > Crea/Seleziona Product
 * 2. Crea Price per Piano Pro (€29/mese) - copia il Price ID (es. price_1ABC...)
 * 3. Crea Price per Piano Desk (€149/mese) - copia il Price ID (es. price_1XYZ...)
 * 4. Aggiungi i Price IDs qui sotto
 * 
 * Esempio:
 * const STRIPE_PRICE_TO_ROLE = {
 *   'price_1ABC123def456': 'pro',           // Piano Pro mensile
 *   'price_1XYZ789ghi012': 'institutional', // Piano Desk mensile
 * };
 */
const STRIPE_PRICE_TO_ROLE = {
  // TODO: Aggiungi i tuoi Stripe Price IDs qui
  // 'price_XXXXXXXXXXXXX': 'pro',
  // 'price_YYYYYYYYYYYYY': 'institutional',
};

// Cache eventi processati per idempotenza (in produzione usa Redis o DB)
const processedEvents = new Set();

/**
 * Logging strutturato per audit trail
 */
function logWebhookEvent(type, eventId, status, details = {}) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    timestamp,
    service: 'stripe-webhook',
    event_type: type,
    event_id: eventId,
    status,
    ...details
  }));
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    logWebhookEvent('invalid_method', null, 'error', { method: req.method });
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      logWebhookEvent('config_error', null, 'error', { message: 'STRIPE_WEBHOOK_SECRET non configurato' });
      return res.status(500).json({ error: 'Webhook secret non configurato' });
    }
    
    // IMPORTANTE: Per Vercel/serverless, req.body è già una stringa JSON
    // Per validazione firma Stripe serve il raw body
    // Se usi Vercel, configura vercel.json per passare raw body
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    
    // Verifica signature Stripe (best practice: sempre validare)
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      logWebhookEvent('signature_verification_failed', null, 'error', { 
        message: err.message,
        signature: sig ? 'present' : 'missing'
      });
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
    
    // Idempotenza: verifica se evento già processato
    if (processedEvents.has(event.id)) {
      logWebhookEvent(event.type, event.id, 'duplicate', { message: 'Evento già processato' });
      return res.status(200).json({ received: true, duplicate: true });
    }
    
    logWebhookEvent(event.type, event.id, 'received', { 
      livemode: event.livemode,
      created: event.created 
    });
    
    // Gestisci eventi Stripe (idempotente)
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscription(event.data.object, event.id);
          break;
        
        case 'customer.subscription.deleted':
        case 'customer.subscription.paused':
          await handleSubscriptionCancelled(event.data.object, event.id);
          break;
        
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object, event.id);
          break;
        
        case 'invoice.payment_succeeded':
          await handlePaymentSucceeded(event.data.object, event.id);
          break;
        
        case 'invoice.payment_failed':
          await handlePaymentFailed(event.data.object, event.id);
          break;
        
        case 'invoice.finalized':
          await handleInvoiceFinalized(event.data.object, event.id);
          break;
        
        default:
          logWebhookEvent(event.type, event.id, 'unhandled', { message: 'Evento non gestito' });
      }
      
      // Marca evento come processato (in produzione usa TTL o DB)
      processedEvents.add(event.id);
      
      logWebhookEvent(event.type, event.id, 'success', { message: 'Evento processato correttamente' });
      return res.status(200).json({ received: true, event_id: event.id });
      
    } catch (handlerError) {
      logWebhookEvent(event.type, event.id, 'handler_error', { 
        error: handlerError.message,
        stack: handlerError.stack 
      });
      // Restituisci 200 per evitare retry infiniti, ma logga l'errore
      return res.status(200).json({ received: true, error: 'Handler error logged' });
    }
    
  } catch (err) {
    logWebhookEvent('unexpected_error', null, 'error', { 
      error: err.message,
      stack: err.stack 
    });
    return res.status(500).json({ error: 'Errore server', details: err.message });
  }
}

/**
 * Mappa Stripe Price ID a ruolo applicativo
 * @param {string} priceId - Stripe Price ID
 * @returns {string|null} - Ruolo ('pro', 'institutional') o null
 */
function mapStripePriceToRole(priceId) {
  if (!priceId) return null;
  
  // Usa mapping configurato
  if (STRIPE_PRICE_TO_ROLE[priceId]) {
    return STRIPE_PRICE_TO_ROLE[priceId];
  }
  
  // Fallback: inferisci da nome price (se disponibile)
  // In produzione, recupera price da Stripe API per nome
  const priceStr = String(priceId).toLowerCase();
  if (priceStr.includes('pro')) return 'pro';
  if (priceStr.includes('desk') || priceStr.includes('institutional')) return 'institutional';
  
  return null;
}

// ===== HANDLE SUBSCRIPTION =====
async function handleSubscription(subscription, eventId) {
  try {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const status = subscription.status; // active, canceled, past_due, etc.
    
    logWebhookEvent('handle_subscription', eventId, 'processing', { 
      subscriptionId, 
      customerId, 
      status 
    });
    
    // Recupera customer da Stripe per ottenere email
    const customer = await stripe.customers.retrieve(customerId);
    const email = customer.email;
    
    if (!email) {
      logWebhookEvent('handle_subscription', eventId, 'error', { 
        message: 'Email mancante nel customer Stripe',
        customerId 
      });
      return;
    }
    
    // Mappa status Stripe a status nostro
    let mappedStatus = 'cancelled';
    if (status === 'active' || status === 'trialing') {
      mappedStatus = 'active';
    } else if (status === 'past_due' || status === 'unpaid') {
      mappedStatus = 'expired';
    }
    
    // Estrai plan identifier da subscription (price_id)
    const priceId = subscription.items?.data[0]?.price?.id;
    const productId = subscription.items?.data[0]?.price?.product;
    
    // Mappa Price ID a ruolo usando mapping configurato
    const planRole = mapStripePriceToRole(priceId);
    const planIdentifier = priceId || productId;
    
    // Calcola scadenza
    const expiresAt = subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000) 
      : null;
    
    logWebhookEvent('handle_subscription', eventId, 'details', { 
      email, 
      priceId, 
      planRole, 
      mappedStatus,
      expiresAt: expiresAt?.toISOString() 
    });
    
    // Sincronizza ruolo utente usando webhook-role-sync
    try {
      // Usa planRole se disponibile, altrimenti planIdentifier
      const roleIdentifier = planRole || planIdentifier;
      await syncUserRoleFromSubscription(email, mappedStatus, roleIdentifier, expiresAt);
      logWebhookEvent('handle_subscription', eventId, 'role_synced', { email, role: planRole });
    } catch (roleSyncError) {
      logWebhookEvent('handle_subscription', eventId, 'role_sync_error', { 
        email, 
        error: roleSyncError.message 
      });
    }
    
    // Aggiorna anche subscribers table (per compatibilità)
    const { data: existingSubscriber, error: selectError } = await supabase
      .from('subscribers')
      .select('id, email, auth_user_id, status')
      .eq('email', email)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      logWebhookEvent('handle_subscription', eventId, 'select_error', { 
        error: selectError.message 
      });
    }
    
    // Se subscriber esiste, aggiorna
    if (existingSubscriber) {
      const { error: updateError } = await supabase
        .from('subscribers')
        .update({
          subscription_id: subscriptionId,
          status: mappedStatus,
          gateway: 'stripe',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscriber.id);
      
      if (updateError) {
        logWebhookEvent('handle_subscription', eventId, 'update_error', { 
          error: updateError.message 
        });
      } else {
        logWebhookEvent('handle_subscription', eventId, 'subscriber_updated', { 
          subscriberId: existingSubscriber.id, 
          email, 
          status: mappedStatus 
        });
      }
    } else {
      // Se subscriber non esiste, crea nuovo record
      const { data: newSubscriber, error: insertError } = await supabase
        .from('subscribers')
        .insert({
          email: email,
          subscription_id: subscriptionId,
          status: mappedStatus,
          gateway: 'stripe'
        })
        .select('id')
        .single();
      
      if (insertError) {
        logWebhookEvent('handle_subscription', eventId, 'insert_error', { 
          error: insertError.message 
        });
      } else {
        logWebhookEvent('handle_subscription', eventId, 'subscriber_created', { 
          subscriberId: newSubscriber.id, 
          email, 
          status: mappedStatus 
        });
      }
    }
  } catch (err) {
    logWebhookEvent('handle_subscription', eventId, 'error', { 
      error: err.message,
      stack: err.stack 
    });
    throw err; // Rilancia per gestione errori nel handler principale
  }
}

// ===== HANDLE SUBSCRIPTION CANCELLED =====
async function handleSubscriptionCancelled(subscription, eventId) {
  try {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    
    logWebhookEvent('handle_subscription_cancelled', eventId, 'processing', { 
      subscriptionId, 
      customerId 
    });
    
    // Recupera customer da Stripe per ottenere email
    const customer = await stripe.customers.retrieve(customerId);
    const email = customer.email;
    
    if (!email) {
      logWebhookEvent('handle_subscription_cancelled', eventId, 'error', { 
        message: 'Email mancante nel customer Stripe',
        customerId 
      });
      return;
    }
    
    // Estrai plan identifier per sincronizzazione
    const priceId = subscription.items?.data[0]?.price?.id;
    const productId = subscription.items?.data[0]?.price?.product;
    const planRole = mapStripePriceToRole(priceId);
    const planIdentifier = planRole || priceId || productId;
    
    // Sincronizza ruolo utente (imposta scadenza)
    try {
      await syncUserRoleFromSubscription(email, 'cancelled', planIdentifier, new Date());
      logWebhookEvent('handle_subscription_cancelled', eventId, 'role_expired', { email });
    } catch (roleSyncError) {
      logWebhookEvent('handle_subscription_cancelled', eventId, 'role_sync_error', { 
        email, 
        error: roleSyncError.message 
      });
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
      logWebhookEvent('handle_subscription_cancelled', eventId, 'update_error', { 
        error: updateError.message 
      });
    } else {
      logWebhookEvent('handle_subscription_cancelled', eventId, 'subscriber_cancelled', { email });
    }
  } catch (err) {
    logWebhookEvent('handle_subscription_cancelled', eventId, 'error', { 
      error: err.message,
      stack: err.stack 
    });
    throw err;
  }
}

// ===== HANDLE CHECKOUT COMPLETED =====
async function handleCheckoutCompleted(session, eventId) {
  try {
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    
    logWebhookEvent('handle_checkout_completed', eventId, 'processing', { 
      customerId, 
      subscriptionId,
      sessionId: session.id 
    });
    
    // Se c'è una subscription, gestiscila (customer.subscription.created verrà chiamato anche)
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await handleSubscription(subscription, eventId);
      logWebhookEvent('handle_checkout_completed', eventId, 'subscription_handled', { 
        subscriptionId 
      });
    } else {
      logWebhookEvent('handle_checkout_completed', eventId, 'no_subscription', { 
        message: 'Checkout senza subscription (one-time payment?)' 
      });
    }
  } catch (err) {
    logWebhookEvent('handle_checkout_completed', eventId, 'error', { 
      error: err.message,
      stack: err.stack 
    });
    throw err;
  }
}

// ===== HANDLE PAYMENT SUCCEEDED =====
async function handlePaymentSucceeded(invoice, eventId) {
  try {
    const subscriptionId = invoice.subscription;
    const customerId = invoice.customer;
    const amountPaid = invoice.amount_paid; // in centesimi
    const currency = invoice.currency;
    
    logWebhookEvent('handle_payment_succeeded', eventId, 'processing', { 
      invoiceId: invoice.id,
      subscriptionId, 
      customerId,
      amount: amountPaid / 100,
      currency 
    });
    
    // Recupera customer per email
    const customer = await stripe.customers.retrieve(customerId);
    const email = customer.email;
    
    if (subscriptionId) {
      // Aggiorna subscription
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await handleSubscription(subscription, eventId);
    }
    
    // Registra pagamento in Supabase (se email disponibile)
    if (email && amountPaid > 0) {
      try {
        const userId = await getUserIdByEmail(email);
        if (userId) {
          await recordPaymentAndInvoice({
            userId,
            gateway: 'stripe',
            amountCents: amountPaid,
            currency: currency.toUpperCase(),
            status: 'succeeded',
            description: `Abbonamento Tradelia - ${invoice.description || 'Mensile'}`,
            externalPaymentId: invoice.payment_intent,
            externalInvoiceId: invoice.id,
            invoiceNumber: invoice.number,
            issuedAt: new Date(invoice.created * 1000).toISOString(),
            pdfUrl: invoice.invoice_pdf,
            metadata: {
              subscription_id: subscriptionId,
              invoice_id: invoice.id
            }
          });
          logWebhookEvent('handle_payment_succeeded', eventId, 'payment_recorded', { 
            email, 
            amount: amountPaid / 100 
          });
        }
      } catch (paymentRecordError) {
        logWebhookEvent('handle_payment_succeeded', eventId, 'payment_record_error', { 
          error: paymentRecordError.message 
        });
      }
    }
  } catch (err) {
    logWebhookEvent('handle_payment_succeeded', eventId, 'error', { 
      error: err.message,
      stack: err.stack 
    });
    throw err;
  }
}

// ===== HANDLE PAYMENT FAILED =====
async function handlePaymentFailed(invoice, eventId) {
  try {
    const subscriptionId = invoice.subscription;
    const customerId = invoice.customer;
    
    logWebhookEvent('handle_payment_failed', eventId, 'processing', { 
      invoiceId: invoice.id,
      subscriptionId, 
      customerId,
      attemptCount: invoice.attempt_count 
    });
    
    if (subscriptionId) {
      // Aggiorna subscription (status diventerà past_due o unpaid)
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await handleSubscription(subscription, eventId);
    }
    
    // Opzionale: invia notifica email all'utente (da implementare)
    logWebhookEvent('handle_payment_failed', eventId, 'handled', { 
      message: 'Payment failed - subscription status updated' 
    });
  } catch (err) {
    logWebhookEvent('handle_payment_failed', eventId, 'error', { 
      error: err.message,
      stack: err.stack 
    });
    throw err;
  }
}

// ===== HANDLE INVOICE FINALIZED =====
async function handleInvoiceFinalized(invoice, eventId) {
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
    
    logWebhookEvent('handle_invoice_finalized', eventId, 'processed', {
      invoiceId,
      email,
      amount: `${amount} ${currency}`,
      invoiceUrl: invoiceUrl ? 'present' : 'missing',
      invoicePdf: invoicePdf ? 'present' : 'missing'
    });
    
    // Opzionale: Salva info fattura in Supabase per tracking
    if (email) {
      const { error } = await supabase
        .from('subscribers')
        .update({
          last_invoice_id: invoiceId,
          last_invoice_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('email', email);
      
      if (error) {
        logWebhookEvent('handle_invoice_finalized', eventId, 'update_warning', { 
          error: error.message,
          message: 'Non critico' 
        });
      } else {
        logWebhookEvent('handle_invoice_finalized', eventId, 'invoice_tracked', { email });
      }
    }
  } catch (err) {
    logWebhookEvent('handle_invoice_finalized', eventId, 'error', { 
      error: err.message,
      stack: err.stack 
    });
    throw err;
  }
}

