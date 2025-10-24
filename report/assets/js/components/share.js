/*
  Tradelia · components/share.js
  Gestisce il foglio di condivisione attivato da #btn-share

  privacy:
  - nessun social pixel viene chiamato automaticamente
  - forniamo link puliti che l'utente apre (LinkedIn/X/email)
  - QR viene generato in locale via QRCode.js (fallback interno se non disponibile)

  accessibility:
  - role="dialog" aria-modal="true"
  - ESC chiude
  - focus iniziale sul bottone "Copia link"
*/

export function initShareSystem() {
  const BTN_ID = '#btn-share';
  const EXISTING = document.querySelector('#share-overlay');
  if (EXISTING) {
    wireUpOverlay(EXISTING);
    return;
  }

  // === costruiamo overlay DOM ===
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
            Link diretto e QR. Nessun tracciamento, nessun cookie.
          </div>
        </div>
        <button class="share-close-btn" type="button" data-share-close aria-label="Chiudi pannello Condividi">
          <i data-lucide="x"></i>
        </button>
      </header>

      <div class="share-sheet__body">

        <!-- LINK DIRETTO -->
        <section class="share-linkbox" aria-labelledby="share-linkbox-h">
          <div class="card-header" style="margin:0">
            <div class="card-title" id="share-linkbox-h">Link diretto al report</div>
          </div>
          <div class="share-linkbox__row">
            <div class="share-linkbox__url" id="share-url">—</div>
            <button class="share-copy-btn" id="share-copy-btn" type="button">Copia</button>
          </div>
        </section>

        <!-- QR -->
        <section class="share-qrbox" aria-labelledby="share-qrbox-h">
          <div class="share-qrbox__canvas-wrap">
            <canvas id="share-qr" width="88" height="88" aria-hidden="true"></canvas>
          </div>
          <div class="share-qrbox__text">
            <div class="card-title" style="font-size:13px;line-height:1.4" id="share-qrbox-h">QR offline</div>
            <p class="card-sub" style="margin-top:4px;line-height:1.4">
              Inquadra per aprire questa stessa pagina sul telefono.
              <br /><strong>Nessun redirect esterno.</strong>
            </p>
          </div>
        </section>

        <!-- SOCIAL CLEAN ROW -->
        <section class="share-social" aria-label="Condividi tramite">
          <button class="share-social-btn" type="button" data-share="linkedin">
            <i data-lucide="linkedin"></i><span>LinkedIn</span>
          </button>
          <button class="share-social-btn" type="button" data-share="x">
            <i data-lucide="twitter"></i><span>X / Twitter</span>
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

  // icone lucide
  if (window.lucide) { window.lucide.createIcons(); }

  // listeners + hydration
  wireUpOverlay(overlay);

  // collega il bottone header
  const triggerBtn = document.querySelector(BTN_ID);
  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => openShare(overlay));
  }
}

/* ==========================================================
   Wiring / Behavior
   ========================================================== */
function wireUpOverlay(overlay) {
  const triggerBtn = document.querySelector('#btn-share');
  const copyBtn    = overlay.querySelector('#share-copy-btn');
  const urlNode    = overlay.querySelector('#share-url');
  const qrCanvas   = overlay.querySelector('#share-qr');

  // apri da pulsante header
  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => openShare(overlay));
  }

  // chiusure
  overlay.addEventListener('click', e => {
    if (e.target.closest('[data-share-close]')) {
      closeShare(overlay);
    }
  });

  // ESC chiude
  document.addEventListener('keydown', e => {
    if (overlay.getAttribute('aria-hidden') === 'false' && e.key === 'Escape') {
      closeShare(overlay);
    }
  });

  // copia link
  copyBtn?.addEventListener('click', async () => {
    const link = getCleanURL();
    try {
      await navigator.clipboard.writeText(link);
      copyBtn.classList.add('copied');
      copyBtn.textContent = 'Copiato';
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.textContent = 'Copia';
      }, 2000);
    } catch {
      // fallback manuale
      selectText(urlNode);
    }
  });

  // share social con link pulito
  overlay.querySelectorAll('[data-share]').forEach(btn => {
    btn.addEventListener('click', () => {
      const link   = encodeURIComponent(getCleanURL());
      const which  = btn.getAttribute('data-share');
      let shareUrl = null;

      if (which === 'linkedin') {
        // LinkedIn non inietta pixel finché non apri la pagina
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${link}`;
      } else if (which === 'x') {
        const text = encodeURIComponent('Analisi di mercato by Tradelia · Report Runtime');
        shareUrl = `https://twitter.com/intent/tweet?url=${link}&text=${text}`;
      } else if (which === 'email') {
        const subject = encodeURIComponent('Tradelia · Report Runtime');
        const body    = encodeURIComponent(
          `Dai un'occhiata a questo report:\n${decodeURIComponent(link)}\n\nFonte: Tradelia · Report Runtime`
        );
        shareUrl = `mailto:?subject=${subject}&body=${body}`;
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
      }
    });
  });

  // popola dati dinamici (URL + QR)
  syncData();

  function syncData() {
    const link = getCleanURL();
    urlNode.textContent = link;
    renderQR(qrCanvas, link);
  }
}

/* Apertura */
function openShare(overlay) {
  overlay.setAttribute('aria-hidden', 'false');

  requestAnimationFrame(() => {
    overlay.classList.add('is-open');
  });

  // focus di default sul bottone copia
  const copyBtn = overlay.querySelector('#share-copy-btn');
  if (copyBtn) {
    copyBtn.focus();
  }

  if (window.lucide) { window.lucide.createIcons(); }
}

/* Chiusura */
function closeShare(overlay) {
  overlay.classList.remove('is-open');
  overlay.addEventListener('transitionend', () => {
    overlay.setAttribute('aria-hidden', 'true');
  }, { once: true });

  // ridai focus al pulsante share in header
  const triggerBtn = document.querySelector('#btn-share');
  if (triggerBtn) triggerBtn.focus();
}

/* ==========================================================
   Helpers
   ========================================================== */

/* Restituisce l'URL pulito da condividere: togliamo hash (#) */
function getCleanURL() {
  const u = new URL(window.location.href);
  u.hash = '';
  // Se vuoi filtrare parametri in futuro, fallo qui.
  return u.toString();
}

/* fallback per copia manuale */
function selectText(node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

/*
  renderQR(canvas, text)
  - primo tentativo: usa QRCode (libreria esterna caricata da CDN)
    -> genera un QR vero e scansionabile
  - fallback: disegno placeholder \"QR-like\" se la libreria non è disponibile
*/
function renderQR(canvas, text) {
  if (!canvas) return;

  // caso 1: libreria QRCode disponibile (quella che abbiamo incluso da CDN)
  if (window.QRCode && typeof window.QRCode.toCanvas === 'function') {
    window.QRCode.toCanvas(
      canvas,
      text,
      {
        margin: 1,
        scale: 4,
        color: { dark: "#000000", light: "#ffffff" }
      },
      (err) => {
        if (err) {
          console.error('QR gen error, fallback...', err);
          drawFallbackQR(canvas, text);
        }
      }
    );
    return;
  }

  // caso 2: fallback immediato se la libreria non c'è
  drawFallbackQR(canvas, text);
}

/*
  drawFallbackQR:
  - cornici stile QR
  - pattern pseudo-casuale
  - url abbreviato in piccolo
  non è scansionabile, ma esteticamente riempie il box
*/
function drawFallbackQR(canvas, text) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // sfondo bianco
  ctx.fillStyle = '#fff';
  ctx.fillRect(0,0,w,h);

  // bordo nero
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(0,0,w,h);

  // quadrati finder corner
  ctx.fillStyle = '#000';
  drawSquare(ctx, 6,6,20);
  drawSquare(ctx, w-26,6,20);
  drawSquare(ctx, 6,h-26,20);

  // pattern pseudo-random
  const hash = hashCode(text);
  for (let i=0;i<80;i++){
    const rx = (hash + i*73) % (w-16) + 8;
    const ry = ((hash>>2) + i*91) % (h-16) + 8;
    if ((i+hash)%3===0) {
      ctx.fillRect(rx, ry, 2, 2);
    }
  }

  // url accorciato sotto
  ctx.fillStyle = '#000';
  ctx.font = '8px ui-monospace, monospace';
  const shortTxt = text.length > 24 ? text.slice(0,24) + '…' : text;
  ctx.fillText(shortTxt, 6, h-4);
}

function drawSquare(ctx, x,y,sz){
  ctx.fillRect(x,y,sz,sz);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x+4,y+4,sz-8,sz-8);
  ctx.fillStyle = '#000';
  ctx.fillRect(x+8,y+8,sz-16,sz-16);
}

function hashCode(str){
  let h=0;
  for(let i=0;i<str.length;i++){
    h=((h<<5)-h)+str.charCodeAt(i);
    h|=0;
  }
  return Math.abs(h);
}
