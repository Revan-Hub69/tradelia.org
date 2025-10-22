// /assets/js/components/share.js
export function initShare(){ /* noop: on-demand */ }

async function shorten_isgd(longUrl, { timeoutMs=5000 }={}){
  const ctrl=new AbortController(); const t=setTimeout(()=>ctrl.abort(),timeoutMs);
  try{
    const api=`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`;
    const res=await fetch(api,{signal:ctrl.signal}); if(!res.ok) throw new Error('HTTP '+res.status);
    const j=await res.json(); if(j.shorturl) return j.shorturl; throw new Error(j.errormessage||'is.gd error');
  } finally { clearTimeout(t); }
}

export function openShare({ longUrl, title, text }){
  const backdrop=document.createElement('div');
  backdrop.className='fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50';
  const card=document.createElement('div');
  card.className='bg-white rounded-xl shadow-2xl p-5 w-[92%] max-w-lg text-left border border-slate-200';

  let currentUrl=longUrl, cachedShort=null;
  const enc=encodeURIComponent;
  const targets=(u)=>([
    { label:'WhatsApp',   href:`https://wa.me/?text=${enc(text+' ') + enc(u)}`, icon:'message-square' },
    { label:'Telegram',   href:`https://t.me/share/url?url=${enc(u)}&text=${enc(text)}`, icon:'send' },
    { label:'X (Twitter)',href:`https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(u)}`, icon:'twitter' },
    { label:'LinkedIn',   href:`https://www.linkedin.com/sharing/share-offsite/?url=${enc(u)}`, icon:'linkedin' },
    { label:'Reddit',     href:`https://www.reddit.com/submit?url=${enc(u)}&title=${enc(title)}`, icon:'square' },
    { label:'Facebook',   href:`https://www.facebook.com/sharer/sharer.php?u=${enc(u)}`, icon:'facebook' },
    { label:'Email',      href:`mailto:?subject=${enc(title)}&body=${enc(text)}%0A%0A${enc(u)}`, icon:'mail' },
  ]);

  card.innerHTML = `
    <div class="flex items-start justify-between gap-3 mb-3">
      <div>
        <h2 class="font-semibold text-slate-800 leading-tight">${title}</h2>
        <p class="text-xs text-slate-500 mt-0.5">Condividi il link del report</p>
      </div>
      <button id="closePopup" class="btn"><i data-lucide="x"></i><span class="hidden sm:inline">Chiudi</span></button>
    </div>
    <div class="flex items-center gap-2 mb-3">
      <label class="text-sm text-slate-700 flex items-center gap-2">
        <input id="useShort" type="checkbox" class="h-4 w-4 accent-sky-600"><span>Usa link breve (is.gd)</span>
      </label>
      <span id="shortStatus" class="text-xs text-slate-400">(non attivo)</span>
    </div>
    <div class="space-y-3 sm:space-y-4">
      <div class="mx-auto w-[180px]">
        <img id="qrImg" alt="QR" class="w-full h-auto rounded-lg border border-slate-200 shadow-sm bg-white p-2"
             src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${enc(currentUrl)}" />
      </div>
      <div id="shareGrid" class="grid grid-cols-2 sm:grid-cols-3 gap-2 justify-items-center sm:justify-items-start"></div>
      <div id="urlBox" class="bg-slate-50 border border-slate-200 text-[12px] p-2 rounded-md font-mono select-all break-all">${currentUrl}</div>
      <div class="flex gap-2">
        <button id="copyLink" class="sbtn"><i data-lucide="copy"></i><span>Copia link</span></button>
        <a id="openNew" class="sbtn" href="${currentUrl}" target="_blank" rel="noopener"><i data-lucide="external-link"></i><span>Apri</span></a>
      </div>
    </div>`;
  const renderTargets=(u)=>{
    const grid=card.querySelector('#shareGrid');
    grid.innerHTML=targets(u).map(t=>`<a class="sbtn" href="${t.href}" target="_blank" rel="noopener"><i data-lucide="${t.icon}"></i><span>${t.label}</span></a>`).join('');
    lucide.createIcons();
  };
  const updateAll=(u)=>{
    card.querySelector('#urlBox').textContent=u;
    card.querySelector('#openNew').href=u;
    card.querySelector('#qrImg').src=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${enc(u)}`;
    renderTargets(u);
  };
  renderTargets(currentUrl);

  const close=()=>backdrop.remove();
  backdrop.addEventListener('click',(e)=>{ if(e.target===backdrop) close(); });
  card.querySelector('#closePopup').addEventListener('click', close);
  card.querySelector('#copyLink').addEventListener('click', async ()=>{
    await navigator.clipboard.writeText(card.querySelector('#urlBox').textContent).catch(()=>{});
    const btn=card.querySelector('#copyLink'); btn.innerHTML='<i data-lucide="check"></i><span>Copiato</span>'; lucide.createIcons(); setTimeout(close, 900);
  });
  card.querySelector('#useShort').addEventListener('change', async (e)=>{
    const st=card.querySelector('#shortStatus');
    if(e.target.checked){
      st.textContent='creo link breve…'; st.className='text-xs text-sky-600';
      try{ if(!cachedShort) cachedShort=await shorten_isgd(longUrl); updateAll(cachedShort); st.textContent='attivo (is.gd)'; st.className='text-xs text-emerald-600'; }
      catch{ updateAll(longUrl); e.target.checked=false; st.textContent='non disponibile (fallback)'; st.className='text-xs text-amber-600'; }
    }else{ updateAll(longUrl); st.textContent='(non attivo)'; st.className='text-xs text-slate-400'; }
  });

  backdrop.appendChild(card); document.body.appendChild(backdrop); lucide.createIcons();
}
