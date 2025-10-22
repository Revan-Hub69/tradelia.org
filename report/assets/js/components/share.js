// ======================================================
// TRADELIA • AI — Full Share Sheet (desktop + mobile)
// ======================================================
export function initShareSystem() {
  const btn = document.getElementById('btn-share');
  if (!btn) return;

  const $ = (sel, root = document) => root.querySelector(sel);

  // Create sheet
  const sheet = document.createElement('div');
  sheet.id = 'share-sheet';
  sheet.className = 'share-sheet hidden noprint';
  sheet.innerHTML = `
    <div class="share-backdrop" data-close></div>
    <div class="share-panel">
      <header class="share-head">
        <div class="share-title">
          <strong>Condividi Report</strong>
          <small class="share-sub">Link, QR e social</small>
        </div>
        <button class="btn btn-sm" data-close aria-label="Chiudi">
          <i data-lucide="x"></i>
        </button>
      </header>

      <div class="share-body">
        <div class="share-linkbox">
          <input id="share-link" type="text" readonly />
          <button id="btn-copy" class="btn" aria-label="Copia">
            <i data-lucide="copy"></i>
          </button>
        </div>

        <div class="share-actions">
          <button class="btn btn-ghost" id="btn-open" aria-label="Apri link">
            <i data-lucide="external-link"></i><span>Apri</span>
          </button>
          <button class="btn btn-ghost" id="btn-short" aria-label="Short URL">
            <i data-lucide="scissors"></i><span>Short</span>
          </button>
          <button class="btn btn-ghost" id="btn-qr" aria-label="QR Code">
            <i data-lucide="qr-code"></i><span>QR</span>
          </button>
        </div>

        <div class="share-grid">
          ${platform('WhatsApp','whatsapp','https://api.whatsapp.com/send?text=')}
          ${platform('Telegram','send','https://t.me/share/url?url=')}
          ${platform('Discord','message-circle','https://discord.com/channels/@me')}
          ${platform('Email','mail','mailto:?subject=Tradelia%20Report&body=')}
          ${platform('LinkedIn','linkedin','https://www.linkedin.com/sharing/share-offsite/?url=')}
          ${platform('X / Twitter','twitter','https://twitter.com/intent/tweet?url=')}
          ${platform('SMS','sms','sms:?body=')}
          ${platform('Facebook','facebook','https://www.facebook.com/sharer/sharer.php?u=')}
        </div>

        <div id="qr-area" class="qr-area hidden" aria-live="polite"></div>
      </div>
    </div>
  `;
  document.body.appendChild(sheet);

  // Helpers
  function platform(name, icon, base) {
    return `<button class="share-item" data-url="${base}" data-name="${name}" aria-label="${name}">
      <i data-lucide="${icon}"></i><span>${name}</span>
    </button>`;
  }

  async function getShortUrl(longUrl) {
    // Placeholder: restituisce il link originale.
    // Integra qui Bitly/TinyURL/endpoint tuo e ritorna la short URL.
    return longUrl;
  }

  async function generateQR(text) {
    // QR via servizio pubblico; sostituibile con lib locale se preferisci
    const api = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(text)}`;
    return `<img src="${api}" width="180" height="180" alt="QR code" class="qr-img" />`;
  }

  const toggle = show => {
    sheet.classList.toggle('hidden', !show);
    if (window.lucide) setTimeout(() => lucide.createIcons(), 0);
  };

  // Open sheet
  btn.addEventListener('click', () => {
    const link = location.href;
    $('#share-link').value = link;
    toggle(true);
  });

  // Close sheet
  sheet.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) toggle(false);
  });
  document.addEventListener('keydown', e => {
    if (!sheet.classList.contains('hidden') && e.key === 'Escape') toggle(false);
  });

  // Copy
  $('#btn-copy').addEventListener('click', async () => {
    const link = $('#share-link').value;
    try {
      await navigator.clipboard.writeText(link);
      $('#btn-copy').innerHTML = `<i data-lucide="check"></i>`;
      if (window.lucide) lucide.createIcons();
      setTimeout(() => { $('#btn-copy').innerHTML = `<i data-lucide="copy"></i>`; if (window.lucide) lucide.createIcons(); }, 1200);
    } catch {
      alert('Impossibile copiare il link.');
    }
  });

  // Open
  $('#btn-open').addEventListener('click', () => {
    const link = $('#share-link').value;
    window.open(link, '_blank', 'noopener');
  });

  // Short
  $('#btn-short').addEventListener('click', async () => {
    const current = $('#share-link').value;
    const shorted = await getShortUrl(current);
    $('#share-link').value = shorted;
  });

  // QR
  $('#btn-qr').addEventListener('click', async () => {
    const qra = $('#qr-area');
    if (qra.classList.contains('hidden')) {
      qra.innerHTML = await generateQR($('#share-link').value);
      qra.classList.remove('hidden');
    } else {
      qra.classList.add('hidden');
      qra.innerHTML = '';
    }
  });

  // Social buttons
  sheet.querySelectorAll('.share-item[data-url]').forEach(el => {
    el.addEventListener('click', () => {
      const base = el.dataset.url;
      const url = encodeURIComponent($('#share-link').value);
      const text = encodeURIComponent('Guarda il report completo su Tradelia · AI');
      const shareUrl = base.includes('mailto:') || base.startsWith('sms:')
        ? `${base}${text}%20${url}`
        : `${base}${url}&text=${text}`;
      window.open(shareUrl, 'share', 'width=640,height=560,noopener');
    });
  });
}
