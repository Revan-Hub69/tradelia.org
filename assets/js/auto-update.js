/**
 * Auto-update system for Tradelia AI
 *
 * Implements automatic update detection and notification following:
 * - W3C Service Worker API (https://www.w3.org/TR/service-workers/)
 * - PWA Best Practices (Microsoft Learn, 2024)
 * - WCAG 2.2 AA accessibility guidelines
 * - Non-intrusive UX patterns (Norman, 2013)
 *
 * Features:
 * - Automatic update detection every 5 minutes
 * - Network-first strategy for HTML content
 * - Accessible notification banner with ARIA
 * - Graceful degradation for unsupported browsers
 *
 * @version 2.0.0
 * @references
 * - W3C (2023). Service Workers. W3C Working Draft
 * - Microsoft (2024). Progressive Web Apps Best Practices
 * - Norman, D. A. (2013). The Design of Everyday Things
 */

(function () {
  "use strict";

  const VERSION = "2.0.0"; // Must match sw.js version
  const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
  const VERSION_CHECK_URL = "/version.json"; // Version manifest

  let updateCheckInterval = null;
  let updateNotification = null;

  // Create version.json if it doesn't exist (will be served by server)
  // This file should be generated on deploy with current version

  // Check for updates
  async function checkForUpdates() {
    try {
      // Check service worker update
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();

          // Listen for new service worker
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  showUpdateNotification();
                }
              });
            }
          });
        }
      }

      // Check version manifest
      try {
        const response = await fetch(`${VERSION_CHECK_URL}?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.version && data.version !== VERSION) {
            showUpdateNotification();
          }
        }
      } catch (e) {
        // Version file might not exist, that's ok
        console.log("[Auto-Update] Version check skipped:", e);
      }
    } catch (error) {
      console.error("[Auto-Update] Error checking updates:", error);
    }
  }

  // Show update notification
  function showUpdateNotification() {
    // Don't show multiple notifications
    if (updateNotification) {
      return;
    }

    // Create notification banner with full accessibility
    const banner = document.createElement("div");
    banner.id = "update-notification";
    banner.setAttribute("role", "alert");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-atomic", "true");
    banner.setAttribute("aria-label", "Notifica aggiornamento disponibile");
    banner.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      background: var(--brand-600, #2563eb);
      color: var(--ink-invert, #ffffff);
      padding: 16px 24px;
      border-radius: var(--radius-md, 8px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      gap: 16px;
      max-width: 90%;
      width: 500px;
      animation: slideDown 0.3s ease;
      /* WCAG 2.2 AA: Ensure sufficient contrast */
      border: 2px solid rgba(255, 255, 255, 0.2);
    `;

    banner.innerHTML = `
      <div style="flex: 1;">
        <strong id="update-title" style="display: block; margin-bottom: 4px; font-size: 15px;">Aggiornamento disponibile</strong>
        <span id="update-description" style="font-size: 13px; opacity: 0.9; display: block;">Una nuova versione è disponibile. Aggiorna per vedere le ultime modifiche.</span>
      </div>
      <button 
        id="update-now-btn" 
        type="button"
        aria-describedby="update-description"
        style="
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
          min-width: 120px;
        "
        onfocus="this.style.outline='2px solid rgba(255,255,255,0.8)'; this.style.outlineOffset='2px';"
        onblur="this.style.outline='none';"
      >Aggiorna ora</button>
      <button 
        id="update-dismiss-btn" 
        type="button"
        aria-label="Chiudi notifica aggiornamento"
        style="
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          opacity: 0.7;
          transition: opacity 0.2s;
          min-width: 32px;
          min-height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
        onfocus="this.style.outline='2px solid rgba(255,255,255,0.8)'; this.style.outlineOffset='2px'; this.style.opacity='1';"
        onblur="this.style.outline='none'; this.style.opacity='0.7';"
        onmouseover="this.style.opacity='1';"
        onmouseout="this.style.opacity='0.7';"
      >
        <span aria-hidden="true">✕</span>
      </button>
    `;

    // Add animation with reduced motion support (WCAG 2.2)
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
      
      @media (prefers-reduced-motion: reduce) {
        #update-notification {
          animation: none;
        }
      }
      
      /* Focus visible for keyboard navigation */
      #update-now-btn:focus-visible,
      #update-dismiss-btn:focus-visible {
        outline: 2px solid rgba(255, 255, 255, 0.8);
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(banner);
    updateNotification = banner;

    // Update button with accessibility
    const updateBtn = banner.querySelector("#update-now-btn");
    updateBtn.onclick = async () => {
      updateBtn.textContent = "Aggiornamento...";
      updateBtn.setAttribute("aria-busy", "true");
      updateBtn.disabled = true;
      banner.setAttribute("aria-live", "assertive");
      banner.querySelector("#update-description").textContent = "Aggiornamento in corso...";
      await performUpdate();
    };

    // Dismiss button
    const dismissBtn = banner.querySelector("#update-dismiss-btn");
    dismissBtn.onclick = () => {
      banner.remove();
      updateNotification = null;
    };

    // Auto-dismiss after 30 seconds
    setTimeout(() => {
      if (updateNotification) {
        updateNotification.remove();
        updateNotification = null;
      }
    }, 30000);
  }

  // Perform update
  async function performUpdate() {
    try {
      // Clear all caches
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // Update service worker
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Send skip waiting message
          if (registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }

          // Unregister and re-register
          await registration.unregister();
        }

        // Re-register service worker
        await navigator.serviceWorker.register("/sw.js");
      }

      // Hard reload
      window.location.reload(true);
    } catch (error) {
      console.error("[Auto-Update] Error performing update:", error);
      alert("Errore durante l'aggiornamento. Ricarica manualmente la pagina.");
    }
  }

  // Initialize
  function init() {
    // Check immediately on load
    checkForUpdates();

    // Check periodically
    updateCheckInterval = setInterval(checkForUpdates, CHECK_INTERVAL);

    // Check when page becomes visible (user returns to tab)
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        checkForUpdates();
      }
    });

    // Check on focus
    window.addEventListener("focus", checkForUpdates);
  }

  // Start when DOM is ready - DISABILITATO (Progetto abbandonato)
  // if (document.readyState === 'loading') {
  //   document.addEventListener('DOMContentLoaded', init);
  // } else {
  //   init();
  // }
})();
