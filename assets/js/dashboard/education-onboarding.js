/* eslint-env browser */
/**
 * Education Onboarding System
 * Best Practice Accademica 2025
 * Onboarding multi-step automatico per nuovi utenti del sistema formativo
 * Usa IndexedDB per sicurezza (non localStorage)
 */

import { safeLog } from "./security-utils.js";

const DB_NAME = "tradelia_education";
const DB_VERSION = 1;
const STORE_NAME = "onboarding";
const KEY_COMPLETED = "completed";

let db = null;
const state = {
  root: null,
  modal: null,
  currentStep: 1,
  totalSteps: 4,
  initialized: false,
  previousActiveElement: null,
};

const STEPS = {
  WELCOME: 1,
  FEATURES: 2,
  NAVIGATION: 3,
  GET_STARTED: 4,
};

/**
 * Initialize IndexedDB
 */
async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      safeLog("error", "[Education Onboarding] IndexedDB error:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Check if onboarding is completed (from IndexedDB)
 */
async function isOnboardingCompleted() {
  try {
    if (!db) {
      await initDB();
    }

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(KEY_COMPLETED);

      request.onsuccess = () => {
        resolve(request.result === true);
      };

      request.onerror = () => {
        safeLog("error", "[Education Onboarding] Error reading from IndexedDB:", request.error);
        resolve(false); // Default to false if error
      };
    });
  } catch (error) {
    safeLog("error", "[Education Onboarding] Error checking completion:", error);
    return false;
  }
}

/**
 * Mark onboarding as completed (save to IndexedDB)
 */
async function markOnboardingCompleted() {
  try {
    if (!db) {
      await initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(true, KEY_COMPLETED);

      request.onsuccess = () => {
        safeLog("log", "[Education Onboarding] Marked as completed in IndexedDB");
        resolve();
      };

      request.onerror = () => {
        safeLog("error", "[Education Onboarding] Error saving to IndexedDB:", request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    safeLog("error", "[Education Onboarding] Error marking completion:", error);
  }
}

/**
 * Initialize onboarding system
 */
export async function initOnboarding() {
  try {
    // Initialize IndexedDB
    await initDB();

    // Check if already completed
    const completed = await isOnboardingCompleted();
    if (completed) {
      safeLog("log", "[Education Onboarding] Already completed, skipping");
      return;
    }

    // Create overlay if not exists
    if (!state.initialized) {
      createOnboardingOverlay();
      registerEvents();
      setupKeyboardNavigation();
      state.initialized = true;
    }

    // Show onboarding automatically after a short delay
    setTimeout(() => {
      open();
    }, 1000);
  } catch (error) {
    safeLog("error", "[Education Onboarding] Errore inizializzazione:", error);
  }
}

/**
 * Create onboarding overlay element
 */
function createOnboardingOverlay() {
  state.root = document.createElement("div");
  state.root.id = "onboarding-overlay";
  state.root.className = "onboarding-overlay";
  state.root.setAttribute("role", "dialog");
  state.root.setAttribute("aria-modal", "true");
  state.root.setAttribute("aria-labelledby", "onboarding-title");
  state.root.hidden = true;

  state.modal = document.createElement("div");
  state.modal.className = "onboarding-modal";

  state.modal.innerHTML = template();
  state.root.appendChild(state.modal);
  document.body.appendChild(state.root);
}

/**
 * Template for onboarding modal
 */
function template() {
  return `
    <div class="auth-backdrop" data-onboarding-dismiss></div>
    <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <header class="auth-header">
        <div class="auth-header-text">
          <h2 class="auth-title" id="onboarding-title">Benvenuto nel Sistema Formativo</h2>
          <div class="trial-progress" id="onboarding-progress">
            <div class="trial-progress-bar" id="onboarding-progress-bar">
              <div class="trial-progress-fill"></div>
            </div>
            <span class="trial-progress-text" id="onboarding-progress-text">Passo 1 di ${state.totalSteps}</span>
          </div>
        </div>
        <button type="button" class="auth-close" data-onboarding-close aria-label="Chiudi">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </button>
      </header>
      
      <div class="auth-body">
        <!-- STEP 1: Welcome -->
        <div class="trial-step" id="step-1" data-step="1">
          <h3 style="font-size: var(--fs-18); font-weight: 700; color: var(--ink); margin-bottom: var(--sp-4);">
            Benvenuto nel Sistema Formativo Tradelia
          </h3>
          <p style="color: var(--muted); font-size: var(--fs-14); margin-bottom: var(--sp-6); line-height: var(--lh-17);">
            Un percorso formativo completo sui mercati finanziari basato su framework AI proprietari e metodologie accademiche verificate.
          </p>
          
          <div style="display: grid; gap: var(--sp-4); margin-bottom: var(--sp-6);">
            <div style="padding: var(--sp-4); background: var(--surface-elev); border: 1px solid var(--br-card); border-radius: var(--radius-md);">
              <div style="display: flex; align-items: center; gap: var(--sp-3); margin-bottom: var(--sp-2);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                <strong style="font-size: var(--fs-16); color: var(--ink);">Percorsi Modulari</strong>
              </div>
              <p style="font-size: var(--fs-13); color: var(--muted); margin: 0; line-height: var(--lh-16);">
                Moduli progressivi con lezioni, test e certificazioni per ogni livello.
              </p>
            </div>
            
            <div style="padding: var(--sp-4); background: var(--surface-elev); border: 1px solid var(--br-card); border-radius: var(--radius-md);">
              <div style="display: flex; align-items: center; gap: var(--sp-3); margin-bottom: var(--sp-2);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <strong style="font-size: var(--fs-16); color: var(--ink);">Gamification</strong>
              </div>
              <p style="font-size: var(--fs-13); color: var(--muted); margin: 0; line-height: var(--lh-16);">
                Badge, punti esperienza e progress tracking per mantenere alta la motivazione.
              </p>
            </div>
          </div>
        </div>
        
        <!-- STEP 2: Features -->
        <div class="trial-step" id="step-2" data-step="2" hidden>
          <h3 style="font-size: var(--fs-18); font-weight: 700; color: var(--ink); margin-bottom: var(--sp-4);">
            Funzionalità Avanzate
          </h3>
          <p style="color: var(--muted); font-size: var(--fs-14); margin-bottom: var(--sp-6); line-height: var(--lh-17);">
            Il sistema include strumenti avanzati basati su ricerca accademica per ottimizzare l'apprendimento.
          </p>
          
          <div style="display: grid; gap: var(--sp-3); margin-bottom: var(--sp-6);">
            <div style="padding: var(--sp-3); background: var(--surface-elev); border: 1px solid var(--br-card); border-radius: var(--radius-md);">
              <strong style="font-size: var(--fs-14); color: var(--ink); display: block; margin-bottom: var(--sp-1);">Spaced Repetition</strong>
              <span style="font-size: var(--fs-13); color: var(--muted);">Ripasso intelligente basato sulla curva dell'oblio (Ebbinghaus, 1885)</span>
            </div>
            <div style="padding: var(--sp-3); background: var(--surface-elev); border: 1px solid var(--br-card); border-radius: var(--radius-md);">
              <strong style="font-size: var(--fs-14); color: var(--ink); display: block; margin-bottom: var(--sp-1);">Retrieval Practice</strong>
              <span style="font-size: var(--fs-13); color: var(--muted);">Test di richiamo per consolidare la memoria (Roediger & Karpicke, 2006)</span>
            </div>
            <div style="padding: var(--sp-3); background: var(--surface-elev); border: 1px solid var(--br-card); border-radius: var(--radius-md);">
              <strong style="font-size: var(--fs-14); color: var(--ink); display: block; margin-bottom: var(--sp-1);">Adaptive Learning</strong>
              <span style="font-size: var(--fs-13); color: var(--muted);">Percorsi personalizzati basati sulle tue performance</span>
            </div>
            <div style="padding: var(--sp-3); background: var(--surface-elev); border: 1px solid var(--br-card); border-radius: var(--radius-md);">
              <strong style="font-size: var(--fs-14); color: var(--ink); display: block; margin-bottom: var(--sp-1);">Learning Analytics</strong>
              <span style="font-size: var(--fs-13); color: var(--muted);">Monitoraggio progressi e aree di miglioramento</span>
            </div>
          </div>
        </div>
        
        <!-- STEP 3: Navigation -->
        <div class="trial-step" id="step-3" data-step="3" hidden>
          <h3 style="font-size: var(--fs-18); font-weight: 700; color: var(--ink); margin-bottom: var(--sp-4);">
            Come Navigare
          </h3>
          <p style="color: var(--muted); font-size: var(--fs-14); margin-bottom: var(--sp-6); line-height: var(--lh-17);">
            Ecco come orientarti nel sistema formativo.
          </p>
          
          <div style="display: grid; gap: var(--sp-4); margin-bottom: var(--sp-6);">
            <div style="padding: var(--sp-4); background: var(--surface-elev); border: 1px solid var(--br-card); border-radius: var(--radius-md);">
              <div style="display: flex; align-items: start; gap: var(--sp-3);">
                <div style="width: 32px; height: 32px; background: var(--brand-500); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: white; font-weight: 700; font-size: var(--fs-14);">1</div>
                <div>
                  <strong style="font-size: var(--fs-15); color: var(--ink); display: block; margin-bottom: var(--sp-1);">Scegli un Modulo</strong>
                  <span style="font-size: var(--fs-13); color: var(--muted); line-height: var(--lh-16);">Inizia da un modulo che ti interessa. I moduli sono organizzati per livello di difficoltà.</span>
                </div>
              </div>
            </div>
            
            <div style="padding: var(--sp-4); background: var(--surface-elev); border: 1px solid var(--br-card); border-radius: var(--radius-md);">
              <div style="display: flex; align-items: start; gap: var(--sp-3);">
                <div style="width: 32px; height: 32px; background: var(--brand-500); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: white; font-weight: 700; font-size: var(--fs-14);">2</div>
                <div>
                  <strong style="font-size: var(--fs-15); color: var(--ink); display: block; margin-bottom: var(--sp-1);">Completa le Lezioni</strong>
                  <span style="font-size: var(--fs-13); color: var(--muted); line-height: var(--lh-16);">Segui le lezioni in ordine. Alcune potrebbero essere bloccate fino al completamento delle precedenti.</span>
                </div>
              </div>
            </div>
            
            <div style="padding: var(--sp-4); background: var(--surface-elev); border: 1px solid var(--br-card); border-radius: var(--radius-md);">
              <div style="display: flex; align-items: start; gap: var(--sp-3);">
                <div style="width: 32px; height: 32px; background: var(--brand-500); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: white; font-weight: 700; font-size: var(--fs-14);">3</div>
                <div>
                  <strong style="font-size: var(--fs-15); color: var(--ink); display: block; margin-bottom: var(--sp-1);">Sostieni i Test</strong>
                  <span style="font-size: var(--fs-13); color: var(--muted); line-height: var(--lh-16);">Completa i test per verificare la comprensione e sbloccare i moduli successivi.</span>
                </div>
              </div>
            </div>
            
            <div style="padding: var(--sp-4); background: var(--surface-elev); border: 1px solid var(--br-card); border-radius: var(--radius-md);">
              <div style="display: flex; align-items: start; gap: var(--sp-3);">
                <div style="width: 32px; height: 32px; background: var(--brand-500); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: white; font-weight: 700; font-size: var(--fs-14);">4</div>
                <div>
                  <strong style="font-size: var(--fs-15); color: var(--ink); display: block; margin-bottom: var(--sp-1);">Ottieni Certificazioni</strong>
                  <span style="font-size: var(--fs-13); color: var(--muted); line-height: var(--lh-16);">Raccogli badge e certificazioni completando i percorsi formativi.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- STEP 4: Get Started -->
        <div class="trial-step" id="step-4" data-step="4" hidden>
          <h3 style="font-size: var(--fs-18); font-weight: 700; color: var(--ink); margin-bottom: var(--sp-4);">
            Pronto per Iniziare?
          </h3>
          <p style="color: var(--muted); font-size: var(--fs-14); margin-bottom: var(--sp-6); line-height: var(--lh-17);">
            Il sistema formativo è completamente gratuito e accessibile. Inizia quando vuoi e procedi al tuo ritmo.
          </p>
          
          <div style="padding: var(--sp-4); background: var(--surface-elev); border: 1px solid var(--br-card); border-radius: var(--radius-md); margin-bottom: var(--sp-6);">
            <p style="font-size: var(--fs-13); color: var(--ink-soft); margin: 0; line-height: var(--lh-16);">
              <strong style="color: var(--ink);">Ricorda:</strong><br>
              • I moduli sono sequenziali - completa quelli precedenti per sbloccare i successivi<br>
              • Usa gli strumenti di ripasso per consolidare l'apprendimento<br>
              • Monitora i tuoi progressi nella dashboard<br>
              • Tutti i contenuti sono basati su ricerca accademica verificata
            </p>
          </div>
          
          <div style="display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-3); background: var(--surface-card); border: 1px solid var(--br-card); border-radius: var(--radius-md); margin-bottom: var(--sp-6);">
            <input type="checkbox" id="onboarding-dont-show" style="width: 18px; height: 18px; cursor: pointer;">
            <label for="onboarding-dont-show" style="font-size: var(--fs-13); color: var(--ink-soft); cursor: pointer; margin: 0;">
              Non mostrare più questo messaggio
            </label>
          </div>
        </div>
      </div>
      
      <footer class="auth-footer" style="padding: var(--sp-4); border-top: 1px solid var(--br-card); display: flex; justify-content: space-between; align-items: center; gap: var(--sp-3);">
        <button type="button" class="btn btn-outline btn-sm" data-onboarding-back style="display: none;">Indietro</button>
        <div style="display: flex; gap: var(--sp-2); margin-left: auto;">
          <button type="button" class="btn btn-outline btn-sm" data-onboarding-skip>Salta</button>
          <button type="button" class="btn btn-primary btn-sm" data-onboarding-next>Continua</button>
        </div>
      </footer>
    </div>
  `;
}

/**
 * Register event listeners
 */
function registerEvents() {
  const root = state.root;
  if (!root) {
    return;
  }

  // Close buttons
  root.querySelectorAll("[data-onboarding-close], [data-onboarding-dismiss]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dontShow = root.querySelector("#onboarding-dont-show")?.checked;
      if (dontShow) {
        markOnboardingCompleted();
      }
      close();
    });
  });

  // Skip button
  const skipBtn = root.querySelector("[data-onboarding-skip]");
  if (skipBtn) {
    skipBtn.addEventListener("click", async () => {
      const dontShow = root.querySelector("#onboarding-dont-show")?.checked;
      if (dontShow) {
        await markOnboardingCompleted();
      }
      close();
    });
  }

  // Next button
  const nextBtn = root.querySelector("[data-onboarding-next]");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (state.currentStep < state.totalSteps) {
        goToStep(state.currentStep + 1);
      } else {
        // Last step - complete
        completeOnboarding();
      }
    });
  }

  // Back button
  const backBtn = root.querySelector("[data-onboarding-back]");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (state.currentStep > 1) {
        goToStep(state.currentStep - 1);
      }
    });
  }
}

/**
 * Go to specific step
 */
function goToStep(step) {
  state.currentStep = step;

  // Hide all steps
  state.root.querySelectorAll(".trial-step").forEach((stepEl) => {
    stepEl.hidden = true;
  });

  // Show current step
  const currentStepEl = state.root.querySelector(`#step-${step}`);
  if (currentStepEl) {
    currentStepEl.hidden = false;
  }

  // Update progress
  updateProgress();

  // Update buttons
  const nextBtn = state.root.querySelector("[data-onboarding-next]");
  const backBtn = state.root.querySelector("[data-onboarding-back]");

  if (nextBtn) {
    nextBtn.textContent = step === state.totalSteps ? "Inizia" : "Continua";
  }

  if (backBtn) {
    backBtn.style.display = step > 1 ? "inline-flex" : "none";
  }
}

/**
 * Update progress bar
 */
function updateProgress() {
  const progressBar = state.root.querySelector("#onboarding-progress-bar");
  const progressText = state.root.querySelector("#onboarding-progress-text");

  const progress = (state.currentStep / state.totalSteps) * 100;

  if (progressBar) {
    const barFill = progressBar.querySelector(".trial-progress-fill");
    if (barFill) {
      barFill.style.width = `${progress}%`;
    }
  }

  if (progressText) {
    progressText.textContent = `Passo ${state.currentStep} di ${state.totalSteps}`;
  }
}

/**
 * Complete onboarding
 */
async function completeOnboarding() {
  const dontShow = state.root.querySelector("#onboarding-dont-show")?.checked;
  if (dontShow) {
    await markOnboardingCompleted();
  }
  close();
}

/**
 * Setup keyboard navigation
 */
function setupKeyboardNavigation() {
  state.root.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      close();
    } else if (e.key === "ArrowRight" && e.ctrlKey) {
      e.preventDefault();
      if (state.currentStep < state.totalSteps) {
        goToStep(state.currentStep + 1);
      }
    } else if (e.key === "ArrowLeft" && e.ctrlKey) {
      e.preventDefault();
      if (state.currentStep > 1) {
        goToStep(state.currentStep - 1);
      }
    }
  });
}

/**
 * Open onboarding
 */
function open() {
  if (!state.root) {
    return;
  }

  // Reset to first step
  goToStep(STEPS.WELCOME);

  // Show modal
  state.root.hidden = false;
  state.root.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  // Save previous active element
  state.previousActiveElement = document.activeElement;

  // Focus first interactive element
  setTimeout(() => {
    const firstButton = state.root.querySelector("[data-onboarding-next]");
    if (firstButton) {
      firstButton.focus();
    }
  }, 100);
}

/**
 * Close onboarding
 */
function close() {
  if (!state.root) {
    return;
  }

  state.root.hidden = true;
  state.root.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  // Restore focus
  if (state.previousActiveElement) {
    state.previousActiveElement.focus();
    state.previousActiveElement = null;
  }
}

/**
 * Hide onboarding overlay (exported for compatibility)
 */
export function hideOnboardingOverlay() {
  close();
}

/**
 * Show onboarding overlay (exported for manual trigger)
 */
export function showOnboarding() {
  open();
}

/**
 * Mark onboarding as completed (exported)
 */
export async function completeOnboardingExport() {
  await markOnboardingCompleted();
  close();
}
