/* eslint-env browser */
/**
 * Metacognition & Self-Regulated Learning Tools
 * Paper: Zimmerman (2002), Winne & Hadwin (2008)
 * "Becoming a Self-Regulated Learner"
 * 
 * Strumenti per:
 * - Pre-test self-assessment
 * - Post-lesson reflection
 * - Learning goals setting
 * - Progress self-monitoring
 */

import { safeLog, escapeHtml } from "./security-utils.js";

const API_BASE = "/api/education";

/**
 * Show pre-lesson self-assessment
 * Paper: Zimmerman (2002) - Forethought phase
 */
export async function showPreLessonAssessment(lessonId, lessonTitle) {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className = "metacognition-modal";
    modal.innerHTML = `
      <div class="meta-modal-overlay" data-dismiss></div>
      <div class="meta-modal-content">
        <div class="meta-modal-header">
          <h3>Prima di Iniziare</h3>
          <button class="meta-modal-close" data-dismiss aria-label="Chiudi">×</button>
        </div>
        <div class="meta-modal-body">
          <p class="meta-prompt">
            <strong>${escapeHtml(lessonTitle)}</strong>
          </p>
          <p class="meta-question">
            Quanto conosci già questo argomento?
          </p>
          <div class="meta-rating-scale">
            ${[1, 2, 3, 4, 5].map(num => `
              <label class="meta-rating-option">
                <input type="radio" name="pre-knowledge" value="${num}" />
                <span class="meta-rating-label">
                  <span class="meta-rating-number">${num}</span>
                  <span class="meta-rating-text">${getKnowledgeLabel(num)}</span>
                </span>
              </label>
            `).join("")}
          </div>
          <div class="meta-optional">
            <label>
              <span>Cosa ti aspetti di imparare? (opzionale)</span>
              <textarea 
                id="pre-expectations" 
                rows="3" 
                placeholder="Scrivi qui le tue aspettative..."
                class="meta-textarea"
              ></textarea>
            </label>
          </div>
        </div>
        <div class="meta-modal-footer">
          <button class="btn btn-secondary" data-dismiss>Salta</button>
          <button class="btn btn-primary" data-submit>Inizia Lezione</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Bind events
    const rating = modal.querySelector('input[name="pre-knowledge"]:checked');
    const submitBtn = modal.querySelector("[data-submit]");
    const expectations = modal.querySelector("#pre-expectations");

    submitBtn.disabled = !rating;

    modal.querySelectorAll('input[name="pre-knowledge"]').forEach(input => {
      input.addEventListener("change", () => {
        submitBtn.disabled = false;
      });
    });

    modal.querySelector("[data-submit]").addEventListener("click", async () => {
      const knowledgeLevel = modal.querySelector('input[name="pre-knowledge"]:checked')?.value;
      const expectationsText = expectations?.value.trim();

      if (knowledgeLevel) {
        await savePreAssessment(lessonId, {
          knowledgeLevel: parseInt(knowledgeLevel),
          expectations: expectationsText,
        });
      }

      closeModal(modal);
      resolve();
    });

    modal.querySelectorAll("[data-dismiss]").forEach(btn => {
      btn.addEventListener("click", () => {
        closeModal(modal);
        resolve();
      });
    });
  });
}

/**
 * Show post-lesson reflection
 * Paper: Zimmerman (2002) - Self-reflection phase
 */
export async function showPostLessonReflection(lessonId, lessonTitle) {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className = "metacognition-modal";
    modal.innerHTML = `
      <div class="meta-modal-overlay" data-dismiss></div>
      <div class="meta-modal-content">
        <div class="meta-modal-header">
          <h3>Riflessione Post-Lezione</h3>
          <button class="meta-modal-close" data-dismiss aria-label="Chiudi">×</button>
        </div>
        <div class="meta-modal-body">
          <p class="meta-prompt">
            <strong>${escapeHtml(lessonTitle)}</strong>
          </p>
          
          <div class="meta-question-group">
            <label class="meta-question">
              Quanto hai capito questa lezione?
            </label>
            <div class="meta-rating-scale">
              ${[1, 2, 3, 4, 5].map(num => `
                <label class="meta-rating-option">
                  <input type="radio" name="comprehension" value="${num}" />
                  <span class="meta-rating-label">
                    <span class="meta-rating-number">${num}</span>
                    <span class="meta-rating-text">${getComprehensionLabel(num)}</span>
                  </span>
                </label>
              `).join("")}
            </div>
          </div>

          <div class="meta-optional">
            <label>
              <span>Cosa ti è rimasto poco chiaro? (opzionale)</span>
              <textarea 
                id="post-unclear" 
                rows="3" 
                placeholder="Scrivi qui cosa vorresti approfondire..."
                class="meta-textarea"
              ></textarea>
            </label>
          </div>

          <div class="meta-optional">
            <label>
              <span>Cosa hai imparato di nuovo? (opzionale)</span>
              <textarea 
                id="post-learned" 
                rows="3" 
                placeholder="Scrivi qui i concetti chiave che hai appreso..."
                class="meta-textarea"
              ></textarea>
            </label>
          </div>
        </div>
        <div class="meta-modal-footer">
          <button class="btn btn-secondary" data-dismiss>Salta</button>
          <button class="btn btn-primary" data-submit>Salva Riflessione</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Bind events
    const submitBtn = modal.querySelector("[data-submit]");
    const comprehension = modal.querySelector('input[name="comprehension"]:checked');
    const unclear = modal.querySelector("#post-unclear");
    const learned = modal.querySelector("#post-learned");

    submitBtn.disabled = !comprehension;

    modal.querySelectorAll('input[name="comprehension"]').forEach(input => {
      input.addEventListener("change", () => {
        submitBtn.disabled = false;
      });
    });

    modal.querySelector("[data-submit]").addEventListener("click", async () => {
      const comprehensionLevel = modal.querySelector('input[name="comprehension"]:checked')?.value;
      const unclearText = unclear?.value.trim();
      const learnedText = learned?.value.trim();

      if (comprehensionLevel) {
        await savePostReflection(lessonId, {
          comprehension: parseInt(comprehensionLevel),
          unclear: unclearText,
          learned: learnedText,
        });
      }

      closeModal(modal);
      resolve();
    });

    modal.querySelectorAll("[data-dismiss]").forEach(btn => {
      btn.addEventListener("click", () => {
        closeModal(modal);
        resolve();
      });
    });
  });
}

/**
 * Show learning goals setting
 * Paper: Zimmerman (2002) - Goal setting
 */
export function showLearningGoalsModal() {
  const modal = document.createElement("div");
  modal.className = "metacognition-modal";
  modal.innerHTML = `
    <div class="meta-modal-overlay" data-dismiss></div>
    <div class="meta-modal-content">
      <div class="meta-modal-header">
        <h3>I Miei Obiettivi di Apprendimento</h3>
        <button class="meta-modal-close" data-dismiss aria-label="Chiudi">×</button>
      </div>
      <div class="meta-modal-body">
        <p class="meta-description">
          Impostare obiettivi chiari migliora l'apprendimento del 30% (Zimmerman, 2002).
        </p>
        
        <div class="meta-goals-list" id="goals-list">
          <!-- Goals loaded dynamically -->
        </div>

        <button class="btn btn-secondary btn-sm" data-action="add-goal" style="margin-top: 1rem;">
          + Aggiungi Obiettivo
        </button>
      </div>
      <div class="meta-modal-footer">
        <button class="btn btn-secondary" data-dismiss>Chiudi</button>
        <button class="btn btn-primary" data-save>Salva Obiettivi</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  loadLearningGoals(modal);

  // Bind events
  modal.querySelector("[data-action='add-goal']").addEventListener("click", () => {
    addGoalInput(modal);
  });

  modal.querySelector("[data-save]").addEventListener("click", async () => {
    const goals = collectGoals(modal);
    await saveLearningGoals(goals);
    closeModal(modal);
  });

  modal.querySelectorAll("[data-dismiss]").forEach(btn => {
    btn.addEventListener("click", () => {
      closeModal(modal);
    });
  });
}

/**
 * Save pre-assessment
 */
async function savePreAssessment(lessonId, data) {
  try {
    const token = await getAuthToken();
    await fetch(`${API_BASE}?action=save-pre-assessment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        lessonId,
        ...data,
      }),
    });
  } catch (error) {
    safeLog("error", "[Metacognition] Errore savePreAssessment:", error);
  }
}

/**
 * Save post-reflection
 */
async function savePostReflection(lessonId, data) {
  try {
    const token = await getAuthToken();
    await fetch(`${API_BASE}?action=save-post-reflection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        lessonId,
        ...data,
      }),
    });
  } catch (error) {
    safeLog("error", "[Metacognition] Errore savePostReflection:", error);
  }
}

/**
 * Load learning goals
 */
async function loadLearningGoals(modal) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE}?action=learning-goals`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const { goals } = await response.json();
      const goalsList = modal.querySelector("#goals-list");
      if (goals && goals.length > 0) {
        goalsList.innerHTML = goals.map((goal, index) => renderGoalInput(goal, index)).join("");
      } else {
        addGoalInput(modal);
      }
    }
  } catch (error) {
    safeLog("error", "[Metacognition] Errore loadLearningGoals:", error);
    addGoalInput(modal);
  }
}

/**
 * Add goal input
 */
function addGoalInput(modal, goal = null) {
  const goalsList = modal.querySelector("#goals-list");
  const index = goalsList.children.length;
  const goalHtml = renderGoalInput(goal, index);
  goalsList.insertAdjacentHTML("beforeend", goalHtml);
}

/**
 * Render goal input
 */
function renderGoalInput(goal, index) {
  return `
    <div class="meta-goal-item" data-goal-index="${index}">
      <input 
        type="text" 
        class="meta-goal-input" 
        placeholder="Es: Completare il Modulo 1 entro questa settimana"
        value="${goal ? escapeHtml(goal.text) : ""}"
      />
      <select class="meta-goal-deadline">
        <option value="week" ${goal?.deadline === "week" ? "selected" : ""}>Questa settimana</option>
        <option value="month" ${goal?.deadline === "month" ? "selected" : ""}>Questo mese</option>
        <option value="quarter" ${goal?.deadline === "quarter" ? "selected" : ""}>Questo trimestre</option>
      </select>
      <button class="btn btn-sm btn-text" data-action="remove-goal" type="button">×</button>
    </div>
  `;
}

/**
 * Collect goals from modal
 */
function collectGoals(modal) {
  const goals = [];
  modal.querySelectorAll(".meta-goal-item").forEach((item) => {
    const text = item.querySelector(".meta-goal-input").value.trim();
    const deadline = item.querySelector(".meta-goal-deadline").value;
    if (text) {
      goals.push({ text, deadline });
    }
  });
  return goals;
}

/**
 * Save learning goals
 */
async function saveLearningGoals(goals) {
  try {
    const token = await getAuthToken();
    await fetch(`${API_BASE}?action=save-learning-goals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ goals }),
    });

    if (window.showToast) {
      window.showToast("Obiettivi salvati!", "success");
    }
  } catch (error) {
    safeLog("error", "[Metacognition] Errore saveLearningGoals:", error);
  }
}

/**
 * Helper functions
 */
function getKnowledgeLabel(num) {
  const labels = {
    1: "Per niente",
    2: "Poco",
    3: "Abbastanza",
    4: "Bene",
    5: "Molto bene",
  };
  return labels[num] || "";
}

function getComprehensionLabel(num) {
  const labels = {
    1: "Per niente",
    2: "Poco",
    3: "Abbastanza",
    4: "Bene",
    5: "Perfettamente",
  };
  return labels[num] || "";
}

function closeModal(modal) {
  modal.style.opacity = "0";
  setTimeout(() => {
    modal.remove();
  }, 200);
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

