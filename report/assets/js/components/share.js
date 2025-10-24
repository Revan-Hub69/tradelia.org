/*
  Tradelia · components/share.js (v1.2 no short, no qr)
  - Bottom sheet responsive
  - Link copia
  - Social puliti: LinkedIn, X, Reddit, Quora, Email
  - Nessun tracking esterno automatico

  Accessibilità:
  - role="dialog" aria-modal="true"
  - ESC chiude
  - focus iniziale sul bottone "Copia" all'apertura
*/

export function initShareSystem() {
  const BTN_ID = '#btn-share';
  const EXISTING = document.querySelector('#share-overlay');
  if (EXISTING) {
    wireUpOverlay(EXISTING);
    return;
  }

  // Costruzione overlay DOM
  const overlay = document.createElement('div');
  overlay.id = 'share-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="share-overlay__backdrop" data-share-close></div>
    <section class="share-sheet" role="dialog" aria-modal="true" aria-labelledby="share-sheet-title">
      <header class="share-sheet__header">
        <div class="share-sheet__title-wrap">
          <div class="share-sheet__title">
            <i data-lucide="share-2"></i>
            <span id="share-sheet-title">Condividi il report</span>
          </div>
          <div class="share-sheet__sub">
            Link diretto + condivisione social.
            Nessun tracciamento di terze parti.
          </div>
        </div>
        <button class="share-close-btn" type="button" data-share-close aria-label="Chiudi pannello Condividi">
          <i data-lucide="x"></i>
        </button>
      </header>

      <div class="share-sheet__body">

        <!-- LINK COMPLETO -->
        <section class="share-linkbox" aria-labelledby="share-linkbox-full-h">
          <div class="share-linkbox__label" id="share-linkbox-full-h">Link completo</div>
          <div class="share-linkbox__row">
            <div class="share-linkbox__url" id="share-url-full">—</div>
            <button class="share-copy-btn" id="share-copy-full" type="button">Copia</button>
          </div>
        </section>

        <!-- SOCIAL -->
        <section class="share-social" aria-label="Condividi tramite">
          <button class="share-social-btn" type="button" data-share="linkedin">
            <i data-lucide="linkedin"></i><span>LinkedIn</span>
          </button>

          <button class="share-social-btn" type="button" data-share="x">
            <i data-lucide="twitter"></i><span>X / Twitter</span>
          </button>

          <button class="share-social-btn" type="button" data-share="reddit">
            <i data-lucide="reddit"></i><span>Reddit</span>
          </button>

          <button class="share-social-btn" type="button" data-share="quora">
            <i data-lucide="message-circle"></i><span>Quora</span>
          </button>

          <button class="share-social-btn" type="button" data-share="email">
            <i data-lucide="mail"></i><span>Email</span>
          </button>
        </section>

      </div>

      <footer class="share-sheet__footer">
        <button class="share-done-btn" type="button" data-share-close>Chiudi</button>
      </footer>
    </section>
  `;

  document.body.appendChild(overlay);

  if (window.lucide) { window.lucide.createIcons(); }

  wireUpOverlay(overlay);

  const triggerBtn = document.querySelector(BTN_ID);
  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => openShare(overlay));
  }
}

/* ==========================================================
   Wiring / Behavior
   ========================================================== */
function wireUpOverlay(overlay) {
  const triggerBtn   = document.querySelector('#btn-share');
  const copyFullBtn  = overlay.querySelector('#share-copy-full');
  const urlFullNode  = overlay.querySelector('#share-url-full');

  // Apri da pulsante header
  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => openShare(overlay));
  }

  // Chiudi con backdrop o pulsanti con data-share-close
  overlay.addEventListener('click', e => {
    if (e.target.closest('[data-share-close]')) {
      closeShare(overlay);
    }
  });

  // ESC chiude se aperto
  document.addEventListener('keydown', e => {
    if (overlay.getAttribute('aria-hidden') === 'false' && e.key === 'Escape') {
      closeShare(overlay);
    }
  });

  // Copy link completo
  copyFullBtn?.addEventListener('click', async () => {
    const link = getFullURL();
    await tryCopy(link, copyFullBtn, urlFullNode);
  });

  // Social share
  overlay.querySelectorAll('[data-share]').forEach(btn => {
    btn.addEventListener('click', () => {
      const linkFull = encodeURIComponent(getFullURL());
      const title    = encodeURIComponent('Tradelia · Report Runtime');
      const text     = encodeURIComponent('Analisi di mercato by Tradelia · Report Runtime');

      let shareUrl = null;
      const which = btn.getAttribute('data-share');

      if (which === 'linkedin') {
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${linkFull}`;
      } else if (which === 'x') {
        shareUrl = `https://twitter.com/intent/tweet?url=${linkFull}&text=${text}`;
      } else if (which === 'reddit') {
        shareUrl = `https://www.reddit.com/submit?url=${linkFull}&title=${text}`;
      } else if (which === 'quora') {
        // Quora richiede login se non autenticato; non mettiamo pixel noi
        shareUrl = `https://www.quora.com/share?url=${linkFull}&title=${text}`;
      } else if (which === 'email') {
        const subject = title;
        const body    = encodeURIComponent(
          `Guarda questo report:\n${decodeURIComponent(linkFull)}\n\nFonte: Tradelia · Report Runtime`
        );
        shareUrl = `mailto:?subject=${subject}&body=${body}`;
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
      }
    });
  });

  // Popola il link visibile
  syncData();

  function syncData() {
    const full  = getFullURL();
    urlFullNode.textContent = full;
  }
}

/* Apertura */
function openShare(overlay) {
  overlay.setAttribute('aria-hidden', 'false');

  requestAnimationFrame(() => {
    overlay.classList.add('is-open');
  });

  // focus sul bottone copia, per UX mobile e accessibilità tastiera
  const copyFullBtn = overlay.querySelector('#share-copy-full');
  if (copyFullBtn) {
    copyFullBtn.focus();
  }

  if (window.lucide) { window.lucide.createIcons(); }
}

/* Chiusura */
function closeShare(overlay) {
  overlay.classList.remove('is-open');
  overlay.addEventListener('transitionend', () => {
    overlay.setAttribute('aria-hidden', 'true');
  }, { once: true });

  // torna focus al pulsante share nell'header
  const triggerBtn = document.querySelector('#btn-share');
  if (triggerBtn) triggerBtn.focus();
}

/* ==========================================================
   Helpers
   ========================================================== */

function getFullURL() {
  const u = new URL(window.location.href);
  u.hash = '';
  return u.toString();
}

async function tryCopy(text, btn, fallbackNode) {
  try {
    await navigator.clipboard.writeText(text);
    btn.classList.add('copied');
    btn.textContent = 'Copiato';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.textContent = 'Copia';
    }, 2000);
  } catch {
    // fallback: seleziona manualmente
    selectText(fallbackNode);
  }
}

function selectText(node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}
