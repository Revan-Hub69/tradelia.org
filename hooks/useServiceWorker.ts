'use client';

import { useEffect, useState, useCallback } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isInstalled: boolean;
  registration: ServiceWorkerRegistration | null;
  subscription: PushSubscription | null;
  error: string | null;
}

/**
 * Hook per gestire la registrazione del service worker e le push notifications
 * Basato su best practices PWA e Web Push API
 */
export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: typeof window !== 'undefined' && 'serviceWorker' in navigator,
    isRegistered: false,
    isInstalled: false,
    registration: null,
    subscription: null,
    error: null,
  });

  const registerServiceWorker = useCallback(async () => {
    if (!state.isSupported) {
      setState((prev) => ({ ...prev, error: 'Service Worker non supportato' }));
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      // Attendi che il service worker sia attivo
      await navigator.serviceWorker.ready;

      setState((prev) => ({
        ...prev,
        isRegistered: true,
        isInstalled: true,
        registration,
        error: null,
      }));

      // Controlla se esiste già una subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setState((prev) => ({ ...prev, subscription: existingSubscription }));
      }
    } catch (error) {
      console.error('Errore registrazione service worker:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
      }));
    }
  }, [state.isSupported]);

  const requestPushPermission = useCallback(async (): Promise<PushSubscription | null> => {
    if (!state.registration) {
      setState((prev) => ({ ...prev, error: 'Service worker non registrato' }));
      return null;
    }

    if (!('PushManager' in window)) {
      setState((prev) => ({ ...prev, error: 'Push notifications non supportate' }));
      return null;
    }

    try {
      // Verifica permesso esistente
      const existingSubscription = await state.registration.pushManager.getSubscription();
      if (existingSubscription) {
        setState((prev) => ({ ...prev, subscription: existingSubscription }));
        return existingSubscription;
      }

      // Richiedi permesso
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState((prev) => ({
          ...prev,
          error: 'Permesso notifiche negato',
        }));
        return null;
      }

      // Ottieni VAPID public key dal server (da implementare se necessario)
      // Per ora usiamo una key di esempio - va sostituita con quella reale
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        console.warn('VAPID public key non configurata');
        // Continua comunque, alcune implementazioni non richiedono VAPID
      }

      // Crea subscription
      const subscription = await state.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
          ? urlBase64ToUint8Array(vapidPublicKey)
          : undefined,
      });

      setState((prev) => ({ ...prev, subscription, error: null }));
      return subscription;
    } catch (error) {
      console.error('Errore richiesta permesso push:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Errore richiesta permesso',
      }));
      return null;
    }
  }, [state.registration]);

  const unsubscribePush = useCallback(async () => {
    if (!state.subscription) return;

    try {
      await state.subscription.unsubscribe();
      setState((prev) => ({ ...prev, subscription: null }));
    } catch (error) {
      console.error('Errore unsubscribe push:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Errore unsubscribe',
      }));
    }
  }, [state.subscription]);

  // Registra automaticamente al mount
  useEffect(() => {
    if (state.isSupported && !state.isRegistered) {
      registerServiceWorker();
    }
  }, [state.isSupported, state.isRegistered, registerServiceWorker]);

  // Listener per aggiornamenti service worker
  useEffect(() => {
    if (!state.registration) return;

    const handleUpdate = () => {
      // Il service worker è stato aggiornato
      // Possiamo mostrare un banner per ricaricare la pagina
      console.log('Service worker aggiornato');
    };

    state.registration.addEventListener('updatefound', handleUpdate);
    return () => {
      state.registration?.removeEventListener('updatefound', handleUpdate);
    };
  }, [state.registration]);

  return {
    ...state,
    registerServiceWorker,
    requestPushPermission,
    unsubscribePush,
  };
}

/**
 * Converte VAPID public key da base64 URL-safe a Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

