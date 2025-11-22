/**
 * Token Storage for Service Worker
 * Salva token in IndexedDB per accesso dal Service Worker
 */

const DB_NAME = "tradelia-auth";
const DB_VERSION = 1;
const STORE_NAME = "tokens";

/**
 * Inizializza IndexedDB
 */
async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
  });
}

/**
 * Salva token in IndexedDB
 */
export async function saveTokenToIndexedDB(token) {
  if (!token) {
    return;
  }

  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    await store.put({ key: "access-token", value: token, updatedAt: Date.now() });
    console.log("[Token Storage] Token salvato in IndexedDB");
  } catch (error) {
    console.warn("[Token Storage] Errore salvataggio token:", error);
  }
}

/**
 * Ottiene token da IndexedDB
 */
export async function getTokenFromIndexedDB() {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get("access-token");
      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.value || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("[Token Storage] Errore lettura token:", error);
    return null;
  }
}

/**
 * Rimuove token da IndexedDB
 */
export async function removeTokenFromIndexedDB() {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    await store.delete("access-token");
    console.log("[Token Storage] Token rimosso da IndexedDB");
  } catch (error) {
    console.warn("[Token Storage] Errore rimozione token:", error);
  }
}

/**
 * Sincronizza token da localStorage a IndexedDB
 * Chiamare quando l'utente si autentica o il token cambia
 */
export async function syncTokenToIndexedDB() {
  const token = localStorage.getItem("tradelia-access-token-v1");
  if (token) {
    await saveTokenToIndexedDB(token);
  } else {
    await removeTokenFromIndexedDB();
  }
}
