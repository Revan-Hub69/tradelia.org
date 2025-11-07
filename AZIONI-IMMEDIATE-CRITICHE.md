# 🚨 Azioni Immediate - Problemi Critici

**Priorità:** ALTA  
**Tempo Stimato:** 2-4 ore  
**Data:** 2025-01-27

---

## 1. Rimuovere Chiavi API Hardcoded 🔴

### File da Modificare:

#### Backend (API Vercel)

**`api/check-subscription.js`**
```javascript
// ❌ RIMUOVERE
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://higkhlfjfhlecbtfnznx.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGci...';

// ✅ SOSTITUIRE CON
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Variabili ambiente Supabase non configurate');
}
```

**File Identici da Modificare:**
- `api/vote.js` (linee 8-9)
- `api/webhook-stripe.js` (linee 9-10)
- `api/webhook-paddle.js` (linee 10-11)
- `api/webhook-lemonsqueezy.js` (linee 7-8)
- `api/send-push.js` (linee 40-41, 118-119)

#### Frontend (Browser)

**`archivio/assets/js/supabase-config.js`**
```javascript
// ❌ RIMUOVERE valori hardcoded
export const SUPABASE_CONFIG = {
  url: 'https://higkhlfjfhlecbtfnznx.supabase.co',
  anonKey: 'eyJhbGci...'
};

// ✅ SOSTITUIRE CON (usare variabili build-time o endpoint API)
export const SUPABASE_CONFIG = {
  url: window.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  anonKey: window.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
};

if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
  console.error('Configurazione Supabase mancante');
}
```

**`archivio/assets/js/fcm-config.js`**
```javascript
// ❌ RIMUOVERE valori hardcoded
export const FCM_CONFIG = {
  apiKey: 'AIzaSyAC2x_9fjPBGdr8glort5EUXLQ40vIAQjg',
  projectId: 'tradelia-push',
  // ...
};

// ✅ SOSTITUIRE CON variabili build-time
export const FCM_CONFIG = {
  apiKey: window.FCM_API_KEY || process.env.VITE_FCM_API_KEY,
  projectId: window.FCM_PROJECT_ID || process.env.VITE_FCM_PROJECT_ID,
  // ...
};
```

### Variabili Ambiente da Configurare in Vercel:

```
SUPABASE_URL=https://higkhlfjfhlecbtfnznx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
FIREBASE_SERVICE_ACCOUNT={...}
FIREBASE_VAPID_PUBLIC_KEY=BGUfdP2IYXrvOwDYEqmRwhZqodiQB1CKeaLd1-oILrVCfgTW7n_mjCe3WQYzYXQw1dqgOtIRTOEfBHu6gj22Uc0
FIREBASE_VAPID_PRIVATE_KEY={...}
RESEND_API_KEY={...}
PUSH_API_KEY={...}
STRIPE_SECRET_KEY={...}
STRIPE_WEBHOOK_SECRET={...}
PADDLE_WEBHOOK_SECRET={...}
LEMONSQUEEZY_WEBHOOK_SECRET={...}
```

---

## 2. Implementare Salvataggio Push Subscriptions ⚠️

### File: `api/push-subscribe.js`

**Stato Attuale:**
```javascript
// TODO: Salva subscription in database (Supabase o Vercel KV)
// Per ora placeholder
console.log('[Push Subscribe] Subscription ricevuta:', {...});
```

**Implementazione Richiesta:**
```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  // ... codice esistente ...
  
  try {
    const { subscription, userId } = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Subscription richiesta' });
    }
    
    // Trova subscriber_id se userId è fornito
    let subscriberId = null;
    if (userId) {
      const { data: subscriber } = await supabase
        .from('subscribers')
        .select('id')
        .eq('auth_user_id', userId)
        .single();
      
      if (subscriber) {
        subscriberId = subscriber.id;
      }
    }
    
    // Verifica se subscription esiste già
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('subscription->>endpoint', subscription.endpoint)
      .single();
    
    if (existing) {
      // Aggiorna subscription esistente
      const { error } = await supabase
        .from('push_subscriptions')
        .update({
          subscription,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      
      if (error) {
        console.error('[Push Subscribe] Errore aggiornamento:', error);
        return res.status(500).json({ error: 'Errore aggiornamento subscription' });
      }
    } else {
      // Crea nuova subscription
      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: subscriberId,
          subscription
        });
      
      if (error) {
        console.error('[Push Subscribe] Errore creazione:', error);
        return res.status(500).json({ error: 'Errore creazione subscription' });
      }
    }
    
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Push Subscribe] Errore:', err);
    return res.status(500).json({ error: 'Errore server', details: err.message });
  }
}
```

---

## 3. Aggiungere Autenticazione a `send-email.js` ⚠️

### File: `api/send-email.js`

**Stato Attuale:** Nessuna autenticazione

**Implementazione Richiesta:**
```javascript
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Verifica autenticazione
  const authHeader = req.headers.authorization;
  const EMAIL_API_KEY = process.env.EMAIL_API_KEY;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  if (token !== EMAIL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ... resto del codice esistente ...
}
```

**Aggiungere in Vercel Environment Variables:**
```
EMAIL_API_KEY=your-secret-email-api-key-here
```

---

## 4. Implementare Verifica Signature Lemon Squeezy ⚠️

### File: `api/webhook-lemonsqueezy.js`

**Stato Attuale:** Verifica signature commentata

**Implementazione Richiesta:**
```javascript
import crypto from 'crypto';

function verifyLemonSqueezySignature(body, signature, secret) {
  try {
    // Lemon Squeezy usa HMAC SHA256
    const hmac = crypto.createHmac('sha256', secret);
    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    const calculatedSignature = hmac.update(payload).digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  } catch (err) {
    console.error('[Webhook Lemon Squeezy] Errore verifica signature:', err);
    return false;
  }
}

export default async function handler(req, res) {
  // ... codice esistente ...
  
  try {
    const signature = req.headers['x-signature'];
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const isValid = verifyLemonSqueezySignature(req.body, signature, webhookSecret);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }
    
    // ... resto del codice ...
  }
}
```

---

## 📋 Checklist Azioni Immediate

- [ ] Rimuovere chiavi hardcoded da tutti i file API backend
- [ ] Rimuovere chiavi hardcoded da file frontend (supabase-config.js, fcm-config.js)
- [ ] Configurare tutte le variabili ambiente in Vercel Dashboard
- [ ] Implementare salvataggio push subscriptions in `api/push-subscribe.js`
- [ ] Aggiungere autenticazione a `api/send-email.js`
- [ ] Implementare verifica signature Lemon Squeezy
- [ ] Testare tutti gli endpoint dopo le modifiche
- [ ] Verificare che le variabili ambiente siano configurate correttamente

---

## ⚠️ Note Importanti

1. **Non committare mai** le chiavi nel codice dopo le modifiche
2. **Verificare** che tutte le variabili ambiente siano configurate in Vercel prima del deploy
3. **Testare** ogni endpoint dopo le modifiche
4. **Backup** del codice attuale prima di modificare

---

**Tempo Totale Stimato:** 2-4 ore  
**Priorità:** CRITICA  
**Rischio se non completato:** ALTO (Sicurezza compromessa)
