/* eslint-env browser */
/**
 * Education System Module
 * Sistema formativo con gamification per retail
 * Best Practice Accademica 2025
 *
 * Research Base (Pre-2015):
 * - Bloom's Taxonomy (1956, revised 2001)
 * - Spaced Repetition (Ebbinghaus, 1885)
 * - Gamification in Education (Deterding et al., 2011)
 * - Cognitive Load Theory (Sweller, 1988)
 *
 * Research Base (2015+):
 * - Adaptive Learning (Koedinger et al., 2015; VanLehn, 2011)
 * - Microlearning (Hug, 2005/2016; Bruck et al., 2012)
 * - Learning Analytics (Siemens & Long, 2011; Gašević et al., 2015)
 * - Personalized Learning Paths (Walkington, 2013; Pardo & Siemens, 2014)
 * - Retrieval Practice (Roediger & Karpicke, 2006; Karpicke & Blunt, 2011)
 * - Interleaving (Rohrer & Taylor, 2007; Birnbaum et al., 2013)
 */

import { safeLog, escapeHtml } from "./security-utils.js";

const API_BASE = "/api/education";

const LEVEL_LABELS = {
  0: "Foundation",
  1: "Foundation",
  2: "Operativo",
  3: "Stratega",
  4: "Maestro",
};

let currentModule = null;
let currentLesson = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const currentTest = null;

// Adaptive Learning: Track performance per question
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const questionPerformance = new Map(); // questionId -> { attempts, correct, difficulty }

// Microlearning: Track session time
let lessonStartTime = null;
const MICROLEARNING_MAX_MINUTES = 10; // Paper: Hug (2016) - optimal 5-10 min chunks

/**
 * Initialize education system (dashboard view)
 */
async function initEducation() {
  // Initialize gamification system
  try {
    const { initGamification } = await import("./education-gamification.js");
    initGamification();
  } catch (error) {
    safeLog("warn", "[Education] Errore initGamification:", error);
  }

  // Initialize spaced repetition system
  try {
    const { initSpacedRepetition } = await import("./education-spaced-repetition.js");
    initSpacedRepetition();
  } catch (error) {
    safeLog("warn", "[Education] Errore initSpacedRepetition:", error);
  }

  // Initialize retrieval practice system
  try {
    const { initRetrievalPractice } = await import("./education-retrieval-practice.js");
    initRetrievalPractice();
  } catch (error) {
    safeLog("warn", "[Education] Errore initRetrievalPractice:", error);
  }

  // Initialize adaptive learning system
  try {
    const { initAdaptiveLearning } = await import("./education-adaptive-learning.js");
    initAdaptiveLearning();
  } catch (error) {
    safeLog("warn", "[Education] Errore initAdaptiveLearning:", error);
  }

  // Initialize interactive tools
  try {
    const { initInteractiveTools } = await import("./education-interactive-tools.js");
    initInteractiveTools();
  } catch (error) {
    safeLog("warn", "[Education] Errore initInteractiveTools:", error);
  }

  // Initialize onboarding - DISABILITATO
  // try {
  //   const { initOnboarding } = await import("./education-onboarding.js");
  //   await initOnboarding();
  // } catch (error) {
  //   safeLog("warn", "[Education] Errore initOnboarding:", error);
  // }

  // FORZA NASCONDI OVERLAY IMMEDIATAMENTE
  (function () {
    function forceHideOverlay() {
      const overlay = document.getElementById("onboarding-overlay");
      if (overlay) {
        overlay.style.display = "none";
        overlay.style.opacity = "0";
        overlay.style.visibility = "hidden";
        overlay.remove();
      }
    }
    forceHideOverlay();
    setTimeout(forceHideOverlay, 100);
    setTimeout(forceHideOverlay, 500);
  })();

  // Initialize toolbar
  try {
    const { initToolbar } = await import("./education-toolbar.js");
    initToolbar();
  } catch (error) {
    safeLog("warn", "[Education] Errore initToolbar:", error);
  }

  // Initialize achievements
  try {
    const { initAchievements, checkAndShowAchievements } = await import(
      "./education-achievements.js"
    );
    initAchievements();
    await checkAndShowAchievements();
  } catch (error) {
    safeLog("warn", "[Education] Errore initAchievements:", error);
  }

  // Initialize progress visualizations
  try {
    const { initProgressVisualizations } = await import("./education-progress-viz.js");
    initProgressVisualizations();
  } catch (error) {
    safeLog("warn", "[Education] Errore initProgressVisualizations:", error);
  }

  // Try to find container in main content area (SPA)
  let container = document.getElementById("education-container");

  if (!container) {
    // Se siamo in modalità SPA, cerca il container principale
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      // Crea container se non esiste
      container = document.createElement("div");
      container.id = "education-container";
      mainContent.appendChild(container);
    } else {
      safeLog("warn", "[Education] Container non trovato");
      return;
    }
  }

  // Skip link per accessibilità (WCAG 2.1 Level A)
  if (!document.getElementById("skip-to-main")) {
    const skipLink = document.createElement("a");
    skipLink.id = "skip-to-main";
    skipLink.href = "#education-container";
    skipLink.className = "skip-link";
    skipLink.textContent = "Salta alla navigazione principale";
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById("education-container");
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Show loading state
  showLoadingState(container);

  // Load user progress and modules
  await loadEducationDashboard(container);

  // Scroll to top when initializing dashboard
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Show loading state (skeleton loaders)
 * Best Practice 2025: Skeleton screens for perceived performance
 */
function showLoadingState(container) {
  container.innerHTML = `
    <div class="education-dashboard">
      <div class="education-header">
        <div class="education-stats">
          ${Array.from(
            { length: 4 },
            () => `
            <div class="stat-card education-skeleton" style="height: 100px;"></div>
          `
          ).join("")}
        </div>
      </div>
      <div class="education-modules">
        <div class="education-section-title education-skeleton skeleton-text" style="width: 300px; height: 32px; margin-bottom: var(--edu-spacing-xl);"></div>
        <div class="modules-grid">
          ${Array.from(
            { length: 6 },
            () => `
            <div class="education-module-card education-skeleton skeleton-card"></div>
          `
          ).join("")}
        </div>
      </div>
    </div>
  `;
}

/**
 * Load education dashboard
 * Supporta sia utenti autenticati (Supabase) che guest (localStorage)
 */
async function loadEducationDashboard(container) {
  try {
    const token = await getAuthToken();
    let progress;

    if (token) {
      // Utente autenticato: carica da API
      try {
        const progressResponse = await fetch(`${API_BASE}?action=user-progress`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (progressResponse.ok) {
          const data = await progressResponse.json();
          progress = data.progress || data; // Supporta sia {progress: {...}} che direttamente progress
          // Assicura struttura corretta
          if (progress && !Array.isArray(progress.modules)) {
            progress.modules = progress.modules || [];
          }
          if (progress && !progress.stats) {
            progress.stats = {
              current_level: "Foundation",
              total_points: 0,
              modules_completed: 0,
              current_streak_days: 0,
            };
          }
          if (progress && !Array.isArray(progress.badges)) {
            progress.badges = progress.badges || [];
          }
        } else {
          // Fallback a localStorage se API fallisce
          progress = loadProgressFromLocalStorage();
        }
      } catch (error) {
        safeLog("warn", "[Education] API fallita, uso localStorage:", error);
        progress = loadProgressFromLocalStorage();
      }
    } else {
      // Utente guest: carica da localStorage
      progress = loadProgressFromLocalStorage();
    }

    // Se non c'è progresso, inizializza struttura base
    if (!progress) {
      progress = {
        modules: [],
        stats: {
          current_level: "Foundation",
          total_points: 0,
          completed_modules: 0,
          completed_lessons: 0,
          modules_completed: 0,
          current_streak_days: 0,
        },
        badges: [],
      };
    }

    // Carica moduli se non presenti (anche senza auth)
    if (!progress.modules || !Array.isArray(progress.modules) || progress.modules.length === 0) {
      try {
        const modulesResponse = await fetch(`${API_BASE}?action=modules`);
        if (modulesResponse.ok) {
          const data = await modulesResponse.json();
          const modules = Array.isArray(data.modules)
            ? data.modules
            : Array.isArray(data)
              ? data
              : [];
          if (modules.length > 0) {
            progress.modules = modules;
          }
        }
      } catch (e) {
        safeLog("warn", "[Education] Errore caricamento moduli:", e);
      }
    }

    // Render dashboard
    renderEducationDashboard(container, progress);
  } catch (error) {
    safeLog("error", "[Education] Errore loadEducationDashboard:", error);
    // Fallback: carica da localStorage
    try {
      const progress = loadProgressFromLocalStorage();
      if (progress) {
        renderEducationDashboard(container, progress);
        return;
      }
    } catch (e) {
      safeLog("error", "[Education] Errore anche su localStorage:", e);
    }

    container.innerHTML = `
      <div class="error-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3>Errore caricamento</h3>
        <p>Impossibile caricare il percorso formativo. Riprova più tardi.</p>
        <p style="margin-top: var(--sp-3); font-size: var(--fs-13); color: var(--muted)">
          Il percorso formativo funziona anche senza registrazione. Il progresso viene salvato localmente nel browser.
        </p>
      </div>
    `;
  }
}

/**
 * Load progress from localStorage (guest users)
 */
function loadProgressFromLocalStorage() {
  try {
    const stored = localStorage.getItem("tradelia_education_progress");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    safeLog("warn", "[Education] Errore lettura localStorage:", e);
  }
  return null;
}

/**
 * Save progress to localStorage (guest users)
 */
function saveProgressToLocalStorage(progress) {
  try {
    localStorage.setItem("tradelia_education_progress", JSON.stringify(progress));
  } catch (e) {
    safeLog("warn", "[Education] Errore scrittura localStorage:", e);
  }
}

/**
 * Convert any value to a safe integer (default fallback)
 */
function toSafeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Format level value using LEVEL_LABELS map
 */
function formatLevelValue(value) {
  if (value === null || value === undefined) {
    return LEVEL_LABELS[0];
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return LEVEL_LABELS[value] || `Livello ${value}`;
  }

  const stringValue = String(value).trim();
  if (stringValue.length === 0) {
    return LEVEL_LABELS[0];
  }

  const numeric = Number(stringValue);
  if (Number.isFinite(numeric)) {
    return LEVEL_LABELS[numeric] || stringValue;
  }

  return stringValue;
}

/**
 * Build safe stats object enriched with computed fields
 */
function buildStats(rawStats = {}, modules = []) {
  const stats = {
    current_level_raw: rawStats?.current_level ?? rawStats?.level ?? "Foundation",
    total_points: toSafeNumber(rawStats?.total_points ?? rawStats?.points, 0),
    modules_completed: toSafeNumber(rawStats?.modules_completed ?? rawStats?.completed_modules, 0),
    current_streak_days: toSafeNumber(rawStats?.current_streak_days ?? rawStats?.streak_days, 0),
  };

  stats.total_modules = Array.isArray(modules) ? modules.length : 0;
  if (stats.total_modules > 0 && stats.modules_completed > stats.total_modules) {
    stats.modules_completed = stats.total_modules;
  }

  stats.current_level_label = formatLevelValue(stats.current_level_raw);
  stats.current_level = stats.current_level_label;

  return stats;
}

/**
 * Normalize lessons order, progress and locking logic
 */
function normalizeLessons(lessons = [], { lessonProgress = {} } = {}) {
  if (!Array.isArray(lessons)) {
    return [];
  }

  const sortedLessons = [...lessons].filter(Boolean).sort((a, b) => {
    const orderA = Number.isFinite(a?.order_index) ? a.order_index : 0;
    const orderB = Number.isFinite(b?.order_index) ? b.order_index : 0;
    if (orderA === orderB) {
      return (a?.title || "").localeCompare(b?.title || "");
    }
    return orderA - orderB;
  });

  let previousMandatoryCompleted = true;

  return sortedLessons.map((lesson, index) => {
    const storedProgress = lessonProgress?.[lesson.id] || {};
    const status = storedProgress.status || lesson.userProgress?.status || "not_started";

    const progressPercentage =
      storedProgress.progress_percentage ??
      lesson.userProgress?.progress_percentage ??
      (status === "completed" ? 100 : 0);

    const isOptional = lesson.is_optional === true;
    const canAccess = isOptional ? true : index === 0 || previousMandatoryCompleted;

    if (!isOptional) {
      previousMandatoryCompleted = status === "completed";
    }

    return {
      ...lesson,
      userProgress: {
        status,
        progress_percentage: progressPercentage,
      },
      canAccess,
      lockReason: canAccess ? "" : "Completa la lezione precedente per continuare.",
    };
  });
}

function normalizeModuleProgress(module) {
  const defaultProgress = module.userProgress || {
    progress_percentage: 0,
    status: "not_started",
  };

  const totalLessons = Array.isArray(module.lessons) ? module.lessons.length : 0;
  if (totalLessons === 0) {
    return {
      progress_percentage: toSafeNumber(defaultProgress.progress_percentage, 0),
      status:
        defaultProgress.status ||
        (defaultProgress.progress_percentage > 0 ? "in_progress" : "not_started"),
    };
  }

  const completedLessons = module.lessons.filter(
    (lesson) => lesson.userProgress?.status === "completed"
  ).length;
  const computedPct = Math.round((completedLessons / totalLessons) * 100);

  if (defaultProgress.status === "completed") {
    return {
      progress_percentage: Math.max(computedPct, 100),
      status: "completed",
    };
  }

  if (defaultProgress.progress_percentage && defaultProgress.progress_percentage > computedPct) {
    return {
      progress_percentage: defaultProgress.progress_percentage,
      status:
        defaultProgress.status ||
        (defaultProgress.progress_percentage > 0 ? "in_progress" : "not_started"),
    };
  }

  return {
    progress_percentage: computedPct,
    status: computedPct === 100 ? "completed" : computedPct > 0 ? "in_progress" : "not_started",
  };
}

/**
 * Normalize modules: ordering, locking, lessons
 */
function normalizeModules(modules = [], { lessonProgress = {} } = {}) {
  if (!Array.isArray(modules)) {
    return [];
  }

  const preparedModules = modules
    .filter(Boolean)
    .map((module) => {
      const normalized = {
        ...module,
        lessons: normalizeLessons(module.lessons || [], { lessonProgress }),
        tests: Array.isArray(module.tests) ? module.tests : [],
      };
      normalized.userProgress = normalizeModuleProgress(normalized);
      return normalized;
    })
    .sort((a, b) => {
      const orderA = Number.isFinite(a?.order_index) ? a.order_index : 0;
      const orderB = Number.isFinite(b?.order_index) ? b.order_index : 0;
      if (orderA === orderB) {
        return (a?.title || "").localeCompare(b?.title || "");
      }
      return orderA - orderB;
    });

  const moduleById = new Map();
  const moduleBySlug = new Map();
  const completionMap = new Map();

  preparedModules.forEach((module) => {
    moduleById.set(module.id, module);
    if (module.slug) {
      moduleBySlug.set(module.slug, module);
    }
    completionMap.set(module.id, module.userProgress?.status === "completed");
  });

  return preparedModules.map((module, index) => {
    let canAccess = typeof module.canAccess === "boolean" ? module.canAccess : true;
    let lockReason = module.lockReason || "";

    const requiresPrevious = Boolean(module.requires_previous_module);
    if (requiresPrevious && index > 0) {
      const previousModule = preparedModules[index - 1];
      if (!completionMap.get(previousModule.id)) {
        canAccess = false;
        lockReason = "Completa il modulo precedente per sbloccarlo.";
      }
    }

    const prerequisites = Array.isArray(module.prerequisites) ? module.prerequisites : [];
    if (prerequisites.length > 0) {
      const unmet = prerequisites.some((requirement) => {
        if (!requirement) {
          return true;
        }
        const prereqModule = moduleById.get(requirement) || moduleBySlug.get(requirement);
        if (!prereqModule) {
          return true;
        }
        return !completionMap.get(prereqModule.id);
      });

      if (unmet) {
        canAccess = false;
        lockReason = "Completa i prerequisiti indicati per continuare.";
      }
    }

    module.canAccess = canAccess;
    module.lockReason = lockReason;

    if (!canAccess) {
      module.userProgress = {
        ...module.userProgress,
        status: "locked",
      };
    }

    return module;
  });
}

/**
 * Render favorites section dynamically
 */
async function mountEducationFavorites(modules) {
  const favoritesContainer = document.getElementById("education-favorites-container");
  if (!favoritesContainer) {
    return;
  }

  try {
    const { renderFavoritesSection } = await import("./education-favorites.js");
    favoritesContainer.innerHTML = renderFavoritesSection(modules, modules);
  } catch (error) {
    safeLog("warn", "[Education] Errore render favorites:", error);
  }
}

/**
 * Render education dashboard
 */
async function renderEducationDashboard(container, progress) {
  // Verifica che progress esista
  if (!progress) {
    safeLog("error", "[Education] Progress è undefined");
    container.innerHTML = `
      <div class="error-state">
        <p>Errore: dati non disponibili. Ricarica la pagina.</p>
      </div>
    `;
    return;
  }

  // Assicura che lesson_progress esista sempre
  if (!progress.lesson_progress || typeof progress.lesson_progress !== "object") {
    progress.lesson_progress = {};
  }

  // Normalizza moduli, lezioni e statistiche
  let modules = Array.isArray(progress.modules) ? progress.modules : [];
  modules = normalizeModules(modules, { lessonProgress: progress.lesson_progress });
  progress.modules = modules;
  window.educationModules = modules;

  const stats = buildStats(progress.stats, modules);
  progress.stats = stats;
  const badges = Array.isArray(progress.badges) ? progress.badges : [];

  const levelLabel = stats.current_level;
  const totalPoints = stats.total_points || 0;
  const modulesValue =
    stats.total_modules > 0
      ? `${stats.modules_completed}/${stats.total_modules}`
      : String(stats.modules_completed);
  const modulesAriaLabel =
    stats.total_modules > 0
      ? `${stats.modules_completed} su ${stats.total_modules}`
      : `${stats.modules_completed}`;
  const streakDays = stats.current_streak_days || 0;

  container.innerHTML = `
    <div class="education-dashboard">
      <!-- Header con stats -->
      <div class="education-header">
        <div class="education-stats" role="region" aria-label="Statistiche apprendimento">
          <div class="stat-card" role="article" aria-label="Livello corrente: ${levelLabel}">
            <div class="stat-value" aria-live="polite" aria-atomic="true">${levelLabel}</div>
            <div class="stat-label">Livello</div>
          </div>
          <div class="stat-card" role="article" aria-label="Punti totali: ${totalPoints}">
            <div class="stat-value" aria-live="polite" aria-atomic="true">${totalPoints}</div>
            <div class="stat-label">Punti</div>
          </div>
          <div class="stat-card" role="article" aria-label="Moduli completati: ${modulesAriaLabel}">
            <div class="stat-value" aria-live="polite" aria-atomic="true">${modulesValue}</div>
            <div class="stat-label">Moduli</div>
          </div>
          <div class="stat-card" role="article" aria-label="Giorni di streak: ${streakDays}">
            <div class="stat-value" aria-live="polite" aria-atomic="true">${streakDays}</div>
            <div class="stat-label">Giorni Streak</div>
          </div>
        </div>

        <!-- Badge recenti -->
        ${
          badges.length > 0
            ? `
          <div class="education-badges-preview">
            <h4>Badge Ottenuti</h4>
            <div class="badges-list">
              ${badges
                .slice(0, 5)
                .map(
                  (badge) => `
                <div class="badge-item" title="${escapeHtml(badge.description || badge.name)}">
                  <span class="badge-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                      <circle cx="12" cy="12" r="3" fill="currentColor"/>
                    </svg>
                  </span>
                  <span class="badge-name">${escapeHtml(badge.name)}</span>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }
      </div>

      <!-- Spaced Repetition Section -->
      <div class="education-spaced-repetition">
        <div class="sr-quick-access">
          <button class="btn btn-secondary" data-action="open-spaced-repetition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="vertical-align: middle; margin-right: 4px;">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            Ripasso Distribuito
          </button>
          <button class="btn btn-secondary" data-action="open-retrieval-practice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="vertical-align: middle; margin-right: 4px;">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Ripasso Attivo
          </button>
          <button class="btn btn-secondary" data-action="open-learning-goals">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="vertical-align: middle; margin-right: 4px;">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            I Miei Obiettivi
          </button>
          <button class="btn btn-secondary" data-action="open-learning-analytics">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="vertical-align: middle; margin-right: 4px;">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Learning Analytics
          </button>
          <button class="btn btn-secondary" data-action="open-personalized-path">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="vertical-align: middle; margin-right: 4px;">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
            </svg>
            Percorso Personalizzato
          </button>
        </div>
      </div>

      <!-- Preferiti -->
      <div id="education-favorites-container"></div>

      <!-- Moduli -->
      <div class="education-modules">
        <h2 class="education-section-title">Percorso Formativo</h2>
        <div class="modules-grid">
          ${
            Array.isArray(modules) && modules.length > 0
              ? modules.map((module, index) => renderModuleCard(module, index)).join("")
              : `<div class="empty-state">
                  <div class="empty-state-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="64" height="64" style="opacity: 0.4;">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      <line x1="8" y1="7" x2="16" y2="7"/>
                      <line x1="8" y1="11" x2="16" y2="11"/>
                      <line x1="8" y1="15" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p>Nessun modulo disponibile al momento.</p>
                </div>`
          }
        </div>
      </div>
    </div>
  `;

  await mountEducationFavorites(modules);

  if (window.__educationFavoritesHandler) {
    window.removeEventListener("education-favorites-changed", window.__educationFavoritesHandler);
  }
  window.__educationFavoritesHandler = async () => {
    await mountEducationFavorites(window.educationModules || modules);
    const favoritesContainer = document.getElementById("education-favorites-container");
    if (favoritesContainer) {
      bindEducationEvents(favoritesContainer);
    }
  };
  window.addEventListener("education-favorites-changed", window.__educationFavoritesHandler);

  // Bind events
  bindEducationEvents(container);
}

/**
 * Render module card
 */
function renderModuleCard(module, index) {
  const { userProgress, canAccess } = module;
  const isLocked = !canAccess;
  const progressPct = userProgress?.progress_percentage || 0;
  const status = userProgress?.status || "not_started";
  const lockHint =
    module.lockReason || "Completa i requisiti richiesti per sbloccare questo modulo.";

  const statusLabels = {
    not_started: "Non iniziato",
    in_progress: "In corso",
    completed: "Completato",
    locked: "Bloccato",
  };

  // Check if favorited (synchronous check)
  let isFavorited = false;
  try {
    const stored = localStorage.getItem("tradelia_education_favorites");
    if (stored) {
      const favorites = JSON.parse(stored);
      isFavorited = favorites.includes(module.id);
    }
  } catch {
    // Ignore
  }

  return `
    <div class="module-card education-module-card ${isLocked ? "locked" : ""}" 
         data-module-id="${module.id}" 
         data-module-slug="${module.slug}"
         data-status="${status}"
         ${isLocked ? 'aria-disabled="true"' : ""}
         role="article"
         aria-label="Modulo ${index + 1}: ${escapeHtml(module.title)}">
      <div class="module-card-header">
        <div class="module-number" aria-hidden="true">${index + 1}</div>
        <div class="module-status-badge" aria-label="Stato: ${statusLabels[status]}">
          ${statusLabels[status]}
        </div>
        <button 
          class="education-favorite-btn ${isFavorited ? "favorited" : ""}" 
          data-module-id="${module.id}"
          aria-label="${isFavorited ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}"
          title="${isFavorited ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="${isFavorited ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div class="module-card-content">
        <h3 class="module-title">${escapeHtml(module.title)}</h3>
        <p class="module-description" id="module-${module.id}-description">${escapeHtml(module.description || "")}</p>
        
        ${
          status === "in_progress" || status === "completed"
            ? `
          <div class="module-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progressPct}%"></div>
            </div>
            <span class="progress-text">${progressPct}% completato</span>
          </div>
        `
            : ""
        }

        <div class="module-meta">
          <span class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            ${module.estimated_hours || 0}h
          </span>
          <span class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            ${module.difficulty_level}
          </span>
        </div>
      </div>
      <div class="module-card-actions">
        ${
          isLocked
            ? `
          <button class="btn btn-secondary" disabled aria-disabled="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Bloccato
          </button>
          <p class="module-lock-hint">${escapeHtml(lockHint)}</p>
        `
            : `
          <button class="btn btn-primary" data-action="open-module" data-module-id="${module.id}">
            ${status === "completed" ? "Rivedi" : status === "in_progress" ? "Continua" : "Inizia"}
          </button>
        `
        }
      </div>
    </div>
  `;
}

/**
 * Bind education events
 */
function bindEducationEvents(container) {
  // Module card clicks
  container.querySelectorAll("[data-action='open-module']").forEach((btn) => {
    if (btn.dataset.listenerAttached === "true") {
      return;
    }
    btn.dataset.listenerAttached = "true";
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const moduleId = btn.dataset.moduleId;

      // Scroll to top when opening module
      window.scrollTo({ top: 0, behavior: "smooth" });

      await openModule(moduleId);
    });
  });

  // Module card click (entire card)
  container.querySelectorAll(".education-module-card").forEach((card) => {
    if (card.classList.contains("locked")) {
      card.setAttribute("aria-disabled", "true");
      return;
    }
    if (card.dataset.listenerAttached === "true") {
      return;
    }
    card.dataset.listenerAttached = "true";

    card.addEventListener("click", async (e) => {
      // Don't trigger if clicking on button or favorite button
      if (e.target.closest("button") || e.target.closest(".education-favorite-btn")) {
        return;
      }

      e.preventDefault();
      const moduleId = card.dataset.moduleId;

      if (moduleId) {
        // Scroll to top when opening module
        window.scrollTo({ top: 0, behavior: "smooth" });

        await openModule(moduleId);
      }
    });

    // Keyboard support
    card.addEventListener("keydown", async (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const moduleId = card.dataset.moduleId;

        if (moduleId) {
          // Scroll to top when opening module
          window.scrollTo({ top: 0, behavior: "smooth" });

          await openModule(moduleId);
        }
      }
    });

    // Make card focusable
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
  });

  // Favorite buttons
  container.querySelectorAll(".education-favorite-btn").forEach((btn) => {
    if (btn.dataset.listenerAttached === "true") {
      return;
    }
    btn.dataset.listenerAttached = "true";
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const moduleId = btn.dataset.moduleId;
      if (!moduleId) {
        return;
      }
      try {
        const { toggleEducationFavorite } = await import("./education-favorites.js");
        const isFavorited = toggleEducationFavorite(moduleId);
        btn.classList.toggle("favorited", isFavorited);
        btn.setAttribute(
          "aria-label",
          isFavorited ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"
        );
        const icon = btn.querySelector("svg");
        if (icon) {
          icon.setAttribute("fill", isFavorited ? "currentColor" : "none");
        }
      } catch (error) {
        safeLog("warn", "[Education] Errore toggle preferito:", error);
      }
    });
  });

  // Spaced Repetition
  container
    .querySelector("[data-action='open-spaced-repetition']")
    ?.addEventListener("click", async () => {
      const { initSpacedRepetition } = await import("./education-spaced-repetition.js");
      await initSpacedRepetition();
    });

  // Retrieval Practice
  container
    .querySelector("[data-action='open-retrieval-practice']")
    ?.addEventListener("click", async () => {
      const { initRetrievalPractice } = await import("./education-retrieval-practice.js");
      // Get questions from recent tests
      const questions = await getRecentQuestionsForPractice();
      if (questions.length > 0) {
        await initRetrievalPractice(questions);
      } else {
        if (window.showToast) {
          window.showToast("Completa almeno un test per attivare il ripasso", "info");
        }
      }
    });

  // Learning Goals
  container
    .querySelector("[data-action='open-learning-goals']")
    ?.addEventListener("click", async () => {
      const { showLearningGoalsModal } = await import("./education-metacognition.js");
      showLearningGoalsModal();
    });

  // Learning Analytics
  container
    .querySelector("[data-action='open-learning-analytics']")
    ?.addEventListener("click", async () => {
      const { initLearningAnalytics } = await import("./education-analytics.js");
      await initLearningAnalytics();
    });

  // Personalized Path
  container
    .querySelector("[data-action='open-personalized-path']")
    ?.addEventListener("click", async () => {
      const { initPersonalizedPathSelector } = await import("./education-personalized-paths.js");
      await initPersonalizedPathSelector();
    });
}

/**
 * Get recent questions for retrieval practice
 */
async function getRecentQuestionsForPractice() {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE}?action=recent-questions-for-practice`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const { questionIds } = await response.json();
      return questionIds || [];
    }
    return [];
  } catch (error) {
    safeLog("error", "[Education] Errore getRecentQuestionsForPractice:", error);
    return [];
  }
}

/**
 * Open module view
 * Supporta sia utenti autenticati che guest
 */
async function openModule(moduleId) {
  try {
    const token = await getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE}?action=module&moduleId=${moduleId}`, {
      headers,
    });

    if (!response.ok) {
      // Se non autenticato, prova a caricare modulo pubblico (senza auth header)
      if (!token) {
        const publicResponse = await fetch(`${API_BASE}?action=module&moduleId=${moduleId}`);
        if (publicResponse.ok) {
          const { module } = await publicResponse.json();
          // Aggiungi progresso da localStorage
          const progress = loadProgressFromLocalStorage();
          const moduleProgress = progress?.lesson_progress || {};

          if (module.lessons) {
            module.lessons = normalizeLessons(module.lessons, { lessonProgress: moduleProgress });
          }

          module.userProgress = module.userProgress || {
            progress_percentage: 0,
            status: "not_started",
          };

          currentModule = module;

          // Scroll to top when opening module
          window.scrollTo({ top: 0, behavior: "smooth" });

          renderModuleView(module);
          return;
        }
      }
      throw new Error("Errore caricamento modulo");
    }

    const { module } = await response.json();
    module.lessons = normalizeLessons(module.lessons || [], { lessonProgress: {} });
    currentModule = module;

    // Navigate to module view (SPA navigation)
    window.history.pushState({ view: "module", moduleId }, "", `#education/module/${module.slug}`);

    // Scroll to top when opening module
    window.scrollTo({ top: 0, behavior: "smooth" });

    renderModuleView(module);
  } catch (error) {
    safeLog("error", "[Education] Errore openModule:", error);
    if (window.showToast) {
      window.showToast("Errore caricamento modulo", "error");
    }
  }
}

/**
 * Render module view
 */
function renderModuleView(module) {
  const container = document.getElementById("education-container");
  if (!container) {
    return;
  }

  // Breadcrumb navigation (Best Practice: sempre visibile)
  const breadcrumb = `
    <nav class="education-breadcrumb" aria-label="Breadcrumb navigation">
      <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList">
        <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a href="#education" data-action="back-to-dashboard" itemprop="item">
            <span itemprop="name">Dashboard</span>
          </a>
          <meta itemprop="position" content="1" />
        </li>
        <li class="breadcrumb-item breadcrumb-current" 
            aria-current="page"
            itemprop="itemListElement" 
            itemscope 
            itemtype="https://schema.org/ListItem">
          <span itemprop="name">${escapeHtml(module.title)}</span>
          <meta itemprop="position" content="2" />
        </li>
      </ol>
    </nav>
  `;

  container.innerHTML = `
    <div class="education-module-view">
      ${breadcrumb}
      <div class="module-view-header">
        <h1 class="module-view-title">${escapeHtml(module.title)}</h1>
        ${module.description ? `<p class="module-view-description">${escapeHtml(module.description)}</p>` : ""}
      </div>

      <div class="module-lessons">
        <h2>Lezioni</h2>
        <div class="lessons-list">
          ${
            Array.isArray(module.lessons) && module.lessons.length > 0
              ? module.lessons.map((lesson, index) => renderLessonItem(lesson, index)).join("")
              : '<div class="empty-state"><p>Nessuna lezione disponibile per questo modulo.</p></div>'
          }
        </div>
      </div>

      ${
        Array.isArray(module.tests) && module.tests.length > 0
          ? `
        <div class="module-tests">
          <h2>Test di Verifica</h2>
          <div class="tests-list">
            ${module.tests.map((test) => renderTestItem(test)).join("")}
          </div>
        </div>
      `
          : ""
      }
    </div>
  `;

  // Bind events
  container
    .querySelector("[data-action='back-to-dashboard']")
    ?.addEventListener("click", async () => {
      // BEST PRACTICE: Usa History API per supporto back button
      window.history.pushState({ view: "education-dashboard" }, "", "#education");
      await initEducation();
    });

  container.querySelectorAll("[data-action='open-lesson']").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const lessonId = btn.dataset.lessonId;

      // Scroll to top when opening lesson
      window.scrollTo({ top: 0, behavior: "smooth" });

      await openLesson(lessonId);
    });
  });

  // Lesson item click (entire item)
  container.querySelectorAll(".lesson-item").forEach((item) => {
    if (item.classList.contains("locked")) {
      item.setAttribute("aria-disabled", "true");
      return;
    }
    item.addEventListener("click", async (e) => {
      // Don't trigger if clicking on button
      if (e.target.closest("button")) {
        return;
      }

      e.preventDefault();
      const lessonId = item.dataset.lessonId;

      // Scroll to top when opening lesson
      window.scrollTo({ top: 0, behavior: "smooth" });

      await openLesson(lessonId);
    });

    // Keyboard support
    item.addEventListener("keydown", async (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const lessonId = item.dataset.lessonId;

        // Scroll to top when opening lesson
        window.scrollTo({ top: 0, behavior: "smooth" });

        await openLesson(lessonId);
      }
    });

    // Make item focusable
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
  });

  container.querySelectorAll("[data-action='start-test']").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const testId = btn.dataset.testId;

      // Scroll to top when opening test
      window.scrollTo({ top: 0, behavior: "smooth" });

      await openTest(testId);
    });
  });

  // Test item click (entire item)
  container.querySelectorAll(".test-item").forEach((item) => {
    item.addEventListener("click", async (e) => {
      // Don't trigger if clicking on button
      if (e.target.closest("button")) {
        return;
      }

      e.preventDefault();
      const testId =
        item.dataset.testId || item.querySelector("[data-action='start-test']")?.dataset.testId;

      if (testId) {
        // Scroll to top when opening test
        window.scrollTo({ top: 0, behavior: "smooth" });

        await openTest(testId);
      }
    });

    // Keyboard support
    item.addEventListener("keydown", async (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const testId =
          item.dataset.testId || item.querySelector("[data-action='start-test']")?.dataset.testId;

        if (testId) {
          // Scroll to top when opening test
          window.scrollTo({ top: 0, behavior: "smooth" });

          await openTest(testId);
        }
      }
    });

    // Make item focusable
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
  });
}

/**
 * Render lesson item
 * Paper: Microlearning (Hug, 2016) - Lezioni brevi 5-10 minuti
 */
function renderLessonItem(lesson, index) {
  const { userProgress } = lesson;
  const status = userProgress?.status || "not_started";
  const estimatedMinutes = lesson.estimated_minutes || 0;
  const canAccess = lesson.canAccess !== false;
  const lockReason = lesson.lockReason || "Completa le lezioni precedenti per procedere.";

  // Microlearning indicator: verde se < 10 min (optimal chunk size)
  const isMicrolearning = estimatedMinutes > 0 && estimatedMinutes <= MICROLEARNING_MAX_MINUTES;
  const microlearningBadge = isMicrolearning
    ? `
    <span class="microlearning-badge" title="Microlearning: lezione ottimale 5-10 minuti (Hug, 2016)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="12" height="12">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      Micro
    </span>
  `
    : "";

  const statusIcons = {
    not_started: "○",
    in_progress: "◐",
    completed: "✓",
  };

  return `
    <div class="lesson-item ${status} ${isMicrolearning ? "microlearning" : ""} ${
      canAccess ? "" : "locked"
    }" data-lesson-id="${lesson.id}" ${canAccess ? "" : 'data-locked="true" aria-disabled="true"'}>
      <div class="lesson-number">${index + 1}</div>
      <div class="lesson-content">
        <h3 class="lesson-title">${escapeHtml(lesson.title)}</h3>
        <div class="lesson-meta">
          <span>${estimatedMinutes} min</span>
          <span class="lesson-type">${lesson.content_type}</span>
          ${microlearningBadge}
        </div>
      </div>
      <div class="lesson-status">${statusIcons[status]}</div>
      <button class="btn btn-primary btn-sm" data-action="open-lesson" data-lesson-id="${lesson.id}" ${
        canAccess ? "" : 'disabled aria-disabled="true"'
      }>
        ${
          canAccess
            ? status === "completed"
              ? "Rivedi"
              : status === "in_progress"
                ? "Continua"
                : "Inizia"
            : "Bloccata"
        }
      </button>
      ${canAccess ? "" : `<div class="lesson-lock-hint">${escapeHtml(lockReason)}</div>`}
    </div>
  `;
}

/**
 * Open lesson view
 * Paper: Microlearning (Hug, 2016) - Track session time
 * Paper: Learning Analytics (Siemens & Long, 2011) - Track engagement
 * Paper: Metacognition (Zimmerman, 2002) - Pre-lesson assessment
 * Supporta sia utenti autenticati che guest
 */
async function openLesson(lessonId) {
  try {
    const token = await getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE}?action=lesson&lessonId=${lessonId}`, {
      headers,
    });

    if (!response.ok) {
      // Se non autenticato, prova comunque (l'API dovrebbe restituire la lezione pubblica)
      if (!token && response.status === 401) {
        // Prova senza auth header
        const publicResponse = await fetch(`${API_BASE}?action=lesson&lessonId=${lessonId}`);
        if (publicResponse.ok) {
          const { lesson } = await publicResponse.json();
          // Aggiungi progresso da localStorage
          const progress = loadProgressFromLocalStorage();
          const lessonProgress = progress?.lesson_progress?.[lessonId] || { status: "not_started" };
          lesson.userProgress = lessonProgress;
          currentLesson = lesson;

          // Scroll to top when opening lesson
          window.scrollTo({ top: 0, behavior: "smooth" });

          renderLessonView(lesson);
          return;
        }
      }
      throw new Error("Errore caricamento lezione");
    }

    const { lesson } = await response.json();
    currentLesson = lesson;

    // Metacognition: Show pre-lesson assessment (Zimmerman, 2002)
    const { showPreLessonAssessment } = await import("./education-metacognition.js");
    await showPreLessonAssessment(lessonId, lesson.title);

    // Microlearning: Start session timer
    lessonStartTime = Date.now();

    // Mark as started
    await updateLessonProgress(lessonId, "in_progress");

    // Scroll to top when opening lesson
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Render lesson view
    renderLessonView(lesson);
  } catch (error) {
    safeLog("error", "[Education] Errore openLesson:", error);
    if (window.showToast) {
      window.showToast("Errore caricamento lezione", "error");
    }
  }
}

/**
 * Render lesson view
 */
function renderLessonView(lesson) {
  const container = document.getElementById("education-container");
  if (!container) {
    return;
  }

  // Breadcrumb navigation (Best Practice: sempre visibile)
  const moduleTitle = currentModule?.title || "Modulo";
  const moduleSlug = currentModule?.slug || "";
  const breadcrumb = `
    <nav class="education-breadcrumb" aria-label="Breadcrumb navigation">
      <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList">
        <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a href="#education" data-action="back-to-dashboard" itemprop="item">
            <span itemprop="name">Dashboard</span>
          </a>
          <meta itemprop="position" content="1" />
        </li>
        <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a href="#education/module/${moduleSlug}" data-action="back-to-module" itemprop="item">
            <span itemprop="name">${escapeHtml(moduleTitle)}</span>
          </a>
          <meta itemprop="position" content="2" />
        </li>
        <li class="breadcrumb-item breadcrumb-current" 
            aria-current="page"
            itemprop="itemListElement" 
            itemscope 
            itemtype="https://schema.org/ListItem">
          <span itemprop="name">${escapeHtml(lesson.title)}</span>
          <meta itemprop="position" content="3" />
        </li>
      </ol>
    </nav>
  `;

  container.innerHTML = `
    <div class="education-lesson-view">
      ${breadcrumb}
      <div class="lesson-view-header">
        <h1 class="lesson-view-title">${escapeHtml(lesson.title)}</h1>
      </div>

      <div class="lesson-view-content">
        ${
          lesson.content_type === "video" && lesson.video_url
            ? `
          <div class="lesson-video">
            <iframe src="${escapeHtml(lesson.video_url)}" frameborder="0" allowfullscreen></iframe>
          </div>
        `
            : ""
        }
        
        ${
          lesson.content
            ? `
          <div class="lesson-text-content">
            ${renderMarkdown(lesson.content)}
          </div>
        `
            : ""
        }

        ${
          lesson.content_type === "pdf" && lesson.pdf_url
            ? `
          <div class="lesson-pdf">
            <iframe src="${escapeHtml(lesson.pdf_url)}" frameborder="0"></iframe>
          </div>
        `
            : ""
        }
      </div>

      <div class="lesson-view-actions">
        <button class="btn btn-primary" data-action="complete-lesson" data-lesson-id="${lesson.id}">
          Segna come completata
        </button>
      </div>
    </div>
  `;

  // Bind events
  container.querySelector("[data-action='back-to-module']")?.addEventListener("click", async () => {
    if (currentModule) {
      // BEST PRACTICE: Usa History API per supporto back button
      window.history.pushState(
        { view: "module", moduleId: currentModule.id },
        "",
        `#education/module/${currentModule.slug}`
      );
      // Scroll to top when going back to module
      window.scrollTo({ top: 0, behavior: "smooth" });

      await openModule(currentModule.id);
    } else {
      // Fallback: torna alla dashboard
      window.history.pushState({ view: "education-dashboard" }, "", "#education");

      // Scroll to top when going back to dashboard
      window.scrollTo({ top: 0, behavior: "smooth" });

      await initEducation();
    }
  });

  container
    .querySelector("[data-action='complete-lesson']")
    ?.addEventListener("click", async () => {
      const lessonId = container.querySelector("[data-action='complete-lesson']").dataset.lessonId;

      // Microlearning: Calculate time spent
      const timeSpentMinutes = lessonStartTime
        ? Math.round((Date.now() - lessonStartTime) / 60000)
        : 0;

      // Learning Analytics: Track completion time
      if (timeSpentMinutes > 0) {
        safeLog("info", `[Education] Lesson completed in ${timeSpentMinutes} minutes`);
      }

      // Metacognition: Show post-lesson reflection (Zimmerman, 2002)
      const { showPostLessonReflection } = await import("./education-metacognition.js");
      await showPostLessonReflection(lessonId, currentLesson?.title || "Lezione");

      await updateLessonProgress(lessonId, "completed", timeSpentMinutes);
      if (window.showToast) {
        window.showToast("Lezione completata!", "success");
      }

      // Reset timer
      lessonStartTime = null;

      // Reload module view
      if (currentModule) {
        await openModule(currentModule.id);
      }
    });
}

/**
 * Update lesson progress
 * Supporta sia utenti autenticati (API) che guest (localStorage)
 */
async function updateLessonProgress(lessonId, status, timeSpentMinutes = 0) {
  const token = await getAuthToken();

  // Se autenticato, salva su API
  if (token) {
    try {
      const response = await fetch(`${API_BASE}?action=update-lesson-progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lessonId,
          status,
          timeSpentMinutes,
        }),
      });

      if (!response.ok) {
        throw new Error("Errore aggiornamento progresso");
      }

      const { progress } = await response.json();
      return progress;
    } catch (error) {
      safeLog("warn", "[Education] API fallita, salvo in localStorage:", error);
      // Fallback a localStorage
      return updateProgressInLocalStorage(lessonId, status, timeSpentMinutes);
    }
  } else {
    // Utente guest: salva solo in localStorage
    return updateProgressInLocalStorage(lessonId, status, timeSpentMinutes);
  }
}

/**
 * Update progress in localStorage (guest users)
 */
function updateProgressInLocalStorage(lessonId, status, timeSpentMinutes = 0) {
  try {
    let progress = loadProgressFromLocalStorage();

    if (!progress) {
      progress = {
        modules: [],
        stats: {
          current_level: "Foundation",
          total_points: 0,
          completed_modules: 0,
          completed_lessons: 0,
          modules_completed: 0,
          current_streak_days: 0,
        },
        badges: [],
        lesson_progress: {},
      };
    }

    // Inizializza lesson_progress se non esiste
    if (!progress.lesson_progress) {
      progress.lesson_progress = {};
    }

    // Aggiorna progresso lezione
    const lessonProgress = progress.lesson_progress[lessonId] || {};
    lessonProgress.status = status;
    lessonProgress.last_accessed_at = new Date().toISOString();

    if (status === "in_progress" && !lessonProgress.started_at) {
      lessonProgress.started_at = new Date().toISOString();
    }

    if (status === "completed") {
      lessonProgress.completed_at = new Date().toISOString();
      if (!progress.stats.completed_lessons) {
        progress.stats.completed_lessons = 0;
      }
      if (lessonProgress.status !== "completed") {
        progress.stats.completed_lessons += 1;
      }
    }

    if (timeSpentMinutes) {
      lessonProgress.time_spent_minutes = timeSpentMinutes;
    }

    progress.lesson_progress[lessonId] = lessonProgress;

    // Salva in localStorage
    saveProgressToLocalStorage(progress);

    return lessonProgress;
  } catch (e) {
    safeLog("error", "[Education] Errore updateProgressInLocalStorage:", e);
    throw e;
  }
}

/**
 * Render test item
 */
function renderTestItem(test) {
  const { userAttempts } = test;
  const lastAttempt = userAttempts?.[0];
  const canRetake = !test.max_attempts || (userAttempts?.length || 0) < test.max_attempts;

  return `
    <div class="test-item">
      <div class="test-content">
        <h3 class="test-title">${escapeHtml(test.title)}</h3>
        <p class="test-description">${escapeHtml(test.description || "")}</p>
        <div class="test-meta">
          <span>Soglia: ${test.passing_score}%</span>
          ${test.max_attempts ? `<span>Tentativi: ${userAttempts?.length || 0}/${test.max_attempts}</span>` : ""}
          ${lastAttempt ? `<span>Ultimo punteggio: ${lastAttempt.score}%</span>` : ""}
        </div>
      </div>
      <button class="btn btn-primary" 
              data-action="start-test" 
              data-test-id="${test.id}"
              ${!canRetake && lastAttempt?.passed ? "disabled" : ""}>
        ${lastAttempt?.passed ? "Rivedi" : lastAttempt ? "Riprova" : "Inizia Test"}
      </button>
    </div>
  `;
}

/**
 * Render markdown content (simplified)
 * IMPORTANTE: MAI colori blu, solo grassetto/corsivo
 */
function renderMarkdown(content) {
  // Simple markdown renderer (in production, use a proper library)
  // Rimuovi qualsiasi link markdown [text](url) e converti in testo normale
  let html = content
    .replace(/\[([^\]]+)\]\([^)]+\)/gim, "$1") // Rimuovi link markdown, mantieni solo testo
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/\n/gim, "<br>");

  // Forza tutti i tag <a> eventuali a non essere blu
  html = html.replace(
    /<a\s+([^>]*)>/gim,
    '<a $1 style="color: var(--edu-text-secondary) !important;">'
  );

  return html;
}

/**
 * Get auth token
 */
async function getAuthToken() {
  try {
    const { getToken } = await import("./token-storage.js");
    return await getToken();
  } catch {
    return null;
  }
}

/**
 * Handle SPA navigation for education
 */
export async function handleEducationNavigation(hash) {
  // Format: #education, #education/module/{slug}, #education/test/{testId}, #education/review/{questionId}, #education/spaced-repetition
  const parts = hash.replace("#education", "").split("/").filter(Boolean);

  if (parts.length === 0) {
    // Dashboard
    await initEducation();
  } else if (parts[0] === "module" && parts[1]) {
    // Module view - get module by slug
    try {
      const response = await fetch(`${API_BASE}?action=modules`, {
        headers: {
          Authorization: `Bearer ${await getAuthToken()}`,
        },
      });
      if (response.ok) {
        const { modules } = await response.json();
        const module = modules.find((m) => m.slug === parts[1]);
        if (module) {
          await openModule(module.id);
        } else {
          await initEducation();
        }
      } else {
        await initEducation();
      }
    } catch {
      await initEducation();
    }
  } else if (parts[0] === "test" && parts[1]) {
    // Test view
    const testId = parts[1];
    await openTest(testId);
  } else if (parts[0] === "review" && parts[1]) {
    // Retrieval practice / Spaced repetition review
    const questionId = parts[1];
    const { initRetrievalPractice } = await import("./education-retrieval-practice.js");
    await initRetrievalPractice(questionId, { spacedRepetition: true });
  } else if (parts[0] === "spaced-repetition") {
    // Spaced repetition dashboard
    const { initSpacedRepetition } = await import("./education-spaced-repetition.js");
    await initSpacedRepetition();
  } else if (parts[0] === "analytics") {
    // Learning analytics dashboard
    const { initLearningAnalytics } = await import("./education-analytics.js");
    await initLearningAnalytics();
  } else if (parts[0] === "interleaved" && parts[1]) {
    // Interleaved practice session
    const moduleIds = parts[1].split(",").filter(Boolean);
    const { initInterleavedPractice } = await import("./education-interleaving.js");
    await initInterleavedPractice(moduleIds);
  } else if (parts[0] === "personalized-paths") {
    // Personalized learning path
    const { initPersonalizedPathSelector } = await import("./education-personalized-paths.js");
    await initPersonalizedPathSelector();
  } else {
    await initEducation();
  }
}

/**
 * Open test view
 */
export async function openTest(testId) {
  const { initTest } = await import("./education-test.js");
  await initTest(testId);
}

/**
 * Export function per compatibilità con index.js (SPA navigation)
 */
export async function loadEducation() {
  // Handle hash-based navigation
  const hash = window.location.hash;
  if (hash.startsWith("#education")) {
    await handleEducationNavigation(hash);
  } else {
    await initEducation();
  }
}

/**
 * Export functions
 */
export { initEducation, openModule, openLesson };
