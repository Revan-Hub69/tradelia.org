// Script per generare VAPID keys
// Eseguire con: node scripts/generate-vapid-keys.js

const webpush = require('web-push');

console.log('🔑 Generazione VAPID Keys...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID Keys generate!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 PUBLIC KEY (per fcm-config.js):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(vapidKeys.publicKey);
console.log('\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔒 PRIVATE KEY (per Vercel FIREBASE_VAPID_PRIVATE_KEY):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(vapidKeys.privateKey);
console.log('\n');

console.log('⚠️  IMPORTANTE:');
console.log('1. Copia la PUBLIC KEY e aggiorna fcm-config.js');
console.log('2. Copia la PRIVATE KEY e aggiungila in Vercel come FIREBASE_VAPID_PRIVATE_KEY');
console.log('3. Se hai già una public key in uso, NON generare nuove chiavi!');
console.log('   (dovresti trovare la private key corrispondente in Firebase Console)');
console.log('\n');

