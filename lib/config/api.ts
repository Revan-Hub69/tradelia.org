/**
 * API Configuration
 * Flag per disattivare tutte le chiamate API e usare dati mock
 * Utile per sviluppo e testing del design senza dipendere da API esterne
 */
export const API_CONFIG = {
  // Disattiva tutte le chiamate API e usa dati mock
  DISABLE_API_CALLS: false, // PRODUCTION: Always use real APIs
  
  // Timeout per le chiamate API (ms)
  TIMEOUT: 10000,
  
  // Retry attempts
  MAX_RETRIES: 2,
};

/**
 * Wrapper per fetch che rispetta il flag DISABLE_API_CALLS
 */
export async function safeFetch(
  url: string,
  options?: RequestInit,
  mockData?: any
): Promise<Response> {
  if (API_CONFIG.DISABLE_API_CALLS) {
    // Ritorna una response mock
    return new Response(JSON.stringify(mockData || { success: true, data: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // Chiamata API normale
  return fetch(url, options);
}
