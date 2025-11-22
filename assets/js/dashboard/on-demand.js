/**
 * Dashboard Module: On-Demand
 * FASE 5: Contenuti e Funzionalità
 * Richiesta analisi on-demand
 */

export async function loadOnDemand() {
  const container = document.getElementById('on-demand-container');
  if (!container) return;

  // Verifica token
  const token = localStorage.getItem('tradelia-access-token-v1');
  
  if (!token) {
    container.innerHTML = `
      <div class="reports-empty">
        <svg class="reports-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
        <div class="reports-empty-title">Accesso richiesto</div>
        <div class="reports-empty-text">Effettua l'accesso per richiedere analisi on-demand.</div>
        <a href="/accesso.html" class="btn btn-primary" style="margin-top: var(--spacing-md);">
          Vai a Accesso
        </a>
      </div>
    `;
    return;
  }

  // Setup form
  setupOnDemandForm(container);
}

function setupOnDemandForm(container) {
  container.innerHTML = `
    <div class="on-demand-card">
      <div class="on-demand-card-header">
        <h3 class="on-demand-title">Richiedi Analisi</h3>
        <p class="on-demand-description">
          Invia brief riservati. Nome ed email vengono recuperati automaticamente dal tuo codice di accesso.
        </p>
      </div>
      <form id="on-demand-form" class="on-demand-form">
        <div class="form-group">
          <label for="on-demand-ticker" class="form-label">
            Ticker/Asset <span class="required">*</span>
          </label>
          <input
            type="text"
            id="on-demand-ticker"
            name="ticker"
            class="form-input"
            placeholder="Es. AAPL, BTC-USD, EUR/USD"
            required
            autocomplete="off"
          />
          <small class="form-hint">Inserisci il ticker o simbolo dell'asset da analizzare</small>
        </div>
        
        <div class="form-group">
          <label for="on-demand-tipo" class="form-label">Tipo Analisi</label>
          <select id="on-demand-tipo" name="tipo" class="form-select">
            <option value="">Seleziona tipo analisi</option>
            <option value="swing">Swing (3-10 giorni)</option>
            <option value="macro">Macro/Tattico</option>
            <option value="long-term">Long-Term</option>
            <option value="custom">Personalizzata</option>
          </select>
        </div>

        <div class="form-group">
          <label for="on-demand-dettagli" class="form-label">Dettagli/Brief</label>
          <textarea
            id="on-demand-dettagli"
            name="dettagli"
            class="form-textarea"
            rows="5"
            placeholder="Descrivi la tua richiesta di analisi, obiettivi, orizzonte temporale, etc."
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="on-demand-submit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <path d="M22 2L11 13"/>
              <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
            Invia Richiesta
          </button>
        </div>
      </form>
    </div>
  `;

  // Setup form handler
  const form = document.getElementById('on-demand-form');
  if (form) {
    form.addEventListener('submit', handleOnDemandSubmit);
  }
}

async function handleOnDemandSubmit(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById('on-demand-submit');
  const token = localStorage.getItem('tradelia-access-token-v1');
  
  if (!token) {
    if (window.showToast) {
      window.showToast('Token di accesso mancante. Effettua l\'accesso.', 'error');
    }
    return;
  }

  const formData = {
    dashboardToken: token,
    ticker: document.getElementById('on-demand-ticker').value.trim().toUpperCase(),
    tipo: document.getElementById('on-demand-tipo').value,
    dettagli: document.getElementById('on-demand-dettagli').value.trim(),
    timestamp: new Date().toISOString()
  };

  // Validazione
  if (!formData.ticker || formData.ticker.length < 1) {
    if (window.showToast) {
      window.showToast('Inserisci un ticker valido', 'error');
    }
    return;
  }

  // Disabilita submit
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      Invio in corso...
    `;
  }

  try {
    const response = await fetch('/api/analysis?action=request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (data.ok) {
      if (window.showToast) {
        window.showToast('Richiesta inviata con successo!', 'success');
      }
      
      // Reset form
      document.getElementById('on-demand-form').reset();
      
      // Redirect a requests history dopo 1s
      setTimeout(() => {
        window.location.hash = 'requests-history';
      }, 1000);
    } else {
      throw new Error(data.error || 'Errore durante l\'invio della richiesta');
    }
  } catch (err) {
    console.error('[On-Demand] Errore:', err);
    if (window.showToast) {
      window.showToast(err.message || 'Errore durante l\'invio della richiesta', 'error');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <path d="M22 2L11 13"/>
          <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
        Invia Richiesta
      `;
    }
  }
}

