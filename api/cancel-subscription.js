// /api/cancel-subscription.js
// API Vercel - Cancella subscription Stripe

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

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

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    const { userId, subscriptionId } = req.body;
    
    if (!subscriptionId && !userId) {
      return res.status(400).json({ error: 'subscriptionId o userId è richiesto' });
    }
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[Cancel] STRIPE_SECRET_KEY non configurato');
      return res.status(500).json({ error: 'Stripe non configurato' });
    }
    
    let stripeSubscriptionId = subscriptionId;
    
    // Se non hai subscriptionId, recuperalo da Supabase
    if (!stripeSubscriptionId && userId && supabase) {
      const { data: subscriber, error } = await supabase
        .from('subscribers')
        .select('subscription_id')
        .eq('auth_user_id', userId)
        .single();
      
      if (error || !subscriber?.subscription_id) {
        return res.status(404).json({ error: 'Subscription non trovata' });
      }
      
      stripeSubscriptionId = subscriber.subscription_id;
    }
    
    if (!stripeSubscriptionId) {
      return res.status(400).json({ error: 'Subscription ID non trovato' });
    }
    
    // Cancella subscription in Stripe (immediatamente o alla fine del periodo)
    const cancelAtPeriodEnd = req.body.cancelAtPeriodEnd !== false; // Default: cancella alla fine del periodo
    
    if (cancelAtPeriodEnd) {
      // Cancella alla fine del periodo corrente (utente mantiene accesso fino alla scadenza)
      const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      
      console.log('[Cancel] Subscription impostata per cancellazione alla fine del periodo:', stripeSubscriptionId);
      
      return res.status(200).json({ 
        success: true,
        canceled: false,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: subscription.current_period_end,
        message: 'Abbonamento verrà cancellato alla fine del periodo corrente'
      });
    } else {
      // Cancella immediatamente
      const subscription = await stripe.subscriptions.cancel(stripeSubscriptionId);
      
      console.log('[Cancel] Subscription cancellata immediatamente:', stripeSubscriptionId);
      
      // Il webhook gestirà l'aggiornamento di user_roles
      
      return res.status(200).json({ 
        success: true,
        canceled: true,
        message: 'Abbonamento cancellato immediatamente'
      });
    }
  } catch (err) {
    console.error('[Cancel] Errore:', err);
    return res.status(500).json({ 
      error: 'Errore cancellazione subscription', 
      details: err.message 
    });
  }
}

