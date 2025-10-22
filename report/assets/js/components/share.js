// ======================================================
// TRADELIA • AI — Full Share Sheet (desktop + mobile)
// ======================================================
export function initShareSystem() {
  const btn = document.getElementById('btn-share');
  if (!btn) return;

  const sheet = document.createElement('div');
  sheet.id = 'share-sheet';
  sheet.className = 'share-sheet hidden noprint';
  sheet.innerHTML = `
    <div class="share-backdrop" data-close></div>
    <div class="share-panel">
      <header class="share-head">
        <h3>Condividi Report</h3>
        <button class="btn btn-sm" data-close><i data-lucide="x"></i></button>
      </header>

      <div class="share-body">
        <div class="share-linkbox">
          <input id="share-link" type="text" readonly />
          <button id="btn-copy" class="btn"><i data-lucide="copy"></i></button>
        </div>

        <div class="share-grid">
          ${renderPlatform('WhatsApp','whatsapp','https://api.whatsapp.com/send?text=')}
          ${renderPlatform('Telegram','send','https://t.me/share/url?url=')}
          ${renderPlatform('Discord','message-circle','https://discord.com/channels/@me')}
          ${renderPlatform('Email','mail','mailto:?subject=Tradelia%20Report&body=')}
          ${renderPlatform('LinkedIn','linkedin','https://www.linkedin.com/sharing/share-offsite/?url=')}
          ${renderPlatform('X / Twitter','twitter','https://twitter.com/intent/tweet?url=')}
          ${renderPlatform('SMS','sms','sms:?body=')}
          <button id="btn-qr" class="share-item" data-type="qr"><i data-lucide="qr-code"></i><span>QR Code</span></button>
        </div>

        <div id="qr-area" class="qr-area hidden"></div>
      </div>
    </div>
  `;
  document.body.appendChild(sheet);

  // QR generator (usa libreria inline base64)
  async function generateQR(text){
    const api=`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(text)}`;
    return `<img src="${api}" alt="QR code" class="mx-auto rounded-lg border border-[color:var(--br)] shadow-sm" />`;
  }

  function renderPlatform(name,icon,base){
    return `<button class="share-item" data-url="${base}" data-name="${name}">
      <i data-lucide="${icon}"></i><span>${name}</span>
    </button>`;
  }

  // Toggle
  const toggle = (show)=>{
    sheet.classList.toggle('hidden',!show);
    setTimeout(()=>lucide.createIcons(),50);
  };

  // Actions
  btn.addEventListener('click',()=>{
    $('#share-link').value = location.href;
    toggle(true);
  });
  sheet.addEventListener('click',e=>{
    if(e.target.closest('[data-close]')) toggle(false);
  });

  // Copy link
  $('#btn-copy').addEventListener('click',async ()=>{
    const link = $('#share-link').value;
    try{
      await navigator.clipboard.writeText(link);
      $('#btn-copy').innerHTML = `<i data-lucide="check"></i>`;
      lucide.createIcons();
      setTimeout(()=>$('#btn-copy').innerHTML=`<i data-lucide="copy"></i>`,1200);
    }catch(e){ alert('Copia fallita'); }
  });

  // Share click
  sheet.querySelectorAll('.share-item[data-url]').forEach(el=>{
    el.addEventListener('click',()=>{
      const base = el.dataset.url;
      const url = encodeURIComponent(location.href);
      const text = encodeURIComponent('Guarda il report completo su Tradelia · AI');
      window.open(`${base}${text}%20${url}`,'share','width=600,height=500');
    });
  });

  // QR toggle
  $('#btn-qr').addEventListener('click',async ()=>{
    const qra = $('#qr-area');
    if(qra.classList.contains('hidden')){
      qra.innerHTML = await generateQR(location.href);
      qra.classList.remove('hidden');
    }else{
      qra.classList.add('hidden');
    }
  });

  const $=(sel,root=document)=>root.querySelector(sel);
}
