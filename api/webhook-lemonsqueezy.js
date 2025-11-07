// /api/webhook-lemonsqueezy.js
// API Vercel - Webhook Lemon Squeezy per abbonamenti

import { createClient } from '@supabase/supabase-js';

// Inizializza Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://higkhlfjfhlecbtfnznx.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Signature');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    // Verifica signature Lemon Squeezy (opzionale ma consigliato)
    const signature = req.headers['x-signature'];
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      // TODO: Verifica signature
      // const isValid = verifySignature(req.body, signature, webhookSecret);
      // if (!isValid) return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const event = req.body;
    const eventType = event.meta?.event_name || event.type;
    
    console.log('[Webhook Lemon Squeezy] Evento ricevuto:', eventType);
    
    // Gestisci eventi Lemon Squeezy
    switch (eventType) {
      case 'subscription_created':
      case 'subscription_updated':
        await handleSubscription(event.data);
        break;
      
      case 'subscription_cancelled':
      case 'subscription_expired':
        await handleSubscriptionCancelled(event.data);
        break;
      
      case 'order_created':
        await handleOrder(event.data);
        break;
      
      default:
        console.log('[Webhook Lemon Squeezy] Evento non gestito:', eventType);
    }
    
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Webhook Lemon Squeezy] Errore:', err);
    return res.status(500).json({ error: 'Errore server', details: err.message });
  }
}

// ===== HANDLE SUBSCRIPTION =====
async function handleSubscription(data) {
  try {
    // data contiene: customer_email, subscription_id, status, ecc.
    const email = data.attributes?.user_email || data.customer_email || data.attributes?.customer_email;
    const subscriptionId = data.id || data.subscription_id || data.attributes?.id;
    const status = data.attributes?.status || 'active';
    
    console.log('[Webhook] Subscription gestita:', { email, subscriptionId, status });
    
    if (!email) {
      console.error('[Webhook] Email mancante nei dati subscription');
      return;
    }
    
    // 1. Cerca utente in Supabase Auth per email
    // Nota: Supabase Admin API richiede service role key, per ora usiamo subscribers table
    // Cerca subscriber esistente per email
    const { data: existingSubscriber, error: selectError } = await supabase
      .from('subscribers')
      .select('id, email, auth_user_id, status')
      .eq('email', email)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('[Webhook] Errore ricerca subscriber:', selectError);
    }
    
    // 2. Se subscriber esiste, aggiorna
    if (existingSubscriber) {
      const { error: updateError } = await supabase
        .from('subscribers')
        .update({
          subscription_id: subscriptionId,
          status: status === 'active' ? 'active' : status === 'cancelled' ? 'cancelled' : 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscriber.id);
      
      if (updateError) {
        console.error('[Webhook] Errore aggiornamento subscriber:', updateError);
      } else {
        console.log('[Webhook] Subscriber aggiornato:', { id: existingSubscriber.id, email, status });
      }
    } else {
      // 3. Se subscriber non esiste, crea nuovo record
      // Nota: auth_user_id sarà null se l'utente non ha ancora fatto login
      // Verrà collegato quando l'utente fa login con la stessa email
      const { data: newSubscriber, error: insertError } = await supabase
        .from('subscribers')
        .insert({
          email: email,
          subscription_id: subscriptionId,
          status: status === 'active' ? 'active' : status === 'cancelled' ? 'cancelled' : 'expired'
        })
        .select('id')
        .single();
      
      if (insertError) {
        console.error('[Webhook] Errore creazione subscriber:', insertError);
      } else {
        console.log('[Webhook] Nuovo subscriber creato:', { id: newSubscriber.id, email, status });
      }
    }
    
    // 4. TODO: Invia email di benvenuto (se nuovo) usando Resend
    // if (isNewSubscriber && status === 'active') {
    //   await sendWelcomeEmail(email);
    // }
  } catch (err) {
    console.error('[Webhook] Errore handleSubscription:', err);
  }
}

// ===== HANDLE SUBSCRIPTION CANCELLED =====
async function handleSubscriptionCancelled(data) {
  try {
    const email = data.attributes?.user_email || data.customer_email || data.attributes?.customer_email;
    const subscriptionId = data.id || data.subscription_id || data.attributes?.id;
    
    console.log('[Webhook] Subscription cancellata:', { email, subscriptionId });
    
    if (!email) {
      console.error('[Webhook] Email mancante nei dati subscription');
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

// ===== HANDLE ORDER =====
async function handleOrder(data) {
  // Gestisci ordini (report singoli su richiesta)
  const email = data.attributes?.user_email || data.customer_email;
  const orderId = data.id;
  
  console.log('[Webhook] Ordine ricevuto:', { email, orderId });
  
  // TODO: Gestisci ordine report singolo
  // 1. Identifica quale report è stato acquistato
  // 2. Genera token temporaneo
  // 3. Invia email con link report
}

