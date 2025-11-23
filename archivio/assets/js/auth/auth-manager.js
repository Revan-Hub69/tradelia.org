/**
 * Auth Manager - Sistema Centralizzato Autenticazione e Autorizzazione
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_CONFIG } from '../supabase-config.js';
import Logger from '/report/assets/js/utils/logger.js';

export const USER_STATE = {
  GUEST: 'guest',
  AUTHENTICATED: 'authenticated',
  PRO: 'pro',
  DESK: 'desk',
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  TRIAL: 'trial',
};

const STATE = {
  supabase: null,
  currentUser: null,
  subscriber: null,
  userState: USER_STATE.GUEST,
  initialized: false,
  listeners: new Set(),
};

export async function initAuthManager() {
  if (STATE.initialized) return STATE;
  try {
    STATE.supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    await checkSession();
    STATE.initialized = true;
    Logger.debug('AuthManager', 'Inizializzato', { userState: STATE.userState });
    return STATE;
  } catch (error) {
    Logger.error('AuthManager', 'Errore inizializzazione', error);
    STATE.userState = USER_STATE.GUEST;
    return STATE;
  }
}

async function checkSession() {
  try {
    const { data: { session }, error } = await STATE.supabase.auth.getSession();
    if (error) {
      Logger.warn('AuthManager', 'Errore verifica sessione', error);
      setUserState(USER_STATE.GUEST);
      return;
    }
    if (session && session.user) {
      STATE.currentUser = session.user;
      await loadSubscriber(session.user);
    } else {
      setUserState(USER_STATE.GUEST);
    }
  } catch (error) {
    Logger.error('AuthManager', 'Errore checkSession', error);
    setUserState(USER_STATE.GUEST);
  }
}

async function loadSubscriber(authUser) {
  try {
    const { data: existing, error: selectError } = await STATE.supabase
      .from('subscribers')
      .select('id, email, subscription_id, status, subscription_type')
      .eq('auth_user_id', authUser.id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      Logger.warn('AuthManager', 'Errore verifica subscriber', selectError);
    }

    if (!existing) {
      const { data: newSubscriber, error: insertError } = await STATE.supabase
        .from('subscribers')
        .insert({
          auth_user_id: authUser.id,
          email: authUser.email,
          status: SUBSCRIPTION_STATUS.CANCELLED,
          subscription_type: null,
        })
        .select('id, email, subscription_id, status, subscription_type')
        .single();

      if (insertError) {
        Logger.warn('AuthManager', 'Errore creazione subscriber', insertError);
        STATE.subscriber = null;
        setUserState(USER_STATE.AUTHENTICATED);
        return;
      }
      STATE.subscriber = newSubscriber;
      setUserState(USER_STATE.AUTHENTICATED);
      return;
    }
    STATE.subscriber = existing;
    determineUserState(existing);
  } catch (error) {
    Logger.error('AuthManager', 'Errore loadSubscriber', error);
    STATE.subscriber = null;
    setUserState(USER_STATE.AUTHENTICATED);
  }
}

function determineUserState(subscriber) {
  if (!subscriber || subscriber.status !== SUBSCRIPTION_STATUS.ACTIVE) {
    setUserState(USER_STATE.AUTHENTICATED);
    return;
  }
  const subscriptionType = subscriber.subscription_type?.toLowerCase() || 'pro';
  if (subscriptionType === 'desk') {
    setUserState(USER_STATE.DESK);
  } else if (subscriptionType === 'pro') {
    setUserState(USER_STATE.PRO);
  } else {
    setUserState(USER_STATE.PRO);
  }
}

function setUserState(newState) {
  if (STATE.userState === newState) return;
  const oldState = STATE.userState;
  STATE.userState = newState;
  Logger.debug('AuthManager', 'Stato utente cambiato', { from: oldState, to: newState, userId: STATE.currentUser?.id });
  notifyListeners({ oldState, newState, user: STATE.currentUser, subscriber: STATE.subscriber });
}

export async function login(email, password) {
  try {
    const { data, error } = await STATE.supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    if (data && data.user) {
      STATE.currentUser = data.user;
      await loadSubscriber(data.user);
      return { success: true, user: data.user };
    }
    throw new Error('Login fallito: nessun dato utente ricevuto');
  } catch (error) {
    Logger.error('AuthManager', 'Errore login', error);
    return { success: false, error: error.message || 'Errore durante il login' };
  }
}

export async function logout() {
  try {
    const { error } = await STATE.supabase.auth.signOut();
    if (error) Logger.warn('AuthManager', 'Errore logout', error);
    STATE.currentUser = null;
    STATE.subscriber = null;
    setUserState(USER_STATE.GUEST);
    return { success: true };
  } catch (error) {
    Logger.error('AuthManager', 'Errore logout', error);
    STATE.currentUser = null;
    STATE.subscriber = null;
    setUserState(USER_STATE.GUEST);
    return { success: true };
  }
}

export async function register(email, password) {
  try {
    const { data, error } = await STATE.supabase.auth.signUp({ email: email.trim(), password });
    if (error) throw error;
    if (data && data.user) {
      return { success: true, requiresConfirmation: true, message: 'Email di conferma inviata. Controlla la tua casella email.' };
    }
    throw new Error('Registrazione fallita');
  } catch (error) {
    Logger.error('AuthManager', 'Errore registrazione', error);
    return { success: false, error: error.message || 'Errore durante la registrazione' };
  }
}

export function getUserState() { return STATE.userState; }
export function getCurrentUser() { return STATE.currentUser; }
export function getSubscriber() { return STATE.subscriber; }
export function getSupabaseClient() { return STATE.supabase; }
export function isAuthenticated() { return STATE.userState !== USER_STATE.GUEST; }
export function isPro() { return STATE.userState === USER_STATE.PRO || STATE.userState === USER_STATE.DESK; }
export function isDesk() { return STATE.userState === USER_STATE.DESK; }
export function isGuest() { return STATE.userState === USER_STATE.GUEST; }

export function canAccess(feature) {
  const permissions = {
    'reports': [USER_STATE.PRO, USER_STATE.DESK],
    'tutorials': [USER_STATE.AUTHENTICATED, USER_STATE.PRO, USER_STATE.DESK],
    'voting': [USER_STATE.PRO, USER_STATE.DESK],
    'community-proposals': [USER_STATE.PRO, USER_STATE.DESK],
    'notifications': [USER_STATE.AUTHENTICATED, USER_STATE.PRO, USER_STATE.DESK],
  };
  const allowedStates = permissions[feature] || [];
  return allowedStates.includes(STATE.userState);
}

export function onAuthStateChange(callback) {
  STATE.listeners.add(callback);
  return () => { STATE.listeners.delete(callback); };
}

function notifyListeners(event) {
  STATE.listeners.forEach(callback => {
    try { callback(event); } catch (error) { Logger.warn('AuthManager', 'Errore listener', error); }
  });
}

export async function refreshSubscriber() {
  if (!STATE.currentUser) return;
  await loadSubscriber(STATE.currentUser);
}

export function setupAuthListener() {
  if (!STATE.supabase) return;
  STATE.supabase.auth.onAuthStateChange(async (event, session) => {
    Logger.debug('AuthManager', 'Auth state changed', { event, hasSession: !!session });
    if (event === 'SIGNED_IN' && session) {
      STATE.currentUser = session.user;
      await loadSubscriber(session.user);
    } else if (event === 'SIGNED_OUT') {
      STATE.currentUser = null;
      STATE.subscriber = null;
      setUserState(USER_STATE.GUEST);
    } else if (event === 'TOKEN_REFRESHED' && session) {
      STATE.currentUser = session.user;
    }
  });
}

export function getState() {
  return {
    userState: STATE.userState,
    hasUser: !!STATE.currentUser,
    hasSubscriber: !!STATE.subscriber,
    subscriberStatus: STATE.subscriber?.status,
    subscriberType: STATE.subscriber?.subscription_type,
  };
}
