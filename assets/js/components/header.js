// /assets/js/components/header.js
import { openShare } from './share.js';

export function initHeader(){
  const el = document.getElementById('app-header');
  el.innerHTML = `
    <div class="max-w-7xl mx-auto px-3 sm:px-5 h-12 sm:h-14 flex items-center justify-between">
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <a href="/" class="shrink-0 text-lg sm:text-xl font-extrabold tracking-tight text-sky-900 hover:opacity-90 transition">
          <span class="text-slate-900">TRADELIA</span><span class="text-blue-600">&bull;AI</span>
        </a>
        <span class="text-slate-400 text-xs sm:text-sm truncate">Report Runtime</span>
      </div>
      <div class="flex items-center gap-1.5 sm:gap-2">
        <button id="btn-print" class="btn"><i data-lucide="printer"></i><span class="hidden sm:inline">Stampa / PDF</span></button>
        <button id="btn-share" class="btn"><i data-lucide="share-2"></i><span class="hidden sm:inline">Condividi</span></button>
      </div>
    </div>
  `;
  lucide.createIcons();
  el.querySelector('#btn-print')?.addEventListener('click', ()=> window.print());
  el.querySelector('#btn-share')?.addEventListener('click', ()=>{
    const urlObj = new URL(window.location.href);
    if (!urlObj.searchParams.get('id') && !urlObj.searchParams.get('data')) urlObj.searchParams.set('id', 'sample');
    const longUrl = urlObj.toString();
    openShare({ longUrl, title:'Tradelia · Report Runtime', text:'Guarda il report completo su Tradelia AI' });
  });
}
