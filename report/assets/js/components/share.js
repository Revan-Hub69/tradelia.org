// /report/assets/js/components/share.js
// Gestione overlay di condivisione (link diretto + social + copia).
// Viene importato in index.html e initShareSystem() viene chiamato subito.
//
// Questo script NON apre/chiude l'overlay: quello è già gestito nell'index
// (btn-share apre, [data-share-close] chiude).
// Qui ci occupiamo di:
//  - Popolare il link nel campo "Copia link"
//  - Gestire il click sui pulsanti social
//  - Copiare negli appunti
//  - Feedback visivo "Copiato!"
//
// Dipendenze lato DOM (già in index.html):
//  - #share-overlay
//  - #share-link-field
//  - #share-copy-btn [data-share-svc="copy"]
//  - .share-btn[data-share-svc="linkedin"|"twitter"|"reddit"|"copy"]
//
// NOTE: se vuoi testo più ricco nei social, puoi usare headerData quando disponibile.
// Qui rimaniamo robusti e usiamo fallback generico se headerData non è pronto.

export function initShareSystem() {
  const overlayEl        = document.getElementById('share-overlay');
  const linkField        = document.getElementById('share-link-field');
  const copyBtn          = document.getElementById('share-copy-btn');
  const shareButtonsNode = overlayEl ? overlayEl.querySelectorAll('.share-btn') : [];

  // --------------------------------------------------
  // 1. Determina URL da condividere
  //    - prendiamo l'URL attuale SENZA hash (#...)
  //    - lo mettiamo nel campo
  // --------------------------------------------------
  const fullUrl = (() => {
    try {
      // togli eventuale hash type #section
      const loc = window.location;
      const base = loc.origin + loc.pathname + loc.search;
      return base;
    } catch(e){
      return window.location.href;
    }
  })();

  if (linkField) {
    linkField.textContent = fullUrl;
  }

  // titolo/descrizione social
  // se app.js ha già caricato headerData, usiamo quello per un testo più carino
  function getShareMeta() {
    const hd = window.Tradelia && window.Tradelia.headerData ? window.Tradelia.headerData : null;
    if (hd) {
      const tkr = hd.Ticker || '';
      const venue = hd.Venue ? ` (${hd.Venue})` : '';
      return {
        title: `Tradelia · ${tkr}${venue}`.trim(),
        text: `Report Runtime su ${tkr}${venue ? ' ' + venue : ''}. Snapshot ${hd.Start || ''} → ${hd.End || ''}.`,
      };
    }
    // fallback safe
    return {
      title: 'Tradelia · Report Runtime',
      text: 'Analisi multi-timeframe, sentiment, intermarket, rischio e broker regolamentati.'
    };
  }

  // --------------------------------------------------
  // 2. Condivisione nativa mobile (Web Share API) se disponibile
  // --------------------------------------------------
  async function tryNativeShare() {
    const meta = getShareMeta();
    if (navigator.share) {
      try {
        await navigator.share({
          title: meta.title,
          text: meta.text,
          url: fullUrl
        });
        return true;
      } catch(err){
        // utente ha chiuso o share non andata -> ignora
        return false;
      }
    }
    return false;
  }

  // --------------------------------------------------
  // 3. Apertura social window
  // --------------------------------------------------
  function openSocial(service) {
    const meta = getShareMeta();

    let shareUrl = '';
    const encUrl   = encodeURIComponent(fullUrl);
    const encText  = encodeURIComponent(meta.text || '');
    const encTitle = encodeURIComponent(meta.title || '');

    switch(service){
      case 'linkedin':
        // LinkedIn share
        // param standard: url + title + summary opzionale
        shareUrl =
          `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`;
        break;

      case 'twitter':
      case 'x':
        // X (ex Twitter), tweet = text + url
        shareUrl =
          `https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`;
        break;

      case 'reddit':
        // Reddit submit
        shareUrl =
          `https://www.reddit.com/submit?url=${encUrl}&title=${encTitle}`;
        break;

      default:
        shareUrl = '';
    }

    if (!shareUrl) return;

    // Apri in popup centrato (desktop); su mobile è comunque una nuova scheda
    const w = 600;
    const h = 500;
    const left = (window.screen.width  - w) / 2;
    const top  = (window.screen.height - h) / 2;
    window.open(
      shareUrl,
      '_blank',
      `noopener,noreferrer,width=${w},height=${h},left=${left},top=${top}`
    );
  }

  // --------------------------------------------------
  // 4. Copia negli appunti + feedback visivo
  // --------------------------------------------------
  async function copyToClipboard() {
    if (!fullUrl) return;
    try {
      await navigator.clipboard.writeText(fullUrl);
      flashCopied(copyBtn, linkField);
    } catch(err){
      // fallback vecchio: selezione manuale
      fallbackManualCopy(fullUrl);
      flashCopied(copyBtn, linkField);
    }
  }

  function fallbackManualCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly','');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e){}
    document.body.removeChild(ta);
  }

  function flashCopied(btnEl, fieldEl) {
    if (btnEl){
      btnEl.classList.add('is-copied');
      btnEl.textContent = 'Copiato!';
      setTimeout(() => {
        btnEl.classList.remove('is-copied');
        btnEl.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <span>Copia</span>
        `;
      }, 1500);
    }

    if (fieldEl){
      fieldEl.classList.add('copied');
      setTimeout(() => {
        fieldEl.classList.remove('copied');
      }, 1500);
    }
  }

  // --------------------------------------------------
  // 5. Event binding pulsanti nella share-sheet
  // --------------------------------------------------
  shareButtonsNode.forEach(btn => {
    btn.addEventListener('click', async () => {
      const svc = btn.getAttribute('data-share-svc');

      // se è "copy" → copia negli appunti
      if (svc === 'copy') {
        copyToClipboard();
        return;
      }

      // su mobile proviamo prima Web Share API (solo una volta per X/LinkedIn/Reddit)
      const isMobile = window.matchMedia('(max-width: 640px)').matches;
      if (isMobile) {
        const didNative = await tryNativeShare();
        if (didNative) return;
        // se nativa fallisce → continuo con shareUrl classico
      }

      // apri share URL nel popup / nuova tab
      openSocial(svc === 'twitter' ? 'twitter' : svc);
    });
  });

  // --------------------------------------------------
  // 6. Copy anche da #share-copy-btn (fuori dalla griglia social)
  // --------------------------------------------------
  if (copyBtn) {
    copyBtn.addEventListener('click', copyToClipboard);
  }
}
