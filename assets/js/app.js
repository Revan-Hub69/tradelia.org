// assets/js/app.js
import { initHeader }       from '../js/components/header.js';
import { initHelpX }        from '../js/components/helpx.js';
import { initShare }        from '../js/components/share.js';
import { initDrawerAPI }    from '../js/components/drawer.js';
import { initHeaderTicker } from '../js/modules/headerTicker.js';
import { mountF1B }         from '../js/modules/f1b.js';
import { mountF2 }          from '../js/modules/f2.js';
import { getDataURL }       from '../js/utils/qs.js';

// Lucide safe
try { window.lucide?.createIcons?.(); } catch {}

initDrawerAPI();
initHeader();
initHelpX();
initShare();

// Layout controls
const cont = document.getElementById('mod-container');
document.getElementById('view-grid')?.addEventListener('click', (e)=>{
  cont.dataset.view='grid';
  e.currentTarget.setAttribute('aria-pressed','true');
  document.getElementById('view-list')?.setAttribute('aria-pressed','false');
  cont.className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2 lg:gap-3';
  try { window.lucide?.createIcons?.(); } catch {}
});
document.getElementById('view-list')?.addEventListener('click', (e)=>{
  cont.dataset.view='list';
  e.currentTarget.setAttribute('aria-pressed','true');
  document.getElementById('view-grid')?.setAttribute('aria-pressed','false');
  cont.className='space-y-1.5';
  try { window.lucide?.createIcons?.(); } catch {}
});

// Data load
(async function loadReport(){
  try{
    const url  = getDataURL();
    const res  = await fetch(url, { cache:'no-store' });
    if (!res.ok) throw new Error('Fetch JSON: ' + res.status + ' @ ' + url);
    const data = await res.json();

    // Header ticker
    initHeaderTicker(data?.Header || {});
    // Moduli
    const apiF1B = mountF1B(); apiF1B.update(data?.F1B || {});
    const apiF2  = mountF2();  apiF2.update(data?.F2  || {});

    try { window.lucide?.createIcons?.(); } catch {}
  }catch(err){
    const msg = `Errore caricamento dati: ${err.message}`;
    const box = document.getElementById('header-ticker');
    if (box) {
      box.innerHTML = `<div class="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">${msg}</div>`;
    } else {
      console.error(msg);
    }
  }
})();
