// /api/webhook-stripe.js
// API Vercel - Webhook Stripe per abbonamenti
// Alternativa a Lemon Squeezy - Legale, conforme, UX perfetta

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Inizializza Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://higkhlfjfhlecbtfnznx.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
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
    
    console.log('[Webhook] Subscription gestita:', { email, subscriptionId, status });
    
    // Mappa status Stripe a status nostro
    let mappedStatus = 'cancelled';
    if (status === 'active' || status === 'trialing') {
      mappedStatus = 'active';
    } else if (status === 'past_due' || status === 'unpaid') {
      mappedStatus = 'expired';
    }
    
    // Cerca subscriber esistente per email
    const { data: existingSubscriber, error: selectError } = await supabase
      .from('subscribers')
      .select('id, email, auth_user_id, status')
      .eq('email', email)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('[Webhook] Errore ricerca subscriber:', selectError);
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
        console.error('[Webhook] Errore aggiornamento subscriber:', updateError);
      } else {
        console.log('[Webhook] Subscriber aggiornato:', { id: existingSubscriber.id, email, status: mappedStatus });
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
        console.error('[Webhook] Errore creazione subscriber:', insertError);
      } else {
        console.log('[Webhook] Nuovo subscriber creato:', { id: newSubscriber.id, email, status: mappedStatus });
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
    
    console.log('[Webhook] Subscription cancellata:', { email, subscriptionId });
    
    if (!email) {
      console.error('[Webhook] Email mancante nel customer Stripe');
      return;
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
      console.error('[Webhook] Errore aggiornamento status subscriber:', updateError);
    } else {
      console.log('[Webhook] Subscriber cancellato:', { email });
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
    console.error('[Webhook] Errore handlePaymentFailed:', err);
  }
}

