// /api/webhook-lemonsqueezy.js
// API Vercel - Webhook Lemon Squeezy per abbonamenti

import { createClient } from '@supabase/supabase-js';
import { syncUserRoleFromSubscription, calculateExpirationDate } from './webhook-role-sync.js';

// Inizializza Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://higkhlfjfhlecbtfnznx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw';

// Usa SERVICE_ROLE_KEY per operazioni admin (listUsers, etc.)
const supabase = SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
      
      case 'subscription_payment_success':
        await handleSubscriptionPaymentSuccess(event.data);
        break;
      
      case 'subscription_payment_failed':
        await handleSubscriptionPaymentFailed(event.data);
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
    
    // Estrai plan identifier da LemonSqueezy (da variant_id o attributes)
    // LemonSqueezy invia variant_id o product_id che va mappato a ruolo
    const planIdentifier = data.attributes?.variant_id || 
                          data.attributes?.product_id ||
                          data.variant_id ||
                          data.product_id ||
                          data.metadata?.plan_type || 
                          data.metadata?.variant_id ||
                          null;
    
    // Log per debug
    console.log('[Webhook LemonSqueezy] Plan identifier:', planIdentifier, 'Data keys:', Object.keys(data));
    
    // Calcola scadenza (LemonSqueezy fornisce renews_at o expires_at)
    const expiryDate = data.attributes?.renews_at || data.attributes?.expires_at;
    const currentPeriodEnd = expiryDate 
      ? new Date(expiryDate)
      : calculateExpirationDate(planMetadata, 1);
    
    // Mappa status LemonSqueezy
    const mappedStatus = status === 'active' ? 'active' : status === 'cancelled' ? 'cancelled' : 'expired';
    
    // 2. Se subscriber esiste, aggiorna
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
    
    // Sincronizza user_roles (sempre, anche se subscriber update/insert fallisce)
    // Usa planIdentifier invece di planMetadata (ora viene mappato internamente)
    try {
      await syncUserRoleFromSubscription(email, mappedStatus, planIdentifier, currentPeriodEnd);
    } catch (roleSyncError) {
      console.error('[Webhook] Errore sincronizzazione ruolo:', roleSyncError);
      // Non bloccare il webhook se la sincronizzazione ruolo fallisce
    }
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
    
    // Sincronizza ruolo quando subscription viene cancellata
    if (email) {
      try {
        await syncUserRoleFromSubscription(email, 'cancelled', null, null);
      } catch (roleSyncError) {
        console.error('[Webhook] Errore sincronizzazione ruolo (cancelled):', roleSyncError);
      }
    }
  } catch (err) {
    console.error('[Webhook] Errore handleSubscriptionCancelled:', err);
  }
}

// ===== HANDLE SUBSCRIPTION PAYMENT SUCCESS =====
async function handleSubscriptionPaymentSuccess(data) {
  try {
    const email = data.attributes?.user_email || data.customer_email || data.attributes?.customer_email;
    const subscriptionId = data.attributes?.subscription_id || data.id;
    
    console.log('[Webhook Lemon Squeezy] Pagamento subscription riuscito:', { email, subscriptionId });
    
    if (!email) {
      console.error('[Webhook] Email mancante nei dati payment success');
      return;
    }
    
    // Aggiorna subscription come attiva
    await handleSubscription({
      ...data,
      attributes: {
        ...data.attributes,
        status: 'active'
      }
    });
  } catch (err) {
    console.error('[Webhook] Errore handleSubscriptionPaymentSuccess:', err);
  }
}

// ===== HANDLE SUBSCRIPTION PAYMENT FAILED =====
async function handleSubscriptionPaymentFailed(data) {
  try {
    const email = data.attributes?.user_email || data.customer_email || data.attributes?.customer_email;
    const subscriptionId = data.attributes?.subscription_id || data.id;
    
    console.log('[Webhook Lemon Squeezy] Pagamento subscription fallito:', { email, subscriptionId });
    
    if (!email) {
      console.error('[Webhook] Email mancante nei dati payment failed');
      return;
    }
    
    // Aggiorna subscription come past_due o expired
    const { error: updateError } = await supabase
      .from('subscribers')
      .update({
        status: 'expired',
        updated_at: new Date().toISOString()
      })
      .eq('email', email);
    
    if (updateError) {
      console.error('[Webhook] Errore aggiornamento subscriber (payment failed):', updateError);
    }
    
    // Sincronizza ruolo (imposta scadenza)
    try {
      await syncUserRoleFromSubscription(email, 'expired', null, new Date());
    } catch (roleSyncError) {
      console.error('[Webhook] Errore sincronizzazione ruolo (payment failed):', roleSyncError);
    }
  } catch (err) {
    console.error('[Webhook] Errore handleSubscriptionPaymentFailed:', err);
  }
}

// ===== HANDLE ORDER =====
async function handleOrder(data) {
  try {
    const email = data.attributes?.user_email || data.attributes?.customer_email || data.customer_email;
    const orderId = data.id || data.attributes?.id;
    
    console.log('[Webhook Lemon Squeezy] Ordine ricevuto:', { email, orderId });
    
    if (!email) {
      console.error('[Webhook] Email mancante nei dati ordine');
      return;
    }
    
    // Estrai variant_id dall'ordine per capire se sono crediti
    const orderItems = data.attributes?.order_items || data.order_items || [];
    const firstItem = orderItems[0];
    const variantId = firstItem?.variant_id || firstItem?.product_variant_id;
    
    // Variant IDs crediti
    const creditsVariantMap = {
      '693409': 1,    // 1 credito
      '1091060': 3,  // 3 crediti
      '1091066': 7   // 7 crediti
    };
    
    const creditsToAdd = creditsVariantMap[variantId];
    
    if (creditsToAdd) {
      // È un acquisto crediti - aggiorna crediti utente
      console.log('[Webhook Lemon Squeezy] Acquisto crediti rilevato:', { email, credits: creditsToAdd, variantId });
      
      // Trova user_id da email
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.error('[Webhook] Errore listUsers per crediti:', authError);
        return;
      }
      
      const user = authUsers.users.find(u => u.email?.toLowerCase() === email?.toLowerCase());
      if (!user) {
        console.warn('[Webhook] Utente non trovato per email (crediti):', email);
        return;
      }
      
      // Aggiorna crediti (incrementa balance)
      const { data: currentCredits, error: creditsSelectError } = await supabase
        .from('user_analysis_credits')
        .select('credits_balance, total_purchased')
        .eq('user_id', user.id)
        .single();
      
      if (creditsSelectError && creditsSelectError.code !== 'PGRST116') {
        console.error('[Webhook] Errore lettura crediti:', creditsSelectError);
        return;
      }
      
      const newBalance = (currentCredits?.credits_balance || 0) + creditsToAdd;
      const newTotalPurchased = (currentCredits?.total_purchased || 0) + creditsToAdd;
      
      const { error: creditsUpdateError } = await supabase
        .from('user_analysis_credits')
        .upsert({
          user_id: user.id,
          credits_balance: newBalance,
          total_purchased: newTotalPurchased,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (creditsUpdateError) {
        console.error('[Webhook] Errore aggiornamento crediti:', creditsUpdateError);
      } else {
        console.log('[Webhook Lemon Squeezy] ✅ Crediti aggiornati:', { 
          email, 
          creditsAdded: creditsToAdd, 
          newBalance 
        });
      }
    } else {
      // Altro tipo di ordine (report singolo, etc.)
      console.log('[Webhook] Ordine non-crediti ricevuto:', { email, orderId, variantId });
      // TODO: Gestisci ordine report singolo
      // 1. Identifica quale report è stato acquistato
      // 2. Genera token temporaneo
      // 3. Invia email con link report
    }
  } catch (err) {
    console.error('[Webhook] Errore handleOrder:', err);
  }
}

