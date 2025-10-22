// ======================================================
// TRADELIA • AI — Full Share Sheet (desktop + mobile)
// + Short link robusto (shrtco.de -> cleanuri -> is.gd -> tinyurl)
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

  // === SHORTENER pubblico (tutti HTTPS + CORS) ==========================
  // 1) shrtco.de: https://api.shrtco.de/v2/shorten?url=<url>
  async function short_shrtco(url) {
    const r = await fetch(`https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(url)}`);
    if (!r.ok) throw new Error('shrtco HTTP');
    const j = await r.json();
    if (j && j.ok && j.result && j.result.full_short_link) return j.result.full_short_link;
    throw new Error('shrtco bad payload');
  }
  // 2) cleanuri: POST form-encoded https://cleanuri.com/api/v1/shorten (returns JSON { result_url })
  async function short_cleanuri(url) {
    const r = await fetch(`https://cleanuri.com/api/v1/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: `url=${encodeURIComponent(url)}`
    });
    if (!r.ok) throw new Error('cleanuri HTTP');
    const j = await r.json();
    if (j && j.result_url) return j.result_url;
    throw new Error('cleanuri bad payload');
  }
  // 3) is.gd: https://is.gd/create.php?format=simple&url=<url> (text)
  async function short_isgd(url) {
    const r = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
    if (!r.ok) throw new Error('is.gd HTTP');
    const t = (await r.text()).trim();
    if (/^https?:\/\//i.test(t)) return t;
    throw new Error('is.gd bad payload');
  }
  // 4) tinyurl: https://tinyurl.com/api-create.php?url=<url> (text)
  async function short_tiny(url) {
    const r = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    if (!r.ok) throw new Error('tinyurl HTTP');
    const t = (await r.text()).trim();
    if (/^https?:\/\//i.test(t)) return t;
    throw new Error('tinyurl bad payload');
  }

  async function getShortUrl(longUrl) {
    // evita ri-short se già corto
    if (/^(https?:\/\/)?(shrtco\.de|shortco\.de|9qr\.de|cleanuri\.com|is\.gd|v\.gd|tinyurl\.com)\//i.test(longUrl)) {
      return longUrl;
    }
    // se la pagina è in HTTP, tutti gli endpoint sono HTTPS → ok.
    // fallback chain con try…catch
    try { return await short_shrtco(longUrl); } catch {}
    try { return await short_cleanuri(longUrl); } catch {}
    try { return await short_isgd(longUrl); } catch {}
    try { return await short_tiny(longUrl); } catch {}
    return longUrl; // fallback finale
  }

  async function generateQR(text) {
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

  // Short (con spinner + copia automatica se cambia)
  $('#btn-short').addEventListener('click', async () => {
    const current = $('#share-link').value;
    const btnShort = $('#btn-short');
    if (!current) return;
    btnShort.disabled = true;
    const prevHTML = btnShort.innerHTML;
    btnShort.innerHTML = `<svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" opacity=".2"/><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg><span>Short</span>`;
    try {
      const shorted = await getShortUrl(current);
      $('#share-link').value = shorted;
      // Auto-copy se cambiato
      if (shorted && shorted !== current) {
        try { await navigator.clipboard.writeText(shorted); } catch {}
      }
      btnShort.innerHTML = `<i data-lucide="check"></i><span>Short</span>`;
      if (window.lucide) lucide.createIcons();
    } catch (e) {
      console.warn('Short error:', e);
      btnShort.innerHTML = prevHTML;
    } finally {
      setTimeout(() => {
        btnShort.disabled = false;
        btnShort.innerHTML = `<i data-lucide="scissors"></i><span>Short</span>`;
        if (window.lucide) lucide.createIcons();
      }, 1200);
    }
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

      let shareUrl = base;
      if (base.startsWith('mailto:') || base.startsWith('sms:')) {
        shareUrl = `${base}${text}%20${url}`;
      } else if (base.includes('t.me/share/url')) {
        shareUrl = `${base}${url}&text=${text}`;
      } else if (base.includes('twitter.com/intent/tweet')) {
        shareUrl = `${base}${url}&text=${text}`;
      } else if (base.includes('facebook.com/sharer/sharer.php')) {
        shareUrl = `${base}${url}`;
      } else if (base.includes('linkedin.com/sharing/share-offsite')) {
        shareUrl = `${base}${url}`;
      } else if (base.includes('api.whatsapp.com/send')) {
        shareUrl = `${base}${text}%20${url}`;
      } else {
        shareUrl = `${base}${url}`;
      }

      window.open(shareUrl, 'share', 'width=640,height=560,noopener');
    });
  });

  // Micro CSS inline per spinner (no dipendenze)
  const spinCSS = document.createElement('style');
  spinCSS.textContent = `.spin{animation:tl-spin .9s linear infinite}@keyframes tl-spin{to{transform:rotate(360deg)}}`;
  document.head.appendChild(spinCSS);
}
