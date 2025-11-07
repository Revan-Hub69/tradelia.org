// /archivio/firebase-private-config.local.js
// Configurazione Firebase PRIVATA (chiavi private)
// ATTENZIONE: Questo file NON viene committato (è nel .gitignore)
// Usa questo file solo per sviluppo locale
// Per produzione, usa Vercel Environment Variables

// Firebase VAPID Private Key
// Copia qui la VAPID private key da Firebase Console
// Formato: stringa lunga senza spazi
export const FIREBASE_VAPID_PRIVATE_KEY = 'E6cggtHVRuV6vN3vDkoRDU_oRcgsGid8QFAs0R1n9JQ';

// Firebase Service Account (JSON completo)
// Incolla qui il contenuto del file JSON del Service Account
// Formato: oggetto JSON
export const FIREBASE_SERVICE_ACCOUNT = {
  "type": "service_account",
  "project_id": "tradelia-push",
  "private_key_id": "7c8d2473c6e68f2d504c4c1d61b1ed3e80ebd40b",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDSZ9bHioQiMWvp\nsjENbHOTK61Hu0p3vZUknS6oWguWi5/iEm224Xyu886RPeHWFw/gW0d7aHWKbs7T\npUZOAbZt7WNSG9Q8zy5S7ZnL5x0ED7MTERLm32ClycIXnXJCoxPpk3faPi40hLqh\nL9tVU4Oy1hb7AP6nx2iyuA5MQaMHXyWPZxIPYa5eTTpq5boOv3rKrg7HklnlTn+U\nw6r6kjV9HcH6CqnXs0xyitI+NTpYwldvqIQn7kd4BxbfKuwfbbrEOOhwL/2MMS8d\nvraSUp0ezKNWPUvFdYULZT0LudxSKPt3XsKddMv8xiwEQmMfbfiJ3UOOQlm+ZyH0\nxccftwsnAgMBAAECggEAAzt5JZ018aVUuEUpuVneXkQGtQ1mU94whlyrzmywga8p\nCG4Q2J7KLZETrh0g23GE2ut/Q6DgY8oKZcUqOVSPzhlRgOQ29HnL7ZY2c9cPFdrj\nFpRMKz1o3K/zlvoVbhSkEt7v5NIDuU04slufDcaEq9Pbv1HNyuhzVIHwJkrz2DWE\n2aOgIjyw0+jc2R+5cZj1Igyu+MWzAuU53hgCvGrDenZt0N2G0V0oaG6H38q9gWIv\nLXv21DrfF61yolt5/0nJ889wX88p5Xbhpst/HRfnp9yy7XuPnFXSveZYzE+3f0MS\nPhgmZwLExh/Ui/bDN6qYW6sWru3NwVHZFMvcrFwYQQKBgQDwIEY3CHGOKoOCxuZI\nzJ038m1zf4yqwEKQuUrb6YN+XBVmRm1BMcNu8S2Qp/kghaZULM/6gyhCRwXiNVG6\nn/49352gyE4IpyBYtHLfjhkYrt1Wxk+sD30fWtumoF4f2qgU/0SjQtsCKbYcRQ0s\n3uOdVH7NXiRZcQZiOA1AXOd91wKBgQDgUJi5zauBypk2k3opa9V9LDVcxHHA5Oj0\na7mw9DKlHreH67i/R9znX6nd1KESkmZsGuOlXFTjsQUX0+1x414V3NP8eyWQ24LF\ntjN0AYZR8oo0GyT6+DmFmEHovMwsMujEz/rfl7webBT57pOAFcTVFv9GYWxypFZ5\n5zLQI1cTMQKBgF541Ccis0pzf3ocNs29cr1oK5edPwKO0aGOxNzwakN0hxbN7n4P\nzgv/5yVacLFS47WKS+kLYPNybeYphBYgjC5bo/B13f2ZgyhjFi7OASGs6ngRXZcc\nIOYNIQ3VWjK+HBLmu2JgEzounu9QW3aj2nkznQ+/Uh2+UfyigNQpuQnRAoGAAeHr\nRjPpqo8utfyK2+ohwokqcXrckYfaRKLazhdejXAyjht2U3Sg7/gnjssIBwXfgiy/\nmFWsCLUlm8uVhI0p7vkJdmb6K7sL3+jliaWxoOJuMn2/07NdmDds5i0fcYeD2JL+\nQf4eAAtcKbTM3BhSrI8i2U5cAKJMb313ObPyOSECgYEAwGxk5R+ovS5sO+wlZc8x\nch/xs3dqkS7nvbZI6HpAUlngr37LpnCmYF/nVuTBz1p1fSMRtGP7f7uSlrBiG3xA\njGWP4DtxrB8p8Rri+6fPaWUQnS3YbjJmdTnyCw3RVIjd17F0CbTgCjwlGU+HI1Jd\n/E/AcpVIppHZbmBkCsnKqS8=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@tradelia-push.iam.gserviceaccount.com",
  "client_id": "110472068512948127276",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40tradelia-push.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Push API Key (opzionale, per proteggere l'endpoint /api/send-push)
export const PUSH_API_KEY = 'your-secret-api-key-here';

