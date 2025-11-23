/* eslint-env browser */
/**
 * Education System Module
 * Sistema formativo con gamification per retail
 * Best Practice Accademica 2025
 * 
 * Research Base:
 * - Bloom's Taxonomy (1956, revised 2001)
 * - Spaced Repetition (Ebbinghaus, 1885)
 * - Gamification in Education (Deterding et al., 2011)
 * - Cognitive Load Theory (Sweller, 1988)
 */

import { safeLog } from "./security-utils.js";
import { escapeHtml } from "./security-utils.js";

const API_BASE = "/api/education";

let currentModule = null;
let currentLesson = null;
let currentTest = null;

/**
 * Initialize education system
 */
export async function initEducation() {
  const container = document.getElementById("education-container");
  if (!container) {
    return;
  }

  // Load user progress and modules
  await loadEducationDashboard(container);
}

/**
 * Load education dashboard
 */
async function loadEducationDashboard(container) {
  try {
    // Get user progress
    const progressResponse = await fetch(`${API_BASE}?action=user-progress`, {
      headers: {
        Authorization: `Bearer ${await getAuthToken()}`,
      },
    });

    if (!progressResponse.ok) {
      throw new Error("Errore caricamento progresso");
    }

    const { progress } = await progressResponse.json();

    // Render dashboard
    renderEducationDashboard(container, progress);
  } catch (error) {
    safeLog("error", "[Education] Errore loadEducationDashboard:", error);
    container.innerHTML = `
      <div class="error-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3>Errore caricamento</h3>
        <p>Impossibile caricare il percorso formativo. Riprova più tardi.</p>
      </div>
    `;
  }
}

/**
 * Render education dashboard
 */
function renderEducationDashboard(container, progress) {
  const { modules, stats, badges } = progress;

  container.innerHTML = `
    <div class="education-dashboard">
      <!-- Header con stats -->
      <div class="education-header">
        <div class="education-stats">
          <div class="stat-card">
            <div class="stat-value">${stats.current_level}</div>
            <div class="stat-label">Livello</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.total_points || 0}</div>
            <div class="stat-label">Punti</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.modules_completed || 0}/4</div>
            <div class="stat-label">Moduli</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.current_streak_days || 0}</div>
            <div class="stat-label">Giorni Streak</div>
          </div>
        </div>

        <!-- Badge recenti -->
        ${badges.length > 0 ? `
          <div class="education-badges-preview">
            <h4>Badge Ottenuti</h4>
            <div class="badges-list">
              ${badges.slice(0, 5).map(badge => `
                <div class="badge-item" title="${escapeHtml(badge.description || badge.name)}">
                  <span class="badge-icon">🏆</span>
                  <span class="badge-name">${escapeHtml(badge.name)}</span>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ""}
      </div>

      <!-- Moduli -->
      <div class="education-modules">
        <h2 class="education-section-title">Percorso Formativo</h2>
        <div class="modules-grid">
          ${modules.map((module, index) => renderModuleCard(module, index)).join("")}
        </div>
      </div>
    </div>
  `;

  // Bind events
  bindEducationEvents(container);
}

/**
 * Render module card
 */
function renderModuleCard(module, index) {
  const { userProgress, canAccess } = module;
  const isLocked = !canAccess && module.requires_previous_module;
  const progressPct = userProgress?.progress_percentage || 0;
  const status = userProgress?.status || "not_started";

  const statusLabels = {
    not_started: "Non iniziato",
    in_progress: "In corso",
    completed: "Completato",
    locked: "Bloccato",
  };

  const statusColors = {
    not_started: "var(--dash-text-muted)",
    in_progress: "var(--brand-500)",
    completed: "var(--success)",
    locked: "var(--dash-text-muted)",
  };

  return `
    <div class="module-card education-module-card ${isLocked ? "locked" : ""}" 
         data-module-id="${module.id}" 
         data-module-slug="${module.slug}">
      <div class="module-card-header">
        <div class="module-number">${index + 1}</div>
        <div class="module-status-badge" style="background: ${statusColors[status]}">
          ${statusLabels[status]}
        </div>
      </div>
      <div class="module-card-content">
        <h3 class="module-title">${escapeHtml(module.title)}</h3>
        <p class="module-description">${escapeHtml(module.description || "")}</p>
        
        ${status === "in_progress" || status === "completed" ? `
          <div class="module-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progressPct}%"></div>
            </div>
            <span class="progress-text">${progressPct}% completato</span>
          </div>
        ` : ""}

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
        ${isLocked ? `
          <button class="btn btn-secondary" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Bloccato
          </button>
        ` : `
          <button class="btn btn-primary" data-action="open-module" data-module-id="${module.id}">
            ${status === "completed" ? "Rivedi" : status === "in_progress" ? "Continua" : "Inizia"}
          </button>
        `}
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
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const moduleId = btn.dataset.moduleId;
      await openModule(moduleId);
    });
  });
}

/**
 * Open module view
 */
async function openModule(moduleId) {
  try {
    const response = await fetch(`${API_BASE}?action=module&moduleId=${moduleId}`, {
      headers: {
        Authorization: `Bearer ${await getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Errore caricamento modulo");
    }

    const { module } = await response.json();
    currentModule = module;

    // Navigate to module view (SPA navigation)
    window.history.pushState({ view: "module", moduleId }, "", `#education/module/${module.slug}`);
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
  if (!container) return;

  container.innerHTML = `
    <div class="education-module-view">
      <div class="module-view-header">
        <button class="btn btn-secondary btn-sm" data-action="back-to-dashboard">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Indietro
        </button>
        <h1 class="module-view-title">${escapeHtml(module.title)}</h1>
        <p class="module-view-description">${escapeHtml(module.description || "")}</p>
      </div>

      <div class="module-lessons">
        <h2>Lezioni</h2>
        <div class="lessons-list">
          ${module.lessons.map((lesson, index) => renderLessonItem(lesson, index)).join("")}
        </div>
      </div>

      ${module.userProgress?.status === "completed" && module.tests?.length > 0 ? `
        <div class="module-tests">
          <h2>Test di Verifica</h2>
          <div class="tests-list">
            ${module.tests.map(test => renderTestItem(test)).join("")}
          </div>
        </div>
      ` : ""}
    </div>
  `;

  // Bind events
  container.querySelector("[data-action='back-to-dashboard']")?.addEventListener("click", () => {
    window.history.pushState({ view: "dashboard" }, "", "#education");
    initEducation();
  });

  container.querySelectorAll("[data-action='open-lesson']").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const lessonId = btn.dataset.lessonId;
      await openLesson(lessonId);
    });
  });
}

/**
 * Render lesson item
 */
function renderLessonItem(lesson, index) {
  const { userProgress } = lesson;
  const status = userProgress?.status || "not_started";

  const statusIcons = {
    not_started: "○",
    in_progress: "◐",
    completed: "✓",
  };

  return `
    <div class="lesson-item ${status}" data-lesson-id="${lesson.id}">
      <div class="lesson-number">${index + 1}</div>
      <div class="lesson-content">
        <h3 class="lesson-title">${escapeHtml(lesson.title)}</h3>
        <div class="lesson-meta">
          <span>${lesson.estimated_minutes || 0} min</span>
          <span class="lesson-type">${lesson.content_type}</span>
        </div>
      </div>
      <div class="lesson-status">${statusIcons[status]}</div>
      <button class="btn btn-primary btn-sm" data-action="open-lesson" data-lesson-id="${lesson.id}">
        ${status === "completed" ? "Rivedi" : status === "in_progress" ? "Continua" : "Inizia"}
      </button>
    </div>
  `;
}

/**
 * Open lesson view
 */
async function openLesson(lessonId) {
  try {
    const response = await fetch(`${API_BASE}?action=lesson&lessonId=${lessonId}`, {
      headers: {
        Authorization: `Bearer ${await getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Errore caricamento lezione");
    }

    const { lesson } = await response.json();
    currentLesson = lesson;

    // Mark as started
    await updateLessonProgress(lessonId, "in_progress");

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
  if (!container) return;

  container.innerHTML = `
    <div class="education-lesson-view">
      <div class="lesson-view-header">
        <button class="btn btn-secondary btn-sm" data-action="back-to-module">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Indietro
        </button>
        <h1 class="lesson-view-title">${escapeHtml(lesson.title)}</h1>
      </div>

      <div class="lesson-view-content">
        ${lesson.content_type === "video" && lesson.video_url ? `
          <div class="lesson-video">
            <iframe src="${escapeHtml(lesson.video_url)}" frameborder="0" allowfullscreen></iframe>
          </div>
        ` : ""}
        
        ${lesson.content ? `
          <div class="lesson-text-content">
            ${renderMarkdown(lesson.content)}
          </div>
        ` : ""}

        ${lesson.content_type === "pdf" && lesson.pdf_url ? `
          <div class="lesson-pdf">
            <iframe src="${escapeHtml(lesson.pdf_url)}" frameborder="0"></iframe>
          </div>
        ` : ""}
      </div>

      <div class="lesson-view-actions">
        <button class="btn btn-primary" data-action="complete-lesson" data-lesson-id="${lesson.id}">
          Segna come completata
        </button>
      </div>
    </div>
  `;

  // Bind events
  container.querySelector("[data-action='back-to-module']")?.addEventListener("click", () => {
    if (currentModule) {
      openModule(currentModule.id);
    }
  });

  container.querySelector("[data-action='complete-lesson']")?.addEventListener("click", async () => {
    const lessonId = container.querySelector("[data-action='complete-lesson']").dataset.lessonId;
    await updateLessonProgress(lessonId, "completed");
    if (window.showToast) {
      window.showToast("Lezione completata!", "success");
    }
    // Reload module view
    if (currentModule) {
      await openModule(currentModule.id);
    }
  });
}

/**
 * Update lesson progress
 */
async function updateLessonProgress(lessonId, status, timeSpentMinutes = 0) {
  try {
    const response = await fetch(`${API_BASE}?action=update-lesson-progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAuthToken()}`,
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
    safeLog("error", "[Education] Errore updateLessonProgress:", error);
    throw error;
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
 */
function renderMarkdown(content) {
  // Simple markdown renderer (in production, use a proper library)
  return content
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/\n/gim, "<br>");
}

/**
 * Get auth token
 */
async function getAuthToken() {
  try {
    const { getToken } = await import("./token-storage.js");
    return await getToken();
  } catch (e) {
    return null;
  }
}

/**
 * Export functions
 */
export { initEducation, openModule, openLesson };
