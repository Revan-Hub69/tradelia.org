// /api/create-checkout-session.js
// API Vercel - Crea Stripe Checkout Session per abbonamenti

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

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
    const { priceId, userEmail, userId } = req.body;
    
    if (!priceId) {
      return res.status(400).json({ error: 'priceId è richiesto' });
    }
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[Checkout] STRIPE_SECRET_KEY non configurato');
      return res.status(500).json({ error: 'Stripe non configurato' });
    }
    
    // Crea checkout session
    const sessionParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin || 'https://tradelia.org'}/user?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://tradelia.org'}/pricing?canceled=true`,
      customer_email: userEmail,
      metadata: {
        user_id: userId || '',
        user_email: userEmail || '',
      },
      subscription_data: {
        metadata: {
          user_id: userId || '',
          user_email: userEmail || '',
        },
      },
    };
    
    // Se hai già un customer_id in Supabase, puoi passarlo qui
    // const customerId = await getStripeCustomerId(userId);
    // if (customerId) {
    //   sessionParams.customer = customerId;
    // }
    
    const session = await stripe.checkout.sessions.create(sessionParams);
    
    console.log('[Checkout] Session creata:', { sessionId: session.id, priceId, userEmail });
    
    return res.status(200).json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (err) {
    console.error('[Checkout] Errore:', err);
    return res.status(500).json({ 
      error: 'Errore creazione checkout', 
      details: err.message 
    });
  }
}

