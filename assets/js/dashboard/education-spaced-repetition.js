/* eslint-env browser */
/**
 * Spaced Repetition System
 * Paper: Ebbinghaus (1885), Cepeda et al. (2006)
 * "The Critical Importance of Retrieval for Learning"
 *
 * Implementa curva dell'oblio con ripasso distribuito:
 * - Domande sbagliate: 1, 3, 7, 14, 30 giorni
 * - Domande difficili: 7, 14, 30, 60 giorni
 * - Domande facili: 30, 60, 90 giorni
 */

import { safeLog, escapeHtml } from "./security-utils.js";

const API_BASE = "/api/education";

// Spaced repetition intervals (giorni) - basato su curva dell'oblio
const SPACED_INTERVALS = {
  incorrect: [1, 3, 7, 14, 30], // Domande sbagliate
  difficult: [7, 14, 30, 60], // Domande difficili (corrette ma > 2 minuti)
  medium: [14, 30, 60], // Domande medie
  easy: [30, 60, 90], // Domande facili (< 30 secondi, corrette)
};

/**
 * Calculate next review date based on performance
 * Paper: Cepeda et al. (2006) - Optimal spacing intervals
 */
export function calculateNextReviewDate(questionId, performance) {
  const { attempts, correct, avgTime, lastReviewDate } = performance;

  if (!lastReviewDate) {
    // Prima volta: ripasso dopo 1 giorno se sbagliata, 7 se corretta
    return correct === 0
      ? addDays(new Date(), SPACED_INTERVALS.incorrect[0])
      : addDays(new Date(), SPACED_INTERVALS.difficult[0]);
  }

  const lastReview = new Date(lastReviewDate);
  const daysSinceLastReview = Math.floor(
    (Date.now() - lastReview.getTime()) / (1000 * 60 * 60 * 24)
  );
  const successRate = attempts > 0 ? correct / attempts : 0;

  // Determina categoria difficoltà
  let category = "easy";
  if (successRate < 0.5) {
    category = "incorrect";
  } else if (successRate < 0.7 || avgTime > 120000) {
    // > 2 minuti
    category = "difficult";
  } else if (successRate < 0.9) {
    category = "medium";
  }

  // Trova intervallo appropriato
  const intervals = SPACED_INTERVALS[category];
  const currentIntervalIndex = intervals.findIndex((interval) => daysSinceLastReview < interval);

  if (currentIntervalIndex === -1) {
    // Superato ultimo intervallo: usa l'ultimo
    return addDays(new Date(), intervals[intervals.length - 1]);
  }

  return addDays(new Date(), intervals[currentIntervalIndex]);
}

/**
 * Get questions due for review today
 */
export async function getQuestionsDueForReview() {
  try {
    const token = await getAuthToken();
    if (!token) {
      return [];
    }

    const response = await fetch(`${API_BASE}?action=spaced-repetition-due`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Errore caricamento ripasso");
    }

    const { questions } = await response.json();
    return questions || [];
  } catch (error) {
    safeLog("error", "[Spaced Repetition] Errore getQuestionsDueForReview:", error);
    return [];
  }
}

/**
 * Render spaced repetition dashboard HTML (internal)
 */
function renderSpacedRepetitionDashboardHTML(questions) {
  const dueToday = questions.filter((q) => q.due_today);
  const dueSoon = questions.filter((q) => !q.due_today && q.days_until_due <= 3);

  return `
    <div class="spaced-repetition-dashboard">
      <div class="sr-header">
        <h2>Ripasso Distribuito</h2>
        <p class="sr-description">
          Sistema di ripasso basato sulla curva dell'oblio (Ebbinghaus, 1885).
          Il ripasso distribuito aumenta la retention del 40-60% rispetto al ripasso concentrato.
        </p>
      </div>

      ${
        dueToday.length > 0
          ? `
        <div class="sr-section">
          <h3 class="sr-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Da Ripassare Oggi (${dueToday.length})
          </h3>
          <div class="sr-questions-list">
            ${dueToday.map((q) => renderQuestionCard(q, true)).join("")}
          </div>
        </div>
      `
          : `
        <div class="sr-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="48" height="48">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
          <h3>Nessun ripasso previsto oggi!</h3>
          <p>Ottimo lavoro, sei in pari con il ripasso distribuito.</p>
        </div>
      `
      }

      ${
        dueSoon.length > 0
          ? `
        <div class="sr-section">
          <h3 class="sr-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            In Arrivo (${dueSoon.length} - prossimi 3 giorni)
          </h3>
          <div class="sr-questions-list">
            ${dueSoon.map((q) => renderQuestionCard(q, false)).join("")}
          </div>
        </div>
      `
          : ""
      }

      <div class="sr-stats">
        <div class="sr-stat-card">
          <div class="sr-stat-value">${questions.length}</div>
          <div class="sr-stat-label">Domande in Ripasso</div>
        </div>
        <div class="sr-stat-card">
          <div class="sr-stat-value">${dueToday.length}</div>
          <div class="sr-stat-label">Da Ripassare Oggi</div>
        </div>
        <div class="sr-stat-card">
          <div class="sr-stat-value">${questions.filter((q) => q.success_rate >= 0.8).length}</div>
          <div class="sr-stat-label">Domande Padroneggiate</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render question card for spaced repetition
 */
function renderQuestionCard(question, isDueToday) {
  const successRate = question.success_rate || 0;
  const successRatePct = Math.round(successRate * 100);
  const difficultyColor =
    successRate < 0.5
      ? "var(--edu-error)"
      : successRate < 0.7
        ? "var(--edu-warning)"
        : "var(--edu-success)";

  return `
    <div class="sr-question-card ${isDueToday ? "due-today" : ""}">
      <div class="sr-question-header">
        <div class="sr-question-meta">
          <span class="sr-question-module">${escapeHtml(question.module_title || "Modulo")}</span>
          ${
            isDueToday
              ? `
            <span class="sr-due-badge">Da ripassare oggi</span>
          `
              : `
            <span class="sr-due-soon">Tra ${question.days_until_due} giorni</span>
          `
          }
        </div>
        <div class="sr-question-stats">
          <span class="sr-success-rate" style="color: ${difficultyColor}">
            ${successRatePct}% successo
          </span>
        </div>
      </div>
      <div class="sr-question-text">
        ${escapeHtml(question.question_text || question.text || "")}
      </div>
      <div class="sr-question-actions">
        <button class="btn btn-primary btn-sm" 
                data-action="start-review" 
                data-question-id="${question.id || question.question_id}">
          ${isDueToday ? "Inizia Ripasso" : "Anticipa Ripasso"}
        </button>
      </div>
    </div>
  `;
}

/**
 * Start review session for a question
 */
async function startReviewSession(questionId) {
  try {
    const container = document.getElementById("education-container");
    if (!container) {
      safeLog("warn", "[Spaced Repetition] Container non trovato");
      return;
    }

    // Navigate to retrieval practice session
    window.history.pushState(
      { view: "retrieval-practice", questionId },
      "",
      `#education/review/${questionId}`
    );

    // Import and init retrieval practice
    const { initRetrievalPractice } = await import("./education-retrieval-practice.js");
    await initRetrievalPractice(questionId, { spacedRepetition: true });
  } catch (error) {
    safeLog("error", "[Spaced Repetition] Errore startReviewSession:", error);
    if (window.showToast) {
      window.showToast("Errore avvio ripasso", "error");
    }
  }
}

/**
 * Update question performance after review
 */
export async function updateQuestionReview(questionId, isCorrect, timeSpent) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return;
    }

    const response = await fetch(`${API_BASE}?action=update-spaced-repetition`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        questionId,
        isCorrect,
        timeSpent,
        reviewedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Errore aggiornamento ripasso");
    }

    return await response.json();
  } catch (error) {
    safeLog("error", "[Spaced Repetition] Errore updateQuestionReview:", error);
    throw error;
  }
}

/**
 * Helper: Add days to date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
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

/**
 * Initialize spaced repetition system
 */
export async function initSpacedRepetition() {
  // Use education container for SPA navigation
  const container = document.getElementById("education-container");
  if (!container) {
    safeLog("warn", "[Spaced Repetition] Container non trovato");
    return;
  }

  // Navigate to spaced repetition view
  window.history.pushState({ view: "spaced-repetition" }, "", "#education/spaced-repetition");

  await loadSpacedRepetition(container);
}

/**
 * Load spaced repetition dashboard
 */
async function loadSpacedRepetition(container) {
  try {
    const questions = await getQuestionsDueForReview();

    // Add back button
    const backButton = `
      <button class="btn btn-secondary btn-sm" data-action="back-to-education" style="margin-bottom: var(--edu-spacing-lg);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Torna alla Formazione
      </button>
    `;

    const questionsHtml = renderSpacedRepetitionDashboardHTML(questions);
    container.innerHTML = backButton + questionsHtml;

    // Bind review buttons
    container.querySelectorAll("[data-action='start-review']").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const questionId = btn.dataset.questionId;
        await startReviewSession(questionId);
      });
    });

    // Bind back button
    container.querySelector("[data-action='back-to-education']")?.addEventListener("click", () => {
      window.history.pushState({ view: "dashboard" }, "", "#education");
      import("./education.js").then(({ initEducation }) => initEducation());
    });
  } catch (error) {
    safeLog("error", "[Spaced Repetition] Errore loadSpacedRepetition:", error);
    container.innerHTML = `
      <div class="error-state">
        <h3>Errore caricamento ripasso</h3>
        <p>Riprova più tardi.</p>
      </div>
    `;
  }
}
