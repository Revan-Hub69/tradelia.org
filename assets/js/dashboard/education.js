/**
 * Dashboard Module: Education
 * Percorsi formativi AI con gamification e assessment
 */

const STORAGE_KEYS = {
  ASSESSMENT: "education-assessment-v1",
  PROGRESS: "education-progress-v1",
};

const ASSESSMENT_QUESTIONS = [
  {
    id: "experience",
    title: "Qual è il tuo livello di esperienza sui mercati?",
    options: [
      { value: "entry", label: "Principiante assoluto", description: "Sto imparando terminologia e concetti base.", persona: "foundation" },
      { value: "retail", label: "Retail intermedio", description: "Seguo i mercati e voglio un metodo strutturato.", persona: "intermarket" },
      { value: "advisor", label: "Professionista / desk", description: "Gestisco capitali e cerco insight istituzionali.", persona: "advanced" },
    ],
  },
  {
    id: "goal",
    title: "Qual è il tuo obiettivo principale?",
    options: [
      { value: "study", label: "Formazione disciplinata", description: "Voglio una routine di studio certificabile.", persona: "foundation" },
      { value: "strategy", label: "Applicare i framework AI", description: "Mi servono strumenti da integrare nel mio processo.", persona: "intermarket" },
      { value: "clients", label: "Supportare clienti / team", description: "Voglio materiali pronti per presentazioni e desk.", persona: "advanced" },
    ],
  },
  {
    id: "time",
    title: "Quanto tempo dedichi alla formazione ogni settimana?",
    options: [
      { value: "low", label: "< 2 ore", description: "Preferisco micro-lezioni e reminder automatici.", persona: "foundation" },
      { value: "medium", label: "2-5 ore", description: "Posso seguire percorsi episodici completi.", persona: "intermarket" },
      { value: "high", label: "> 5 ore", description: "Cerco laboratori avanzati e analisi in tempo reale.", persona: "advanced" },
    ],
  },
];

const LEARNING_PATHS = [
  {
    id: "foundation",
    persona: "foundation",
    label: "Livello 1 · Foundation FDM",
    description: "Glossario essenziale, protocollo FDM e routine giornaliera per leggere i mercati in autonomia.",
    reward: "Badge “FDM Base” + accesso ai modelli foundation.",
    modules: [
      { id: "foundation-orientation", title: "Orientamento metodo FDM", type: "lesson", duration: "15 min", xp: 20 },
      { id: "foundation-journal", title: "Journaling e bias cognitivi", type: "lesson", duration: "10 min", xp: 15 },
      { id: "foundation-glossary", title: "Quiz interattivo Glossario", type: "quiz", duration: "8 domande", xp: 25 },
      { id: "foundation-scenario", title: "Scenario Lab: MLT di base", type: "lab", duration: "20 min", xp: 30 },
      { id: "foundation-retro", title: "Retrospettiva guidata", type: "reflection", duration: "10 min", xp: 20 },
    ],
  },
  {
    id: "intermarket",
    persona: "intermarket",
    label: "Livello 2 · Intermarket & MLT",
    description: "Studio delle correlazioni, matrice MLT e costruzione di dashboard personali.",
    reward: "Badge “Intermarket Analyst” + sblocco modelli MLT.",
    modules: [
      { id: "intermarket-matrix", title: "Costruire la matrice MLT", type: "lesson", duration: "20 min", xp: 30 },
      { id: "intermarket-flow", title: "Flow monitor ETF e tassi", type: "lesson", duration: "15 min", xp: 25 },
      { id: "intermarket-case", title: "Case study multi-asset", type: "lab", duration: "25 min", xp: 35 },
      { id: "intermarket-quiz", title: "Quiz avanzato intermarket", type: "quiz", duration: "10 domande", xp: 30 },
      { id: "intermarket-brief", title: "Sprint report 3-10 giorni", type: "exercise", duration: "30 min", xp: 40 },
    ],
  },
  {
    id: "advanced",
    persona: "advanced",
    label: "Livello 3 · Desk & Advanced Signals",
    description: "Procedure per desk, alert PAC e storytelling dati per clienti istituzionali.",
    reward: "Badge “Desk Ready” + accesso modelli avanzati.",
    modules: [
      { id: "advanced-pac", title: "Protocollo PAC completo", type: "lesson", duration: "25 min", xp: 35 },
      { id: "advanced-sla", title: "SLA analisi & QA editoriale", type: "lesson", duration: "15 min", xp: 25 },
      { id: "advanced-automation", title: "Automazioni e RUM", type: "lesson", duration: "20 min", xp: 30 },
      { id: "advanced-workshop", title: "Workshop desk simulato", type: "lab", duration: "35 min", xp: 45 },
      { id: "advanced-capstone", title: "Capstone: briefing completo", type: "project", duration: "45 min", xp: 60 },
    ],
  },
];

const PERSONA_TO_PATH = {
  foundation: "foundation",
  intermarket: "intermarket",
  advanced: "advanced",
};

let educationContainer;
let educationInitialized = false;

export async function loadEducation() {
  educationContainer = document.getElementById("education-container");
  if (!educationContainer) return;

  if (!educationInitialized) {
    educationContainer.addEventListener("click", handleEducationClick);
    educationInitialized = true;
  }

  renderEducationPanel();
}

function handleEducationClick(event) {
  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) {
    return;
  }

  const action = actionEl.dataset.action;

  if (action === "start-assessment" || action === "retake-assessment") {
    openAssessmentModal();
    return;
  }

  if (action === "complete-module") {
    const { pathId, moduleId } = actionEl.dataset;
    handleModuleCompletion(pathId, moduleId);
    return;
  }
}

function renderEducationPanel() {
  const assessment = loadAssessment();
  const progress = loadProgress();
  const aggregated = aggregateProgress(progress);
  const recommendedPathId = assessment?.recommendedPathId || "foundation";
  const recommendedPath = LEARNING_PATHS.find((path) => path.id === recommendedPathId);

  educationContainer.innerHTML = `
    <div class="education-panel">
      ${renderHeroSection(assessment, aggregated, recommendedPath)}
      ${renderPathsSection(assessment, progress)}
      ${renderBadgeSection(progress)}
      <p class="education-disclaimer">
        Tutti i contenuti sono per finalità informative e didattiche (MiFID II). Non costituiscono
        raccomandazioni personalizzate, consulenza finanziaria o sollecitazione al pubblico risparmio.
      </p>
    </div>
  `;
}

function renderHeroSection(assessment, aggregated, recommendedPath) {
  return `
    <section class="education-hero">
      <div class="education-hero-header">
        <span class="education-hero-eyebrow">Percorso formativo AI</span>
        <h2 class="education-hero-title">Rubrica gamificata con framework proprietari</h2>
        <p class="education-hero-description">
          Segui percorsi basati su FDM · MLT · PAC. Completa lezioni, laboratori e quiz per sbloccare
          badge, modelli e strumenti avanzati. Nessuna certificazione formale: è un campus indipendente,
          costruito per disciplinare il tuo processo.
        </p>
      </div>
      <div class="education-hero-metrics">
        <div class="education-metric">
          <span>Percorso consigliato</span>
          <strong>${recommendedPath ? recommendedPath.label : "Completa l'assessment"}</strong>
        </div>
        <div class="education-metric">
          <span>Moduli completati</span>
          <strong>${aggregated.completedModules}/${aggregated.totalModules}</strong>
        </div>
        <div class="education-metric">
          <span>XP guadagnati</span>
          <strong>${aggregated.xp}/${aggregated.totalXp}</strong>
        </div>
      </div>
      <div class="education-hero-actions">
        ${
          assessment
            ? `<button class="btn btn-outline" data-action="retake-assessment">Rivaluta il tuo percorso</button>`
            : `<button class="btn btn-primary" data-action="start-assessment">Inizia l'assessment guidato</button>`
        }
        <a class="btn btn-outline" href="/tutorials.html" target="_blank">Manuale & Tutorial</a>
      </div>
    </section>
  `;
}

function renderPathsSection(assessment, progress) {
  const cards = LEARNING_PATHS.map((path) => renderPathCard(path, assessment, progress[path.id]));
  return `
    <section class="education-section">
      <div class="education-section-header">
        <h3>Percorsi disponibili</h3>
        <p>Sblocca ciascun livello completando moduli, laboratori e quiz. Solo dopo il percorso foundation si accede agli strumenti e ai modelli.</p>
      </div>
      <div class="education-track-grid">
        ${cards.join("")}
      </div>
    </section>
  `;
}

function renderPathCard(path, assessment, progressEntry) {
  const totalModules = path.modules.length;
  const totalXp = getPathTotalXp(path);
  const completedModules = progressEntry?.completedModules?.length || 0;
  const xp = progressEntry?.xp || 0;
  const percent = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;
  const locked = !assessment && path.id !== "foundation";
  const completed = completedModules === totalModules && totalModules > 0;
  const recommended = assessment && assessment.recommendedPathId === path.id;

  return `
    <article class="education-track ${locked ? "is-locked" : ""}">
      <span class="education-track-label">${path.label}</span>
      <h4 class="education-track-title">${path.description}</h4>
      <p class="education-track-description">${path.reward}</p>
      <div class="education-progress-bar" aria-label="Avanzamento percorso ${path.label}">
        <span style="width: ${percent}%"></span>
      </div>
      <div class="education-track-meta">
        <span>${completedModules}/${totalModules} moduli</span>
        <span>${xp}/${totalXp} XP</span>
      </div>
      ${
        recommended
          ? '<span class="badge" style="align-self:flex-start;">Consigliato</span>'
          : ""
      }
      <div class="education-module-list">
        ${path.modules
          .map((module) => renderModule(path.id, module, locked, progressEntry))
          .join("")}
      </div>
      ${
        locked
          ? `<button class="btn btn-outline btn-sm" data-action="start-assessment">Completa l'assessment per sbloccare</button>`
          : ""
      }
      ${
        completed
          ? `<span class="badge" style="background: rgba(34,211,238,0.1); border-color: rgba(45,212,191,0.4);">Percorso completato</span>`
          : ""
      }
    </article>
  `;
}

function renderModule(pathId, module, locked, progressEntry) {
  const completed = progressEntry?.completedModules?.includes(module.id);
  const disabled = locked || completed;
  const label = completed ? "Completato" : "Segna completato";
  return `
    <div class="education-module">
      <div class="education-module-info">
        <strong>${module.title}</strong>
        <span>${module.type.toUpperCase()} · ${module.duration} · ${module.xp} XP</span>
      </div>
      <button
        class="education-module-action"
        data-action="complete-module"
        data-path-id="${pathId}"
        data-module-id="${module.id}"
        ${disabled ? "disabled" : ""}
      >
        ${label}
      </button>
    </div>
  `;
}

function renderBadgeSection(progress) {
  const badges = LEARNING_PATHS.filter((path) =>
    isPathCompleted(progress[path.id], path)
  ).map((path) => {
    const completedAt = progress[path.id]?.completedAt;
    return `<div class="education-badge">
      <strong>${path.reward}</strong>
      <span>Completato il ${formatDate(completedAt)}</span>
    </div>`;
  });

  if (!badges.length) {
    return "";
  }

  return `
    <section class="education-section">
      <div class="education-section-header">
        <h3>Badge ottenuti</h3>
        <p>Dimostrano disciplina e completamento dei percorsi. Non sono certificazioni ufficiali.</p>
      </div>
      <div class="education-badge-wall">
        ${badges.join("")}
      </div>
    </section>
  `;
}

function openAssessmentModal() {
  if (!educationContainer) return;

  const modal = document.createElement("div");
  modal.className = "education-modal";
  modal.innerHTML = `
    <div class="education-modal-content" role="dialog" aria-modal="true" tabindex="-1">
      <button class="education-modal-close" data-action="close-modal" aria-label="Chiudi modulo">&times;</button>
      <p class="education-modal-progress"></p>
      <h3 class="education-modal-heading"></h3>
      <div class="education-modal-options"></div>
    </div>
  `;

  const content = modal.querySelector(".education-modal-content");
  const progressLabel = modal.querySelector(".education-modal-progress");
  const heading = modal.querySelector(".education-modal-heading");
  const optionsContainer = modal.querySelector(".education-modal-options");

  let currentIndex = 0;
  const answers = [];

  const renderStep = () => {
    const question = ASSESSMENT_QUESTIONS[currentIndex];
    progressLabel.textContent = `Step ${currentIndex + 1} di ${ASSESSMENT_QUESTIONS.length}`;
    heading.textContent = question.title;
    optionsContainer.innerHTML = question.options
      .map(
        (option) => `
          <button class="education-option" data-option="${option.value}">
            <strong>${option.label}</strong>
            <p style="margin:0; font-size:0.85rem; color:var(--dash-text-muted,#94a3b8);">${option.description}</p>
          </button>
        `
      )
      .join("");
  };

  const closeModal = () => {
    modal.remove();
  };

  modal.addEventListener("click", (event) => {
    if (event.target.dataset.action === "close-modal" || event.target === modal) {
      closeModal();
      return;
    }
    const optionBtn = event.target.closest(".education-option");
    if (!optionBtn) return;
    answers.push(optionBtn.dataset.option);
    currentIndex += 1;
    if (currentIndex >= ASSESSMENT_QUESTIONS.length) {
      finalizeAssessment(answers);
      closeModal();
      renderEducationPanel();
    } else {
      renderStep();
    }
  });

  educationContainer.appendChild(modal);
  renderStep();
  content.focus();
}

function finalizeAssessment(selectedValues) {
  const tally = { foundation: 0, intermarket: 0, advanced: 0 };
  selectedValues.forEach((value) => {
    const question = ASSESSMENT_QUESTIONS.find((q) => q.options.some((opt) => opt.value === value));
    const option = question?.options.find((opt) => opt.value === value);
    if (option?.persona && tally[option.persona] !== undefined) {
      tally[option.persona] += 1;
    }
  });

  const persona =
    Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] || "foundation";
  const recommendedPathId = PERSONA_TO_PATH[persona] || "foundation";
  const assessmentResult = {
    persona,
    recommendedPathId,
    answers: selectedValues,
    completedAt: new Date().toISOString(),
  };
  saveAssessment(assessmentResult);
}

function handleModuleCompletion(pathId, moduleId) {
  const progress = loadProgress();
  const path = LEARNING_PATHS.find((item) => item.id === pathId);
  if (!path) return;

  const entry = progress[pathId] || { completedModules: [], xp: 0 };
  if (entry.completedModules.includes(moduleId)) {
    return;
  }

  entry.completedModules.push(moduleId);
  const moduleData = path.modules.find((module) => module.id === moduleId);
  entry.xp += moduleData?.xp || 0;

  if (entry.completedModules.length === path.modules.length) {
    entry.completedAt = new Date().toISOString();
  }

  progress[pathId] = entry;
  saveProgress(progress);
  renderEducationPanel();
}

function aggregateProgress(progress) {
  const totalModules = LEARNING_PATHS.reduce((acc, path) => acc + path.modules.length, 0);
  const totalXp = LEARNING_PATHS.reduce((acc, path) => acc + getPathTotalXp(path), 0);
  const completedModules = Object.values(progress).reduce(
    (acc, entry) => acc + (entry?.completedModules?.length || 0),
    0
  );
  const xp = Object.values(progress).reduce((acc, entry) => acc + (entry?.xp || 0), 0);
  return { totalModules, completedModules, totalXp, xp };
}

function getPathTotalXp(path) {
  return path.modules.reduce((acc, module) => acc + (module.xp || 0), 0);
}

function isPathCompleted(progressEntry, path) {
  if (!progressEntry) return false;
  return (progressEntry.completedModules?.length || 0) === path.modules.length;
}

function loadAssessment() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSESSMENT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveAssessment(value) {
  localStorage.setItem(STORAGE_KEYS.ASSESSMENT, JSON.stringify(value));
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(value) {
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(value));
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

