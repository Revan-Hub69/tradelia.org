// /archivio/assets/js/dashboard.js
// Dashboard Abbonati - Autenticazione Supabase + Votazioni

import Logger from '/report/assets/js/utils/logger.js';
import { i18n } from '/report/assets/js/utils/i18n.js';
import { siteHeader } from '/report/assets/js/components/site-header.js';
import { siteFooter } from '/report/assets/js/components/site-footer.js';
import { SUPABASE_CONFIG } from './supabase-config.js';
import { FCM_CONFIG } from './fcm-config.js';

// ===== SUPABASE CONFIG =====
const SUPABASE_URL = SUPABASE_CONFIG.url;
const SUPABASE_ANON_KEY = SUPABASE_CONFIG.anonKey;

// Importa Supabase client (via CDN per browser)
// Nota: Per produzione, considera di usare npm install @supabase/supabase-js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== STATE =====
const STATE = {
  user: null,
  subscriber: null, // Info abbonamento
  reports: [],
  tutorials: [],
  votes: [],
  currentTab: 'reports',
  sortBy: 'date',
  sortOrder: 'desc',
  deferredPrompt: null, // Evento installazione PWA
  isInstalled: false // Se l'app è già installata
};

// ===== INIT =====
async function init() {
  Logger.debug('Dashboard', 'Inizializzazione dashboard');
  
  // Monta header e footer
  await mountHeaderFooter();
  
  // Registra Service Worker per PWA
  await registerServiceWorker();
  
  // Controlla autenticazione
  await checkAuth();
  
  // Setup event listeners
  setupEventListeners();
  
  // Setup PWA install
  setupPWAInstall();
  
  Logger.debug('Dashboard', 'Dashboard inizializzata');
}

// ===== MOUNT HEADER & FOOTER =====
async function mountHeaderFooter() {
  document.documentElement.setAttribute('data-theme', 'dark');
  
  try {
    // Inizializza i18n
    i18n.init();
    
    const headerSlot = document.getElementById('site-header-slot');
    if (headerSlot) {
      // Monta header SENZA export menu (dashboard non ha export)
      siteHeader.mount(headerSlot, { showExport: false });
    }
    
    const footerSlot = document.getElementById('site-footer-slot');
    if (footerSlot) {
      siteFooter.mount(footerSlot);
    }
    
    // Applica traduzioni
    i18n.translatePage();
    
    // Ascolta cambiamenti lingua
    window.addEventListener('languageChanged', () => {
      i18n.translatePage();
    });
  } catch (err) {
    Logger.warn('Dashboard', 'Errore montaggio header/footer', err);
  }
}

// ===== REGISTER SERVICE WORKER =====
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      Logger.debug('Dashboard', 'Service Worker registrato', registration);
      
      // Richiedi permessi push
      await requestPushPermission(registration);
    } catch (err) {
      Logger.warn('Dashboard', 'Errore registrazione Service Worker', err);
    }
  }
}

// ===== REQUEST PUSH PERMISSION =====
async function requestPushPermission(registration) {
  if (!('Notification' in window)) {
    Logger.warn('Dashboard', 'Notifiche non supportate');
    return;
  }
  
  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    Logger.debug('Dashboard', `Permesso notifiche: ${permission}`);
  }
  
  if (Notification.permission === 'granted' && registration) {
    // Subscribe to push notifications
    try {
      // Converti VAPID public key per FCM
      const vapidPublicKey = FCM_CONFIG.vapidPublicKey;
      if (!vapidPublicKey || vapidPublicKey === 'YOUR_VAPID_PUBLIC_KEY') {
        Logger.warn('Dashboard', 'VAPID public key non configurata');
        return;
      }
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
      
      // Invia subscription al server
      await sendSubscriptionToServer(subscription);
    } catch (err) {
      Logger.warn('Dashboard', 'Errore subscription push', err);
    }
  }
}

// ===== SEND SUBSCRIPTION TO SERVER =====
async function sendSubscriptionToServer(subscription) {
  try {
    if (!STATE.user?.id) {
      Logger.warn('Dashboard', 'User non autenticato, skip subscription');
      return;
    }
    
    // Salva subscription in Supabase
    const subscriber = await ensureSubscriber(STATE.user);
    if (!subscriber) {
      Logger.warn('Dashboard', 'Subscriber non trovato, skip subscription');
      return;
    }
    
    // Verifica se subscription esiste già
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', subscriber.id)
      .eq('subscription->>endpoint', subscription.endpoint)
      .single();
    
    if (existing) {
      // Aggiorna subscription esistente
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ subscription, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      
      if (error) {
        Logger.warn('Dashboard', 'Errore aggiornamento subscription', error);
      } else {
        Logger.debug('Dashboard', 'Subscription aggiornata in Supabase');
      }
    } else {
      // Crea nuova subscription
      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: subscriber.id,
          subscription
        });
      
      if (error) {
        Logger.warn('Dashboard', 'Errore creazione subscription', error);
      } else {
        Logger.debug('Dashboard', 'Subscription salvata in Supabase');
      }
    }
    
    // Invia anche all'API endpoint (per compatibilità)
    try {
      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          userId: STATE.user?.id
        })
      });
    } catch (apiErr) {
      Logger.warn('Dashboard', 'Errore invio subscription all\'API', apiErr);
    }
  } catch (err) {
    Logger.warn('Dashboard', 'Errore invio subscription', err);
  }
}

// ===== URL BASE64 TO UINT8ARRAY =====
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ===== CHECK AUTH =====
async function checkAuth() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      Logger.warn('Dashboard', 'Errore verifica sessione', error);
      showLogin();
      return;
    }
    
    if (session && session.user) {
      STATE.user = session.user;
      
      // Crea/aggiorna record subscriber se non esiste
      const subscriber = await ensureSubscriber(session.user);
      STATE.subscriber = subscriber;
      
      // Verifica status abbonamento
      if (subscriber && subscriber.status === 'active') {
        showDashboard();
      } else {
        showSubscriptionRequired();
      }
    } else {
      showLogin();
    }
  } catch (err) {
    Logger.error('Dashboard', 'Errore checkAuth', err);
    showLogin();
  }
}

// ===== ENSURE SUBSCRIBER =====
async function ensureSubscriber(authUser) {
  try {
    // Verifica se subscriber esiste
    const { data: existing, error: selectError } = await supabase
      .from('subscribers')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows returned
      Logger.warn('Dashboard', 'Errore verifica subscriber', selectError);
    }
    
    if (!existing) {
      // Crea nuovo subscriber (senza abbonamento attivo di default)
      // L'abbonamento verrà attivato tramite webhook Lemon Squeezy
      const { data: newSubscriber, error: insertError } = await supabase
        .from('subscribers')
        .insert({
          auth_user_id: authUser.id,
          email: authUser.email,
          status: 'cancelled' // Default: non abbonato fino a quando non arriva webhook
        })
        .select('id, email, subscription_id, status')
        .single();
      
      if (insertError) {
        Logger.warn('Dashboard', 'Errore creazione subscriber', insertError);
        return null;
      }
      
      return newSubscriber;
    }
    
    // Ritorna subscriber con tutti i campi
    const { data: fullSubscriber, error: selectError2 } = await supabase
      .from('subscribers')
      .select('id, email, subscription_id, status')
      .eq('id', existing.id)
      .single();
    
    if (selectError2) {
      Logger.warn('Dashboard', 'Errore recupero subscriber completo', selectError2);
      return existing;
    }
    
    return fullSubscriber;
  } catch (err) {
    Logger.warn('Dashboard', 'Errore ensureSubscriber', err);
    return null;
  }
}

// ===== SETUP PWA INSTALL =====
function setupPWAInstall() {
  // Verifica se l'app è già installata
  if (window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true) {
    STATE.isInstalled = true;
    hideInstallButton();
    return;
  }
  
  // Intercetta evento beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    // Previeni il prompt automatico del browser
    e.preventDefault();
    
    // Salva l'evento per usarlo quando l'utente clicca "Installa"
    STATE.deferredPrompt = e;
    
    // Mostra pulsante "Installa App"
    showInstallButton();
    
    Logger.debug('Dashboard', 'PWA installabile - pulsante mostrato');
  });
  
  // Verifica se l'app è stata installata
  window.addEventListener('appinstalled', () => {
    STATE.isInstalled = true;
    STATE.deferredPrompt = null;
    hideInstallButton();
    Logger.debug('Dashboard', 'PWA installata');
    
    // Mostra messaggio di conferma
    showInstallSuccess();
  });
}

// ===== SHOW INSTALL BUTTON =====
function showInstallButton() {
  const installBtn = document.getElementById('install-app-btn');
  if (installBtn) {
    installBtn.hidden = false;
  }
}

// ===== HIDE INSTALL BUTTON =====
function hideInstallButton() {
  const installBtn = document.getElementById('install-app-btn');
  if (installBtn) {
    installBtn.hidden = true;
  }
}

// ===== HANDLE INSTALL APP =====
async function handleInstallApp() {
  if (!STATE.deferredPrompt) {
    Logger.warn('Dashboard', 'Installazione non disponibile');
    return;
  }
  
  try {
    // Mostra prompt installazione
    STATE.deferredPrompt.prompt();
    
    // Attendi risposta utente
    const { outcome } = await STATE.deferredPrompt.userChoice;
    
    Logger.debug('Dashboard', `Installazione: ${outcome}`);
    
    // Pulisci evento
    STATE.deferredPrompt = null;
    
    // Nascondi pulsante
    hideInstallButton();
    
    if (outcome === 'accepted') {
      showInstallSuccess();
    }
  } catch (err) {
    Logger.error('Dashboard', 'Errore installazione PWA', err);
  }
}

// ===== SHOW INSTALL SUCCESS =====
function showInstallSuccess() {
  // Mostra messaggio temporaneo di successo
  const successMsg = document.createElement('div');
  successMsg.className = 'install-success-message';
  successMsg.textContent = '✅ App installata con successo!';
  successMsg.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4caf50;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(successMsg);
  
  // Rimuovi dopo 3 secondi
  setTimeout(() => {
    successMsg.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => successMsg.remove(), 300);
  }, 3000);
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Demo login button
  const demoLoginBtn = document.getElementById('demo-login-btn');
  if (demoLoginBtn) {
    demoLoginBtn.addEventListener('click', handleDemoLogin);
  }
  
  // Forgot password button
  const forgotPasswordBtn = document.getElementById('forgot-password-btn');
  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', () => {
      const modal = document.getElementById('forgot-password-modal');
      if (modal) {
        modal.hidden = false;
      }
    });
  }
  
  // Cancel reset button
  const cancelResetBtn = document.getElementById('cancel-reset-btn');
  if (cancelResetBtn) {
    cancelResetBtn.addEventListener('click', () => {
      const modal = document.getElementById('forgot-password-modal');
      if (modal) {
        modal.hidden = true;
      }
    });
  }
  
  // Forgot password form
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', handleForgotPassword);
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Install App button
  const installBtn = document.getElementById('install-app-btn');
  if (installBtn) {
    installBtn.addEventListener('click', handleInstallApp);
  }
  
  // Dashboard tabs
  const tabs = document.querySelectorAll('.dashboard-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });
  
  // Voting form
  const votingForm = document.getElementById('voting-form');
  if (votingForm) {
    votingForm.addEventListener('submit', handleVote);
  }
}

// ===== HANDLE LOGIN =====
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');
  const successEl = document.getElementById('login-success');
  
  // Reset messaggi
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = '';
  }
  if (successEl) {
    successEl.hidden = true;
    successEl.textContent = '';
  }
  
  try {
    if (!email || !password) {
      throw new Error('Email e password richieste');
    }
    
    Logger.debug('Dashboard', 'Tentativo login', { email: email.trim() });
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim(), 
      password 
    });
    
    if (error) {
      Logger.error('Dashboard', 'Errore Supabase login', error);
      
      // Messaggi di errore specifici
      let errorMessage = 'Errore durante il login';
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email o password non corretti. Verifica le credenziali e riprova.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email non confermata. Controlla la tua casella email e clicca sul link di conferma.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Troppi tentativi. Attendi qualche minuto e riprova.';
        } else {
          errorMessage = error.message;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    if (data && data.user) {
      Logger.debug('Dashboard', 'Login riuscito', { userId: data.user.id });
      STATE.user = data.user;
      
      // Crea/aggiorna subscriber
      await ensureSubscriber(data.user);
      
      // Mostra messaggio di successo
      if (successEl) {
        successEl.hidden = false;
        successEl.textContent = 'Login riuscito! Accesso in corso...';
      }
      
      // Piccolo delay per mostrare messaggio
      setTimeout(() => {
        showDashboard();
      }, 500);
    } else {
      throw new Error('Login fallito: nessun dato utente ricevuto');
    }
    
  } catch (err) {
    Logger.error('Dashboard', 'Errore login', err);
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = err.message || 'Errore durante il login. Verifica le credenziali e riprova.';
    }
  }
}

// ===== HANDLE DEMO LOGIN =====
async function handleDemoLogin() {
  const errorEl = document.getElementById('login-error');
  const successEl = document.getElementById('login-success');
  
  // Reset messaggi
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = '';
  }
  if (successEl) {
    successEl.hidden = true;
    successEl.textContent = '';
  }
  
  try {
    // Credenziali demo (da creare in Supabase)
    const demoEmail = 'demo@tradelia.org';
    const demoPassword = 'Demo123!';
    
    Logger.debug('Dashboard', 'Tentativo login demo', { email: demoEmail });
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: demoEmail, 
      password: demoPassword 
    });
    
    if (error) {
      Logger.error('Dashboard', 'Errore login demo', error);
      
      // Se login demo fallisce, mostra messaggio informativo
      if (errorEl) {
        errorEl.hidden = false;
        errorEl.textContent = 'Login demo non disponibile. Crea un account o usa le tue credenziali.';
      }
      return;
    }
    
    if (data && data.user) {
      Logger.debug('Dashboard', 'Login demo riuscito', { userId: data.user.id });
      STATE.user = data.user;
      
      // Crea/aggiorna subscriber
      await ensureSubscriber(data.user);
      
      // Mostra messaggio di successo
      if (successEl) {
        successEl.hidden = false;
        successEl.textContent = 'Login demo riuscito! Accesso in corso...';
      }
      
      // Piccolo delay per mostrare messaggio
      setTimeout(() => {
        showDashboard();
      }, 500);
    }
    
  } catch (err) {
    Logger.error('Dashboard', 'Errore login demo', err);
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = 'Errore durante il login demo. Verifica la configurazione.';
    }
  }
}

// ===== HANDLE FORGOT PASSWORD =====
async function handleForgotPassword(event) {
  event.preventDefault();
  
  const email = document.getElementById('reset-email').value;
  const errorEl = document.getElementById('reset-error');
  const successEl = document.getElementById('reset-success');
  
  // Reset messaggi
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = '';
  }
  if (successEl) {
    successEl.hidden = true;
    successEl.textContent = '';
  }
  
  try {
    if (!email) {
      throw new Error('Email richiesta');
    }
    
    Logger.debug('Dashboard', 'Richiesta reset password', { email: email.trim() });
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/archivio/dashboard.html?reset=true`
    });
    
    if (error) {
      Logger.error('Dashboard', 'Errore reset password', error);
      
      // Messaggi di errore specifici
      let errorMessage = 'Errore durante la richiesta di reset password';
      if (error.message) {
        if (error.message.includes('rate limit')) {
          errorMessage = 'Troppe richieste. Attendi qualche minuto e riprova.';
        } else {
          errorMessage = error.message;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // Mostra messaggio di successo
    if (successEl) {
      successEl.hidden = false;
      successEl.textContent = 'Email di ripristino inviata! Controlla la tua casella email e segui le istruzioni.';
    }
    
    Logger.debug('Dashboard', 'Reset password inviato', { email: email.trim() });
    
  } catch (err) {
    Logger.error('Dashboard', 'Errore forgot password', err);
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = err.message || 'Errore durante la richiesta di reset password. Riprova.';
    }
  }
}

// ===== HANDLE LOGOUT =====
async function handleLogout() {
  try {
    // Logout Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      Logger.warn('Dashboard', 'Errore logout Supabase', error);
    }
    
    localStorage.removeItem('tradelia_session');
    STATE.user = null;
    showLogin();
  } catch (err) {
    Logger.error('Dashboard', 'Errore logout', err);
    // Fallback: rimuovi comunque sessione locale
    localStorage.removeItem('tradelia_session');
    STATE.user = null;
    showLogin();
  }
}

// ===== SHOW LOGIN =====
function showLogin() {
  const loginSection = document.getElementById('login-section');
  const dashboardContent = document.getElementById('dashboard-content');
  const subscriptionRequiredSection = document.getElementById('subscription-required-section');
  
  if (loginSection) loginSection.hidden = false;
  if (dashboardContent) dashboardContent.hidden = true;
  if (subscriptionRequiredSection) subscriptionRequiredSection.hidden = true;
}

// ===== SHOW SUBSCRIPTION REQUIRED =====
function showSubscriptionRequired() {
  const loginSection = document.getElementById('login-section');
  const dashboardContent = document.getElementById('dashboard-content');
  const subscriptionRequiredSection = document.getElementById('subscription-required-section');
  
  if (loginSection) loginSection.hidden = true;
  if (dashboardContent) dashboardContent.hidden = true;
  if (subscriptionRequiredSection) subscriptionRequiredSection.hidden = false;
  
  // Setup event listeners per refresh subscription
  const refreshBtn = document.getElementById('refresh-subscription-btn');
  if (refreshBtn) {
    refreshBtn.onclick = async () => {
      await checkSubscriptionStatus();
    };
  }
  
  const logoutBtn2 = document.getElementById('logout-btn-2');
  if (logoutBtn2) {
    logoutBtn2.onclick = handleLogout;
  }
}

// ===== CHECK SUBSCRIPTION STATUS =====
async function checkSubscriptionStatus() {
  try {
    if (!STATE.user) return;
    
    // Recupera subscriber aggiornato da Supabase
    const { data: subscriber, error } = await supabase
      .from('subscribers')
      .select('id, email, subscription_id, status')
      .eq('auth_user_id', STATE.user.id)
      .single();
    
    if (error) {
      Logger.warn('Dashboard', 'Errore verifica subscription', error);
      return;
    }
    
    STATE.subscriber = subscriber;
    
    // Se abbonamento attivo, mostra dashboard
    if (subscriber && subscriber.status === 'active') {
      showDashboard();
    } else {
      Logger.debug('Dashboard', 'Abbonamento non attivo', subscriber);
    }
  } catch (err) {
    Logger.error('Dashboard', 'Errore checkSubscriptionStatus', err);
  }
}

// ===== SHOW DASHBOARD =====
async function showDashboard() {
  const loginSection = document.getElementById('login-section');
  const dashboardContent = document.getElementById('dashboard-content');
  const userEmail = document.getElementById('user-email');
  
  if (loginSection) loginSection.hidden = true;
  if (dashboardContent) dashboardContent.hidden = false;
  if (userEmail && STATE.user) {
    userEmail.textContent = STATE.user.email;
  }
  
  // Timeout globale: se il caricamento dura più di 15 secondi, forza il rendering
  const globalTimeout = setTimeout(() => {
    Logger.warn('Dashboard', 'Timeout globale caricamento dati (15s), forzo rendering');
    renderDashboardReports();
    // renderDashboardTutorials(); // Tutorial temporaneamente disabilitati
    hideLoadingState();
  }, 15000);
  
  try {
    // Carica dati
    await loadDashboardData();
    clearTimeout(globalTimeout);
    
    // Renderizza sempre, anche se non ci sono dati
    renderDashboardReports();
    // renderDashboardTutorials(); // Tutorial temporaneamente disabilitati
    
    // Applica traduzioni dopo il rendering
    setTimeout(() => {
      i18n.translatePage();
    }, 100);
    
    // Carica votazioni in background (non blocca il rendering)
    loadVotingData().catch(err => {
      Logger.warn('Dashboard', 'Errore caricamento votazioni (non critico)', err);
    });
  } catch (err) {
    clearTimeout(globalTimeout);
    Logger.error('Dashboard', 'Errore showDashboard', err);
    // Mostra messaggio di errore e nascondi loading
    renderDashboardReports(); // Renderizza comunque
    // renderDashboardTutorials(); // Tutorial temporaneamente disabilitati
    hideLoadingState();
    showErrorState('Errore nel caricamento della dashboard. Riprova più tardi.');
    
    // Applica traduzioni anche in caso di errore
    setTimeout(() => {
      i18n.translatePage();
    }, 100);
  }
}

// ===== LOAD DASHBOARD DATA =====
async function loadDashboardData() {
  // Mostra stato di loading
  showLoadingState();
  
  try {
    // Carica manifest report (tutti, anche < 24h per abbonati) con timeout
    const manifestController = new AbortController();
    const manifestTimeout = setTimeout(() => manifestController.abort(), 10000); // 10 secondi timeout
    
    try {
      const manifestResponse = await fetch('/archivio/manifest.json', {
        signal: manifestController.signal,
        cache: 'no-cache'
      });
      clearTimeout(manifestTimeout);
      
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        STATE.reports = manifest.reports || [];
        Logger.debug('Dashboard', `Caricati ${STATE.reports.length} report`);
        
        if (STATE.reports.length === 0) {
          Logger.warn('Dashboard', 'Nessun report trovato nel manifest');
        }
      } else {
        Logger.error('Dashboard', `Errore caricamento manifest: ${manifestResponse.status} ${manifestResponse.statusText}`);
        STATE.reports = [];
      }
    } catch (fetchErr) {
      clearTimeout(manifestTimeout);
      if (fetchErr.name === 'AbortError') {
        Logger.error('Dashboard', 'Timeout caricamento manifest.json (10s)');
      } else {
        Logger.error('Dashboard', 'Errore fetch manifest.json', fetchErr);
      }
      STATE.reports = [];
    }
    
    // Tutorial temporaneamente disabilitati - verranno riattivati quando completati
    // Carica documenti tutorial con timeout
    // const docsController = new AbortController();
    // const docsTimeout = setTimeout(() => docsController.abort(), 10000);
    
    // try {
    //   const docsResponse = await fetch('/archivio/documents.json', {
    //     signal: docsController.signal,
    //     cache: 'no-cache'
    //   });
    //   clearTimeout(docsTimeout);
      
    //   if (docsResponse.ok) {
    //     const docs = await docsResponse.json();
    //     STATE.tutorials = docs.documents || [];
    //     Logger.debug('Dashboard', `Caricati ${STATE.tutorials.length} tutorial`);
    //   } else {
    //     Logger.warn('Dashboard', `Errore caricamento documenti: ${docsResponse.status}`);
    //     STATE.tutorials = [];
    //   }
    // } catch (fetchErr) {
    //   clearTimeout(docsTimeout);
    //   if (fetchErr.name === 'AbortError') {
    //     Logger.warn('Dashboard', 'Timeout caricamento documents.json (10s)');
    //   } else {
    //     Logger.warn('Dashboard', 'Errore fetch documents.json', fetchErr);
    //   }
    //   STATE.tutorials = [];
    // }
    
    // Tutorial disabilitati - non caricarli
    STATE.tutorials = [];
    Logger.debug('Dashboard', 'Tutorial temporaneamente disabilitati');
  } catch (err) {
    Logger.error('Dashboard', 'Errore caricamento dati', err);
    STATE.reports = [];
    STATE.tutorials = [];
  } finally {
    // Il rendering rimuove lo stato di loading
    // Assicuriamoci che il rendering avvenga sempre
  }
}

// ===== RENDER DASHBOARD REPORTS =====
function renderDashboardReports() {
  const tbody = document.getElementById('dashboard-reports-tbody');
  if (!tbody) {
    Logger.warn('Dashboard', 'Elemento dashboard-reports-tbody non trovato');
    // Nascondi loading comunque
    hideLoadingState();
    return;
  }
  
  try {
    // Verifica se ci sono report
    if (!STATE.reports || STATE.reports.length === 0) {
      const noReportsText = i18n.t('dashboard.table.noReports') || 'Nessun report disponibile';
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: var(--sp-6);" data-i18n="dashboard.table.noReports">${noReportsText}</td></tr>`;
      Logger.warn('Dashboard', 'Nessun report da renderizzare');
      // Applica traduzioni
      setTimeout(() => {
        i18n.translatePage();
      }, 50);
      return;
    }
    
    // Sort reports (più recenti prima)
    const sortedReports = [...STATE.reports].sort((a, b) => {
      try {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      } catch (err) {
        Logger.warn('Dashboard', 'Errore ordinamento report', err);
        return 0;
      }
    });
    
    Logger.debug('Dashboard', `Renderizzando ${sortedReports.length} report`);
    
    tbody.innerHTML = sortedReports.map(report => {
      try {
        const date = report.created_at ? new Date(report.created_at).toLocaleDateString('it-IT') : '—';
        const statusBadge = `<span class="status-badge" data-status="${report.status || 'active'}">${(report.status || 'active').toUpperCase()}</span>`;
        const isLocked = isReportLocked(report);
        const lockedBadge = isLocked ? '<span class="status-badge" data-status="hold" style="margin-left: var(--sp-2);">LOCKED</span>' : '';
        
        const openReportText = i18n.t('dashboard.table.openReport') || 'Apri Report';
        return `
          <tr>
            <td>${date}</td>
            <td><strong>${report.ticker || '—'}</strong></td>
            <td>${report.company || '—'}</td>
            <td>${report.type || '—'}</td>
            <td>${report.version || '—'}</td>
            <td>${statusBadge}${lockedBadge}</td>
            <td><a href="/report/index.html?id=${report.id}" target="_blank" data-i18n="dashboard.table.openReport">${openReportText}</a></td>
          </tr>
        `;
      } catch (err) {
        Logger.warn('Dashboard', 'Errore rendering report', err);
        return '<tr><td colspan="7">Errore caricamento report</td></tr>';
      }
    }).join('');
    
    // Applica traduzioni dopo il rendering
    setTimeout(() => {
      i18n.translatePage();
    }, 50);
  } catch (err) {
    Logger.error('Dashboard', 'Errore renderDashboardReports', err);
    const errorText = i18n.t('dashboard.table.error') || 'Errore nel rendering dei report';
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: var(--sp-6); color: var(--err, #ef4444);" data-i18n="dashboard.table.error">${errorText}</td></tr>`;
    setTimeout(() => {
      i18n.translatePage();
    }, 50);
  }
}

// ===== IS REPORT LOCKED =====
function isReportLocked(report) {
  if (!report.public_after) return false;
  const now = new Date();
  const publicAfter = new Date(report.public_after);
  return now < publicAfter;
}

// ===== RENDER DASHBOARD TUTORIALS =====
function renderDashboardTutorials() {
  const list = document.getElementById('dashboard-tutorials-list');
  if (!list) return;
  
  if (STATE.tutorials.length === 0) {
    list.innerHTML = '<p class="archive-empty">Nessun tutorial disponibile</p>';
    return;
  }
  
  list.innerHTML = STATE.tutorials.map(tutorial => {
    const tags = (tutorial.tags || []).map(tag => 
      `<span class="tutorial-tag">${tag}</span>`
    ).join('');
    
    return `
      <div class="tutorial-card">
        <h3 class="tutorial-card-title">${tutorial.title || 'Tutorial'}</h3>
        <div class="tutorial-card-meta">
          <span>${tutorial.category || 'Tutorial'}</span>
          <span>•</span>
          <span>${tutorial.version || '—'}</span>
          <span>•</span>
          <span>${new Date(tutorial.created_at || tutorial.updated_at).toLocaleDateString('it-IT')}</span>
        </div>
        <div class="tutorial-card-tags">${tags}</div>
        <a href="${tutorial.link}" target="_blank" class="btn btn-sm" style="margin-top: var(--sp-3);">Apri Tutorial</a>
      </div>
    `;
  }).join('');
}

// ===== SWITCH TAB =====
function switchTab(tabName) {
  const tabs = document.querySelectorAll('.dashboard-tab');
  const sections = document.querySelectorAll('.dashboard-section');
  
  tabs.forEach(tab => {
    tab.classList.remove('active');
    tab.setAttribute('aria-selected', 'false');
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
    }
  });
  
  sections.forEach(section => {
    section.classList.remove('active');
    section.hidden = true;
  });
  
  const section = document.getElementById(`dashboard-${tabName}`);
  if (section) {
    section.classList.add('active');
    section.hidden = false;
  }
  
  STATE.currentTab = tabName;
  
  // Carica dati specifici per tab
  if (tabName === 'voting') {
    loadVotingData();
  }
  
  // Applica traduzioni dopo il cambio tab
  setTimeout(() => {
    i18n.translatePage();
  }, 50);
}

// ===== LOAD VOTING DATA =====
async function loadVotingData() {
  try {
    // L'API /api/vote supporta GET per recuperare i voti con timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 secondi timeout
    
    try {
      const response = await fetch('/api/vote', {
        signal: controller.signal,
        cache: 'no-cache'
      });
      clearTimeout(timeout);
      
      if (response.ok) {
        const data = await response.json();
        STATE.votes = data.votes || [];
        renderVotingRanking();
        renderVotingStats();
        // Applica traduzioni dopo il rendering
        setTimeout(() => {
          i18n.translatePage();
        }, 50);
      } else {
        Logger.warn('Dashboard', 'Errore risposta API votazioni', response.status);
        STATE.votes = [];
        renderVotingRanking();
        renderVotingStats();
        setTimeout(() => {
          i18n.translatePage();
        }, 50);
      }
    } catch (fetchErr) {
      clearTimeout(timeout);
      if (fetchErr.name === 'AbortError') {
        Logger.warn('Dashboard', 'Timeout caricamento votazioni (5s)');
      } else {
        Logger.warn('Dashboard', 'Errore fetch votazioni', fetchErr);
      }
      STATE.votes = [];
      renderVotingRanking();
      renderVotingStats();
      setTimeout(() => {
        i18n.translatePage();
      }, 50);
    }
  } catch (err) {
    Logger.error('Dashboard', 'Errore caricamento votazioni', err);
    STATE.votes = [];
    renderVotingRanking();
    renderVotingStats();
    setTimeout(() => {
      i18n.translatePage();
    }, 50);
  }
}

// ===== HANDLE VOTE =====
async function handleVote(event) {
  event.preventDefault();
  
  const ticker = document.getElementById('ticker-input').value.toUpperCase();
  const votes = parseInt(document.getElementById('votes-input').value);
  
  try {
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticker,
        votes,
        userId: STATE.user?.id
      })
    });
    
    if (response.ok) {
      Logger.debug('Dashboard', 'Voto inviato', { ticker, votes });
      // Reset form
      event.target.reset();
      // Ricarica votazioni
      await loadVotingData();
    } else {
      throw new Error('Errore nell\'invio del voto');
    }
  } catch (err) {
    Logger.error('Dashboard', 'Errore voto', err);
    alert('Errore nell\'invio del voto. Riprova.');
  }
}

// ===== RENDER VOTING RANKING =====
function renderVotingRanking() {
  const list = document.getElementById('ranking-list');
  if (!list) return;
  
  // Aggrega voti per ticker
  const voteMap = {};
  STATE.votes.forEach(vote => {
    if (!voteMap[vote.ticker]) {
      voteMap[vote.ticker] = 0;
    }
    voteMap[vote.ticker] += vote.votes;
  });
  
  // Ordina per voti (discendente)
  const ranking = Object.entries(voteMap)
    .map(([ticker, totalVotes]) => ({ ticker, totalVotes }))
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 10); // Top 10
  
  if (ranking.length === 0) {
    list.innerHTML = '<p class="archive-empty">Nessun voto ancora</p>';
    return;
  }
  
  list.innerHTML = ranking.map((item, index) => `
    <div class="ranking-item">
      <span class="ranking-item-position">#${index + 1}</span>
      <span class="ranking-item-ticker">${item.ticker}</span>
      <span class="ranking-item-votes">${item.totalVotes} voti</span>
    </div>
  `).join('');
}

// ===== RENDER VOTING STATS =====
function renderVotingStats() {
  const stats = document.getElementById('voting-stats');
  if (!stats) return;
  
  const totalVotes = STATE.votes.length;
  const uniqueTickers = new Set(STATE.votes.map(v => v.ticker)).size;
  const totalVoteCount = STATE.votes.reduce((sum, v) => sum + v.votes, 0);
  
  stats.innerHTML = `
    <div class="stat-item">
      <div class="stat-label">Voti Totali</div>
      <div class="stat-value">${totalVotes}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Ticker Unici</div>
      <div class="stat-value">${uniqueTickers}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Punti Totali</div>
      <div class="stat-value">${totalVoteCount}</div>
    </div>
  `;
}

// ===== LOADING STATE =====
function showLoadingState() {
  const tbody = document.getElementById('dashboard-reports-tbody');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: var(--sp-6);"><div class="loading-spinner">Caricamento report...</div></td></tr>';
  }
}

function hideLoadingState() {
  // Rimuove lo stato di loading se presente
  const tbody = document.getElementById('dashboard-reports-tbody');
  if (tbody) {
    // Se è ancora in loading, mostra messaggio vuoto
    const currentContent = tbody.innerHTML;
    if (currentContent.includes('loading-spinner') || currentContent.includes('Caricamento report')) {
      // Il rendering lo sostituirà, ma se non ci sono dati mostriamo messaggio
      if (!STATE.reports || STATE.reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: var(--sp-6);">Nessun report disponibile</td></tr>';
      }
    }
  }
}

// ===== ERROR STATE =====
function showErrorState(message) {
  const tbody = document.getElementById('dashboard-reports-tbody');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: var(--sp-6); color: var(--err, #ef4444);">${message}</td></tr>`;
  }
}

// ===== AVVIO =====
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

