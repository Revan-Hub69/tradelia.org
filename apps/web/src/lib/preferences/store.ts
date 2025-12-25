type PreferencePayload = {
  theme: 'dark' | 'light'
  textScale: 'normal' | 'large'
  animations: 'on' | 'reduce'
}

const DB_NAME = 'tradelia-preferences'
const STORE_NAME = 'ui'
const DB_VERSION = 1

async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function readLocal(): Promise<PreferencePayload | null> {
  try {
    const db = await openDatabase()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get('ui-preferences')
      req.onsuccess = () => resolve((req.result as PreferencePayload) || null)
      req.onerror = () => reject(req.error)
    })
  } catch (error) {
    console.error('IndexedDB read failed', error)
    return null
  }
}

async function writeLocal(value: PreferencePayload) {
  try {
    const db = await openDatabase()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.put(value, 'ui-preferences')
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch (error) {
    console.error('IndexedDB write failed', error)
  }
}

export async function loadPreferences(userId?: string) {
  let remote: PreferencePayload | null = null

  if (userId) {
    const { db } = await import('../supabase/client')
    try {
      const { data, error } = await db.getPreferences(userId)
      if (!error && data) {
        remote = {
          theme: (data.theme as PreferencePayload['theme']) || 'dark',
          textScale: (data.text_scale as PreferencePayload['textScale']) || 'normal',
          animations: (data.animations as PreferencePayload['animations']) || 'on',
        }
      }
    } catch (error) {
      console.warn('Remote preferences unavailable', error)
    }
  }

  const local = await readLocal()

  return remote || local || { theme: 'dark', textScale: 'normal', animations: 'on' }
}

export async function savePreferences(value: PreferencePayload, userId?: string) {
  await writeLocal(value)

  if (userId) {
    const { db } = await import('../supabase/client')
    try {
      await db.savePreferences(userId, {
        theme: value.theme,
        text_scale: value.textScale,
        animations: value.animations,
      })
    } catch (error) {
      console.warn('Remote preferences save failed', error)
    }
  }
}

export type { PreferencePayload }
