/**
 * Dashboard Module: Education
 * Percorsi formativi con tracking locale (fase 1)
 */

const STORAGE_KEY = "dashboard-education-progress-v1";

const EDUCATION_PATHS = [
  {
    id: "analisi-tecnica",
    title: "Analisi Tecnica Integrata",
    description: "Pattern di prezzo, momentum e setup operativi pronti per il desk.",
    level: "Intermedio",
    duration: "4h 20m",
    focus: "Price action · Momentum · Gestione segnali",
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 18 9 12 13 16 21 8" />
        <polyline points="14 8 21 8 21 15" />
        <circle cx="9" cy="12" r="1" />
        <circle cx="13" cy="16" r="1" />
      </svg>
    `,
    skills: ["Price action", "Pattern recognition", "Momentum"],
    tutorials: [
      {
        id: "analisi-tecnica-introduzione",
        title: "Introduzione all'Analisi Tecnica",
        url: "/report/tutorial/Analisi-Tecnica-Introduzione.html",
        duration: "25 min",
        format: "Guida",
        tags: ["Foundations"],
      },
      {
        id: "candlestick-patterns",
        title: "Candlestick Patterns Pro",
        url: "/report/tutorial/Candlestick-Patterns.html",
        duration: "30 min",
        format: "Mini corso",
        tags: ["Pattern", "Sentiment"],
      },
      {
        id: "chart-patterns",
        title: "Chart Patterns Essenziali",
        url: "/report/tutorial/Chart-Patterns.html",
        duration: "35 min",
        format: "Guida interattiva",
        tags: ["Breakout", "Reversal"],
      },
      {
        id: "indicatori-tecnici",
        title: "Indicatori Tecnici Operativi",
        url: "/report/tutorial/Indicatori-Tecnici.html",
        duration: "28 min",
        format: "Schede operative",
        tags: ["Momentum", "Volatilità"],
      },
      {
        id: "trading-algoritmico",
        title: "Trading Algoritmico: miti vs realtà",
        url: "/report/tutorial/Trading-Algoritmico-Miti-Realta.html",
        duration: "22 min",
        format: "Briefing",
        tags: ["Automazione", "Bias"],
      },
    ],
  },
  {
    id: "analisi-fondamentale",
    title: "Analisi Fondamentale & Macro",
    description: "Valutazioni bottom-up e lettura dei driver macro per equity, bond ed ETF.",
    level: "Avanzato",
    duration: "5h 00m",
    focus: "Valutazioni · Macro indicatori · Quality scoring",
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 3v18h18" />
        <rect x="6" y="11" width="2.5" height="7" />
        <rect x="11" y="7" width="2.5" height="11" />
        <rect x="16" y="4" width="2.5" height="14" />
      </svg>
    `,
    skills: ["Equity research", "Macro view", "Valuation"],
    tutorials: [
      {
        id: "valutare-azioni",
        title: "Valutare Azioni in modo disciplinato",
        url: "/report/tutorial/valutare-azioni.html",
        duration: "35 min",
        format: "Playbook",
        tags: ["DCF", "Multipli"],
      },
      {
        id: "valutare-etf",
        title: "Valutare ETF e fondi indicizzati",
        url: "/report/tutorial/valutare-etf.html",
        duration: "28 min",
        format: "Scheda tecnica",
        tags: ["Exposure", "Costi"],
      },
      {
        id: "valutare-obbligazioni",
        title: "Valutare Obbligazioni corporate e sovrane",
        url: "/report/tutorial/valutare-obbligazioni.html",
        duration: "32 min",
        format: "Framework",
        tags: ["Credito", "Duration"],
      },
      {
        id: "analisi-macro",
        title: "Analisi Macroeconomica & leading indicators",
        url: "/report/tutorial/Analisi-Macroeconomica-Investimenti.html",
        duration: "40 min",
        format: "Deep dive",
        tags: ["Ciclo", "Policy"],
      },
      {
        id: "value-vs-growth",
        title: "Value vs Growth: come leggere i cicli",
        url: "/report/tutorial/Value-vs-Growth-Investing.html",
        duration: "24 min",
        format: "Case study",
        tags: ["Style rotation"],
      },
    ],
  },
  {
    id: "derivati-strumenti",
    title: "Derivati e Strutture Complesse",
    description: "Opzioni, certificates e note strutturate per coperture e strategie income.",
    level: "Avanzato",
    duration: "4h 45m",
    focus: "Greeks · Payoff · Rischio emittente",
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 18c2-6 6-10 8-10s6 4 8 10" />
        <path d="M2 9c1.5-3 4-5 6-5s4.5 2 6 5" />
        <circle cx="12" cy="12" r="1" />
      </svg>
    `,
    skills: ["Greeks", "Payoff design", "Risk overlay"],
    tutorials: [
      {
        id: "opzioni-vanilla",
        title: "Opzioni Vanilla: struttura e payoff",
        url: "/report/tutorial/Opzioni-Vanilla.html",
        duration: "30 min",
        format: "Manuale operativo",
        tags: ["Call/Put", "Greeks"],
      },
      {
        id: "opzioni-esotiche",
        title: "Opzioni Esotiche & scenari reali",
        url: "/report/tutorial/Opzioni-Esotiche.html",
        duration: "34 min",
        format: "Schede scenario",
        tags: ["Barriere", "Path dependency"],
      },
      {
        id: "certificates-complessi",
        title: "Certificates complessi spiegati semplice",
        url: "/report/tutorial/Certificates-Complessi.html",
        duration: "32 min",
        format: "Toolkit",
        tags: ["Income", "Protezione"],
      },
      {
        id: "note-strutturate",
        title: "Note strutturate e protezione del capitale",
        url: "/report/tutorial/Note-Strutturate-Barriera.html",
        duration: "26 min",
        format: "Guida rapida",
        tags: ["Barriere", "Cedole"],
      },
      {
        id: "reverse-convertible",
        title: "Reverse Convertible & Dual Currency",
        url: "/report/tutorial/Reverse-Convertible.html",
        duration: "23 min",
        format: "Caso pratico",
        tags: ["Yield boost"],
      },
    ],
  },
  {
    id: "digital-assets",
    title: "Digital Assets & Sicurezza",
    description: "Framework per valutare crypto, stablecoin e rischi operativi.",
    level: "Intermedio",
    duration: "3h 30m",
    focus: "Tokenomics · Risk control · Compliance",
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v8M9 10h6M9 14h6" />
      </svg>
    `,
    skills: ["Tokenomics", "Risk assessment", "Compliance"],
    tutorials: [
      {
        id: "valutare-crypto",
        title: "Valutare crypto assets in ottica istituzionale",
        url: "/report/tutorial/valutare-crypto.html",
        duration: "30 min",
        format: "Checklist",
        tags: ["Tokenomics", "On-chain"],
      },
      {
        id: "stablecoin",
        title: "Stablecoin algoritmiche: rischi reali",
        url: "/report/tutorial/Stablecoin-Algoritmiche.html",
        duration: "24 min",
        format: "Guida critica",
        tags: ["Peg", "Risk"],
      },
      {
        id: "token-sintetici",
        title: "Token Sintetici e mercati derivati",
        url: "/report/tutorial/Token-Sintetici.html",
        duration: "22 min",
        format: "Brief",
        tags: ["Synthetic exposure"],
      },
      {
        id: "truffe-cripto",
        title: "Truffe crypto e schemi ricorrenti",
        url: "/report/tutorial/Truffe-Cripto.html",
        duration: "26 min",
        format: "Case study",
        tags: ["Fraud", "Compliance"],
      },
      {
        id: "truffe-finanziarie",
        title: "Truffe finanziarie storiche (lesson learned)",
        url: "/report/tutorial/Truffe-Finanziarie-Storiche.html",
        duration: "28 min",
        format: "Storytelling",
        tags: ["Red flags"],
      },
    ],
  },
  {
    id: "money-management",
    title: "Money Management & Execution",
    description: "Dimensionamento delle posizioni, rebalance e psicologia decisionale.",
    level: "Base",
    duration: "3h 10m",
    focus: "Risk budgeting · Execution · Mindset",
    icon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4z" />
        <path d="M13 13h7v7h-7z" />
      </svg>
    `,
    skills: ["Position sizing", "Execution", "Behavioral finance"],
    tutorials: [
      {
        id: "money-management",
        title: "Money Management & Position Sizing",
        url: "/report/tutorial/Money-Management-Position-Sizing.html",
        duration: "30 min",
        format: "Manuale",
        tags: ["Sizing", "Kelly"],
      },
      {
        id: "rebalancing",
        title: "Rebalancing del portafoglio",
        url: "/report/tutorial/Rebalancing-Portafoglio.html",
        duration: "26 min",
        format: "Processo",
        tags: ["Allocazione"],
      },
      {
        id: "backtesting",
        title: "Backtesting & Stress Test Monte Carlo",
        url: "/report/tutorial/Backtesting-Stress-Test-Monte-Carlo.html",
        duration: "32 min",
        format: "Lab",
        tags: ["Scenario", "Risk"],
      },
      {
        id: "tipi-ordini",
        title: "Tipi di ordini sul mercato",
        url: "/report/tutorial/Tipi-Ordini-Mercato.html",
        duration: "20 min",
        format: "Scheda rapida",
        tags: ["Execution"],
      },
      {
        id: "psicologia-trading",
        title: "Psicologia del trading & bias",
        url: "/report/tutorial/Psicologia-Trading-Bias-Comportamentali.html",
        duration: "22 min",
        format: "Mindset",
        tags: ["Behavioral"],
      },
    ],
  },
];

let storageListenerRegistered = false;

export async function loadEducation() {
  const container = document.getElementById("education-container");
  if (!container) return;

  renderEducation(container);

  if (!storageListenerRegistered) {
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) {
        const target = document.getElementById("education-container");
        if (target) {
          renderEducation(target);
        }
      }
    });
    storageListenerRegistered = true;
  }
}

function renderEducation(container) {
  const progress = getProgress();
  const stats = computeEducationStats(progress);

  container.dataset.educationLoaded = "true";
  container.innerHTML = `
    ${renderHero(stats)}
    <section class="education-path-grid">
      ${EDUCATION_PATHS.map((path) => renderPathCard(path, progress[path.id] || [])).join("")}
    </section>
    ${renderResources()}
  `;

  bindEducationInteractions(container);
}

function renderHero(stats) {
  return `
    <section class="education-hero">
      <div class="education-hero-card">
        <div>
          <p class="education-eyebrow">Percorsi formativi</p>
          <h3>Forma il team con percorsi modulari e progress tracking locale.</h3>
          <p class="education-hero-text">
            I percorsi aggregano i 50+ tutorial già presenti nella library. Salva l'avanzamento in locale e riprendi da dove hai interrotto.
          </p>
        </div>
        <div class="education-hero-actions">
          <a href="/report/tutorial/index.html" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
            Apri libreria completa
          </a>
          <button type="button" class="btn btn-secondary" data-education-reset aria-label="Azzera progressi">
            Azzera progressi
          </button>
        </div>
      </div>
      <div class="education-hero-metrics">
        <div class="education-metric">
          <span class="education-metric-value" data-education-metric="completion">${stats.completionRate}%</span>
          <span class="education-metric-label">Completamento medio</span>
        </div>
        <div class="education-metric">
          <span class="education-metric-value" data-education-metric="lessons">${stats.completedLessons}/${stats.totalLessons}</span>
          <span class="education-metric-label">Lezioni completate</span>
        </div>
        <div class="education-metric">
          <span class="education-metric-value" data-education-metric="active">${stats.activePaths}</span>
          <span class="education-metric-label">Percorsi attivi</span>
        </div>
      </div>
    </section>
  `;
}

function renderPathCard(path, completed = []) {
  const completedSet = new Set(completed);
  const totalSteps = path.tutorials.length;
  const validCompleted = path.tutorials.filter((lesson) => completedSet.has(lesson.id)).length;
  const completionPercent = totalSteps ? Math.round((validCompleted / totalSteps) * 100) : 0;

  return `
    <article class="education-path-card" data-progress-path="${path.id}">
      <div class="education-path-header">
        <div class="education-path-icon" aria-hidden="true">
          ${path.icon}
        </div>
        <div>
          <div class="education-path-meta">
            <span class="education-badge">${path.level}</span>
            <span>${path.duration}</span>
          </div>
          <h4>${path.title}</h4>
          <p>${path.description}</p>
          <div class="education-skills">
            ${path.skills.map((skill) => `<span>${skill}</span>`).join("")}
          </div>
        </div>
      </div>
      <div class="education-progress">
        <div
          class="education-progress-bar"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="${completionPercent}"
        >
          <span data-education-progress-bar="${path.id}" style="width: ${completionPercent}%;"></span>
        </div>
        <span class="education-progress-label" data-education-progress-label="${path.id}">
          ${validCompleted} / ${totalSteps} lezioni completate
        </span>
      </div>
      <ul class="education-lesson-list">
        ${path.tutorials.map((lesson) => renderLesson(path.id, lesson, completedSet.has(lesson.id))).join("")}
      </ul>
    </article>
  `;
}

function renderLesson(pathId, lesson, isComplete) {
  const tags = lesson.tags?.map((tag) => `<span class="education-lesson-tag">${tag}</span>`).join("") || "";

  return `
    <li class="education-lesson ${isComplete ? "is-complete" : ""}" data-education-lesson="${pathId}:${lesson.id}">
      <button
        type="button"
        class="education-lesson-toggle"
        aria-pressed="${isComplete}"
        data-education-toggle
        data-path-id="${pathId}"
        data-step-id="${lesson.id}"
        data-lesson-title="${lesson.title}"
        aria-label="${isComplete ? "Segna come da ripassare" : "Segna come completata"}"
      >
        <span class="education-lesson-check" aria-hidden="true"></span>
        <span class="sr-only">${isComplete ? "Segna come da ripassare" : "Segna come completata"}</span>
      </button>
      <div class="education-lesson-body">
        <a
          href="${lesson.url}"
          target="_blank"
          rel="noopener noreferrer"
          class="education-lesson-link"
        >
          <span class="education-lesson-title">${lesson.title}</span>
          <span class="education-lesson-meta">${lesson.duration} · ${lesson.format}</span>
        </a>
        ${tags ? `<div class="education-lesson-tags">${tags}</div>` : ""}
      </div>
    </li>
  `;
}

function renderResources() {
  return `
    <section class="education-resource-grid">
      <article class="education-resource-card">
        <div>
          <p class="education-resource-eyebrow">Richiedi nuovi percorsi</p>
          <h4>Hai bisogno di un percorso dedicato?</h4>
          <p>Invia una richiesta in area Community per prioritarizzare nuovi contenuti formativi.</p>
        </div>
        <a href="#community" class="btn btn-secondary">Apri Community</a>
      </article>
      <article class="education-resource-card">
        <div>
          <p class="education-resource-eyebrow">Tutorial library</p>
          <h4>Indice completo dei 50+ tutorial</h4>
          <p>Filtra per asset class, livello di difficoltà o scenario operativo.</p>
        </div>
        <a href="/report/tutorial/index.html" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Vai all'indice</a>
      </article>
    </section>
  `;
}

function bindEducationInteractions(container) {
  if (!container.dataset.educationBound) {
    container.addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-education-toggle]");
      if (toggle) {
        event.preventDefault();
        const pathId = toggle.getAttribute("data-path-id");
        const stepId = toggle.getAttribute("data-step-id");
        toggleLessonProgress(container, pathId, stepId, toggle.getAttribute("data-lesson-title") || "");
        return;
      }

      const resetBtn = event.target.closest("[data-education-reset]");
      if (resetBtn) {
        event.preventDefault();
        resetEducationProgress(container);
      }
    });

    container.dataset.educationBound = "true";
  }
}

function toggleLessonProgress(container, pathId, stepId, lessonTitle) {
  if (!pathId || !stepId) return;

  const progress = getProgress();
  const pathProgress = new Set(progress[pathId] || []);
  const wasComplete = pathProgress.has(stepId);

  if (wasComplete) {
    pathProgress.delete(stepId);
  } else {
    pathProgress.add(stepId);
  }

  if (pathProgress.size === 0) {
    delete progress[pathId];
  } else {
    progress[pathId] = Array.from(pathProgress);
  }

  saveProgress(progress);
  updateLessonUI(container, pathId, stepId, !wasComplete);
  updatePathProgressUI(container, pathId, progress);
  refreshHeroMetrics(container, progress);
  announceProgressChange(lessonTitle, !wasComplete);
}

function updateLessonUI(container, pathId, stepId, isComplete) {
  const selector = `[data-education-lesson="${pathId}:${stepId}"]`;
  const lessonEl = container.querySelector(selector);

  if (lessonEl) {
    lessonEl.classList.toggle("is-complete", isComplete);
  }

  const toggle = container.querySelector(
    `[data-education-toggle][data-path-id="${pathId}"][data-step-id="${stepId}"]`
  );

  if (toggle) {
    toggle.setAttribute("aria-pressed", String(isComplete));
    toggle.setAttribute("aria-label", isComplete ? "Segna come da ripassare" : "Segna come completata");
  }
}

function updatePathProgressUI(container, pathId, progress) {
  const path = EDUCATION_PATHS.find((item) => item.id === pathId);
  if (!path) return;

  const completedSteps = (progress[pathId] || []).filter((stepId) =>
    path.tutorials.some((lesson) => lesson.id === stepId)
  ).length;
  const totalSteps = path.tutorials.length;
  const percent = totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const progressFill = container.querySelector(`[data-education-progress-bar="${pathId}"]`);
  if (progressFill) {
    progressFill.style.width = `${percent}%`;
    const bar = progressFill.closest(".education-progress-bar");
    if (bar) {
      bar.setAttribute("aria-valuenow", String(percent));
    }
  }

  const label = container.querySelector(`[data-education-progress-label="${pathId}"]`);
  if (label) {
    label.textContent = `${completedSteps} / ${totalSteps} lezioni completate`;
  }
}

function refreshHeroMetrics(container, progress) {
  const stats = computeEducationStats(progress);

  const completionEl = container.querySelector('[data-education-metric="completion"]');
  if (completionEl) {
    completionEl.textContent = `${stats.completionRate}%`;
  }

  const lessonsEl = container.querySelector('[data-education-metric="lessons"]');
  if (lessonsEl) {
    lessonsEl.textContent = `${stats.completedLessons}/${stats.totalLessons}`;
  }

  const activeEl = container.querySelector('[data-education-metric="active"]');
  if (activeEl) {
    activeEl.textContent = `${stats.activePaths}`;
  }
}

function resetEducationProgress(container) {
  localStorage.removeItem(STORAGE_KEY);
  const blankProgress = {};
  renderEducation(container);
  announceProgressChange("Tutti i percorsi", false);
  refreshHeroMetrics(container, blankProgress);
}

function getProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    console.warn("[Dashboard] Impossibile leggere i progressi education:", error);
    return {};
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn("[Dashboard] Impossibile salvare i progressi education:", error);
  }
}

function computeEducationStats(progress) {
  const totalLessons = EDUCATION_PATHS.reduce((sum, path) => sum + path.tutorials.length, 0);

  const completedLessons = Object.entries(progress).reduce((sum, [pathId, steps]) => {
    const path = EDUCATION_PATHS.find((item) => item.id === pathId);
    if (!path) return sum;

    const validCount = steps.filter((stepId) => path.tutorials.some((lesson) => lesson.id === stepId)).length;
    return sum + validCount;
  }, 0);

  const activePaths = Object.values(progress).filter((steps) => Array.isArray(steps) && steps.length > 0).length;
  const completionRate = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    totalLessons,
    completedLessons,
    completionRate,
    activePaths,
  };
}

function announceProgressChange(lessonTitle, completed) {
  if (typeof window.announceToScreenReader === "function") {
    const status = completed ? "segnata completata" : "riaperta per ripasso";
    window.announceToScreenReader(`${lessonTitle} ${status}`);
  }
}

