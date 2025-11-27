/* eslint-env browser */
/**
 * Interleaving Implementation
 * Paper: Rohrer & Taylor (2007), Birnbaum et al. (2013)
 * "The Shuffling of Mathematics Problems Improves Learning"
 *
 * Interleaving: mescolare problemi di tipi diversi invece di raggrupparli.
 * Migliora il transfer learning e la capacità di distinguere tra tipi di problemi.
 */

import { safeLog, escapeHtml } from "./security-utils.js";

const API_BASE = "/api/education";

/**
 * Apply interleaving to questions in a test
 * Paper: Rohrer & Taylor (2007) - Interleaving improves learning
 *
 * @param {Array} questions - Original questions array
 * @param {string} strategy - 'interleaved' or 'blocked' (default: 'interleaved')
 * @returns {Array} - Reordered questions
 */
export function applyInterleaving(questions, strategy = "interleaved") {
  if (!questions || questions.length === 0) {
    return questions;
  }

  if (strategy === "blocked") {
    // Blocked: group by type/topic (traditional)
    return questions.sort((a, b) => {
      const topicA = a.topic || a.bloom_level || "other";
      const topicB = b.topic || b.bloom_level || "other";
      return topicA.localeCompare(topicB);
    });
  }

  // Interleaved: mix different types/topics
  // Paper: Birnbaum et al. (2013) - Optimal interleaving pattern
  const questionsByTopic = {};

  questions.forEach((q, index) => {
    const topic = q.topic || q.bloom_level || "other";
    if (!questionsByTopic[topic]) {
      questionsByTopic[topic] = [];
    }
    questionsByTopic[topic].push({ ...q, originalIndex: index });
  });

  const topics = Object.keys(questionsByTopic);
  const interleaved = [];
  const maxLength = Math.max(...Object.values(questionsByTopic).map((arr) => arr.length));

  // Round-robin interleaving
  for (let i = 0; i < maxLength; i++) {
    topics.forEach((topic) => {
      if (questionsByTopic[topic][i]) {
        interleaved.push(questionsByTopic[topic][i]);
      }
    });
  }

  return interleaved;
}

/**
 * Get interleaved practice session
 * Paper: Rohrer & Taylor (2007) - Interleaved practice sessions
 */
export async function getInterleavedPracticeSession(moduleIds, _options = {}) {
  try {
    const token = await getAuthToken();
    const { difficulty, count = 20 } = _options || {};

    // Fetch questions from multiple modules/topics
    const response = await fetch(
      `${API_BASE}?action=interleaved-questions&moduleIds=${moduleIds.join(",")}&count=${count}${difficulty ? `&difficulty=${difficulty}` : ""}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Errore caricamento domande interleaved");
    }

    const { questions } = await response.json();

    // Apply interleaving
    const interleavedQuestions = applyInterleaving(questions, "interleaved");

    return interleavedQuestions;
  } catch (error) {
    safeLog("error", "[Interleaving] Errore getInterleavedPracticeSession:", error);
    throw error;
  }
}

/**
 * Initialize interleaved practice session
 */
export async function initInterleavedPractice(moduleIds, _options = {}) {
  try {
    const container = document.getElementById("education-container");
    if (!container) {
      safeLog("warn", "[Interleaving] Container non trovato");
      return;
    }

    // Show loading
    container.innerHTML = `
      <div class="interleaving-loading">
        <div class="spinner"></div>
        <p>Preparazione sessione interleaved...</p>
      </div>
    `;

    // Get interleaved questions
    const questions = await getInterleavedPracticeSession(moduleIds, _options);

    if (!questions || questions.length === 0) {
      container.innerHTML = `
        <div class="error-state">
          <h3>Nessuna domanda disponibile</h3>
          <p>Completa più moduli per attivare la pratica interleaved.</p>
        </div>
      `;
      return;
    }

    // Navigate to interleaved practice
    window.history.pushState(
      { view: "interleaved-practice", moduleIds },
      "",
      `#education/interleaved/${moduleIds.join(",")}`
    );

    // Render interleaved practice session
    renderInterleavedPractice(container, questions, _options);
  } catch (error) {
    safeLog("error", "[Interleaving] Errore initInterleavedPractice:", error);
    if (window.showToast) {
      window.showToast("Errore avvio pratica interleaved", "error");
    }
  }
}

/**
 * Render interleaved practice session
 */
function renderInterleavedPractice(container, questions, options) {
  const { showExplanations = true, timed = false } = options;

  // Breadcrumb sticky sempre presente
  const breadcrumb = `
    <nav class="education-breadcrumb" aria-label="Breadcrumb navigation">
      <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList">
        <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a href="#overview" data-action="back-to-dashboard" itemprop="item">
            <span itemprop="name">Dashboard</span>
          </a>
          <meta itemprop="position" content="1" />
        </li>
        <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a href="#education" data-action="back-to-education" itemprop="item">
            <span itemprop="name">Formazione</span>
          </a>
          <meta itemprop="position" content="2" />
        </li>
        <li class="breadcrumb-item breadcrumb-current" 
            aria-current="page"
            itemprop="itemListElement" 
            itemscope 
            itemtype="https://schema.org/ListItem">
          <span itemprop="name">Pratica Interleaved</span>
          <meta itemprop="position" content="3" />
        </li>
      </ol>
    </nav>
  `;

  container.innerHTML = `
    ${breadcrumb}
    <div class="interleaved-practice-session">
      <div class="ip-header">
        <div class="ip-header-content">
          <h1 class="ip-title">Pratica Interleaved</h1>
          <p class="ip-description">
            Mescolando diversi tipi di problemi migliori il transfer learning del 25-40% 
            (Rohrer & Taylor, 2007). Questa sessione mescola domande da diversi moduli.
          </p>
          <div class="ip-info">
            <span>${questions.length} domande</span>
            <span>•</span>
            <span>Interleaved (mescolate)</span>
            ${timed ? `<span>•</span><span>Tempo limitato</span>` : ""}
          </div>
        </div>
      </div>

      <div class="ip-questions">
        ${questions.map((question, index) => renderInterleavedQuestion(question, index + 1)).join("")}
      </div>

      <div class="ip-actions">
        <button class="btn btn-primary" data-action="check-interleaved-answers">
          Verifica Risposte
        </button>
        ${
          showExplanations
            ? `
          <button class="btn btn-secondary" data-action="show-explanations" style="display: none;">
            Mostra Spiegazioni
          </button>
        `
            : ""
        }
      </div>
    </div>
  `;

  bindInterleavedEvents(container, questions, options);
}

/**
 * Render interleaved question
 */
function renderInterleavedQuestion(question, questionNumber) {
  const questionId = question.id;
  const inputType = question.question_type === "multiple_choice" ? "radio" : "checkbox";
  const inputName = `ip-question-${questionId}`;
  const topic = question.topic || question.education_tests?.education_modules?.title || "Modulo";

  return `
    <div class="ip-question" data-question-id="${questionId}">
      <div class="ip-question-header">
        <div class="ip-question-meta">
          <span class="ip-question-number">Domanda ${questionNumber}</span>
          <span class="ip-topic-badge" title="Modulo di origine">
            ${escapeHtml(topic)}
          </span>
        </div>
      </div>
      <div class="ip-question-text">${escapeHtml(question.question_text)}</div>
      
      ${
        question.bloom_level
          ? `
        <div class="ip-question-bloom">
          <span class="bloom-badge bloom-${question.bloom_level}">${getBloomLabel(question.bloom_level)}</span>
        </div>
      `
          : ""
      }

      <div class="ip-question-options">
        ${
          question.education_question_options
            ?.map(
              (option, optIndex) => `
          <label class="ip-option" data-option-id="${option.id}">
            <input 
              type="${inputType}" 
              id="ip-option-${questionId}-${option.id}"
              name="${inputName}" 
              value="${option.id}"
              data-question-id="${questionId}"
            />
            <span class="ip-option-label">
              <span class="option-letter">${String.fromCharCode(65 + optIndex)}.</span>
              ${escapeHtml(option.option_text)}
            </span>
          </label>
        `
            )
            .join("") || ""
        }
      </div>

      <div class="ip-question-explanation" style="display: none;" data-explanation>
        ${
          question.explanation
            ? `
          <div class="ip-explanation-content">
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
 * Bind interleaved practice events
 */
function bindInterleavedEvents(container, questions, options) {
  const answers = {};

  // Bind breadcrumb events
  container.querySelector("[data-action='back-to-education']")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.history.pushState({ view: "dashboard" }, "", "#education");
    import("./education.js").then(({ initEducation }) => initEducation());
  });
  
  container.querySelector("[data-action='back-to-dashboard']")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.history.pushState({ view: "dashboard-overview" }, "", "#overview");
    const event = new CustomEvent("dashboard-navigate", { detail: { module: "overview" } });
    window.dispatchEvent(event);
  });

  // Option selection
  container.querySelectorAll(".ip-option input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const questionId = e.target.dataset.questionId;
      const optionId = e.target.value;

      answers[questionId] = {
        option_id: optionId,
        selectedAt: Date.now(),
      };

      // Visual feedback
      const option = e.target.closest(".ip-option");
      container.querySelectorAll(`[name="ip-question-${questionId}"]`).forEach((inp) => {
        inp.closest(".ip-option").classList.remove("selected");
      });
      option.classList.add("selected");
    });
  });

  // Check answers
  container
    .querySelector("[data-action='check-interleaved-answers']")
    ?.addEventListener("click", async () => {
      await checkInterleavedAnswers(container, questions, answers);
    });

  // Show explanations
  container.querySelector("[data-action='show-explanations']")?.addEventListener("click", () => {
    container.querySelectorAll("[data-explanation]").forEach((el) => {
      el.style.display = "block";
    });
    container.querySelector("[data-action='show-explanations']").style.display = "none";
  });
}

/**
 * Check interleaved answers
 */
async function checkInterleavedAnswers(container, questions, userAnswers) {
  try {
    const questionIds = questions.map((q) => q.id);
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
      throw new Error("Errore verifica risposte");
    }

    const { answers: correctAnswers } = await response.json();
    let correctCount = 0;

    questions.forEach((question) => {
      const questionEl = container.querySelector(`[data-question-id="${question.id}"]`);
      const userAnswer = userAnswers[question.id];
      const correctOptionIds = correctAnswers[question.id] || [];
      const isCorrect = userAnswer && correctOptionIds.includes(userAnswer.option_id);

      if (isCorrect) {
        correctCount++;
      }

      questionEl.classList.add(isCorrect ? "correct" : "incorrect");

      questionEl.querySelectorAll(".ip-option").forEach((optionEl) => {
        const optionId = optionEl.dataset.optionId;
        if (correctOptionIds.includes(optionId)) {
          optionEl.classList.add("correct-answer");
        }
        if (userAnswer && userAnswer.option_id === optionId && !isCorrect) {
          optionEl.classList.add("incorrect-answer");
        }
      });
    });

    container.querySelector("[data-action='check-interleaved-answers']").style.display = "none";
    if (container.querySelector("[data-action='show-explanations']")) {
      container.querySelector("[data-action='show-explanations']").style.display = "block";
    }

    if (window.showToast) {
      const accuracy = Math.round((correctCount / questions.length) * 100);
      window.showToast(
        `${correctCount}/${questions.length} corrette (${accuracy}%) - Ottimo lavoro con la pratica interleaved!`,
        correctCount === questions.length ? "success" : "info"
      );
    }
  } catch (error) {
    safeLog("error", "[Interleaving] Errore checkInterleavedAnswers:", error);
    if (window.showToast) {
      window.showToast("Errore verifica risposte", "error");
    }
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
