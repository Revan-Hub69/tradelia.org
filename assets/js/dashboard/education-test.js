/* eslint-env browser */
/**
 * Education Test Interface
 * Sistema di test con best practice accademiche
 * Bloom's Taxonomy, feedback immediato, spaced repetition
 */

import { safeLog, escapeHtml } from "./security-utils.js";

const API_BASE = "/api/education";

let currentTest = null;
let testAnswers = {};
let testStartTime = null;
let testTimer = null;

/**
 * Initialize test view
 */
export async function initTest(testId) {
  try {
    const response = await fetch(`${API_BASE}?action=test&testId=${testId}`, {
      headers: {
        Authorization: `Bearer ${await getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Errore caricamento test");
    }

    const { test } = await response.json();
    currentTest = test;
    testAnswers = {};
    testStartTime = Date.now();

    renderTestView(test);

    // Start timer if time limit exists
    if (test.time_limit_minutes) {
      startTestTimer(test.time_limit_minutes);
    }
  } catch (error) {
    safeLog("error", "[Education Test] Errore initTest:", error);
    if (window.showToast) {
      window.showToast("Errore caricamento test", "error");
    }
  }
}

/**
 * Render test view
 */
function renderTestView(test) {
  const container = document.getElementById("education-container");
  if (!container) return;

  const { questions, userAttempts } = test;
  const lastAttempt = userAttempts?.[0];
  const canRetake = !test.max_attempts || (userAttempts?.length || 0) < test.max_attempts;

  container.innerHTML = `
    <div class="education-test-view">
      <div class="test-view-header">
        <button class="btn btn-secondary btn-sm" data-action="back-to-module">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Indietro
        </button>
        <h1 class="test-view-title">${escapeHtml(test.title)}</h1>
        <p class="test-view-description">${escapeHtml(test.description || "")}</p>
        
        <div class="test-info">
          <span>Soglia di superamento: <strong>${test.passing_score}%</strong></span>
          ${test.max_attempts ? `<span>Tentativi: ${userAttempts?.length || 0}/${test.max_attempts}</span>` : ""}
          ${test.time_limit_minutes ? `<span>Tempo limite: ${test.time_limit_minutes} minuti</span>` : ""}
          ${lastAttempt ? `<span>Ultimo punteggio: <strong>${lastAttempt.score}%</strong></span>` : ""}
        </div>

        ${test.time_limit_minutes ? `
          <div class="test-timer" id="test-timer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span id="timer-display">${formatTime(test.time_limit_minutes * 60)}</span>
          </div>
        ` : ""}
      </div>

      ${!canRetake && lastAttempt?.passed ? `
        <div class="test-completed-notice">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="48" height="48">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h3>Test già superato!</h3>
          <p>Hai completato questo test con successo. Puoi rivedere le domande e le risposte corrette.</p>
        </div>
      ` : ""}

      <form id="test-form" class="test-questions">
        ${questions.map((question, index) => renderQuestion(question, index + 1)).join("")}
      </form>

      <div class="test-actions">
        <button type="button" class="btn btn-secondary" data-action="review-answers">
          Rivedi Risposte
        </button>
        <button type="submit" form="test-form" class="btn btn-primary" id="submit-test-btn">
          Invia Test
        </button>
      </div>
    </div>
  `;

  // Bind events
  bindTestEvents(container, test);
}

/**
 * Render question
 */
function renderQuestion(question, questionNumber) {
  const questionId = question.id;
  const inputType = question.question_type === "multiple_choice" ? "radio" : "checkbox";
  const inputName = `question-${questionId}`;

  return `
    <div class="test-question" data-question-id="${questionId}">
      <div class="question-header">
        <span class="question-number">Domanda ${questionNumber}</span>
        <span class="question-points">${question.points} ${question.points === 1 ? "punto" : "punti"}</span>
      </div>
      <div class="question-text">${escapeHtml(question.question_text)}</div>
      
      ${question.bloom_level ? `
        <div class="question-bloom-level">
          <span class="bloom-badge bloom-${question.bloom_level}">${getBloomLabel(question.bloom_level)}</span>
        </div>
      ` : ""}

      <div class="question-options">
        ${question.education_question_options.map((option, optIndex) => `
          <label class="question-option" data-option-id="${option.id}">
            <input 
              type="${inputType}" 
              name="${inputName}" 
              value="${option.id}"
              data-question-id="${questionId}"
              data-option-id="${option.id}"
            />
            <span class="question-option-label">
              <span class="option-letter">${String.fromCharCode(65 + optIndex)}.</span>
              ${escapeHtml(option.option_text)}
            </span>
          </label>
        `).join("")}
      </div>
    </div>
  `;
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
 * Bind test events
 */
function bindTestEvents(container, test) {
  // Back button
  container.querySelector("[data-action='back-to-module']")?.addEventListener("click", () => {
    if (currentTest?.education_modules) {
      window.history.pushState({ view: "module" }, "", `#education/module/${currentTest.education_modules.slug}`);
      // Reload module view
      import("./education.js").then(({ openModule }) => {
        openModule(currentTest.education_modules.id);
      });
    }
  });

  // Option selection
  container.querySelectorAll(".question-option input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const questionId = e.target.dataset.questionId;
      const optionId = e.target.value;
      const option = e.target.closest(".question-option");

      // Update visual state
      container.querySelectorAll(`[name="question-${questionId}"]`).forEach((inp) => {
        inp.closest(".question-option").classList.remove("selected");
      });
      option.classList.add("selected");

      // Store answer
      testAnswers[questionId] = {
        option_id: optionId,
      };

      // Haptic feedback
      if (window.triggerHapticFeedback) {
        window.triggerHapticFeedback("light");
      }
    });
  });

  // Review answers button
  container.querySelector("[data-action='review-answers']")?.addEventListener("click", () => {
    reviewAnswers();
  });

  // Submit form
  container.querySelector("#test-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitTest(test.id);
  });
}

/**
 * Review answers before submission
 */
function reviewAnswers() {
  const container = document.getElementById("education-container");
  const questions = container.querySelectorAll(".test-question");
  let unansweredCount = 0;

  questions.forEach((questionEl) => {
    const questionId = questionEl.dataset.questionId;
    const hasAnswer = testAnswers[questionId];

    if (!hasAnswer) {
      unansweredCount++;
      questionEl.style.border = "2px solid var(--edu-warning)";
      questionEl.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      questionEl.style.border = "";
    }
  });

  if (unansweredCount > 0) {
    if (window.showToast) {
      window.showToast(
        `${unansweredCount} ${unansweredCount === 1 ? "domanda senza risposta" : "domande senza risposta"}`,
        "warning"
      );
    }
  } else {
    if (window.showToast) {
      window.showToast("Tutte le domande hanno una risposta", "success");
    }
  }
}

/**
 * Submit test
 */
async function submitTest(testId) {
  const submitBtn = document.getElementById("submit-test-btn");
  if (!submitBtn) return;

  // Validate all questions answered
  const unanswered = Object.keys(currentTest.questions).filter(
    (qId) => !testAnswers[qId]
  );

  if (unanswered.length > 0) {
    if (
      !confirm(
        `${unanswered.length} domande senza risposta. Vuoi inviare comunque il test?`
      )
    ) {
      return;
    }
  }

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = "Invio in corso...";

  try {
    const timeSpentSeconds = Math.floor((Date.now() - testStartTime) / 1000);
    if (testTimer) {
      clearInterval(testTimer);
    }

    const response = await fetch(`${API_BASE}?action=submit-test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        testId,
        answers: testAnswers,
        timeSpentSeconds,
      }),
    });

    if (!response.ok) {
      throw new Error("Errore invio test");
    }

    const { attempt } = await response.json();
    renderTestResults(attempt);
  } catch (error) {
    safeLog("error", "[Education Test] Errore submitTest:", error);
    if (window.showToast) {
      window.showToast("Errore invio test", "error");
    }
    submitBtn.disabled = false;
    submitBtn.textContent = "Invia Test";
  }
}

/**
 * Render test results
 */
function renderTestResults(attempt) {
  const container = document.getElementById("education-container");
  if (!container) return;

  const { score, passed, correctAnswers } = attempt;
  const isPerfect = score === 100;

  container.innerHTML = `
    <div class="education-test-results">
      <div class="test-results-header ${passed ? "passed" : "failed"}">
        <div class="results-icon">
          ${passed ? `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="64" height="64">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          ` : `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="64" height="64">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          `}
        </div>
        <h1 class="results-title">${passed ? "Test Superato!" : "Test Non Superato"}</h1>
        <div class="results-score">
          <span class="score-value">${score}%</span>
          ${isPerfect ? `<span class="perfect-badge">Perfetto! 🎉</span>` : ""}
        </div>
        <p class="results-message">
          ${passed
            ? `Complimenti! Hai superato il test con ${score}%. ${isPerfect ? "Punteggio perfetto!" : ""}`
            : `Hai ottenuto ${score}%. Per superare il test serve almeno ${currentTest.passing_score}%. Puoi riprovare.`}
        </p>
      </div>

      <div class="test-review">
        <h2>Rivedi le Risposte</h2>
        <div class="review-questions">
          ${currentTest.questions.map((question, index) => 
            renderQuestionReview(question, index + 1, testAnswers[question.id], correctAnswers[question.id])
          ).join("")}
        </div>
      </div>

      <div class="test-results-actions">
        <button class="btn btn-secondary" data-action="back-to-module">
          Torna al Modulo
        </button>
        ${!passed && canRetakeTest() ? `
          <button class="btn btn-primary" data-action="retake-test">
            Riprova Test
          </button>
        ` : ""}
      </div>
    </div>
  `;

  // Bind events
  container.querySelector("[data-action='back-to-module']")?.addEventListener("click", () => {
    if (currentTest?.education_modules) {
      import("./education.js").then(({ openModule }) => {
        openModule(currentTest.education_modules.id);
      });
    }
  });

  container.querySelector("[data-action='retake-test']")?.addEventListener("click", () => {
    initTest(currentTest.id);
  });
}

/**
 * Render question review
 */
function renderQuestionReview(question, questionNumber, userAnswer, correctAnswerIds) {
  const questionId = question.id;
  const userSelectedId = userAnswer?.option_id;
  const isCorrect = correctAnswerIds?.includes(userSelectedId);

  return `
    <div class="review-question ${isCorrect ? "correct" : "incorrect"}">
      <div class="review-question-header">
        <span class="question-number">Domanda ${questionNumber}</span>
        <span class="question-result">
          ${isCorrect ? "✓ Corretto" : "✗ Sbagliato"}
        </span>
      </div>
      <div class="review-question-text">${escapeHtml(question.question_text)}</div>
      
      <div class="review-options">
        ${question.education_question_options.map((option, optIndex) => {
          const isUserAnswer = option.id === userSelectedId;
          const isCorrectAnswer = correctAnswerIds?.includes(option.id);
          
          return `
            <div class="review-option ${isUserAnswer ? "user-answer" : ""} ${isCorrectAnswer ? "correct-answer" : ""}">
              <span class="option-letter">${String.fromCharCode(65 + optIndex)}.</span>
              <span class="option-text">${escapeHtml(option.option_text)}</span>
              ${isUserAnswer ? `<span class="option-label">Tua risposta</span>` : ""}
              ${isCorrectAnswer ? `<span class="option-label">Corretta</span>` : ""}
            </div>
          `;
        }).join("")}
      </div>

      ${question.explanation ? `
        <div class="question-explanation">
          <strong>Spiegazione:</strong> ${escapeHtml(question.explanation)}
        </div>
      ` : ""}
    </div>
  `;
}

/**
 * Check if user can retake test
 */
function canRetakeTest() {
  if (!currentTest.max_attempts) return true;
  const attempts = currentTest.userAttempts?.length || 0;
  return attempts < currentTest.max_attempts;
}

/**
 * Start test timer
 */
function startTestTimer(minutes) {
  let secondsRemaining = minutes * 60;
  const timerDisplay = document.getElementById("timer-display");
  const timerElement = document.getElementById("test-timer");

  testTimer = setInterval(() => {
    secondsRemaining--;

    if (timerDisplay) {
      timerDisplay.textContent = formatTime(secondsRemaining);
    }

    // Warning states
    if (timerElement) {
      timerElement.classList.remove("warning", "danger");
      if (secondsRemaining <= 60) {
        timerElement.classList.add("danger");
      } else if (secondsRemaining <= 300) {
        timerElement.classList.add("warning");
      }
    }

    if (secondsRemaining <= 0) {
      clearInterval(testTimer);
      if (window.showToast) {
        window.showToast("Tempo scaduto! Il test verrà inviato automaticamente.", "warning");
      }
      // Auto-submit
      submitTest(currentTest.id);
    }
  }, 1000);
}

/**
 * Format time (seconds to MM:SS)
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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

export { initTest };
