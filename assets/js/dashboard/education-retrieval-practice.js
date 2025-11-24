/* eslint-env browser */
/**
 * Retrieval Practice Sessions
 * Paper: Roediger & Karpicke (2006), Karpicke & Blunt (2011)
 * "Test-Enhanced Learning" - "Retrieval Practice Produces More Learning"
 *
 * Sessioni di ripasso attivo senza punteggio, solo per apprendere.
 * Low-stakes quizzing per consolidare conoscenza.
 */

import { safeLog, escapeHtml } from "./security-utils.js";
import { updateQuestionReview } from "./education-spaced-repetition.js";

const API_BASE = "/api/education";

let currentSession = null;
let sessionAnswers = {};
// let sessionStartTime = null; // TODO: Usare per analytics

/**
 * Initialize retrieval practice session
 * @param {string|Array} questionIds - Single question ID or array of question IDs
 * @param {Object} options - Session options
 */
export async function initRetrievalPractice(questionIds, options = {}) {
  try {
    const container = document.getElementById("education-container");
    if (!container) {
      safeLog("warn", "[Retrieval Practice] Container non trovato");
      return;
    }

    // Convert single ID to array
    const ids = Array.isArray(questionIds) ? questionIds : [questionIds];

    // Get questions
    const questions = await fetchQuestions(ids);
    if (!questions || questions.length === 0) {
      if (window.showToast) {
        window.showToast("Nessuna domanda disponibile per il ripasso", "warning");
      }
      return;
    }

    currentSession = {
      questions,
      options: {
        showScore: false, // No score in practice mode
        showExplanations: true,
        allowRetry: true,
        ...options,
      },
    };

    sessionAnswers = {};
    // sessionStartTime = Date.now(); // TODO: Usare per analytics

    renderRetrievalPracticeSession(container, currentSession);
  } catch (error) {
    safeLog("error", "[Retrieval Practice] Errore initRetrievalPractice:", error);
    if (window.showToast) {
      window.showToast("Errore avvio ripasso attivo", "error");
    }
  }
}

/**
 * Fetch questions for retrieval practice
 */
async function fetchQuestions(questionIds) {
  try {
    const token = await getAuthToken();
    const response = await fetch(
      `${API_BASE}?action=retrieval-questions&questionIds=${questionIds.join(",")}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Errore caricamento domande");
    }

    const { questions } = await response.json();
    return questions || [];
  } catch (error) {
    safeLog("error", "[Retrieval Practice] Errore fetchQuestions:", error);
    return [];
  }
}

/**
 * Render retrieval practice session
 */
function renderRetrievalPracticeSession(container, session) {
  const { questions, options } = session;
  const isSpacedRepetition = options.spacedRepetition;

  container.innerHTML = `
    <div class="retrieval-practice-session">
      <div class="rp-header">
        <button class="btn btn-secondary btn-sm" data-action="back-to-dashboard">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Indietro
        </button>
        <div class="rp-header-content">
          <h1 class="rp-title">
            ${isSpacedRepetition ? "Ripasso Distribuito" : "Ripasso Attivo"}
          </h1>
          <p class="rp-description">
            ${
              isSpacedRepetition
                ? "Ripassa questa domanda per consolidare la memoria a lungo termine (Ebbinghaus, 1885)"
                : "Ripasso attivo senza punteggio - solo per apprendere (Roediger & Karpicke, 2006)"
            }
          </p>
          <div class="rp-info">
            <span>${questions.length} ${questions.length === 1 ? "domanda" : "domande"}</span>
            <span>•</span>
            <span>Nessun punteggio - solo apprendimento</span>
          </div>
        </div>
      </div>

      <div class="rp-questions">
        ${questions.map((question, index) => renderPracticeQuestion(question, index + 1)).join("")}
      </div>

      <div class="rp-actions">
        <button class="btn btn-secondary" data-action="check-answers">
          Verifica Risposte
        </button>
        <button class="btn btn-primary" data-action="show-explanations" style="display: none;">
          Mostra Spiegazioni
        </button>
      </div>
    </div>
  `;

  bindRetrievalPracticeEvents(container, session);
}

/**
 * Render practice question (no score, just learning)
 */
function renderPracticeQuestion(question, questionNumber) {
  const questionId = question.id;
  const inputType = question.question_type === "multiple_choice" ? "radio" : "checkbox";
  const inputName = `rp-question-${questionId}`;

  return `
    <div class="rp-question" data-question-id="${questionId}">
      <div class="rp-question-header">
        <span class="rp-question-number">Domanda ${questionNumber}</span>
        <span class="rp-practice-badge" title="Ripasso attivo - nessun punteggio">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="14" height="14">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          Practice Mode
        </span>
      </div>
      <div class="rp-question-text">${escapeHtml(question.question_text)}</div>
      
      ${
        question.bloom_level
          ? `
        <div class="rp-question-bloom">
          <span class="bloom-badge bloom-${question.bloom_level}">${getBloomLabel(question.bloom_level)}</span>
        </div>
      `
          : ""
      }

      <div class="rp-question-options">
        ${
          question.education_question_options
            ?.map(
              (option, optIndex) => `
          <label class="rp-option" data-option-id="${option.id}">
            <input 
              type="${inputType}" 
              id="rp-option-${questionId}-${option.id}"
              name="${inputName}" 
              value="${option.id}"
              data-question-id="${questionId}"
            />
            <span class="rp-option-label">
              <span class="option-letter">${String.fromCharCode(65 + optIndex)}.</span>
              ${escapeHtml(option.option_text)}
            </span>
          </label>
        `
            )
            .join("") || ""
        }
      </div>

      <div class="rp-question-explanation" style="display: none;" data-explanation>
        ${
          question.explanation
            ? `
          <div class="rp-explanation-content">
            <strong>Spiegazione:</strong>
            <p>${escapeHtml(question.explanation)}</p>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `;
}

/**
 * Bind retrieval practice events
 */
function bindRetrievalPracticeEvents(container, session) {
  // Back button
  container.querySelector("[data-action='back-to-dashboard']")?.addEventListener("click", () => {
    window.history.pushState({ view: "dashboard" }, "", "#education");
    import("./education.js").then(({ initEducation }) => initEducation());
  });

  // Option selection
  container.querySelectorAll(".rp-option input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const questionId = e.target.dataset.questionId;
      const optionId = e.target.value;

      // Store answer
      sessionAnswers[questionId] = {
        option_id: optionId,
        selectedAt: Date.now(),
      };

      // Visual feedback
      const option = e.target.closest(".rp-option");
      container.querySelectorAll(`[name="rp-question-${questionId}"]`).forEach((inp) => {
        inp.closest(".rp-option").classList.remove("selected");
      });
      option.classList.add("selected");
    });
  });

  // Check answers button
  container.querySelector("[data-action='check-answers']")?.addEventListener("click", async () => {
    await checkAnswers(container, session);
  });

  // Show explanations button
  container.querySelector("[data-action='show-explanations']")?.addEventListener("click", () => {
    showExplanations(container);
  });
}

/**
 * Check answers and show feedback
 */
async function checkAnswers(container, session) {
  const { questions, options } = session;
  let correctCount = 0;
  let totalTime = 0;

  // Get correct answers from server
  const questionIds = questions.map((q) => q.id);
  const correctAnswers = await fetchCorrectAnswers(questionIds);

  // Check each answer
  questions.forEach((question) => {
    const questionEl = container.querySelector(`[data-question-id="${question.id}"]`);
    const userAnswer = sessionAnswers[question.id];
    const correctOptionIds = correctAnswers[question.id] || [];
    const isCorrect = userAnswer && correctOptionIds.includes(userAnswer.option_id);

    if (isCorrect) {
      correctCount++;
    }

    // Update visual state
    questionEl.classList.add(isCorrect ? "correct" : "incorrect");

    // Highlight correct/incorrect options
    questionEl.querySelectorAll(".rp-option").forEach((optionEl) => {
      const optionId = optionEl.dataset.optionId;
      if (correctOptionIds.includes(optionId)) {
        optionEl.classList.add("correct-answer");
      }
      if (userAnswer && userAnswer.option_id === optionId && !isCorrect) {
        optionEl.classList.add("incorrect-answer");
      }
    });

    // Calculate time spent
    if (userAnswer && userAnswer.selectedAt) {
      totalTime += Date.now() - userAnswer.selectedAt;
    }
  });

  // Show explanations button
  container.querySelector("[data-action='show-explanations']").style.display = "block";
  container.querySelector("[data-action='check-answers']").style.display = "none";

  // Update spaced repetition if applicable
  if (options.spacedRepetition && questions.length === 1) {
    const question = questions[0];
    const isCorrect = correctCount > 0;
    const timeSpent = totalTime;

    try {
      await updateQuestionReview(question.id, isCorrect, timeSpent);
    } catch (error) {
      safeLog("error", "[Retrieval Practice] Errore updateQuestionReview:", error);
    }
  }

  // Show feedback
  if (window.showToast) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    window.showToast(
      `${correctCount}/${questions.length} corrette (${accuracy}%) - Ottimo ripasso!`,
      correctCount === questions.length ? "success" : "info"
    );
  }
}

/**
 * Show explanations for all questions
 */
function showExplanations(container) {
  container.querySelectorAll("[data-explanation]").forEach((explanationEl) => {
    explanationEl.style.display = "block";
  });

  container.querySelector("[data-action='show-explanations']").style.display = "none";
}

/**
 * Fetch correct answers
 */
async function fetchCorrectAnswers(questionIds) {
  try {
    const token = await getAuthToken();
    const response = await fetch(
      `${API_BASE}?action=retrieval-answers&questionIds=${questionIds.join(",")}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Errore caricamento risposte corrette");
    }

    const { answers } = await response.json();
    return answers || {};
  } catch (error) {
    safeLog("error", "[Retrieval Practice] Errore fetchCorrectAnswers:", error);
    return {};
  }
}

/**
 * Get Bloom Taxonomy label
 */
function getBloomLabel(level) {
  const labels = {
    remember: "Ricorda",
    understand: "Comprendi",
    apply: "Applica",
    analyze: "Analizza",
    evaluate: "Valuta",
    create: "Crea",
  };
  return labels[level] || level;
}

/**
 * Helper: Get auth token
 */
async function getAuthToken() {
  try {
    const { getToken } = await import("./token-storage.js");
    return await getToken();
  } catch {
    return null;
  }
}
