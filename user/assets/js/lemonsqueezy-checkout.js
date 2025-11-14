// Lemon Squeezy Checkout Integration
// Gestisce checkout per abbonamenti e crediti

const LEMONSQUEEZY_STORE_ID = window.LEMONSQUEEZY_STORE_ID || process.env.LEMONSQUEEZY_STORE_ID;

/**
 * Apre checkout Lemon Squeezy per abbonamento
 * @param {string} variantId - ID variante prodotto Lemon Squeezy
 * @param {string} userEmail - Email utente
 * @param {string} userName - Nome utente (opzionale)
 */
export function openLemonSqueezyCheckout(variantId, userEmail, userName = '') {
  if (!variantId) {
    console.error('[LemonSqueezy] variantId mancante');
    if (window.showToast) {
      window.showToast('Errore: prodotto non configurato. Contatta il supporto.', 'error');
    } else {
      alert('Errore configurazione. Contatta il supporto.');
    }
    return;
  }

  if (!LEMONSQUEEZY_STORE_ID || LEMONSQUEEZY_STORE_ID === 'YOUR_STORE_ID') {
    console.error('[LemonSqueezy] LEMONSQUEEZY_STORE_ID non configurato');
    if (window.showToast) {
      window.showToast('Errore configurazione pagamenti. Contatta il supporto.', 'error');
    } else {
      alert('Errore configurazione pagamenti. Contatta il supporto.');
    }
    return;
  }

  // Costruisci URL checkout Lemon Squeezy
  const checkoutUrl = new URL(`https://${LEMONSQUEEZY_STORE_ID}.lemonsqueezy.com/checkout/buy/${variantId}`);
  
  // Aggiungi parametri opzionali
  if (userEmail) {
    checkoutUrl.searchParams.set('email', userEmail);
  }
  if (userName) {
    checkoutUrl.searchParams.set('name', userName);
  }
  
  // Aggiungi metadata per tracking (opzionale)
  checkoutUrl.searchParams.set('checkout[custom][user_id]', window.state?.user?.id || '');
  checkoutUrl.searchParams.set('checkout[custom][source]', 'tradelia_user_area');
  
  // Redirect a checkout
  window.location.href = checkoutUrl.toString();
}

/**
 * Apre checkout Lemon Squeezy per crediti
 * @param {number} credits - Numero crediti da acquistare
 * @param {number} price - Prezzo in euro
 * @param {string} userEmail - Email utente
 */
export function openLemonSqueezyCreditsCheckout(credits, price, userEmail) {
  // Mappa crediti a variant_id Lemon Squeezy
  const creditsVariantMap = {
    1: '693409',    // 1 credito = 99€
    3: '1091060',   // 3 crediti = 249€
    7: '1091066'    // 7 crediti = 499€
  };

  const variantId = creditsVariantMap[credits];
  
  if (!variantId) {
    console.error('[LemonSqueezy] Variant ID non trovato per crediti:', credits);
    alert(`Pacchetto ${credits} crediti non disponibile.`);
    return;
  }

  openLemonSqueezyCheckout(variantId, userEmail);
}

/**
 * Mappa ruoli a variant_id abbonamenti Lemon Squeezy
 */
export const SUBSCRIPTION_VARIANTS = {
  pro: {
    monthly: '1091082',    // Piano Pro mensile
    yearly: '1091075'       // Piano Pro annuale
  },
  institutional: {
    monthly: '1091084',    // Piano Desk mensile
    yearly: '1091083'       // Piano Desk annuale
  }
};

/**
 * Apre checkout per upgrade abbonamento
 * @param {string} targetRole - 'pro' o 'institutional'
 * @param {string} userEmail - Email utente
 * @param {string} userName - Nome utente (opzionale)
 * @param {string} billingPeriod - 'monthly' o 'yearly' (default: 'monthly')
 */
export function openLemonSqueezyUpgrade(targetRole, userEmail, userName = '', billingPeriod = 'monthly') {
  const variants = SUBSCRIPTION_VARIANTS[targetRole];
  
  if (!variants) {
    console.error('[LemonSqueezy] Variant ID non trovato per ruolo:', targetRole);
    alert('Piano non disponibile. Contatta il supporto.');
    return;
  }

  const variantId = variants[billingPeriod] || variants.monthly;
  
  if (!variantId) {
    console.error('[LemonSqueezy] Variant ID non trovato per periodo:', billingPeriod);
    alert('Piano non disponibile. Contatta il supporto.');
    return;
  }

  openLemonSqueezyCheckout(variantId, userEmail, userName);
}

/**
 * Gestisce redirect dopo checkout completato
 * Chiamato quando l'utente ritorna da Lemon Squeezy
 */
export function handleLemonSqueezyReturn() {
  const urlParams = new URLSearchParams(window.location.search);
  const checkoutSuccess = urlParams.get('checkout') === 'success';
  const orderId = urlParams.get('order');
  
  if (checkoutSuccess) {
    // Mostra messaggio di successo
    if (window.showToast) {
      window.showToast('Pagamento completato con successo! Il tuo account verrà aggiornato a breve.', 'success');
    }
    
    // Ricarica dati utente dopo qualche secondo
    setTimeout(() => {
      if (window.location.pathname.includes('/user')) {
        window.location.reload();
      } else {
        window.location.href = '/user';
      }
    }, 2000);
  }
}

// Auto-esegui se siamo nella pagina di ritorno
if (typeof window !== 'undefined' && window.location.search.includes('checkout=success')) {
  handleLemonSqueezyReturn();
}

