/* eslint-env browser */
/**
 * Pull-to-Refresh Implementation
 * BEST PRACTICE: Mobile UX Patterns (iOS/Android)
 * Pattern standard su mobile per aggiornare contenuto
 */

let touchStartY = 0;
let isPulling = false;
let pullDistance = 0;
let refreshIndicator = null;

/**
 * Initialize pull-to-refresh
 */
export function initPullToRefresh() {
  if (window.innerWidth > 768) {
    return;
  } // Solo su mobile

  createRefreshIndicator();

  document.addEventListener("touchstart", handleTouchStart, { passive: true });
  document.addEventListener("touchmove", handleTouchMove, { passive: false });
  document.addEventListener("touchend", handleTouchEnd, { passive: true });
}

/**
 * Handle touch start
 */
function handleTouchStart(e) {
  // Solo se siamo in cima alla pagina
  if (window.scrollY === 0) {
    touchStartY = e.touches[0].clientY;
    isPulling = true;
    pullDistance = 0;
  } else {
    isPulling = false;
  }
}

/**
 * Handle touch move
 */
function handleTouchMove(e) {
  if (!isPulling) {
    return;
  }

  const currentY = e.touches[0].clientY;
  pullDistance = currentY - touchStartY;

  // Solo se stiamo tirando verso il basso
  if (pullDistance > 0) {
    e.preventDefault(); // Previeni scroll nativo

    if (pullDistance > 80) {
      showRefreshIndicator();
      const text = refreshIndicator?.querySelector(".pull-to-refresh-text");
      if (text) {
        text.textContent = text.dataset.release || "Rilascia per aggiornare";
      }
    } else {
      hideRefreshIndicator();
      const text = refreshIndicator?.querySelector(".pull-to-refresh-text");
      if (text) {
        text.textContent = text.dataset.pull || "Trascina per aggiornare";
      }
    }

    // Aggiorna posizione indicatore
    updateRefreshIndicator(pullDistance);
  } else {
    isPulling = false;
    hideRefreshIndicator();
  }
}

/**
 * Handle touch end
 */
function handleTouchEnd() {
  if (!isPulling) {
    return;
  }

  if (pullDistance > 80) {
    // Trigger refresh
    triggerRefresh();
  } else {
    hideRefreshIndicator();
  }

  isPulling = false;
  pullDistance = 0;
  touchStartY = 0;
}

/**
 * Create refresh indicator
 */
function createRefreshIndicator() {
  refreshIndicator = document.createElement("div");
  refreshIndicator.id = "pull-to-refresh-indicator";
  refreshIndicator.className = "pull-to-refresh-indicator";
  refreshIndicator.hidden = true;
  const pullText = window.t ? window.t("refresh.pull") : "Trascina per aggiornare";
  const releaseText = window.t ? window.t("refresh.release") : "Rilascia per aggiornare";

  refreshIndicator.innerHTML = `
    <div class="pull-to-refresh-content">
      <svg class="pull-to-refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="23 4 23 10 17 10"></polyline>
        <polyline points="1 20 1 14 7 14"></polyline>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
      </svg>
      <span class="pull-to-refresh-text" data-pull="${pullText}" data-release="${releaseText}">${pullText}</span>
    </div>
  `;
  document.body.insertBefore(refreshIndicator, document.body.firstChild);
}

/**
 * Show refresh indicator
 */
function showRefreshIndicator() {
  if (refreshIndicator) {
    refreshIndicator.hidden = false;
  }
}

/**
 * Hide refresh indicator
 */
function hideRefreshIndicator() {
  if (refreshIndicator) {
    refreshIndicator.hidden = true;
  }
}

/**
 * Update refresh indicator position
 */
function updateRefreshIndicator(distance) {
  if (!refreshIndicator) {
    return;
  }

  const maxDistance = 120;
  const progress = Math.min(distance / maxDistance, 1);
  const translateY = Math.min(distance, maxDistance);

  refreshIndicator.style.transform = `translateY(${translateY}px)`;
  refreshIndicator.style.opacity = progress;

  // Rotazione icona
  const icon = refreshIndicator.querySelector(".pull-to-refresh-icon");
  if (icon) {
    icon.style.transform = `rotate(${progress * 360}deg)`;
  }
}

/**
 * Trigger refresh
 */
async function triggerRefresh() {
  if (!refreshIndicator) {
    return;
  }

  refreshIndicator.classList.add("refreshing");
  const text = refreshIndicator.querySelector(".pull-to-refresh-text");
  if (text) {
    const updatingText = window.t ? window.t("refresh.updating") : "Aggiornamento...";
    text.textContent = updatingText;
  }

  try {
    // Ricarica la pagina o aggiorna i dati
    if (window.location.hash) {
      // Se siamo in un modulo, ricarica il modulo
      const moduleId = window.location.hash.slice(1);
      if (moduleId && window.loadModule) {
        await window.loadModule(moduleId);
      }
    } else {
      // Ricarica la dashboard
      window.location.reload();
    }
  } catch (error) {
    console.error("[PullToRefresh] Errore durante refresh:", error);
    if (text) {
      text.textContent = "Errore durante l'aggiornamento";
    }
    setTimeout(() => {
      hideRefreshIndicator();
      refreshIndicator?.classList.remove("refreshing");
    }, 2000);
  }
}
