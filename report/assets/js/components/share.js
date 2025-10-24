/* =========================================================
   Tradelia · Share Sheet
   Gestione overlay di condivisione ("Condividi")
   Path: /report/assets/js/components/share.js
   ========================================================= */

function safeCreateIcons() {
  try {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  } catch {}
}

function buildOverlayMarkup() {
  const wrap = document.createElement("div");
  wrap.id = "share-overlay";
  wrap.className = "share-overlay noprint";
  wrap.setAttribute("aria-hidden", "true");

  wrap.innerHTML = `
    <div class="share-overlay__backdrop" data-share-close></div>

    <section class="share-sheet" role="dialog" aria-modal="true" aria-labelledby="share-title">
      <header class="share-sheet__header">
        <div class="share-sheet__titlewrap">
          <div class="share-sheet__title">
            <i data-lucide="share-2"></i>
            <span id="share-title">Condividi il report</span>
          </div>
          <div class="share-sheet__subtitle" id="share-sub">
            Link diretto a questa vista del Report Runtime
          </div>
        </div>

        <button class="share-sheet__closebtn" data-share-close aria-label="Chiudi condividi">
          <i data-lucide="x"></i>
        </button>
      </header>

      <div class="share-sheet__body">
        <div class="share-row">
          <label class="share-label" for="share-link">Link</label>
          <div class="share-linkwrap">
            <input id="share-link" class="share-input" type="text" readonly value="">
            <button class="btn btn-sm share-copy-btn" id="share-copy" type="button">
              <i data-lucide="link-2"></i>
              <span>Copia link</span>
            </button>
          </div>
        </div>

        <div class="share-row">
          <div class="share-hint">
            Puoi inviarlo via chat / email. Il link include l’ID del report.
          </div>
        </div>

        <div class="share-actions">
          <button class="btn btn-sm w-full justify-center" id="share-native" type="button">
            <i data-lucide="send"></i>
            <span>Condividi…</span>
          </button>
        </div>
      </div>
    </section>
  `;

  return wrap;
}

function getCurrentShareURL() {
  // usiamo direttamente l'URL corrente (con ?id=...)
  try {
    return new URL(location.href).toString();
  } catch {
    return location.href;
  }
}

export function initShareSystem() {
  // se è già stato inizializzato, basta uscire
  if (window.Tradelia?.Share?.__ready) return;

  // assicura namespace globale
  window.Tradelia = window.Tradelia || {};
  window.Tradelia.Share = window.Tradelia.Share || {};

  // prendi / crea overlay nel DOM
  let overlayEl = document.querySelector("#share-overlay");
  if (!overlayEl) {
    overlayEl = buildOverlayMarkup();
    document.body.appendChild(overlayEl);
  }

  const backdropEl   = overlayEl.querySelector(".share-overlay__backdrop");
  const closeBtns    = overlayEl.querySelectorAll("[data-share-close]");
  const copyBtn      = overlayEl.querySelector("#share-copy");
  const nativeBtn    = overlayEl.querySelector("#share-native");
  const inputEl      = overlayEl.querySelector("#share-link");

  // bottone header "Condividi"
  const triggerBtn   = document.querySelector("#btn-share");

  function openOverlay() {
    // aggiorna link
    const url = getCurrentShareURL();
    inputEl.value = url;

    // mostra overlay
    overlayEl.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      overlayEl.classList.add("is-open");
    });

    safeCreateIcons();
  }

  function closeOverlay() {
    overlayEl.classList.remove("is-open");
    overlayEl.addEventListener(
      "transitionend",
      () => {
        overlayEl.setAttribute("aria-hidden", "true");
      },
      { once: true }
    );
  }

  async function copyLink() {
    const url = getCurrentShareURL();
    try {
      await navigator.clipboard.writeText(url);
      // feedback rapido nel bottone
      const oldHtml = copyBtn.innerHTML;
      copyBtn.innerHTML = `<i data-lucide="check"></i><span>Copiato</span>`;
      safeCreateIcons();
      setTimeout(() => {
        copyBtn.innerHTML = oldHtml;
        safeCreateIcons();
      }, 1500);
    } catch {
      // fallback: seleziona input
      inputEl.select();
    }
  }

  async function nativeShare() {
    const url = getCurrentShareURL();
    const payload = {
      title: "Tradelia · Report Runtime",
      text: "Guarda questo report generato da Tradelia AI.",
      url
    };

    if (navigator.share) {
      try {
        await navigator.share(payload);
      } catch {
        // annullato o errore → non facciamo nulla
      }
    } else {
      // se Web Share API non c'è, fallback = copia link
      copyLink();
    }
  }

  // click backdrop o icona X chiude
  backdropEl.addEventListener("click", closeOverlay);
  closeBtns.forEach(btn => btn.addEventListener("click", closeOverlay));

  // copy
  copyBtn.addEventListener("click", copyLink);

  // native share
  nativeBtn.addEventListener("click", nativeShare);

  // ESC chiude
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlayEl.getAttribute("aria-hidden") === "false") {
      closeOverlay();
    }
  });

  // trigger header
  if (triggerBtn) {
    triggerBtn.addEventListener("click", openOverlay);
  }

  // metti reference globale utile se serve
  window.Tradelia.Share.open  = openOverlay;
  window.Tradelia.Share.close = closeOverlay;
  window.Tradelia.Share.__ready = true;

  // prima pass icone
  safeCreateIcons();
}
