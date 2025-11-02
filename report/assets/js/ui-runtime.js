// Tradelia · UI Runtime v4.0 — tooltip unificati, overlay, tema duale

const UI = (() => {
  const state = {
    glossary: null,
    openTT: null,
  };

  /* ---------- THEME ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('tradelia-theme', t); } catch {}
    const btn = document.getElementById('btn-theme');
    if (btn) btn.setAttribute('aria-pressed', String(t === 'light'));
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  }
  function initTheme() {
    let t = 'dark';
    try { t = localStorage.getItem('tradelia-theme') || 'dark'; } catch {}
    applyTheme(t);
    const btn = document.getElementById('btn-theme');
    if (btn) btn.addEventListener('click', toggleTheme);
  }

  /* ---------- GLOSSARY ---------- */
  async function loadGlossary() {
    if (state.glossary) return state.glossary;
    try {
      const res = await fetch('/report/assets/glossary.json');
      state.glossary = await res.json();
    } catch {
      state.glossary = {};
    }
    return state.glossary;
  }

  /* ---------- TOOLTIP (desktop popover / mobile sheet-lite) ---------- */
  function closeTT() {
    if (!state.openTT) return;
    state.openTT.btn?.setAttribute('aria-expanded', 'false');
    state.openTT.node.remove();
    state.openTT = null;
  }
  function trapClose(ev) {
    if (ev.key === 'Escape') closeTT();
  }
  function positionPopover(node, btn) {
    const r = btn.getBoundingClientRect();
    const n = node.getBoundingClientRect();
    const pad = 8;
    let top = r.bottom + pad;
    let left = Math.min(Math.max(r.left - (n.width/2) + (r.width/2), pad), window.innerWidth - n.width - pad);
    node.style.top = `${top}px`;
    node.style.left = `${left}px`;
    // arrow
    const arrow = document.createElement('div');
    arrow.className = 'tt-arrow';
    arrow.style.left = `${Math.min(Math.max((r.left + r.width/2) - left - 5, 10), n.width - 20)}px`;
    arrow.style.top = `-5px`;
    node.appendChild(arrow);
  }
  function buildTTContent(id, titleFallback) {
    const g = state.glossary?.[id] || {};
    const title = g.title || titleFallback || id;
    const what = g.what || 'Descrizione non disponibile.';
    const how  = g.how  || 'Indicazioni d’uso non disponibili.';
    const src  = g.source || 'Fonte non disponibile.';
    const root = document.createElement('div');
    root.className = 'tt';
    root.innerHTML = `
      <h4>${title}</h4>
      <section><h5>Cos’è</h5><p>${what}</p></section>
      <section><h5>Come si usa</h5><p>${how}</p></section>
      <section class="meta"><h5>Fonti</h5><p>${src}</p></section>
    `;
    return root;
  }
  async function onInfoClick(e) {
    const btn = e.currentTarget;
    const id = btn.getAttribute('data-info');
    if (!id) return;
    if (state.openTT?.btn === btn) { closeTT(); return; }
    closeTT();
    await loadGlossary();
    const node = buildTTContent(id, btn.getAttribute('aria-label'));
    document.body.appendChild(node);
    positionPopover(node, btn);
    state.openTT = { node, btn };
    btn.setAttribute('aria-expanded', 'true');
  }
  function bindInfoButtons(root = document) {
    root.querySelectorAll('.info-btn').forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
      btn.removeEventListener('click', onInfoClick);
      btn.addEventListener('click', onInfoClick);
    });
    document.addEventListener('keydown', trapClose);
    document.addEventListener('click', (ev) => {
      if (!state.openTT) return;
      const inside = state.openTT.node.contains(ev.target) || state.openTT.btn.contains(ev.target);
      if (!inside) closeTT();
    });
    window.addEventListener('resize', () => { if (state.openTT) positionPopover(state.openTT.node, state.openTT.btn); });
  }

  /* ---------- OVERLAYS (panel & legal) ---------- */
  function openOverlay(id) { document.getElementById(id)?.removeAttribute('hidden'); }
  function closeOverlay(id) { document.getElementById(id)?.setAttribute('hidden', ''); }
  function bindOverlays() {
    const p = document.getElementById('panel-overlay');
    p?.querySelectorAll('[data-overlay-close]').forEach(el => el.addEventListener('click', () => closeOverlay('panel-overlay')));
    const l = document.getElementById('legal-overlay');
    l?.querySelectorAll('[data-legal-close]').forEach(el => el.addEventListener('click', () => closeOverlay('legal-overlay')));
    document.getElementById('btn-privacy')?.addEventListener('click', async () => {
      document.getElementById('legal-title').textContent = 'Privacy';
      document.getElementById('legal-body').innerHTML = '<p>Informativa Privacy (versione breve). Nessun tracciamento esterno.</p>';
      openOverlay('legal-overlay');
    });
    document.getElementById('btn-mifid')?.addEventListener('click', async () => {
      document.getElementById('legal-title').textContent = 'MiFID';
      document.getElementById('legal-body').innerHTML = '<p>Materiale informativo/educativo. Non costituisce raccomandazione personalizzata (MiFID II).</p>';
      openOverlay('legal-overlay');
    });
  }

  /* ---------- PUBLIC API ---------- */
  return {
    init() { initTheme(); bindOverlays(); bindInfoButtons(); },
    applyTheme, bindInfoButtons,
    openPanel(){ openOverlay('panel-overlay'); },
    closePanel(){ closeOverlay('panel-overlay'); },
  };
})();

window.__TradeliaUI = UI;
document.addEventListener('DOMContentLoaded', () => {
  UI.init();
  const y = document.getElementById('footer-year');
  if (y) y.textContent = new Date().getFullYear();
});
