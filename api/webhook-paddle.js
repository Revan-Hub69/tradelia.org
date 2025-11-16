// /api/webhook-paddle.js
// API Vercel - Webhook Paddle per abbonamenti
// Paddle gestisce automaticamente IVA/VAT, fatturazione, compliance fiscale
// Legale, conforme, UX perfetta, gestione fiscale automatica

import { createClient } from '@supabase/supabase-js';
import { 
  syncUserRoleFromSubscription, 
  calculateExpirationDate,
  getUserIdByEmail,
  recordPaymentAndInvoice
} from './webhook-role-sync.js';
import crypto from 'crypto';

// Inizializza Supabase (può usare anche service_role se configurato)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://higkhlfjfhlecbtfnznx.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Paddle-Signature');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  try {
    // Verifica signature Paddle
    const signature = req.headers['paddle-signature'];
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('[Webhook Paddle] PADDLE_WEBHOOK_SECRET non configurato');
      return res.status(500).json({ error: 'Webhook secret non configurato' });
    }
    
    // Verifica signature Paddle
    if (signature) {
      const isValid = verifyPaddleSignature(req.body, signature, webhookSecret);
      if (!isValid) {
        console.error('[Webhook Paddle] Signature non valida');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }
    
    const event = req.body;
    const eventType = event.event_type || event.alert_name;
    
    console.log('[Webhook Paddle] Evento ricevuto:', eventType);
    
    // Gestisci eventi Paddle
    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.activated':
        await handleSubscription(event);
        break;
      
      case 'subscription.cancelled':
      case 'subscription.past_due':
      case 'subscription.payment_failed':
        await handleSubscriptionCancelled(event);
        break;
      
      case 'subscription.payment_succeeded':
        await handlePaymentSucceeded(event);
        break;
      
      case 'transaction.completed':
        await handleTransactionCompleted(event);
        break;
      
      default:
        console.log('[Webhook Paddle] Evento non gestito:', eventType);
    }
    
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Webhook Paddle] Errore:', err);
    return res.status(500).json({ error: 'Errore server', details: err.message });
  }
}

// ===== VERIFY PADDLE SIGNATURE =====
function verifyPaddleSignature(body, signature, secret) {
  try {
    // Paddle usa HMAC SHA256 per firmare i webhook
    const hmac = crypto.createHmac('sha256', secret);
    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    const calculatedSignature = hmac.update(payload).digest('hex');
    
    // Paddle invia la signature come stringa esadecimale
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  } catch (err) {
    console.error('[Webhook Paddle] Errore verifica signature:', err);
    return false;
  }
}

// ===== HANDLE SUBSCRIPTION =====
async function handleSubscription(event) {
  try {
    // event contiene: email, subscription_id, status, ecc.
    const email = event.email || event.customer_email || event.data?.email;
    const subscriptionId = event.subscription_id || event.data?.subscription_id;
    const status = event.status || event.data?.status || 'active';
    
    console.log('[Webhook] Subscription gestita:', { email, subscriptionId, status });
    
    if (!email) {
      console.error('[Webhook] Email mancante nei dati subscription');
      return;
    }
    
    // Mappa status Paddle a status nostro
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
    
    // Estrai plan type da Paddle event (da subscription plan o metadata)
    // Paddle invia plan_id o product_id che va mappato a ruolo
    const planIdentifier = event.plan_id || 
                          event.subscription_plan_id || 
                          event.product_id ||
                          event.metadata?.plan_type || 
                          event.metadata?.plan_id ||
                          null;
    
    // Log per debug
    console.log('[Webhook Paddle] Plan identifier:', planIdentifier, 'Event keys:', Object.keys(event));
    
    // Calcola scadenza (Paddle fornisce next_bill_date o expiry_date)
    const expiryDate = event.next_bill_date || event.expiry_date;
    const currentPeriodEnd = expiryDate 
      ? new Date(expiryDate)
      : calculateExpirationDate(planMetadata, 1);
    
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
async function handleSubscriptionCancelled(event) {
  try {
    const email = event.email || event.customer_email || event.data?.email;
    const subscriptionId = event.subscription_id || event.data?.subscription_id;
    
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

// ===== HANDLE PAYMENT SUCCEEDED =====
async function handlePaymentSucceeded(event) {
  try {
    // Quando un pagamento ha successo:
    // 1) Assicura che la subscription sia attiva
    // 2) Registra il pagamento (e opzionalmente la fattura) in Supabase
    const subscriptionId = event.subscription_id || event.data?.subscription_id;
    const email = event.email || event.customer_email || event.data?.email;
    const amount = event.amount || event.data?.amount;
    const currency = event.currency || event.data?.currency || 'EUR';
    
    if (subscriptionId && email) {
      await handleSubscription({
        email,
        subscription_id: subscriptionId,
        status: 'active'
      });
    }
    
    // Registra pagamento solo se abbiamo l'email (per risalire all'utente)
    if (email && amount) {
      const userId = await getUserIdByEmail(email);
      if (!userId) {
        console.warn('[Webhook Paddle] Impossibile registrare pagamento: userId non trovato per', email);
        return;
      }
      
      const amountCents = Math.round(parseFloat(amount) * 100);
      const description = 'Pagamento abbonamento Paddle';
      const externalPaymentId = event.transaction_id || event.event_id || event.alert_id || subscriptionId || null;
      
      await recordPaymentAndInvoice({
        userId,
        gateway: 'paddle',
        amountCents: isNaN(amountCents) ? 0 : amountCents,
        currency,
        status: 'succeeded',
        description,
        externalPaymentId,
        externalInvoiceId: null, // potrà essere valorizzato in futuro se Paddle invia ID fattura
        invoiceNumber: null,
        issuedAt: event.payout_date || event.event_time || null,
        pdfUrl: null,
        metadata: event
      });
    }
  } catch (err) {
    console.error('[Webhook] Errore handlePaymentSucceeded:', err);
  }
}

// ===== HANDLE TRANSACTION COMPLETED =====
async function handleTransactionCompleted(event) {
  try {
    // Gestisci transazione completata (es. acquisti one-off, crediti, ecc.)
    const subscriptionId = event.subscription_id || event.data?.subscription_id;
    const email = event.email || event.customer_email || event.data?.email;
    const amount = event.amount || event.data?.amount;
    const currency = event.currency || event.data?.currency || 'EUR';
    
    console.log('[Webhook] Transazione completata:', { email, subscriptionId, amount, currency });
    
    if (email && amount) {
      const userId = await getUserIdByEmail(email);
      if (!userId) {
        console.warn('[Webhook Paddle] Impossibile registrare transaction.completed: userId non trovato per', email);
        return;
      }
      
      const amountCents = Math.round(parseFloat(amount) * 100);
      const description = 'Transazione Paddle completata';
      const externalPaymentId = event.transaction_id || event.event_id || event.alert_id || subscriptionId || null;
      
      await recordPaymentAndInvoice({
        userId,
        gateway: 'paddle',
        amountCents: isNaN(amountCents) ? 0 : amountCents,
        currency,
        status: 'succeeded',
        description,
        externalPaymentId,
        externalInvoiceId: null,
        invoiceNumber: null,
        issuedAt: event.payout_date || event.event_time || null,
        pdfUrl: null,
        metadata: event
      });
    }
  } catch (err) {
    console.error('[Webhook] Errore handleTransactionCompleted:', err);
  }
}

