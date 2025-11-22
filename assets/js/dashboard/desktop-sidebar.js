/* eslint-env browser */
/**
 * Desktop Sidebar Navigation
 * BEST PRACTICE: Coerenza Desktop vs Mobile (Cross-Platform UX Research 2024)
 * 75% utenti si aspetta esperienza coerente
 * Sidebar desktop equivalente a bottom nav mobile
 */

/**
 * Initialize desktop sidebar
 */
export function initDesktopSidebar() {
  // BEST PRACTICE: Solo su desktop, nascondi su mobile
  if (window.innerWidth <= 768) {
    // Rimuovi sidebar se esiste su mobile
    const existingSidebar = document.getElementById("desktop-sidebar");
    if (existingSidebar) {
      existingSidebar.remove();
    }
    return;
  }

  createSidebar();
  setupSidebarNavigation();
  syncWithBottomNav();

  // BEST PRACTICE: Listener per resize window
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (window.innerWidth <= 768) {
        // Nascondi sidebar su mobile
        const sidebar = document.getElementById("desktop-sidebar");
        if (sidebar) {
          sidebar.style.display = "none";
        }
        // Rimuovi margin-left dal container
        const container = document.querySelector(".dashboard-container");
        if (container) {
          container.style.marginLeft = "0";
        }
      } else {
        // Mostra sidebar su desktop
        const sidebar = document.getElementById("desktop-sidebar");
        if (sidebar) {
          sidebar.style.display = "flex";
        }
        // Ripristina margin-left
        const container = document.querySelector(".dashboard-container");
        if (container) {
          container.style.marginLeft = "240px";
        }
      }
    }, 150);
  });
}

/**
 * Create sidebar element
 */
function createSidebar() {
  // Check if already exists
  if (document.getElementById("desktop-sidebar")) {
    return;
  }

  const sidebar = document.createElement("nav");
  sidebar.id = "desktop-sidebar";
  sidebar.className = "desktop-sidebar";
  sidebar.setAttribute("role", "navigation");
  sidebar.setAttribute("aria-label", "Navigazione principale");

  sidebar.innerHTML = `
    <div class="desktop-sidebar-header">
      <a href="#overview" class="desktop-sidebar-brand" aria-label="Tradelia Dashboard">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span class="desktop-sidebar-brand-text">Tradelia</span>
      </a>
    </div>
    <div class="desktop-sidebar-nav">
      <a href="#overview" class="desktop-sidebar-item" aria-label="Panoramica" data-module="overview">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Home</span>
      </a>
      <a href="#reports" class="desktop-sidebar-item" aria-label="Report" data-module="reports">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <span>Report</span>
      </a>
      <a href="#notifications" class="desktop-sidebar-item" aria-label="Notifiche" data-module="notifications">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span>Notifiche</span>
      </a>
      <a href="#settings" class="desktop-sidebar-item" aria-label="Impostazioni" data-module="settings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m-4.242 0L5.636 18.364m12.728 0l-4.243-4.243m-4.242 0L5.636 5.636"></path>
        </svg>
        <span>Impostazioni</span>
      </a>
    </div>
    <div class="desktop-sidebar-footer">
      <div class="desktop-sidebar-theme-toggle" id="theme-toggle" role="button" tabindex="0" aria-label="Cambia tema">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </div>
    </div>
  `;

  // Insert before main content
  const main = document.querySelector("main, .dashboard-container");
  if (main) {
    main.parentNode.insertBefore(sidebar, main);
  } else {
    document.body.insertBefore(sidebar, document.body.firstChild);
  }
}

/**
 * Setup sidebar navigation
 */
function setupSidebarNavigation() {
  const sidebarItems = document.querySelectorAll(".desktop-sidebar-item");
  sidebarItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const moduleId = item.dataset.module || item.getAttribute("href")?.slice(1);
      if (moduleId && window.showModule) {
        window.showModule(moduleId);
        // Update active state
        sidebarItems.forEach((nav) => nav.classList.remove("active"));
        item.classList.add("active");
        item.setAttribute("aria-current", "page");
      }
    });
  });

  // Update active state based on current module
  window.addEventListener("hashchange", () => {
    updateActiveState();
  });

  // Initial active state
  updateActiveState();
}

/**
 * Update active state
 */
function updateActiveState() {
  const hash = window.location.hash.slice(1);
  const sidebarItems = document.querySelectorAll(".desktop-sidebar-item");

  sidebarItems.forEach((item) => {
    const moduleId = item.dataset.module || item.getAttribute("href")?.slice(1);
    if (moduleId === hash || (!hash && moduleId === "overview")) {
      item.classList.add("active");
      item.setAttribute("aria-current", "page");
    } else {
      item.classList.remove("active");
      item.removeAttribute("aria-current");
    }
  });
}

/**
 * Sync with bottom nav (mobile)
 */
function syncWithBottomNav() {
  // When bottom nav changes, update sidebar
  const bottomNavItems = document.querySelectorAll(".bottom-nav-item");
  bottomNavItems.forEach((item) => {
    item.addEventListener("click", () => {
      const moduleId = item.dataset.module || item.getAttribute("href")?.slice(1);
      const sidebarItem = document.querySelector(
        `.desktop-sidebar-item[data-module="${moduleId}"]`
      );
      if (sidebarItem) {
        sidebarItem.classList.add("active");
        sidebarItem.setAttribute("aria-current", "page");
      }
    });
  });
}
