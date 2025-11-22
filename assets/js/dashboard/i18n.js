/* eslint-env browser */
/**
 * Internationalization (i18n) System
 * BEST PRACTICE: W3C Internationalization Guidelines, Global UX
 * Sistema base per supporto multilingue (italiano/inglese)
 */

const STORAGE_KEY = "dashboard-language";

// Translations
const translations = {
  it: {
    // Navigation
    "nav.home": "Home",
    "nav.reports": "Report",
    "nav.notifications": "Notifiche",
    "nav.settings": "Impostazioni",

    // Common
    "common.loading": "Caricamento in corso...",
    "common.error": "Errore",
    "common.success": "Successo",
    "common.save": "Salva",
    "common.cancel": "Annulla",
    "common.close": "Chiudi",
    "common.confirm": "Conferma",

    // Favorites
    "favorites.add": "Aggiungi ai preferiti",
    "favorites.remove": "Rimuovi dai preferiti",
    "favorites.added": "Aggiunto ai preferiti",
    "favorites.removed": "Rimosso dai preferiti",
    "favorites.section": "Preferiti",

    // Security
    "security.secure": "Connessione sicura",
    "security.privacy": "Privacy Policy",
    "security.terms": "Termini di Servizio",
    "security.cookie": "Cookie Policy",

    // Theme
    "theme.dark": "Tema scuro",
    "theme.light": "Tema chiaro",
    "theme.switch.dark": "Passa a tema scuro",
    "theme.switch.light": "Passa a tema chiaro",
    "theme.changed": "Tema cambiato a",

    // Feedback
    "feedback.saving": "Salvataggio in corso...",
    "feedback.saved": "Salvato",
    "feedback.loading": "Caricamento in corso...",

    // Network
    "network.offline": "Connessione assente",
    "network.slow": "Connessione lenta",
    "network.online": "Connessione ripristinata",

    // Pull to refresh
    "refresh.pull": "Trascina per aggiornare",
    "refresh.release": "Rilascia per aggiornare",
    "refresh.updating": "Aggiornamento...",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.reports": "Reports",
    "nav.notifications": "Notifications",
    "nav.settings": "Settings",

    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.close": "Close",
    "common.confirm": "Confirm",

    // Favorites
    "favorites.add": "Add to favorites",
    "favorites.remove": "Remove from favorites",
    "favorites.added": "Added to favorites",
    "favorites.removed": "Removed from favorites",
    "favorites.section": "Favorites",

    // Security
    "security.secure": "Secure connection",
    "security.privacy": "Privacy Policy",
    "security.terms": "Terms of Service",
    "security.cookie": "Cookie Policy",

    // Theme
    "theme.dark": "Dark theme",
    "theme.light": "Light theme",
    "theme.switch.dark": "Switch to dark theme",
    "theme.switch.light": "Switch to light theme",
    "theme.changed": "Theme changed to",

    // Feedback
    "feedback.saving": "Saving...",
    "feedback.saved": "Saved",
    "feedback.loading": "Loading...",

    // Network
    "network.offline": "No connection",
    "network.slow": "Slow connection",
    "network.online": "Connection restored",

    // Pull to refresh
    "refresh.pull": "Pull to refresh",
    "refresh.release": "Release to refresh",
    "refresh.updating": "Updating...",
  },
};

let currentLang = "it";

/**
 * Initialize i18n system
 */
export function initI18n() {
  // Detect browser language
  const browserLang = navigator.language || navigator.userLanguage;
  const detectedLang = browserLang.startsWith("en") ? "en" : "it";

  // Get saved language or use detected
  const savedLang = localStorage.getItem(STORAGE_KEY);
  currentLang = savedLang || detectedLang;

  // Apply language
  setLanguage(currentLang);

  // Create language switcher
  createLanguageSwitcher();
}

/**
 * Set language
 */
export function setLanguage(lang) {
  if (!translations[lang]) {
    console.warn(`[i18n] Language ${lang} not supported, falling back to 'it'`);
    lang = "it";
  }

  currentLang = lang;
  document.documentElement.setAttribute("lang", lang);
  localStorage.setItem(STORAGE_KEY, lang);

  // Update all translatable elements
  updateTranslatableElements();

  // Announce to screen reader
  if (window.announceToScreenReader) {
    window.announceToScreenReader(t("common.language.changed", lang));
  }
}

/**
 * Translate key
 */
export function t(key, lang = null) {
  const useLang = lang || currentLang;
  return translations[useLang]?.[key] || translations.it?.[key] || key;
}

/**
 * Get current language
 */
export function getCurrentLanguage() {
  return currentLang;
}

/**
 * Update all translatable elements
 */
function updateTranslatableElements() {
  // Update elements with data-i18n attribute
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  // Update elements with data-i18n-aria-label
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria-label");
    el.setAttribute("aria-label", t(key));
  });

  // Update elements with data-i18n-placeholder
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.setAttribute("placeholder", t(key));
  });
}

/**
 * Create language switcher
 */
function createLanguageSwitcher() {
  // Add to sidebar footer if exists
  const sidebarFooter = document.querySelector(".desktop-sidebar-footer");
  if (sidebarFooter && !document.getElementById("language-switcher")) {
    const switcher = document.createElement("div");
    switcher.id = "language-switcher";
    switcher.className = "language-switcher";
    switcher.setAttribute("role", "group");
    switcher.setAttribute("aria-label", "Seleziona lingua");

    switcher.innerHTML = `
      <button 
        class="lang-btn ${currentLang === "it" ? "active" : ""}" 
        data-lang="it"
        aria-label="Italiano"
        aria-pressed="${currentLang === "it"}"
      >
        IT
      </button>
      <button 
        class="lang-btn ${currentLang === "en" ? "active" : ""}" 
        data-lang="en"
        aria-label="English"
        aria-pressed="${currentLang === "en"}"
      >
        EN
      </button>
    `;

    switcher.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang;
        setLanguage(lang);

        // Update buttons
        switcher.querySelectorAll(".lang-btn").forEach((b) => {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
      });
    });

    sidebarFooter.appendChild(switcher);
  }
}

// Export for use in other modules
window.t = t;
window.setLanguage = setLanguage;
window.getCurrentLanguage = getCurrentLanguage;
