/* eslint-env browser */
/**
 * Learning Analytics Dashboard
 * Paper: Siemens & Long (2011), Ferguson (2012)
 * "Penetrating the Fog: Analytics in Learning and Education"
 * 
 * Dashboard completo per tracciare:
 * - Progresso moduli/lezioni
 * - Performance test
 * - Tempo di studio
 * - Retention rate
 * - Learning velocity
 * - Weak areas
 */

import { safeLog, escapeHtml } from "./security-utils.js";

const API_BASE = "/api/education";

let analyticsData = null;

/**
 * Initialize learning analytics dashboard
 */
export async function initLearningAnalytics() {
  const container = document.getElementById("education-container");
  if (!container) {
    safeLog("warn", "[Learning Analytics] Container non trovato");
    return;
  }

  // Navigate to analytics view
  window.history.pushState({ view: "learning-analytics" }, "", "#education/analytics");

  await loadAnalyticsDashboard(container);
}

/**
 * Load analytics dashboard
 */
async function loadAnalyticsDashboard(container) {
  try {
    // Show loading state
    container.innerHTML = `
      <div class="analytics-loading">
        <div class="spinner"></div>
        <p>Caricamento analytics...</p>
      </div>
    `;

    // Fetch analytics data
    const data = await fetchAnalyticsData();
    analyticsData = data;

    // Render dashboard
    renderAnalyticsDashboard(container, data);
  } catch (error) {
    safeLog("error", "[Learning Analytics] Errore loadAnalyticsDashboard:", error);
    container.innerHTML = `
      <div class="error-state">
        <h3>Errore caricamento analytics</h3>
        <p>Riprova più tardi.</p>
        <button class="btn btn-primary" onclick="location.reload()">Ricarica</button>
      </div>
    `;
  }
}

/**
 * Fetch analytics data from API
 */
async function fetchAnalyticsData() {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE}?action=learning-analytics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Errore caricamento analytics");
    }

    return await response.json();
  } catch (error) {
    safeLog("error", "[Learning Analytics] Errore fetchAnalyticsData:", error);
    throw error;
  }
}

/**
 * Render analytics dashboard
 */
function renderAnalyticsDashboard(container, data) {
  const {
    overview,
    progress,
    testPerformance,
    timeSpent,
    retentionRate,
    learningVelocity,
    weakAreas,
    streaks,
  } = data;

  container.innerHTML = `
    <div class="learning-analytics-dashboard">
      <!-- Header -->
      <div class="analytics-header">
        <button class="btn btn-secondary btn-sm" data-action="back-to-education">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Torna alla Formazione
        </button>
        <div class="analytics-header-content">
          <h1 class="analytics-title">Learning Analytics</h1>
          <p class="analytics-description">
            Dashboard completa del tuo apprendimento basata su Learning Analytics (Siemens & Long, 2011).
            Traccia progresso, performance e aree di miglioramento.
          </p>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="analytics-overview">
        ${renderOverviewCard("Moduli Completati", overview.modulesCompleted || 0, overview.totalModules || 0, "modules")}
        ${renderOverviewCard("Lezioni Completate", overview.lessonsCompleted || 0, overview.totalLessons || 0, "lessons")}
        ${renderOverviewCard("Test Superati", overview.testsPassed || 0, overview.totalTests || 0, "tests")}
        ${renderOverviewCard("Punti Totali", overview.totalPoints || 0, null, "points")}
        ${renderOverviewCard("Livello Attuale", overview.currentLevel || 1, null, "level")}
        ${renderOverviewCard("Streak Giorni", streaks.current || 0, streaks.longest || 0, "streak")}
      </div>

      <!-- Progress Chart -->
      <div class="analytics-section">
        <h2 class="analytics-section-title">Progresso Moduli</h2>
        <div class="analytics-chart-container">
          ${renderProgressChart(progress)}
        </div>
      </div>

      <!-- Test Performance -->
      <div class="analytics-section">
        <h2 class="analytics-section-title">Performance Test</h2>
        <div class="analytics-chart-container">
          ${renderTestPerformanceChart(testPerformance)}
        </div>
      </div>

      <!-- Time Spent -->
      <div class="analytics-section">
        <h2 class="analytics-section-title">Tempo di Studio</h2>
        <div class="analytics-stats-grid">
          ${renderTimeStat("Oggi", timeSpent.today || 0)}
          ${renderTimeStat("Questa Settimana", timeSpent.thisWeek || 0)}
          ${renderTimeStat("Questo Mese", timeSpent.thisMonth || 0)}
          ${renderTimeStat("Totale", timeSpent.total || 0)}
        </div>
      </div>

      <!-- Retention Rate -->
      <div class="analytics-section">
        <h2 class="analytics-section-title">Retention Rate</h2>
        <div class="analytics-retention">
          ${renderRetentionCard("1 Giorno", retentionRate.day1 || 0)}
          ${renderRetentionCard("7 Giorni", retentionRate.day7 || 0)}
          ${renderRetentionCard("30 Giorni", retentionRate.day30 || 0)}
        </div>
      </div>

      <!-- Learning Velocity -->
      <div class="analytics-section">
        <h2 class="analytics-section-title">Learning Velocity</h2>
        <div class="analytics-velocity">
          <div class="velocity-metric">
            <span class="velocity-label">Lezioni/Settimana</span>
            <span class="velocity-value">${learningVelocity.lessonsPerWeek || 0}</span>
          </div>
          <div class="velocity-metric">
            <span class="velocity-label">Tempo Medio/Lezione</span>
            <span class="velocity-value">${formatMinutes(learningVelocity.avgTimePerLesson || 0)}</span>
          </div>
          <div class="velocity-metric">
            <span class="velocity-label">Test/Settimana</span>
            <span class="velocity-value">${learningVelocity.testsPerWeek || 0}</span>
          </div>
        </div>
      </div>

      <!-- Weak Areas -->
      ${weakAreas && weakAreas.length > 0 ? `
        <div class="analytics-section">
          <h2 class="analytics-section-title">Aree da Migliorare</h2>
          <div class="analytics-weak-areas">
            ${weakAreas.map(area => renderWeakArea(area)).join("")}
          </div>
        </div>
      ` : ""}

      <!-- Recent Activity -->
      <div class="analytics-section">
        <h2 class="analytics-section-title">Attività Recente</h2>
        <div class="analytics-activity">
          ${renderRecentActivity(data.recentActivity || [])}
        </div>
      </div>
    </div>
  `;

  // Bind events
  container.querySelector("[data-action='back-to-education']")?.addEventListener("click", () => {
    window.history.pushState({ view: "dashboard" }, "", "#education");
    import("./education.js").then(({ initEducation }) => initEducation());
  });
}

/**
 * Render overview card
 */
function renderOverviewCard(title, value, max, type) {
  const percentage = max ? Math.round((value / max) * 100) : null;
  const icon = getOverviewIcon(type);

  return `
    <div class="analytics-overview-card">
      <div class="overview-icon">${icon}</div>
      <div class="overview-content">
        <div class="overview-value">${value}${max ? ` / ${max}` : ""}</div>
        <div class="overview-label">${escapeHtml(title)}</div>
        ${percentage !== null ? `
          <div class="overview-progress">
            <div class="overview-progress-bar">
              <div class="overview-progress-fill" style="width: ${percentage}%"></div>
            </div>
            <span class="overview-percentage">${percentage}%</span>
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

/**
 * Render progress chart
 */
function renderProgressChart(progress) {
  if (!progress || !progress.modules || progress.modules.length === 0) {
    return `<p class="analytics-empty">Nessun progresso ancora</p>`;
  }

  return `
    <div class="progress-chart">
      ${progress.modules.map(module => `
        <div class="progress-item">
          <div class="progress-header">
            <span class="progress-module-name">${escapeHtml(module.name)}</span>
            <span class="progress-percentage">${module.percentage || 0}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${module.percentage || 0}%"></div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

/**
 * Render test performance chart
 */
function renderTestPerformanceChart(testPerformance) {
  if (!testPerformance || !testPerformance.tests || testPerformance.tests.length === 0) {
    return `<p class="analytics-empty">Nessun test completato</p>`;
  }

  const avgScore = testPerformance.averageScore || 0;

  return `
    <div class="test-performance-chart">
      <div class="test-performance-avg">
        <span class="avg-label">Media Punteggio</span>
        <span class="avg-value">${avgScore}%</span>
      </div>
      <div class="test-performance-list">
        ${testPerformance.tests.map(test => `
          <div class="test-performance-item">
            <div class="test-info">
              <span class="test-name">${escapeHtml(test.name)}</span>
              <span class="test-date">${formatDate(test.date)}</span>
            </div>
            <div class="test-score">
              <span class="score-value ${getScoreClass(test.score)}">${test.score}%</span>
              <div class="score-bar">
                <div class="score-fill ${getScoreClass(test.score)}" style="width: ${test.score}%"></div>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

/**
 * Render time stat
 */
function renderTimeStat(label, minutes) {
  return `
    <div class="time-stat-card">
      <div class="time-stat-value">${formatMinutes(minutes)}</div>
      <div class="time-stat-label">${escapeHtml(label)}</div>
    </div>
  `;
}

/**
 * Render retention card
 */
function renderRetentionCard(label, percentage) {
  return `
    <div class="retention-card">
      <div class="retention-label">${escapeHtml(label)}</div>
      <div class="retention-value">${percentage}%</div>
      <div class="retention-bar">
        <div class="retention-fill" style="width: ${percentage}%"></div>
      </div>
    </div>
  `;
}

/**
 * Render weak area
 */
function renderWeakArea(area) {
  return `
    <div class="weak-area-card">
      <div class="weak-area-header">
        <span class="weak-area-name">${escapeHtml(area.name)}</span>
        <span class="weak-area-score">${area.score}%</span>
      </div>
      <div class="weak-area-description">
        ${escapeHtml(area.description || "Migliora questa area per aumentare le tue competenze")}
      </div>
      <div class="weak-area-actions">
        <button class="btn btn-primary btn-sm" data-action="review-area" data-area-id="${area.id}">
          Ripassa Area
        </button>
      </div>
    </div>
  `;
}

/**
 * Render recent activity
 */
function renderRecentActivity(activities) {
  if (!activities || activities.length === 0) {
    return `<p class="analytics-empty">Nessuna attività recente</p>`;
  }

  return `
    <div class="activity-list">
      ${activities.map(activity => `
        <div class="activity-item">
          <div class="activity-icon">${getActivityIcon(activity.type)}</div>
          <div class="activity-content">
            <div class="activity-title">${escapeHtml(activity.title)}</div>
            <div class="activity-meta">
              <span class="activity-time">${formatRelativeTime(activity.timestamp)}</span>
              ${activity.module ? `<span class="activity-module">${escapeHtml(activity.module)}</span>` : ""}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

/**
 * Helper functions
 */
function getOverviewIcon(type) {
  const icons = {
    modules: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>`,
    lessons: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>`,
    tests: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>`,
    points: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>`,
    level: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>`,
    streak: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>`,
  };
  return icons[type] || icons.modules;
}

function getScoreClass(score) {
  if (score >= 80) return "score-excellent";
  if (score >= 60) return "score-good";
  if (score >= 40) return "score-fair";
  return "score-poor";
}

function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Ora";
  if (diffMins < 60) return `${diffMins} min fa`;
  if (diffHours < 24) return `${diffHours} ore fa`;
  if (diffDays < 7) return `${diffDays} giorni fa`;
  return formatDate(timestamp);
}

function getActivityIcon(type) {
  const icons = {
    lesson_completed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
      <polyline points="9 11 12 14 22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>`,
    test_completed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>`,
    module_completed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>`,
  };
  return icons[type] || icons.lesson_completed;
}

/**
 * Helper: Get auth token
 */
async function getAuthToken() {
  try {
    const { getToken } = await import("./token-storage.js");
    return await getToken();
  } catch (e) {
    return null;
  }
}

export { initLearningAnalytics };
