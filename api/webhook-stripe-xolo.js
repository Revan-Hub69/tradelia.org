// /api/webhook-stripe-xolo.js
// API Vercel - Webhook Stripe → Xolo Go Integration
// Dopo pagamento Stripe, crea fattura automatica in Xolo Go

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { syncUserRoleFromSubscription } from './webhook-role-sync.js';

// Inizializza Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Inizializza Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Xolo API Configuration
const XOLO_API_KEY = process.env.XOLO_API_KEY;
const XOLO_API_URL = process.env.XOLO_API_URL || 'https://api.xolo.io/v1';

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
      console.error('[Webhook Stripe-Xolo] STRIPE_WEBHOOK_SECRET non configurato');
      return res.status(500).json({ error: 'Webhook secret non configurato' });
    }
    
    // Verifica signature Stripe
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('[Webhook Stripe-Xolo] Errore verifica signature:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
    
    console.log('[Webhook Stripe-Xolo] Evento ricevuto:', event.type);
    
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
      
      case 'invoice.payment_succeeded':
        // Quando un pagamento ha successo, crea fattura in Xolo
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.finalized':
        // Fattura finalizzata, assicurati che Xolo l'abbia ricevuta
        await handleInvoiceFinalized(event.data.object);
        break;
      
      default:
        console.log('[Webhook Stripe-Xolo] Evento non gestito:', event.type);
    }
    
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Webhook Stripe-Xolo] Errore:', err);
    return res.status(500).json({ error: 'Errore server', details: err.message });
  }
}

// ===== HANDLE SUBSCRIPTION =====
async function handleSubscription(subscription) {
  try {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const status = subscription.status;
    
    const customer = await stripe.customers.retrieve(customerId);
    const email = customer.email;
    
    if (!email) {
      console.error('[Webhook Stripe-Xolo] Email mancante nel customer Stripe');
      return;
    }
    
    // Estrai plan identifier
    const priceId = subscription.items?.data[0]?.price?.id;
    const productId = subscription.items?.data[0]?.price?.product;
    const planIdentifier = priceId || productId || subscription.plan?.id;
    
    const expiresAt = subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000) 
      : null;
    
    // Sincronizza ruolo in Supabase
    try {
      await syncUserRoleFromSubscription(email, status === 'active' ? 'active' : 'cancelled', planIdentifier, expiresAt);
      console.log('[Webhook Stripe-Xolo] ✅ Ruolo sincronizzato per:', email);
    } catch (roleSyncError) {
      console.error('[Webhook Stripe-Xolo] Errore sincronizzazione ruolo:', roleSyncError);
    }
  } catch (err) {
    console.error('[Webhook Stripe-Xolo] Errore handleSubscription:', err);
  }
}

// ===== HANDLE SUBSCRIPTION CANCELLED =====
async function handleSubscriptionCancelled(subscription) {
  try {
    const customerId = subscription.customer;
    const customer = await stripe.customers.retrieve(customerId);
    const email = customer.email;
    
    if (!email) return;
    
    const priceId = subscription.items?.data[0]?.price?.id;
    const planIdentifier = priceId || subscription.plan?.id;
    
    // Sincronizza ruolo (imposta scadenza)
    try {
      await syncUserRoleFromSubscription(email, 'cancelled', planIdentifier, new Date());
      console.log('[Webhook Stripe-Xolo] ✅ Ruolo scaduto per:', email);
    } catch (roleSyncError) {
      console.error('[Webhook Stripe-Xolo] Errore sincronizzazione ruolo:', roleSyncError);
    }
  } catch (err) {
    console.error('[Webhook Stripe-Xolo] Errore handleSubscriptionCancelled:', err);
  }
}

// ===== HANDLE PAYMENT SUCCEEDED =====
async function handlePaymentSucceeded(invoice) {
  try {
    const subscriptionId = invoice.subscription;
    
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await handleSubscription(subscription);
    }
    
    // Crea fattura in Xolo Go
    await createXoloInvoice(invoice);
  } catch (err) {
    console.error('[Webhook Stripe-Xolo] Errore handlePaymentSucceeded:', err);
  }
}

// ===== HANDLE INVOICE FINALIZED =====
async function handleInvoiceFinalized(invoice) {
  try {
    // Assicurati che Xolo abbia ricevuto la fattura
    // Se non è stata creata in handlePaymentSucceeded, creala ora
    const xoloInvoiceId = invoice.metadata?.xolo_invoice_id;
    
    if (!xoloInvoiceId) {
      console.log('[Webhook Stripe-Xolo] Fattura non ancora creata in Xolo, creando...');
      await createXoloInvoice(invoice);
    }
  } catch (err) {
    console.error('[Webhook Stripe-Xolo] Errore handleInvoiceFinalized:', err);
  }
}

// ===== CREATE XOLO INVOICE =====
async function createXoloInvoice(stripeInvoice) {
  try {
    if (!XOLO_API_KEY) {
      console.warn('[Webhook Stripe-Xolo] XOLO_API_KEY non configurato, salto creazione fattura Xolo');
      return;
    }
    
    // Recupera customer da Stripe
    const customerId = stripeInvoice.customer;
    const customer = await stripe.customers.retrieve(customerId);
    
    const amount = stripeInvoice.amount_paid / 100; // Converti da centesimi
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
      // Metadata per tracking
      metadata: {
        stripe_invoice_id: stripeInvoice.id,
        stripe_customer_id: customerId,
        source: 'tradelia_ai',
        subscription_id: stripeInvoice.subscription
      }
    };
    
    // Se è B2B, aggiungi Partita IVA
    if (isB2B && customerVatId) {
      xoloInvoiceData.customer_vat_id = customerVatId;
      xoloInvoiceData.invoice_type = 'invoice'; // Invoice invece di Receipt
    } else {
      xoloInvoiceData.invoice_type = 'receipt'; // Receipt per B2C
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
      console.error('[Webhook Stripe-Xolo] Errore API Xolo:', response.status, errorText);
      throw new Error(`Xolo API error: ${response.status} - ${errorText}`);
    }
    
    const xoloInvoice = await response.json();
    console.log('[Webhook Stripe-Xolo] ✅ Fattura Xolo creata:', {
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
      console.warn('[Webhook Stripe-Xolo] Errore aggiornamento metadata Stripe (non critico):', updateError);
    }
    
    return xoloInvoice;
  } catch (err) {
    console.error('[Webhook Stripe-Xolo] Errore createXoloInvoice:', err);
    // Non bloccare il flusso se Xolo fallisce
    // Il pagamento è già processato, la fattura può essere creata manualmente
    throw err;
  }
}

