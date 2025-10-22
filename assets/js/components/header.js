// /assets/js/components/header.js
import { openShare } from './share.js';

export function initHeader() {
  const el = document.getElementById('app-header');
  if (!el) {
    console.warn('[header] #app-header non trovato');
    return;
  }

  el.innerHTML = `
    <div class="max-w-7xl mx-auto px-3 sm:px-5 h-12 sm:h-14 flex items-center justify-between">
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <a href="/" class="shrink-0 text-lg sm:text-xl font-extrabold tracking-tight text-sky-900 hover:opacity-90 transition"
           aria-label="Tradelia Home">
          <span class="text-slate-900">TRADELIA</span><span class="text-blue-600">&bull;AI</span>
        </a>
        <span class="text-slate-400 text-xs sm:text-sm truncate" aria-live="polite">Report Runtime</span>
      </div>
      <div class="flex items-center gap-1.5 sm:gap-2">
        <button id="btn-print" class="btn" type="button" aria-label="Stampa o esporta in PDF">
          <i data-lucide="printer" aria-hidden="true"></i>
          <span class="hidden sm:inline">Stampa / PDF</span>
        </button>
        <button id="btn-share" class="btn" type="button" aria-label="Condividi il report">
          <i data-lucide="share-2" aria-hidden="true"></i>
          <span class="hidden sm:inline">Condividi</span>
        </button>
      </div>
    </div>
  `;

  // icone
  try { window.lucide?.createIcons?.(); } catch {}

  // azioni
  const btnPrint = el.querySelector('#btn-print');
  const btnShare = el.querySelector('#btn-share');

  btnPrint?.addEventListener('click', () => window.print());

  btnShare?.addEventListener('click', async () => {
    try {
      // Costruisce un URL condivisibile: se mancano parametri, imposta id=sample
      const url = new URL(window.location.href);
      if (!url.searchParams.get('id') && !url.searchParams.get('data')) {
        url.searchParams.set('id', 'sample');
      }
      url.hash = ''; // link pulito
      const longUrl = url.toString();

      const payload = {
        longUrl,
        title: 'Tradelia · Report Runtime',
        text: 'Guarda il report completo su Tradelia AI'
      };

      if (typeof openShare === 'function') {
        await openShare(payload);
        return;
      }

      // Fallback nativo / clipboard
      if (navigator.share) {
        await navigator.share({ title: payload.title, text: payload.text, url: longUrl });
      } else {
        await navigator.clipboard?.writeText(longUrl);
        btnShare.setAttribute('aria-label', 'Link copiato negli appunti');
        btnShare.classList.add('ring-2', 'ring-blue-300');
        setTimeout(() => {
          btnShare.classList.remove('ring-2', 'ring-blue-300');
          btnShare.setAttribute('aria-label', 'Condividi il report');
        }, 1200);
      }
    } catch (err) {
      console.error('[header] share error:', err);
      alert('Impossibile condividere: ' + (err?.message || 'errore sconosciuto'));
    }
  });
}
