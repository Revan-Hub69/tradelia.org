// ============================================
// WEBHOOK ROLE SYNC - Sincronizza user_roles da subscribers
// ============================================
// Funzione helper per aggiornare user_roles quando subscriber cambia status
// Da chiamare da webhook Stripe/Paddle/LemonSqueezy dopo aggiornamento subscriber
// ============================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere configurati');
}

// Client di servizio (service_role) per operazioni webhook (ruoli, crediti, pagamenti, fatture)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Mappa plan identifier a ruolo applicativo
 * @param {string|number} planIdentifier - ID piano da gateway (variant_id, product_id, plan_id)
 * @returns {string} - Ruolo applicativo ('trial', 'pro', 'institutional')
 */
export function mapPlanToRole(planIdentifier) {
  if (!planIdentifier) return null;
  
  const planStr = String(planIdentifier).toLowerCase();
  
  // Mapping esplicito per Lemon Squeezy Variant IDs
  // Variant IDs reali da Lemon Squeezy Dashboard
  const planMapping = {
    // Guest (nuovo utente senza piano)
    'guest': 'guest',
    
    // Trial (prova gratuita)
    'trial': 'trial',
    'free': 'trial',
    
    // Pro - Variant IDs Lemon Squeezy
    '1091082': 'pro',  // Piano Pro mensile
    '1091075': 'pro',  // Piano Pro annuale
    'pro': 'pro',
    'professional': 'pro',
    
    // Institutional/Desk - Variant IDs Lemon Squeezy
    '1091084': 'institutional',  // Piano Desk mensile
    '1091083': 'institutional',  // Piano Desk annuale
    'institutional': 'institutional',
    'desk': 'institutional',
    'enterprise': 'institutional',
    
    // Crediti (non sono ruoli, ma prodotti)
    '693409': null,   // 1 credito
    '1091060': null,  // 3 crediti
    '1091066': null,  // 7 crediti
  };
  
  // Cerca match esatto
  if (planMapping[planStr]) {
    return planMapping[planStr];
  }
  
  // Cerca match parziale
  for (const [key, role] of Object.entries(planMapping)) {
    if (planStr.includes(key)) {
      return role;
    }
  }
  
  // Default: prova a inferire dal nome
  if (planStr.includes('guest')) return 'guest';
  if (planStr.includes('trial') || planStr.includes('free')) return 'trial';
  if (planStr.includes('institutional') || planStr.includes('desk') || planStr.includes('enterprise')) return 'institutional';
  if (planStr.includes('pro') || planStr.includes('professional')) return 'pro';
  
  // Fallback: default a 'guest' (nuovo utente senza piano)
  console.warn(`[Role Sync] Plan identifier non riconosciuto: ${planIdentifier}, default a 'guest'`);
  return 'guest';
}

/**
 * Sincronizza user_roles da subscribers
 * @param {string} email - Email utente
 * @param {string} status - Status subscription ('active', 'cancelled', 'expired')
 * @param {string|number} planIdentifier - Identificatore piano da gateway
 * @param {Date} expiresAt - Data scadenza (opzionale)
 */
export async function syncUserRoleFromSubscription(email, status, planIdentifier, expiresAt = null) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere configurati');
    }
    
    // 1. Trova user_id da email usando SERVICE_ROLE_KEY
    const userId = await getUserIdByEmail(email);
    if (!userId) {
      console.warn(`[Role Sync] Utente non trovato per email: ${email} - potrebbe non essere ancora registrato`);
      return { success: false, reason: 'user_not_found', email };
    }
    
    // 2. Mappa plan identifier a ruolo
    const planType = mapPlanToRole(planIdentifier);
    if (!planType) {
      console.warn(`[Role Sync] Plan identifier non valido: ${planIdentifier}`);
      return { success: false, reason: 'invalid_plan' };
    }
    
    // 3. Se status è 'active', aggiorna/crea user_roles
    if (status === 'active' && planType) {
      const roleData = {
        user_id: userId,
        role: planType,
        valid_until: expiresAt ? (expiresAt instanceof Date ? expiresAt.toISOString() : expiresAt) : null
      };
      
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert(roleData, { onConflict: 'user_id' });
      
      if (roleError) {
        console.error('[Role Sync] Errore upsert user_roles:', roleError);
        throw roleError;
      }
      
      console.log(`[Role Sync] ✅ Ruolo aggiornato: ${email} → ${planType} (scadenza: ${expiresAt ? new Date(expiresAt).toISOString() : 'permanente'})`);
      
      // Se è institutional, assicurati che abbia record credits
      if (planType === 'institutional') {
        const { error: creditsError } = await supabase
          .from('user_analysis_credits')
          .upsert({
            user_id: user.id,
            credits_balance: 0,
            total_purchased: 0,
            total_used: 0
          }, { onConflict: 'user_id' });
        
        if (creditsError) {
          console.warn('[Role Sync] Errore creazione credits (non critico):', creditsError);
        }
      }
      
      return { success: true, user_id: userId, role: planType };
    }
    
    // 4. Se status è 'cancelled' o 'expired', imposta scadenza a oggi (non rimuoviamo ruolo)
    if (status === 'cancelled' || status === 'expired') {
      const now = new Date().toISOString();
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ valid_until: now })
        .eq('user_id', user.id);
      
      if (roleError && roleError.code !== 'PGRST116') {
        console.error('[Role Sync] Errore update user_roles (cancelled):', roleError);
        throw roleError;
      }
      
      console.log(`[Role Sync] ⚠️ Ruolo scaduto: ${email} (valid_until = ${now})`);
      return { success: true, user_id: userId, action: 'expired' };
    }
    
    return { success: true, action: 'no_change' };
  } catch (err) {
    console.error('[Role Sync] ❌ Errore:', err);
    throw err;
  }
}

/**
 * Restituisce user_id dato l'email usando l'admin API (service_role).
 * @param {string} email 
 * @returns {Promise<string|null>}
 */
export async function getUserIdByEmail(email) {
  if (!email) return null;
  
  try {
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('[Role Sync] Errore listUsers in getUserIdByEmail:', authError);
      throw authError;
    }
    
    const user = authUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    return user ? user.id : null;
  } catch (err) {
    console.error('[Role Sync] Errore getUserIdByEmail:', err);
    return null;
  }
}

/**
 * Registra un pagamento e, se disponibili i dati, anche la relativa fattura.
 * Usato dai webhook (Paddle, Xolo, ecc.) per alimentare la cronologia pagamenti.
 */
export async function recordPaymentAndInvoice({
  userId,
  gateway,
  amountCents,
  currency = 'EUR',
  status = 'succeeded',
  description = null,
  externalPaymentId = null,
  externalInvoiceId = null,
  invoiceNumber = null,
  issuedAt = null,
  pdfUrl = null,
  metadata = {}
}) {
  if (!userId || !gateway || amountCents == null) {
    console.warn('[Payments] Parametri insufficienti per recordPaymentAndInvoice', {
      userId,
      gateway,
      amountCents
    });
    return null;
  }
  
  try {
    // 1) Inserisci pagamento
    const paymentPayload = {
      user_id: userId,
      gateway,
      amount_cents: amountCents,
      currency,
      status,
      description,
      external_id: externalPaymentId,
      metadata
    };
    
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert(paymentPayload)
      .select('id')
      .single();
    
    if (paymentError) {
      console.error('[Payments] Errore inserimento pagamento:', paymentError);
      throw paymentError;
    }
    
    let invoice = null;
    
    // 2) Se esistono dati fattura, crea invoice collegata
    if (externalInvoiceId || invoiceNumber || pdfUrl) {
      const invoicePayload = {
        user_id: userId,
        payment_id: payment.id,
        gateway,
        external_id: externalInvoiceId,
        number: invoiceNumber,
        amount_cents: amountCents,
        currency,
        status: status === 'succeeded' ? 'paid' : 'issued',
        issued_at: issuedAt || new Date().toISOString(),
        pdf_url: pdfUrl,
        metadata
      };
      
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoicePayload)
        .select('id')
        .single();
      
      if (invoiceError) {
        console.error('[Payments] Errore inserimento invoice (non bloccante):', invoiceError);
      } else {
        invoice = invoiceData;
      }
    }
    
    console.log('[Payments] ✅ Pagamento registrato', { paymentId: payment.id, gateway, amountCents });
    return { paymentId: payment.id, invoiceId: invoice?.id || null };
  } catch (err) {
    console.error('[Payments] ❌ Errore recordPaymentAndInvoice:', err);
    throw err;
  }
}

/**
 * Calcola valid_until in base al tipo piano e durata
 * @param {string} planType - Tipo piano
 * @param {number} durationMonths - Durata in mesi (default: 1)
 */
export function calculateExpirationDate(planType, durationMonths = 1) {
  const now = new Date();
  const expiration = new Date(now);
  expiration.setMonth(expiration.getMonth() + durationMonths);
  return expiration;
}

