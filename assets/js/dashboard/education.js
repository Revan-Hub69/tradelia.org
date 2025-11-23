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

let currentModule = null;
let currentLesson = null;
let currentTest = null;

// Adaptive Learning: Track performance per question
const questionPerformance = new Map(); // questionId -> { attempts, correct, difficulty }

// Microlearning: Track session time
let lessonStartTime = null;
const MICROLEARNING_MAX_MINUTES = 10; // Paper: Hug (2016) - optimal 5-10 min chunks

/**
 * Initialize education system (dashboard view)
 */
async function initEducation() {
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

      <!-- Spaced Repetition Section -->
      <div class="education-spaced-repetition">
        <div class="sr-quick-access">
          <button class="btn btn-secondary" data-action="open-spaced-repetition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            Ripasso Distribuito
          </button>
          <button class="btn btn-secondary" data-action="open-retrieval-practice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Ripasso Attivo
          </button>
          <button class="btn btn-secondary" data-action="open-learning-goals">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            I Miei Obiettivi
          </button>
          <button class="btn btn-secondary" data-action="open-learning-analytics">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Learning Analytics
          </button>
          <button class="btn btn-secondary" data-action="open-personalized-path">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            Percorso Personalizzato
          </button>
        </div>
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

  // Spaced Repetition
  container.querySelector("[data-action='open-spaced-repetition']")?.addEventListener("click", async () => {
    const { initSpacedRepetition } = await import("./education-spaced-repetition.js");
    await initSpacedRepetition();
  });

  // Retrieval Practice
  container.querySelector("[data-action='open-retrieval-practice']")?.addEventListener("click", async () => {
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
  container.querySelector("[data-action='open-learning-goals']")?.addEventListener("click", async () => {
    const { showLearningGoalsModal } = await import("./education-metacognition.js");
    showLearningGoalsModal();
  });

  // Learning Analytics
  container.querySelector("[data-action='open-learning-analytics']")?.addEventListener("click", async () => {
    const { initLearningAnalytics } = await import("./education-analytics.js");
    await initLearningAnalytics();
  });

  // Personalized Path
  container.querySelector("[data-action='open-personalized-path']")?.addEventListener("click", async () => {
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

      ${module.tests && module.tests.length > 0 ? `
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

  container.querySelectorAll("[data-action='start-test']").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const testId = btn.dataset.testId;
      await openTest(testId);
    });
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
  
  // Microlearning indicator: verde se < 10 min (optimal chunk size)
  const isMicrolearning = estimatedMinutes > 0 && estimatedMinutes <= MICROLEARNING_MAX_MINUTES;
  const microlearningBadge = isMicrolearning ? `
    <span class="microlearning-badge" title="Microlearning: lezione ottimale 5-10 minuti (Hug, 2016)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="12" height="12">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      Micro
    </span>
  ` : "";

  const statusIcons = {
    not_started: "○",
    in_progress: "◐",
    completed: "✓",
  };

  return `
    <div class="lesson-item ${status} ${isMicrolearning ? 'microlearning' : ''}" data-lesson-id="${lesson.id}">
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
      <button class="btn btn-primary btn-sm" data-action="open-lesson" data-lesson-id="${lesson.id}">
        ${status === "completed" ? "Rivedi" : status === "in_progress" ? "Continua" : "Inizia"}
      </button>
    </div>
  `;
}

/**
 * Open lesson view
 * Paper: Microlearning (Hug, 2016) - Track session time
 * Paper: Learning Analytics (Siemens & Long, 2011) - Track engagement
 * Paper: Metacognition (Zimmerman, 2002) - Pre-lesson assessment
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

    // Metacognition: Show pre-lesson assessment (Zimmerman, 2002)
    const { showPreLessonAssessment } = await import("./education-metacognition.js");
    await showPreLessonAssessment(lessonId, lesson.title);

    // Microlearning: Start session timer
    lessonStartTime = Date.now();

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
        const module = modules.find(m => m.slug === parts[1]);
        if (module) {
          await openModule(module.id);
        } else {
          await initEducation();
        }
      } else {
        await initEducation();
      }
    } catch (e) {
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
