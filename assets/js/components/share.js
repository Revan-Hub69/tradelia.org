// /report/assets/js/components/share.js
// Gestione overlay di condivisione (link diretto + social + copia).
// - Popola link
// - Web Share API (mobile)
// - Apertura social popup
// - Copia negli appunti con feedback

function initShareSystem() {

  function bootShare() {
    const overlayEl = document.getElementById('share-overlay');
    const linkField = document.getElementById('share-link-field');
    const copyBtn   = document.getElementById('share-copy-btn');
    const shareButtonsNode = overlayEl
      ? Array.from(overlayEl.querySelectorAll('.share-btn'))
      : [];

    // ---------------------------------
    // 1. URL da condividere (senza hash)
    // ---------------------------------
    const fullUrl = (() => {
      try {
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

    // testo social (usa headerData se disponibile)
    function getShareMeta() {
      const hd = window.Tradelia && window.Tradelia.headerData
        ? window.Tradelia.headerData
        : null;

      if (hd) {
        const tkr   = hd.Ticker || '';
        const venue = hd.Venue ? ` (${hd.Venue})` : '';
        return {
          title: `Tradelia · ${tkr}${venue}`.trim(),
          text:  `Report Runtime su ${tkr}${venue ? ' ' + venue : ''}. Snapshot ${hd.Start || ''} → ${hd.End || ''}.`
        };
      }

      return {
        title: 'Tradelia · Report Runtime',
        text:  'Analisi multi-timeframe, sentiment, intermarket, rischio e broker regolamentati.'
      };
    }

    // ---------------------------------
    // 2. Web Share API (mobile native share)
    // ---------------------------------
    async function tryNativeShare() {
      const meta = getShareMeta();
      if (navigator.share) {
        try {
          await navigator.share({
            title: meta.title,
            text:  meta.text,
            url:   fullUrl
          });
          return true;
        } catch(err){
          // utente annulla o share non supportata -> ignora
          return false;
        }
      }
      return false;
    }

    // ---------------------------------
    // 3. Apertura social popup
    // ---------------------------------
    function openSocial(service) {
      const meta = getShareMeta();

      const encUrl   = encodeURIComponent(fullUrl);
      const encText  = encodeURIComponent(meta.text || '');
      const encTitle = encodeURIComponent(meta.title || '');

      let shareUrl = '';

      switch(service){
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`;
          break;
        case 'twitter':
        case 'x':
          shareUrl = `https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`;
          break;
        case 'reddit':
          shareUrl = `https://www.reddit.com/submit?url=${encUrl}&title=${encTitle}`;
          break;
        default:
          shareUrl = '';
      }

      if (!shareUrl) return;

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

    // ---------------------------------
    // 4. Copia negli appunti + feedback
    // ---------------------------------
    async function copyToClipboard() {
      if (!fullUrl) return;
      try {
        await navigator.clipboard.writeText(fullUrl);
        flashCopied(copyBtn, linkField);
      } catch(err){
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

    // ---------------------------------
    // 5. Bind pulsanti social nella share-sheet
    // ---------------------------------
    shareButtonsNode.forEach(btn => {
      btn.addEventListener('click', async () => {
        const svc = btn.getAttribute('data-share-svc');

        if (svc === 'copy') {
          copyToClipboard();
          return;
        }

        const mobile = window.matchMedia('(max-width: 640px)').matches;
        if (mobile) {
          const didNative = await tryNativeShare();
          if (didNative) return;
        }

        openSocial(svc === 'twitter' ? 'twitter' : svc);
      });
    });

    // ---------------------------------
    // 6. Bind sul pulsante copia separato
    // ---------------------------------
    if (copyBtn) {
      copyBtn.addEventListener('click', copyToClipboard);
    }
  }

  // assicurati che il DOM esista
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootShare, { once: true });
  } else {
    bootShare();
  }
}

// auto-start (così non devi ricordarti di chiamarla da index.html)
initShareSystem();

export { initShareSystem };
