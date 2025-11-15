// Paddle Checkout Integration
// Gestisce checkout per abbonamenti tramite Paddle
// Xolo Go gestisce fatturazione per account business

/**
 * Apre checkout Paddle per abbonamento
 * @param {string} planId - ID piano Paddle (es. 'pro-monthly', 'desk-monthly')
 * @param {string} userEmail - Email utente
 * @param {string} userName - Nome utente (opzionale)
 */
export function openPaddleCheckout(planId, userEmail, userName = '') {
  if (!planId) {
    console.error('[Paddle] planId mancante');
    if (window.showToast) {
      window.showToast('Errore: piano non configurato. Contatta il supporto.', 'error');
    } else {
      alert('Errore configurazione. Contatta il supporto.');
    }
    return;
  }

  // Paddle Checkout Overlay (metodo moderno)
  // Paddle.init() deve essere chiamato prima in pricing.html
  
  if (!window.Paddle) {
    console.error('[Paddle] Paddle SDK non caricato');
    if (window.showToast) {
      window.showToast('Errore configurazione pagamenti. Contatta il supporto.', 'error');
    } else {
      alert('Errore configurazione pagamenti. Contatta il supporto.');
    }
    return;
  }

  try {
    // Apri checkout overlay Paddle
    window.Paddle.Checkout.open({
      items: [{ priceId: planId, quantity: 1 }],
      customer: {
        email: userEmail || undefined,
        name: userName || undefined
      },
      customData: {
        user_id: window.state?.user?.id || '',
        source: 'tradelia_user_area'
      },
      settings: {
        successUrl: `${window.location.origin}/user/index.html?checkout=success`,
        theme: 'dark',
        locale: 'it'
      }
    });
  } catch (err) {
    console.error('[Paddle] Errore apertura checkout', err);
    if (window.showToast) {
      window.showToast('Errore durante l\'apertura del checkout. Contatta il supporto.', 'error');
    } else {
      alert('Errore durante l\'apertura del checkout.');
    }
  }
}

/**
 * Mappa ruoli a price IDs abbonamenti Paddle
 */
export const PADDLE_PRICE_IDS = {
  pro: {
    monthly: 'pri_01hqjf8y3y4vqk8n7k9x1z2w3e',  // TODO: Sostituisci con Price ID reale Pro mensile
    yearly: 'pri_01hqjf8y3y4vqk8n7k9x1z2w4'   // TODO: Sostituisci con Price ID reale Pro annuale
  },
  institutional: {
    monthly: 'pri_01hqjf8y3y4vqk8n7k9x1z2w5',  // TODO: Sostituisci con Price ID reale Desk mensile
    yearly: 'pri_01hqjf8y3y4vqk8n7k9x1z2w6'   // TODO: Sostituisci con Price ID reale Desk annuale
  }
};

/**
 * Apre checkout per upgrade abbonamento
 * @param {string} targetRole - 'pro' o 'institutional'
 * @param {string} userEmail - Email utente
 * @param {string} userName - Nome utente (opzionale)
 * @param {string} billingPeriod - 'monthly' o 'yearly' (default: 'monthly')
 */
export function openPaddleUpgrade(targetRole, userEmail, userName = '', billingPeriod = 'monthly') {
  const priceIds = PADDLE_PRICE_IDS[targetRole];
  
  if (!priceIds) {
    console.error('[Paddle] Price ID non trovato per ruolo:', targetRole);
    if (window.showToast) {
      window.showToast('Piano non disponibile. Contatta il supporto.', 'error');
    } else {
      alert('Piano non disponibile. Contatta il supporto.');
    }
    return;
  }

  const priceId = priceIds[billingPeriod] || priceIds.monthly;
  
  if (!priceId) {
    console.error('[Paddle] Price ID non trovato per periodo:', billingPeriod);
    if (window.showToast) {
      window.showToast('Piano non disponibile. Contatta il supporto.', 'error');
    } else {
      alert('Piano non disponibile. Contatta il supporto.');
    }
    return;
  }

  openPaddleCheckout(priceId, userEmail, userName);
}

/**
 * Gestisce redirect dopo checkout completato
 * Chiamato quando l'utente ritorna da Paddle
 */
export function handlePaddleReturn() {
  const urlParams = new URLSearchParams(window.location.search);
  const checkoutSuccess = urlParams.get('checkout') === 'success';
  const orderId = urlParams.get('order');
  
  if (checkoutSuccess) {
    // Mostra messaggio di successo
    if (window.showToast) {
      window.showToast('Pagamento completato con successo! Il tuo account verrà aggiornato a breve.', 'success');
    }
    
    // Pulisci URL
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);
    
    // Ricarica dati utente dopo qualche secondo
    setTimeout(() => {
      if (window.location.pathname.includes('/user')) {
        window.location.reload();
      } else {
        window.location.href = '/user/index.html';
      }
    }, 2000);
  }
}

// Auto-esegui se siamo nella pagina di ritorno
if (typeof window !== 'undefined' && window.location.search.includes('checkout=success')) {
  handlePaddleReturn();
}

