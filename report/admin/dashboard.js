import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY, REPORTS_BUCKET } from './supabase-config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, storageKey: 'tradelia-report-admin' }
});
window.supabase = supabase;

const ACCESS_TOKEN_KEY = 'tradelia-access-token-v1';
const ADMIN_PLAN_ROLES = new Set(['admin', 'internal', 'staff', 'team', 'founder']);
const NETWORK_TIMEOUT_MS = 15000;

const readStoredAdminToken = () => {
  try {
    const rawToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    return rawToken?.trim() || null;
  } catch (error) {
    console.warn('[Report Admin] Impossibile leggere il token locale', error);
    return null;
  }
};

const clearStoredAdminToken = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // ignore
  }
};

const fetchWithTimeout = async (resource, options = {}, timeout = NETWORK_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
};

const fetchJSON = async (resource, options = {}, timeout) => {
  const response = await fetchWithTimeout(resource, options, timeout);
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const preview = await response.text();
    throw new Error(`Risposta non JSON (${response.status}): ${preview.slice(0, 160)}`);
  }
  return response.json();
};

const DEFAULT_REPORT_TYPE = 'swing_master_5_0';

const REPORT_TEMPLATES = {
  swing_master_5_0: {
    label: 'SRD v5.0 ÔÇö Swing Research Deck',
    description: 'Template istituzionale SRD v5.0 (Swing Research Deck)',
    modules: [
      { key: 'header', order: 10, template: {}, required: true },
      { key: 'f1', order: 20, template: {}, required: false },
      { key: 'f2', order: 30, template: {}, required: false },
      { key: 'f3o', order: 35, template: {}, required: false },
      { key: 'f3', order: 40, template: {}, required: false },
      { key: 'f4', order: 50, template: {}, required: false },
      { key: 'f5', order: 60, template: {}, required: false },
      { key: 'f5o', order: 65, template: {}, required: false },
      { key: 'f5lt', order: 70, template: {}, required: false }
    ]
  },
  daily_market_intel_3_1: {
    label: 'MTB v3.1 ÔÇö Macro Tactical Briefing',
    description: 'Deck macro cross-asset in rollout',
    modules: []
  },
  custom: {
    label: 'CRD ÔÇö Custom Research Deck',
    description: 'Analisi su richiesta con composizione manuale',
    modules: []
  }
};

const toastEl = document.getElementById('toast');
const authCard = document.getElementById('auth-card');
const authLogged = document.getElementById('auth-logged');
// Campi login rimossi - ora redirect a accesso.html
// const emailEl = document.getElementById('auth-email');
// const loginBtn = document.getElementById('auth-login-btn');
const logoutBtn = document.getElementById('auth-logout-btn');
const refreshSessionBtn = document.getElementById('auth-refresh-session');
const authUserBadge = document.getElementById('auth-user-badge');

const appGrid = document.getElementById('app-grid');
const reportsListEl = document.getElementById('reports-list');
const searchEl = document.getElementById('search');
const refreshBtn = document.getElementById('refresh-btn');
const newReportBtn = document.getElementById('new-report-btn');

const reportTypeEl = document.getElementById('report-type');
const reportSlugEl = document.getElementById('report-slug');
const reportTitleEl = document.getElementById('report-title');
const reportStatusEl = document.getElementById('report-status');
const reportPublishedAtEl = document.getElementById('report-published-at');
const reportNotesEl = document.getElementById('report-notes');
const chartPathEl = document.getElementById('chart-path');
const chartFileEl = document.getElementById('chart-file');
const uploadChartBtn = document.getElementById('upload-chart-btn');
const openChartBtn = document.getElementById('open-chart-btn');
const chartPreviewEl = document.getElementById('chart-preview');
const chartDropzone = document.getElementById('chart-dropzone');
const chartUploadArea = document.getElementById('chart-upload-area');
const editorReportIdEl = document.getElementById('editor-report-id');

const addModuleBtn = document.getElementById('add-module-btn');
const resetTemplateBtn = document.getElementById('reset-template-btn');
const modulesContainer = document.getElementById('modules-container');
const moduleTemplate = document.getElementById('module-template');

const saveDraftBtn = document.getElementById('save-draft-btn');
const publishBtn = document.getElementById('publish-report-btn');
const duplicateBtn = document.getElementById('duplicate-report-btn');
const deleteBtn = document.getElementById('delete-report-btn');
const generateIdentifiersBtn = document.getElementById('generate-identifiers-btn');
const statusBanner = document.getElementById('status-banner');
const statusBannerTitle = document.getElementById('status-banner-title');
const statusBannerMessage = document.getElementById('status-banner-message');
duplicateBtn.disabled = true;
deleteBtn.disabled = true;

let currentUser = null;
let isAdmin = false;
let reports = [];
let filteredReports = [];
let activeReport = null;
let isDirty = false;
let isSaving = false;
let lastSavedAt = null;
let currentChartSignedUrl = null;
let currentTemplateType = DEFAULT_REPORT_TYPE;
let lastFocusedModuleArea = null;
let reportsRequestSeq = 0;
let reportDetailsRequestSeq = 0;

const statusLabels = {
  draft: 'Bozza',
  active: 'Pubblicato',
  archived: 'Archiviato'
};

const statusClasses = {
  draft: 'status-draft',
  active: 'status-active',
  archived: 'status-archived'
};

const showToast = (message, type = 'info') => {
  toastEl.textContent = message;
  toastEl.className = `toast toast-${type}`;
  toastEl.style.display = 'block';
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toastEl.style.display = 'none';
  }, 3200);
};

const STATUS_BANNER_CLASSES = {
  info: 'status-banner--info',
  success: 'status-banner--success',
  warning: 'status-banner--warning',
  error: 'status-banner--error'
};

const AUTH_CARD_MESSAGES = {
  not_admin: {
    title: 'Accesso non autorizzato',
    message: 'Il token inserito non dispone dei permessi per accedere alla dashboard report. Richiedi l\'abilitazione a support@tradelia.org.'
  },
  lookup_failed: {
    title: 'Verifica non riuscita',
    message: 'Non siamo riusciti a verificare i permessi amministratore. Aggiorna il token o contatta il supporto.'
  },
  session_error: {
    title: 'Sessione scaduta',
    message: 'La sessione non è più valida. Effettua nuovamente l\'accesso dalla pagina dedicata.'
  },
  missing_user: {
    title: 'Sessione non valida',
    message: 'Non riusciamo a identificare l\'utente associato al token corrente. Torna alla pagina di accesso e ripeti la procedura.'
  }
};

const setStatusBannerMessage = (tone = 'info', title = '', message = '') => {
  if (!statusBanner) return;
  Object.values(STATUS_BANNER_CLASSES).forEach((cls) => statusBanner.classList.remove(cls));
  const appliedClass = STATUS_BANNER_CLASSES[tone] || STATUS_BANNER_CLASSES.info;
  statusBanner.classList.add(appliedClass);
  if (title) {
    statusBannerTitle.textContent = title;
  }
  if (message !== undefined) {
    statusBannerMessage.textContent = message;
  }
};

const showUnauthorizedState = (reason = 'not_admin') => {
  const copy = AUTH_CARD_MESSAGES[reason] || AUTH_CARD_MESSAGES.not_admin;
  authCard.classList.remove('hidden');
  authLogged.classList.add('hidden');
  appGrid.classList.add('hidden');
  authCard.innerHTML = `
    <h3 style="margin-bottom: 1rem;">${copy.title}</h3>
    <p style="margin-bottom: 1.5rem; color: var(--ink-soft);">
      ${copy.message}
    </p>
    <div style="display:flex; gap:0.75rem; flex-wrap:wrap; justify-content:center;">
      <a href="/accesso.html" class="btn btn-primary">Vai alla pagina di accesso</a>
      <a href="mailto:support@tradelia.org" class="btn btn-outline">Contatta il supporto</a>
    </div>
  `;
};

const formatStatusTime = (date) => {
  try {
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  } catch {
    return date instanceof Date ? date.toISOString() : '';
  }
};

const toggleButtonLoading = (button, loading, loadingLabel) => {
  if (!button) return;
  const baseLabel = button.getAttribute('data-label') || button.textContent.trim();
  if (loading) {
    button.textContent = loadingLabel;
    button.classList.add('btn-loading');
  } else {
    button.textContent = baseLabel;
    button.classList.remove('btn-loading');
  }
};

const setSavingState = (saving, mode) => {
  isSaving = saving;
  const targetButton = mode === 'publish' ? publishBtn : saveDraftBtn;
  toggleButtonLoading(targetButton, saving, mode === 'publish' ? 'PubblicazioneÔÇª' : 'SalvataggioÔÇª');
  if (saving) {
    saveDraftBtn.disabled = true;
    publishBtn.disabled = true;
    duplicateBtn.disabled = true;
    deleteBtn.disabled = true;
  } else {
    saveDraftBtn.disabled = false;
    publishBtn.disabled = false;
    duplicateBtn.disabled = !activeReport;
    deleteBtn.disabled = !activeReport;
  }
};

const updateStatusAfterDirtyChange = () => {
  if (isSaving) return;
  if (isDirty) {
    setStatusBannerMessage(
      'warning',
      'Modifiche non salvate',
      'Salva una bozza o pubblica il report per sincronizzare i dati.'
    );
  } else if (lastSavedAt) {
    setStatusBannerMessage(
      'success',
      'Sincronizzato',
      `Ultimo salvataggio alle ${formatStatusTime(lastSavedAt)}.`
    );
  } else {
    setStatusBannerMessage(
      'info',
      'Pronto',
      'Compila i moduli e salva una bozza per sincronizzare il report.'
    );
  }
};
updateStatusAfterDirtyChange();

const padNumber = (value, length = 2) => value.toString().padStart(length, '0');

const buildSlugSuggestion = (date = new Date()) => {
  const year = date.getFullYear();
  const month = padNumber(date.getMonth() + 1);
  const day = padNumber(date.getDate());
  const hour = padNumber(date.getHours());
  const minutes = padNumber(date.getMinutes());
  return `${year}${month}${day}-${hour}${minutes}`;
};

const buildTitleSuggestion = (date = new Date()) => {
  const formatter = new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  return `SRD v5.0 ┬À ${formatter.format(date)}`;
};

const suggestIdentifiers = ({ force = false, markDirty = true } = {}) => {
  const now = new Date();
  const slugSuggestion = buildSlugSuggestion(now);
  const titleSuggestion = buildTitleSuggestion(now);

  const currentSlug = reportSlugEl.value.trim();
  const currentTitle = reportTitleEl.value.trim();

  if (force || !currentSlug) {
    reportSlugEl.value = slugSuggestion;
  }

  if (force || !currentTitle) {
    reportTitleEl.value = titleSuggestion;
  }

  if (markDirty && (force || !currentSlug || !currentTitle)) {
    setDirty(true);
    setStatusBannerMessage(
      'info',
      'Suggerimento applicato',
      `Slug e titolo aggiornati automaticamente (${slugSuggestion}).`
    );
  }
};

const updateEditorBadge = () => {
  if (isDirty) {
    editorReportIdEl.textContent = 'Modifiche non salvate';
  } else if (activeReport) {
    editorReportIdEl.textContent = `${activeReport.slug} ┬À id ${activeReport.id.slice(0, 8)}ÔÇª`;
  } else {
    editorReportIdEl.textContent = 'Nuovo report';
  }
};

const setDirty = (state) => {
  isDirty = state;
  updateEditorBadge();
  updateStatusAfterDirtyChange();
};

const resetDirty = () => setDirty(false);

const formatDateTimeLocal = (iso) => {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 16);
};

const formatDateTimeHuman = (iso) => {
  if (!iso) return 'ÔÇö';
  try {
    return new Date(iso).toLocaleString('it-IT', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  } catch {
    return iso;
  }
};

const renderModulesEmptyState = () => {
  modulesContainer.innerHTML = '<div class="module-empty">Nessun modulo presente. Aggiungi un modulo per iniziare.</div>';
};

const syncTemplateControls = (type) => {
  currentTemplateType = type;
  const template = REPORT_TEMPLATES[type];
  const hasTemplate = Array.isArray(template?.modules) && template.modules.length > 0;
  addModuleBtn.disabled = hasTemplate && type !== 'custom';
  resetTemplateBtn.disabled = !hasTemplate;
  resetTemplateBtn.textContent = hasTemplate ? 'Reimposta template' : 'Importa template';
};

const applyTemplateToModules = (type, { skipConfirm = false, markDirty = true } = {}) => {
  const template = REPORT_TEMPLATES[type];
  if (!template || !template.modules?.length) {
    renderModulesEmptyState();
    syncTemplateControls(type);
    if (markDirty) setDirty(true);
    return true;
  }

  const hasExisting = modulesContainer.querySelector('.module-card');
  if (hasExisting && !skipConfirm) {
    const confirmed = confirm('Sostituire i moduli correnti con il template selezionato?');
    if (!confirmed) {
      reportTypeEl.value = currentTemplateType;
      return;
    }
  }

  modulesContainer.innerHTML = '';
  template.modules.forEach((module, index) => {
    appendModuleCard({
      module_key: module.key,
      order_index: module.order ?? index,
      content: module.template ?? {}
    }, { lockedKey: true, allowDuplicate: false });
  });
  syncTemplateControls(type);
  if (markDirty) setDirty(true);
  return true;
};

const appendModuleCard = (module = {}, options = {}) => {
  const node = moduleTemplate.content.cloneNode(true);
  const card = node.querySelector('.module-card');
  const keyInput = card.querySelector('.module-key');
  const orderInput = card.querySelector('.module-order');
  const contentArea = card.querySelector('.module-content');
  const fileInput = card.querySelector('.module-file');

  const { lockedKey = false, allowDuplicate = true } = options;

  keyInput.value = module.module_key ?? '';
  orderInput.value = module.order_index ?? '';
  contentArea.value = module.content
    ? typeof module.content === 'string'
      ? module.content
      : JSON.stringify(module.content, null, 2)
    : '';

  if (lockedKey) {
    keyInput.readOnly = true;
    keyInput.title = 'Chiave definita dal template';
  }

  const markDirty = () => setDirty(true);
  keyInput.addEventListener('input', markDirty);
  orderInput.addEventListener('input', markDirty);
  contentArea.addEventListener('input', markDirty);

  contentArea.addEventListener('focus', () => {
    lastFocusedModuleArea = contentArea;
  });

  contentArea.addEventListener('paste', (event) => {
    const text = event.clipboardData?.getData('text');
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      event.preventDefault();
      contentArea.value = JSON.stringify(parsed, null, 2);
      showToast(`JSON incollato in ${keyInput.value || 'modulo'}`, 'success');
      markDirty();
    } catch (error) {
      // lascia comportamento default per testo non JSON
    }
  });

  card.querySelector('.module-import').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      contentArea.value = ev.target?.result ?? '';
      markDirty();
      try {
        JSON.parse(contentArea.value);
        showToast(`JSON caricato in ${keyInput.value || 'modulo'}`, 'success');
      } catch (error) {
        showToast(`JSON caricato ma non valido: ${error.message}`, 'error');
      }
    };
    reader.onerror = () => showToast('Impossibile leggere il file JSON', 'error');
    reader.readAsText(file);
  });

  card.querySelector('.module-validate').addEventListener('click', () => {
    try {
      JSON.parse(contentArea.value);
      showToast('JSON valido', 'success');
    } catch (error) {
      showToast(`JSON non valido: ${error.message}`, 'error');
    }
  });

  const duplicateBtnEl = card.querySelector('.module-duplicate');
  duplicateBtnEl.disabled = !allowDuplicate;
  duplicateBtnEl.addEventListener('click', () => {
    if (!allowDuplicate) {
      showToast('Duplicazione disabilitata per i moduli del template', 'info');
      return;
    }
    appendModuleCard({
      module_key: `${keyInput.value || 'modulo'}-copy`,
      order_index: orderInput.value === '' ? null : Number(orderInput.value),
      content: (() => {
        try {
          return JSON.parse(contentArea.value);
  } catch {
          return contentArea.value;
        }
      })()
    });
    showToast('Modulo duplicato', 'info');
    setDirty(true);
  });

  card.querySelector('.module-remove').addEventListener('click', () => {
    card.remove();
    if (!modulesContainer.querySelector('.module-card')) {
      renderModulesEmptyState();
    }
    setDirty(true);
  });

  modulesContainer.appendChild(card);
};

const collectModules = () => {
  const cards = modulesContainer.querySelectorAll('.module-card');
  if (!cards.length) return [];

  const modules = [];
  const seenKeys = new Set();

  for (const card of cards) {
    const key = card.querySelector('.module-key').value.trim();
    const orderValue = card.querySelector('.module-order').value.trim();
    const contentText = card.querySelector('.module-content').value.trim();

    if (!key) {
      showToast('Ogni modulo deve avere una chiave', 'error');
      setStatusBannerMessage(
        'error',
        'Modulo senza chiave',
        'Assegna una chiave univoca a ciascun modulo prima di salvare.'
      );
      return null;
    }
    if (seenKeys.has(key)) {
      showToast(`Chiave duplicata: ${key}`, 'error');
      setStatusBannerMessage(
        'error',
        'Chiave duplicata',
        `La chiave ${key} ├¿ gi├á utilizzata. Usa identificativi distinti per ogni modulo.`
      );
      return null;
    }
    seenKeys.add(key);

    if (!contentText) {
      showToast(`Modulo ${key}: contenuto mancante`, 'error');
      setStatusBannerMessage(
        'error',
        'Contenuto mancante',
        `Il modulo ${key} non contiene dati. Incolla o carica il JSON prima di salvare.`
      );
      return null;
    }

    let content;
    try {
      content = JSON.parse(contentText);
    } catch (error) {
      showToast(`Modulo ${key}: JSON non valido (${error.message})`, 'error');
      setStatusBannerMessage(
        'error',
        'JSON non valido',
        `Correggi il formato JSON del modulo ${key} e riprova.`
      );
      return null;
    }

    modules.push({
      module_key: key,
      order_index: orderValue === '' ? null : Number(orderValue),
      content
    });
  }

  return modules;
};

const validateModulesForType = (modules, type, options = {}) => {
  const template = REPORT_TEMPLATES[type];
  if (!template) return true;

  if (options.publish) {
    const hasHeader = modules.some((module) => module.module_key === 'header');
    if (!hasHeader) {
      showToast('Per pubblicare il report ├¿ necessario compilare almeno il modulo header.', 'error');
      setStatusBannerMessage(
        'warning',
        'Modulo obbligatorio mancante',
        'Compila il modulo header prima di pubblicare il report.'
      );
      return false;
    }
  }

  return true;
};

const clearEditor = () => {
  activeReport = null;
  reportTypeEl.value = DEFAULT_REPORT_TYPE;
  reportSlugEl.value = '';
  reportTitleEl.value = '';
  reportStatusEl.value = 'draft';
  reportPublishedAtEl.value = '';
  reportNotesEl.value = '';
  chartPathEl.value = '';
  chartFileEl.value = '';
  chartPreviewEl.style.display = 'none';
  chartPreviewEl.src = '';
  openChartBtn.disabled = true;
  openChartBtn.setAttribute('aria-disabled', 'true');
  currentChartSignedUrl = null;
  uploadChartBtn.disabled = false;
  chartUploadArea.classList.remove('drop-active');
  lastSavedAt = null;
  duplicateBtn.disabled = true;
  deleteBtn.disabled = true;
  renderModulesEmptyState();
  syncTemplateControls(DEFAULT_REPORT_TYPE);
  applyTemplateToModules(DEFAULT_REPORT_TYPE, { skipConfirm: true, markDirty: false });
  suggestIdentifiers({ force: true, markDirty: false });
  resetDirty();
};

const renderReportsList = () => {
  reportsListEl.innerHTML = '';
  if (!filteredReports.length) {
    reportsListEl.innerHTML = '<div class="list-empty">Nessun report trovato.</div>';
      return;
    }
  filteredReports.forEach((report) => {
    const card = document.createElement('article');
    card.className = 'report-card';
    if (activeReport && activeReport.id === report.id) {
      card.classList.add('active');
    }
    const typeLabel = REPORT_TEMPLATES[report.report_type]?.label ?? report.report_type;
    card.innerHTML = `
      <div class="report-card-header">
        <strong>${report.title || 'Senza titolo'}</strong>
        <span class="status-pill ${statusClasses[report.status] || ''}">${statusLabels[report.status] || report.status}</span>
      </div>
      <div class="report-meta">
        <span class="type-pill">${typeLabel}</span>
        <span>slug: <code>${report.slug}</code></span>
        <span>moduli: ${report.modules_count}</span>
        <span>pubblicato: ${formatDateTimeHuman(report.published_at)}</span>
        <span>aggiornato: ${formatDateTimeHuman(report.updated_at)}</span>
      </div>
    `;
    card.addEventListener('click', async () => {
      if (isDirty && !confirm('Ci sono modifiche non salvate. Procedere comunque?')) return;
      try {
        await selectReport(report.id);
      } catch (error) {
        console.error('[Dashboard] errore nella selezione del report', error);
        showToast('Errore durante la selezione del report', 'error');
      }
    });
    reportsListEl.appendChild(card);
  });
};

const loadReports = async () => {
  if (!currentUser) return;
  const requestId = ++reportsRequestSeq;
  const { data, error } = await supabase
    .from('reports')
    .select('id, slug, title, status, report_type, chart_path, notes, published_at, updated_at, report_modules(count)')
    .order('updated_at', { ascending: false });

  if (requestId !== reportsRequestSeq) {
    return;
  }

  if (error) {
    console.error(error);
    reports = [];
    filteredReports = [];
    renderReportsList();
    showToast('Errore nel caricamento dei report', 'error');
    return;
  }

  reports = data.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    report_type: row.report_type,
    chart_path: row.chart_path,
    notes: row.notes,
    published_at: row.published_at,
    updated_at: row.updated_at,
    modules_count: row.report_modules?.[0]?.count ?? 0
  }));

  filteredReports = reports;
  renderReportsList();
};

const updateChartPreview = async (path) => {
  currentChartSignedUrl = null;
  if (!path) {
    chartPreviewEl.style.display = 'none';
    chartPreviewEl.src = '';
    openChartBtn.disabled = true;
    openChartBtn.setAttribute('aria-disabled', 'true');
    return;
  }

  const isExternal = /^https?:\/\//i.test(path);
  if (isExternal) {
    chartPreviewEl.src = path;
    chartPreviewEl.style.display = 'block';
    openChartBtn.disabled = false;
    openChartBtn.removeAttribute('aria-disabled');
    currentChartSignedUrl = path;
    return;
  }

  const { data, error } = await supabase.storage
    .from(REPORTS_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) {
    console.error(error);
    showToast('Impossibile generare il link del chart', 'error');
    chartPreviewEl.style.display = 'none';
    chartPreviewEl.src = '';
    openChartBtn.disabled = true;
    openChartBtn.setAttribute('aria-disabled', 'true');
    return;
  }
  currentChartSignedUrl = data.signedUrl;
  chartPreviewEl.src = data.signedUrl;
  chartPreviewEl.style.display = 'block';
  openChartBtn.disabled = false;
  openChartBtn.removeAttribute('aria-disabled');
};

const selectReport = async (id) => {
  const requestId = ++reportDetailsRequestSeq;
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();

  if (requestId !== reportDetailsRequestSeq) {
    return;
  }

  if (reportError) {
    console.error(reportError);
    showToast('Errore nel recupero del report', 'error');
    return;
  }

  const { data: modules, error: modulesError } = await supabase
    .from('report_modules')
    .select('id, module_key, content, order_index')
    .eq('report_id', id)
    .order('order_index', { ascending: true, nullsFirst: true });

  if (requestId !== reportDetailsRequestSeq) {
    return;
  }

  if (modulesError) {
    console.error(modulesError);
    showToast('Errore nel recupero dei moduli', 'error');
    return;
  }

  activeReport = report;
  reportTypeEl.value = report.report_type || DEFAULT_REPORT_TYPE;
  reportSlugEl.value = report.slug || '';
  reportTitleEl.value = report.title || '';
  reportStatusEl.value = report.status || 'draft';
  reportPublishedAtEl.value = formatDateTimeLocal(report.published_at);
  reportNotesEl.value = report.notes || '';
  chartPathEl.value = report.chart_path || '';
  chartFileEl.value = '';
  await updateChartPreview(report.chart_path);

  const moduleList = Array.isArray(modules) ? modules : [];

  modulesContainer.innerHTML = '';
  if (moduleList.length) {
    moduleList.forEach((module) =>
      appendModuleCard(module, {
        lockedKey: REPORT_TEMPLATES[report.report_type]?.modules?.length > 0,
        allowDuplicate: report.report_type === 'custom'
      })
    );
  } else {
    renderModulesEmptyState();
  }

  syncTemplateControls(report.report_type || DEFAULT_REPORT_TYPE);
  lastSavedAt = report.updated_at ? new Date(report.updated_at) : null;
  duplicateBtn.disabled = false;
  deleteBtn.disabled = false;
  resetDirty();
  renderReportsList();
};

const sanitizeFilename = (filename, fallback = 'chart.png') => {
  if (!filename) return fallback;
  return filename.replace(/[^a-zA-Z0-9._-]/g, '-');
};

const uploadChartFile = async (file) => {
  const slug = reportSlugEl.value.trim();
  if (!slug) {
    showToast('Imposta lo slug prima di caricare il chart', 'error');
    return false;
  }
  uploadChartBtn.disabled = true;
  try {
    const sanitizedName = sanitizeFilename(file.name, `chart-${Date.now()}.png`);
    const path = `${slug}/${Date.now()}-${sanitizedName}`;
    const { error } = await supabase.storage
      .from(REPORTS_BUCKET)
      .upload(path, file, { upsert: true, cacheControl: '3600' });
    if (error) throw error;
    chartPathEl.value = path;
    await updateChartPreview(path);
    setDirty(true);
    showToast('Chart caricato con successo', 'success');
    return true;
  } catch (error) {
    console.error(error);
    showToast(`Upload chart fallito: ${error.message}`, 'error');
    return false;
  } finally {
    uploadChartBtn.disabled = false;
  }
};

const uploadChart = async () => {
  const file = chartFileEl.files?.[0];
  if (!file) {
    showToast('Seleziona un file immagine', 'error');
    return;
  }
  await uploadChartFile(file);
};

const handleChartPaste = async (event) => {
  const clipboard = event.clipboardData;
  if (!clipboard) return;

  const imageItem = Array.from(clipboard.items || []).find((item) => item.type?.startsWith('image/'));
  if (imageItem) {
    event.preventDefault();
    const file = imageItem.getAsFile();
    if (file) {
      const ext = file.type.split('/')[1] || 'png';
      const renamed = new File([file], `clipboard-${Date.now()}.${ext}`, { type: file.type });
      await uploadChartFile(renamed);
    }
    return;
  }

  const text = clipboard.getData('text');
  if (text) {
    event.preventDefault();
    const trimmed = text.trim();
    chartPathEl.value = trimmed;
    await updateChartPreview(trimmed);
    setDirty(true);
    showToast('Path chart impostato da clipboard', 'info');
  }
};

const handleChartDrop = async (event) => {
  event.preventDefault();
  chartDropzone.classList.remove('drop-active');
  const files = event.dataTransfer?.files;
  if (files && files.length) {
    const file = files[0];
    if (file.type.startsWith('image/')) {
      await uploadChartFile(file);
    } else {
      showToast('Il file trascinato non ├¿ unÔÇÖimmagine', 'error');
    }
    return;
  }
  const text = event.dataTransfer?.getData('text');
  if (text) {
    chartPathEl.value = text.trim();
    await updateChartPreview(text.trim());
    setDirty(true);
    showToast('Path chart impostato dal drop', 'info');
  }
};

const saveReport = async ({ publish }) => {
  console.log('[Dashboard] saveReport start', { publish });
  let bannerLocked = false;
  const actionMode = publish ? 'publish' : 'save';
  const slug = reportSlugEl.value.trim();
  const title = reportTitleEl.value.trim();
  if (!slug || !title) {
    showToast('Slug e titolo sono obbligatori', 'error');
    setStatusBannerMessage(
      'error',
      'Dati mancanti',
      'Compila sia lo slug sia il titolo prima di salvare o pubblicare.'
    );
    bannerLocked = true;
    console.log('[Dashboard] saveReport abort: missing slug/title', { slug, title });
    return;
  }

  const modules = collectModules();
  if (modules === null) {
    setStatusBannerMessage(
      'error',
      'Moduli incompleti',
      'Correggi i moduli segnalati prima di procedere con il salvataggio.'
    );
    bannerLocked = true;
    console.log('[Dashboard] saveReport abort: collectModules returned null');
    return;
  }
  console.log('[Dashboard] saveReport collected modules', modules);
  if (!validateModulesForType(modules, reportTypeEl.value, { publish })) {
    bannerLocked = true;
    console.log('[Dashboard] saveReport abort: validation failed', { publish, type: reportTypeEl.value });
    return;
  }

  const reportPayload = {
    slug,
    title,
    report_type: reportTypeEl.value,
    status: publish ? 'active' : reportStatusEl.value,
    chart_path: chartPathEl.value.trim() || null,
    notes: reportNotesEl.value.trim() || null,
    published_at: publish
      ? new Date().toISOString()
      : reportPublishedAtEl.value
        ? new Date(reportPublishedAtEl.value).toISOString()
        : null
  };

  setSavingState(true, actionMode);
  setStatusBannerMessage(
    'info',
    publish ? 'Pubblicazione in corso' : 'Salvataggio in corso',
    'Attendi qualche secondo: sincronizziamo i dati con Supabase.'
  );
  bannerLocked = true;

  try {
    const isNew = !activeReport;
    console.log('[Dashboard] saveReport upsert', { isNew, reportPayload });
    const { data: savedReport, error: saveError } = isNew
      ? await supabase.from('reports').insert(reportPayload).select().single()
      : await supabase.from('reports').update(reportPayload).eq('id', activeReport.id).select().single();
    console.log('[Dashboard] saveReport upsert result', { savedReport, saveError });

    if (saveError) {
      console.error(saveError);
      showToast('Errore durante il salvataggio del report', 'error');
      setStatusBannerMessage(
        'error',
        'Errore durante il salvataggio',
        'Il server ha rifiutato la richiesta. Riprova o verifica i permessi.'
      );
      bannerLocked = true;
      console.log('[Dashboard] saveReport abort: saveError', saveError);
      return;
    }

    const reportId = savedReport.id;
    console.log('[Dashboard] saveReport saved report', savedReport);

    const { error: deleteError } = await supabase
      .from('report_modules')
      .delete()
      .eq('report_id', reportId);

    if (deleteError) {
      console.error(deleteError);
      showToast('Errore nella sostituzione dei moduli', 'error');
      setStatusBannerMessage(
        'error',
        'Errore sui moduli',
        'Non ├¿ stato possibile sostituire i moduli esistenti. Riprova pi├╣ tardi.'
      );
      bannerLocked = true;
      console.log('[Dashboard] saveReport abort: deleteError', deleteError);
      return;
    }

    if (modules.length) {
      const inserts = modules.map((module, index) => ({
        report_id: reportId,
        module_key: module.module_key,
        order_index: module.order_index ?? index,
        content: module.content
      }));
      console.log('[Dashboard] saveReport inserting modules', inserts);
      const { error: insertError } = await supabase.from('report_modules').insert(inserts);
      if (insertError) {
        console.error(insertError);
        showToast('Errore durante l\'inserimento dei moduli', 'error');
        setStatusBannerMessage(
          'error',
          'Errore durante l\'inserimento',
          'Alcuni moduli non sono stati salvati. Verifica il JSON e riprova.'
        );
        bannerLocked = true;
        console.log('[Dashboard] saveReport abort: insertError', insertError);
    return;
  }
      }

    console.log('[Dashboard] saveReport success', { publish });
    showToast(publish ? 'Report pubblicato' : 'Report salvato', 'success');
    const completionTime = new Date();
    lastSavedAt = completionTime;
    await loadReports();
    await selectReport(reportId);
    setStatusBannerMessage(
      'success',
      publish ? 'Report pubblicato' : 'Bozza salvata',
      `${publish ? 'Il report ├¿ ora online.' : 'La bozza ├¿ stata sincronizzata.'} Ultimo salvataggio alle ${formatStatusTime(completionTime)}.`
    );
    bannerLocked = true;
  } catch (error) {
    console.error('[Dashboard] saveReport exception', error);
    showToast('Errore imprevisto durante il salvataggio', 'error');
    setStatusBannerMessage(
      'error',
      'Errore imprevisto',
      'Si ├¿ verificato un problema non previsto. Riprova pi├╣ tardi.'
    );
    bannerLocked = true;
  } finally {
    setSavingState(false, actionMode);
    if (!bannerLocked) {
      updateStatusAfterDirtyChange();
    }
  }
};

const deleteReport = async () => {
  if (!activeReport) return;
  if (!confirm('Eliminare definitivamente il report?')) return;

  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', activeReport.id);

  if (error) {
    console.error(error);
    showToast('Errore durante l\'eliminazione', 'error');
    return;
  }

  showToast('Report eliminato', 'success');
  await loadReports();
  clearEditor();
};

const duplicateReport = () => {
  if (!activeReport) return;
  reportSlugEl.value = `${activeReport.slug}-copy`;
  reportTitleEl.value = `${(activeReport.title || '').trim()} (copia)`.trim();
  reportStatusEl.value = 'draft';
  reportPublishedAtEl.value = '';
  chartPathEl.value = '';
  chartFileEl.value = '';
  chartPreviewEl.style.display = 'none';
  chartPreviewEl.src = '';
  openChartBtn.disabled = true;
  openChartBtn.setAttribute('aria-disabled', 'true');
  currentChartSignedUrl = null;
  activeReport = null;
  setDirty(true);
  showToast('Replica pronta. Ricorda di salvare con il nuovo slug.', 'info');
};

const updateAuthUI = async () => {
  const token = readStoredAdminToken();
  if (!token) {
    window.location.href = '/accesso.html?reason=missing_token';
    return;
  }

  try {
    const data = await fetchJSON(
      '/api/validate-dashboard-token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      },
      NETWORK_TIMEOUT_MS
    );

    if (!data?.ok) {
      clearStoredAdminToken();
      window.location.href = '/accesso.html?reason=invalid_token';
      return;
    }

    currentUser = {
      email: data.email || '',
      id: data.userId || null,
      planRole: data.planRole || null,
      validUntil: data.validUntil || null,
      token
    };

    authCard.classList.add('hidden');
    authLogged.classList.remove('hidden');
    appGrid.classList.remove('hidden');

    const adminCheck = await ensureAdminAccess({
      email: currentUser.email,
      userId: currentUser.id,
      planRole: currentUser.planRole,
      isAdmin: data.isAdmin
    });

    if (!adminCheck.allowed) {
      if (adminCheck.reason === 'lookup_failed') {
        showToast('Impossibile verificare i permessi admin', 'error');
      } else {
        showToast('Accesso negato: utente non abilitato', 'error');
      }
      clearStoredAdminToken();
      currentUser = null;
      reports = [];
      filteredReports = [];
      reportsListEl.innerHTML = '<div class="list-empty">Effettua l\'accesso per visualizzare i report.</div>';
      clearEditor();
      showUnauthorizedState(adminCheck.reason);
      return;
    }

    authUserBadge.textContent = `Connesso come ${currentUser.email}`;
    await loadReports();
    updateEditorBadge();
  } catch (err) {
    console.error('[Report Admin] Error validating token:', err);
    showUnauthorizedState('session_error');
  }
};

const login = async () => {
  // Redirect alla pagina di accesso - non gestiamo login qui
  window.location.href = '/accesso.html';
};

const logout = async (silent = false) => {
  clearStoredAdminToken();
  currentUser = null;
  isAdmin = false;
  reportsRequestSeq = 0;
  reportDetailsRequestSeq = 0;
  reports = [];
  filteredReports = [];
  activeReport = null;
  renderModulesEmptyState();
  authUserBadge.textContent = '';
  authCard?.classList.remove('hidden');
  authLogged?.classList.add('hidden');
  appGrid?.classList.add('hidden');
  if (!silent) {
    showToast('Disconnesso', 'info');
  }
  window.location.href = '/accesso.html';
};

// Login button rimosso - ora redirect a accesso.html
// loginBtn.addEventListener('click', login);
logoutBtn.addEventListener('click', logout);
refreshSessionBtn.addEventListener('click', updateAuthUI);

const ensureAdminAccess = async (tokenMeta = {}) => {
  if (!currentUser || !currentUser.email) {
    return { allowed: false, reason: 'missing_user' };
  }

  const normalizedEmail = (tokenMeta.email || currentUser.email || '').trim().toLowerCase();
  const normalizedPlanRole = (tokenMeta.planRole || currentUser.planRole || '').trim().toLowerCase();

  if (typeof tokenMeta.isAdmin === 'boolean') {
    isAdmin = tokenMeta.isAdmin;
    return { allowed: tokenMeta.isAdmin, reason: tokenMeta.isAdmin ? 'api_flag' : 'not_admin' };
  }

  if (normalizedPlanRole && ADMIN_PLAN_ROLES.has(normalizedPlanRole)) {
    isAdmin = true;
    return { allowed: true, reason: 'admin_plan' };
  }

  try {
    const { data: adminEmailData, error: adminError } = await supabase
      .from('admin_emails')
      .select('email')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (adminError) {
      console.error('[Report Admin] Error checking admin_emails:', adminError);
      return { allowed: false, reason: 'lookup_failed' };
    }

    if (adminEmailData) {
      isAdmin = true;
      return { allowed: true, reason: 'email_whitelist' };
    }
  } catch (error) {
    console.error('[Report Admin] Error checking admin emails:', error);
    return { allowed: false, reason: 'lookup_failed' };
  }

  const candidateUserId = tokenMeta.userId || currentUser.id;
  if (candidateUserId) {
    try {
      const { data: adminUserData, error: adminUserError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', candidateUserId)
        .maybeSingle();

      if (adminUserError) {
        console.error('[Report Admin] Error checking admin_users:', adminUserError);
        return { allowed: false, reason: 'lookup_failed' };
      }

      if (adminUserData) {
        isAdmin = true;
        return { allowed: true, reason: 'legacy_user' };
      }
    } catch (error) {
      console.error('[Report Admin] Error verifying admin_users:', error);
      return { allowed: false, reason: 'lookup_failed' };
    }
  }

  return { allowed: false, reason: 'not_admin' };
};

refreshBtn.addEventListener('click', loadReports);
newReportBtn.addEventListener('click', () => {
  if (isDirty && !confirm('Ci sono modifiche non salvate. Procedere comunque?')) return;
  clearEditor();
  setDirty(false);
});

searchEl.addEventListener('input', () => {
  const query = searchEl.value.trim().toLowerCase();
  filteredReports = reports.filter((report) => (
    report.slug.toLowerCase().includes(query) ||
    (report.title && report.title.toLowerCase().includes(query)) ||
    report.status.toLowerCase().includes(query)
  ));
  renderReportsList();
});

addModuleBtn.addEventListener('click', () => {
  appendModuleCard();
  setDirty(true);
});

resetTemplateBtn.addEventListener('click', () => {
  applyTemplateToModules(reportTypeEl.value, { skipConfirm: false });
});

if (generateIdentifiersBtn) {
  generateIdentifiersBtn.addEventListener('click', () => {
    suggestIdentifiers({ force: true, markDirty: true });
  });
}

modulesContainer.addEventListener('input', () => setDirty(true));

reportTypeEl.addEventListener('change', () => {
  const nextType = reportTypeEl.value;
  const template = REPORT_TEMPLATES[nextType];
  if (!template) {
    showToast('Template non disponibile', 'error');
    reportTypeEl.value = currentTemplateType;
    return;
  }
  if (template.modules.length === 0) {
    showToast('Questo template sar├á disponibile a breve', 'info');
    reportTypeEl.value = currentTemplateType;
    return;
  }
  const applied = applyTemplateToModules(nextType, { skipConfirm: false });
  if (applied) syncTemplateControls(nextType);
});

chartPathEl.addEventListener('input', () => setDirty(true));
chartPathEl.addEventListener('blur', async () => {
  const path = chartPathEl.value.trim();
  await updateChartPreview(path);
});
chartPathEl.addEventListener('paste', handleChartPaste);

chartDropzone.addEventListener('dragover', (event) => {
  event.preventDefault();
  chartDropzone.classList.add('drop-active');
});
chartDropzone.addEventListener('dragleave', () => chartDropzone.classList.remove('drop-active'));
chartDropzone.addEventListener('drop', handleChartDrop);
chartUploadArea.addEventListener('click', () => chartFileEl.click());
chartFileEl.addEventListener('change', uploadChart);
chartUploadArea.addEventListener('dragover', (event) => {
  event.preventDefault();
  chartUploadArea.classList.add('drop-active');
});
chartUploadArea.addEventListener('dragleave', () => chartUploadArea.classList.remove('drop-active'));
chartUploadArea.addEventListener('drop', async (event) => {
  event.preventDefault();
  chartUploadArea.classList.remove('drop-active');
  const files = event.dataTransfer?.files;
  if (files && files.length) {
    const file = files[0];
    if (file.type.startsWith('image/')) {
      await uploadChartFile(file);
    } else {
      showToast('Il file trascinato non ├¿ unÔÇÖimmagine', 'error');
    }
  }
});

uploadChartBtn.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  chartFileEl.click();
});
openChartBtn.addEventListener('click', () => {
  if (openChartBtn.disabled || !currentChartSignedUrl) {
    showToast('Carica o imposta un chart per aprirlo', 'info');
    return;
  }
  window.open(currentChartSignedUrl, '_blank', 'noopener');
});

saveDraftBtn.addEventListener('click', () => saveReport({ publish: false }));
publishBtn.addEventListener('click', () => saveReport({ publish: true }));
duplicateBtn.addEventListener('click', duplicateReport);
deleteBtn.addEventListener('click', deleteReport);

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    saveReport({ publish: false });
  }
});

document.addEventListener('paste', async (event) => {
  const target = event.target;
  const isEditableTarget = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
  if (isEditableTarget) return; // i campi gestiscono gi├á la loro logica

  const clipboard = event.clipboardData;
  if (!clipboard) return;

  const imageItem = Array.from(clipboard.items || []).find((item) => item.type?.startsWith('image/'));
  if (imageItem) {
    const file = imageItem.getAsFile();
    if (file) {
      event.preventDefault();
      const ext = file.type.split('/')[1] || 'png';
      const renamed = new File([file], `clipboard-${Date.now()}.${ext}`, { type: file.type });
      await uploadChartFile(renamed);
    }
    return;
  }

  const text = clipboard.getData('text');
  if (!text) return;

  if (lastFocusedModuleArea) {
    try {
      const parsed = JSON.parse(text);
      event.preventDefault();
      lastFocusedModuleArea.value = JSON.stringify(parsed, null, 2);
      showToast('JSON incollato nel modulo attivo', 'success');
      setDirty(true);
      return;
    } catch {
      // se non ├¿ JSON continuo
    }
  }

  const trimmed = text.trim();
  if (/\.(png|jpe?g|webp)$/i.test(trimmed) || trimmed.includes('/')) {
    event.preventDefault();
    chartPathEl.value = trimmed;
    await updateChartPreview(trimmed);
    setDirty(true);
    showToast('Path chart impostato da clipboard', 'info');
  }
});

const init = async () => {
  renderModulesEmptyState();
  // Verifica token solo una volta all'inizio
  await updateAuthUI();
  // Non serve pi├╣: usiamo token invece di Supabase Auth
  // supabase.auth.onAuthStateChange(() => updateAuthUI());
};

init();
