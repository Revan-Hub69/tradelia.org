import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;

// Lazy init Supabase client
let supabase = null;
function getSupabaseClient() {
  if (!supabase) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
  }
  return supabase;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function sendTokenEmail(email, token, role, validUntil) {
  if (!BREVO_API_KEY) {
    console.warn('[Create User] BREVO_API_KEY not set, skipping email');
    return;
  }
  
  const planNames = {
    'trial': 'Trial',
    'pro': 'Pro',
    'institutional': 'Desk / Institutional'
  };
  
  const expiryDate = new Date(validUntil).toLocaleDateString('it-IT');
  
  const emailBody = `
    <h2>Benvenuto su Tradelia!</h2>
    <p>Il tuo account è stato creato con successo.</p>
    <p><strong>Piano:</strong> ${planNames[role] || role}</p>
    <p><strong>Scadenza:</strong> ${expiryDate}</p>
    <p><strong>Token di accesso:</strong></p>
    <div style="background: #f5f5f5; padding: 1rem; border-radius: 4px; font-family: monospace; font-size: 1.2rem; margin: 1rem 0; text-align: center;">
      ${token}
    </div>
    <p>Usa questo token per accedere alla dashboard su <a href="https://tradelia.org/accesso.html">tradelia.org/accesso.html</a></p>
    <p style="color: #666; font-size: 0.9rem; margin-top: 2rem;">Se non hai richiesto questo account, ignora questa email.</p>
  `;
  
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Api-Key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Tradelia', email: 'noreply@tradelia.org' },
        to: [{ email }],
        subject: 'Token di accesso Tradelia',
        htmlContent: emailBody
      })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Brevo API error: ${res.status} - ${errorText}`);
    }
  } catch (err) {
    console.error('[Create User] Error sending email:', err);
    throw err;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  
  try {
    const { email, displayName, role, validUntil, credits = 0, sendEmail = true, isAdmin = false } = req.body;
    
    if (!email || !role || !validUntil) {
      return res.status(400).json({ ok: false, error: 'Missing required fields: email, role, validUntil' });
    }
    
    if (!['trial', 'pro', 'institutional'].includes(role)) {
      return res.status(400).json({ ok: false, error: 'Invalid role. Must be: trial, pro, institutional' });
    }
    
    const supabase = getSupabaseClient();
    
    // Genera token univoco
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    
    // Verifica valid_until è nel futuro
    const validUntilDate = new Date(validUntil);
    if (validUntilDate <= new Date()) {
      return res.status(400).json({ ok: false, error: 'validUntil must be in the future' });
    }
    
    // Se isAdmin=true, verifica che l'email sia in admin_emails
    if (isAdmin) {
      const { data: adminCheck, error: adminCheckError } = await supabase
        .from('admin_emails')
        .select('email')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (adminCheckError || !adminCheck) {
        return res.status(403).json({ ok: false, error: 'Email non autorizzata per token admin' });
      }
      // Forza ruolo institutional per admin
      role = 'institutional';
    }
    
    // 1. Crea/aggiorna user_role
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        email: email.toLowerCase(),
        role,
        valid_until: validUntilDate.toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      });
    
    if (roleError) {
      console.error('[Create User] Error upserting user_role:', roleError);
      return res.status(500).json({ ok: false, error: 'Error creating user role: ' + roleError.message });
    }
    
    // 2. Crea dashboard_access_token
    // Revoca vecchi token per questa email
    await supabase
      .from('dashboard_access_tokens')
      .update({ revoked: true, revoked_at: new Date().toISOString() })
      .eq('email', email.toLowerCase())
      .eq('revoked', false);
    
    // Inserisci nuovo token
    const { error: tokenError } = await supabase
      .from('dashboard_access_tokens')
      .insert({
        email: email.toLowerCase(),
        token_hash: tokenHash,
        plan_role: role,
        valid_from: new Date().toISOString(),
        valid_until: validUntilDate.toISOString(),
        source: 'manual',
        metadata: {
          created_by: 'admin_dashboard',
          display_name: displayName || null
        }
      });
    
    if (tokenError) {
      console.error('[Create User] Error creating token:', tokenError);
      return res.status(500).json({ ok: false, error: 'Error creating access token: ' + tokenError.message });
    }
    
    // 3. Se institutional, aggiungi crediti
    if (role === 'institutional' && credits > 0) {
      // Cerca user_id da subscribers o user_profiles
      let userId = null;
      const { data: subscriber } = await supabase
        .from('subscribers')
        .select('auth_user_id')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (subscriber?.auth_user_id) {
        userId = subscriber.auth_user_id;
      }
      
      if (userId) {
        const { error: creditsError } = await supabase
          .from('user_analysis_credits')
          .upsert({
            user_id: userId,
            credits_balance: credits,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        if (creditsError) {
          console.error('[Create User] Error updating credits:', creditsError);
          // Non blocchiamo se i crediti falliscono
        }
      }
    }
    
    // 4. Se displayName, aggiorna user_profiles (se esiste user_id)
    if (displayName) {
      // Cerca user_id
      let userId = null;
      const { data: subscriber } = await supabase
        .from('subscribers')
        .select('auth_user_id')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (subscriber?.auth_user_id) {
        userId = subscriber.auth_user_id;
      }
      
      if (userId) {
        await supabase
          .from('user_profiles')
          .upsert({
            user_id: userId,
            display_name: displayName,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
      }
    }
    
    // 5. Invia email con token (se richiesto)
    if (sendEmail) {
      try {
        await sendTokenEmail(email, token, role, validUntil);
      } catch (emailErr) {
        console.error('[Create User] Error sending email:', emailErr);
        // Non blocchiamo se l'email fallisce, ma restituiamo il token
      }
    }
    
    return res.status(200).json({
      ok: true,
      token: sendEmail ? undefined : token, // Restituisci token solo se email non inviata
      email,
      role,
      validUntil: validUntilDate.toISOString()
    });
    
  } catch (err) {
    console.error('[Create User] Unexpected error:', err);
    return res.status(500).json({ ok: false, error: err.message || 'Internal server error' });
  }
}

