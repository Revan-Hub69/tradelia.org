// assets/js/boot.js
(function(){
  function showOverlay(msg){
    try{
      const b = document.createElement('div');
      b.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;padding:16px';
      const c = document.createElement('div');
      c.style.cssText = 'max-width:880px;width:92%;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px;font:14px/1.45 system-ui,Segoe UI,Arial;white-space:pre-wrap';
      c.innerHTML = '<div style="font-weight:700;margin-bottom:6px;color:#991b1b">Errore runtime</div>' +
                    '<div style="color:#111827">'+ String(msg) +'</div>';
      b.appendChild(c);
      document.body.appendChild(b);
    }catch{ alert('Errore runtime: ' + msg); }
  }

  window.addEventListener('error', e => showOverlay(e.message || e.error || 'error'));
  window.addEventListener('unhandledrejection', e => showOverlay(e.reason || 'unhandledrejection'));

  document.addEventListener('DOMContentLoaded', ()=>{
    const hint = document.createElement('div');
    hint.textContent = 'BOOT OK';
    hint.style.cssText = 'position:fixed;bottom:10px;left:10px;background:#0ea5e9;color:#fff;padding:4px 8px;border-radius:6px;font:12px/1.2 system-ui;z-index:9999;opacity:.9';
    document.body.appendChild(hint);
    setTimeout(()=> hint.remove(), 1200);
  });

  (async function preflight(){
    // *** IMPORT RELATIVI ALLA POSIZIONE DI QUESTO FILE (/assets/js/) ***
    const must = [
      './components/header.js',
      './components/helpx.js',
      './components/share.js',
      './components/drawer.js',
      './modules/headerTicker.js',
      './modules/f1b.js',
      './modules/f2.js',
      './utils/qs.js',
      './utils/tone.js',
      './utils/stateBadge.js'
    ];
    for (const p of must) {
      try { await import(p); }
      catch (e) { showOverlay(`Import fallito: ${p}\n${e?.message || e}`); throw e; }
    }
    if (!window.lucide || typeof window.lucide.createIcons !== 'function') {
      console.warn('Lucide non pronto (window.lucide assente).');
    }
  })();
})();
