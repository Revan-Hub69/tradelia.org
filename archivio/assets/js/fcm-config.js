// /archivio/assets/js/fcm-config.js
// Configurazione FCM (Firebase Cloud Messaging)

export const FCM_CONFIG = {
  apiKey: 'AIzaSyAC2x_9fjPBGdr8glort5EUXLQ40vIAQjg',
  projectId: 'tradelia-push',
  messagingSenderId: '904705785437',
  appId: '1:904705785437:web:c9da853c7d900a62c017b4',
  vapidPublicKey: 'BGUfdP2IYXrvOwDYEqmRwhZqodiQB1CKeaLd1-oILrVCfgTW7n_mjCe3WQYzYXQw1dqgOtIRTOEfBHu6gj22Uc0'
};

// Firebase config per inizializzazione
export const firebaseConfig = {
  apiKey: FCM_CONFIG.apiKey,
  authDomain: `${FCM_CONFIG.projectId}.firebaseapp.com`,
  projectId: FCM_CONFIG.projectId,
  storageBucket: 'tradelia-push.firebasestorage.app',
  messagingSenderId: FCM_CONFIG.messagingSenderId,
  appId: FCM_CONFIG.appId,
  measurementId: 'G-DCGFDF0N38'
};

