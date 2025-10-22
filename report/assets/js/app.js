// /report/assets/js/app.js
// Orchestratore: carica manifest, sceglie UNA tra F1A/F1B, monta la card in #cards-grid

async function loadJSON(path){
  try{
    const r = await fetch(path, { cache: 'no-store' });
    if(!r.ok) return null;
    return await r.json();
  }catch(e){
    console.warn('loadJSON fail', path, e);
    return null;
  }
}

function hasF1A(d){ return d && typeof d.strategy_mode_tkr === 'string'; }
function hasF1B(d){ return d && typeof d.strategy_mode === 'string'; }

async function decideF1(base, cfg){
  const [a, b] = await Promise.all([
    loadJSON(`${base}/f1a.json`),
    loadJSON(`${base}/f1b.json`)
  ]);

  const mode   = (cfg?.mode || 'auto').toLowerCase();   // 'auto' | 'force'
  const prefer = (cfg?.prefer || 'b').toLowerCase();    // 'a' | 'b'

  if (mode === 'force'){
    if (prefer === 'a' && hasF1A(a)) return { key:'f1a', data:a };
    if (prefer === 'b' && hasF1B(b)) return { key:'f1b', data:b };
    return null;
  }

  // auto
  if (prefer === 'a'){
    if (hasF1A(a)) return { key:'f1a', data:a };
    if (hasF1B(b)) return { key:'f1b', data:b };
  } else {
    if (hasF1B(b)) return { key:'f1b', data:b };
    if (hasF1A(a)) return { key:'f1a', data:a };
  }
  return null;
}

async function mountReport(reportId){
  const base = `/report/reports/${reportId}`;
  const grid = document.getElementById('cards-grid');
  if (!grid){ console.error('#cards-grid non trovato'); return; }

  // Manifest di default se manca
  const manifest = await loadJSON(`${base}/manifest.json`) || {
    order: ['f1'],
    f1: { mode: 'auto', prefer: 'b' }
  };

  for (const slot of manifest.order){
    if (slot !== 'f1') { 
      // In questa fase montiamo solo F1; gli altri moduli (f2..f5, broker) arriveranno dopo
      continue; 
    }

    const pick = await decideF1(base, manifest.f1);
    if (!pick){ console.warn('Nessun F1 valido trovato'); continue; }

    try{
      const mod = await import(`/report/assets/js/modules/${pick.key}.js`);
      const el  = mod.renderCard(pick.data);
      grid.appendChild(el);
      mod.bindCard(el, pick.data, {
        base,
        openDrawer: (title, sub, html) => window.Tradelia?.Drawer?.open({ title, subtitle: sub, html })
      });
    }catch(e){
      console.error(`Errore import modulo ${pick.key}`, e);
    }
  }

  if (window.lucide) lucide.createIcons();
}

// Bootstrap: prendi id da ?id=...
(function(){
  const url = new URL(location.href);
  const reportId = url.searchParams.get('id') || 'sample-id';
  mountReport(reportId).catch(console.error);
})();
