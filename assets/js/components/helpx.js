function P(...s){ return s.map(x=>`<p class="mb-1.5">${x}</p>`).join(""); }
function UL(arr){ return `<ul class="list-disc ml-5">${arr.map(x=>`<li>${x}</li>`).join("")}</ul>`; }

const HELP = {
  DataStart:{t:"Inizio report",a:P("Timestamp locale d'inizio.")},
  DataEnd:{t:"Fine report",a:P("Timestamp di chiusura.")},
  Ticker:{t:"Ticker",a:P("Simbolo primario.")},
  Venue:{t:"Venue/MIC",a:P("Mercato primario.")},
  Freshness:{t:"Freshness",a:UL(["T-0 → verde","T-1 → giallo","T-2+ → rosso"])},
  OCR_Conf:{t:"OCR_Conf",a:UL(["≥0.85 buono","0.65–0.85 discreto","<0.65 critico"])},
  DataIntegrity:{t:"DataIntegrity",a:UL(["≥0.85 buono","0.65–0.85 discreto","<0.10 critico"])},
  FeedSync:{t:"FeedSync",a:UL(["≥0.85 ok","0.65–0.85 discreto","<0.65 critico"])},
  ConfidenceFinal:{t:"Affidabilità",a:UL(["≥0.80 verde","0.60–0.80 giallo","<0.60 rosso"])},
  StatoReport:{t:"Stato report",a:UL(["ACTIVE","REVIEW","HOLD"])},
  F1B_VIX:{t:"VIX",a:UL(["<15 bassa","15–22 moderata",">22 elevata"])},
  F1B_Breadth:{t:"Breadth 1M",a:P("% settori SPDR positivi.")},
  F1B_RiskTilt:{t:"Risk Tilt",a:P("Δ ciclici − difensivi.")},
  F1B_FlowScore:{t:"FlowScore",a:P("0.45·z(Inflow5D)+0.35·z(Perf1M)+0.20·z(RiskTilt)")},
  F1B_Regime:{t:"RegimeScore",a:UL(["≥0.35 momentum","0.10–0.35 light","<0.10 pullback"])},
  F1B_Mode:{t:"StrategyMode",a:P("Traduzione operativa del regime.")},
  F2_Ticker:{t:"Ticker (F2)",a:P("Contesto.")},
  F2_MacroConcordance:{t:"Concordanza Macro",a:UL(["ALTA","MEDIA","BASSA"])},
  F2_Conf:{t:"Confidence (F2)",a:UL(["≥0.80 verde","0.60–0.80 giallo","<0.60 rosso"])},
  F2_IV:{t:"IV",a:P("Near-term ATM.")},
  F2_PCR:{t:"PCR",a:P(">1 difensivo; <1 risk-on.")},
  F2_Profile:{t:"Profilo",a:P("Sintesi business.")},
  F2_Upcoming:{t:"Eventi",a:P("Earnings, EX-div, conf.")},
  F2_ETFs:{t:"ETF collegati",a:P("Peso su titolo.")},
  F2_Peers:{t:"Peers",a:P("Comparabili diretti.")}
};

function enhanceHxButtons(){
  const apply = (btn)=>{
    if(!btn || btn.dataset.__hxIcon==='1') return;
    const k = btn.getAttribute('data-k') || '?';
    const t = HELP[k]?.t || k;
    btn.setAttribute('title', t);
    btn.setAttribute('aria-label', `${t} — Aiuto`);
    btn.setAttribute('type','button');
    btn.innerHTML = `<i data-lucide="help-circle" aria-hidden="true"></i><span class="sr-only">${t}</span>`;
    btn.dataset.__hxIcon = '1';
  };
  document.querySelectorAll('.hx[data-k]').forEach(apply);
  try {
    if (window.lucide && typeof window.lucide.createIcons==='function') {
      window.lucide.createIcons();
    } else {
      // Fallback: testo "?"
      document.querySelectorAll('.hx[data-k]').forEach(btn=>{
        if (!btn.querySelector('svg')) btn.textContent='?';
      });
    }
  } catch {
    document.querySelectorAll('.hx[data-k]').forEach(btn=>{ btn.textContent='?'; });
  }
}

export function initHelpX(){
  // Icone + titoli subito e ogni volta che monta nuovo DOM
  enhanceHxButtons();
  const mo = new MutationObserver(()=> enhanceHxButtons());
  mo.observe(document.documentElement,{childList:true,subtree:true});

  // Popup
  const open=(d)=>{
    const wrap=document.createElement('div'); wrap.className='hx-pop'; wrap.tabIndex=-1;
    const card=document.createElement('div'); card.className='hx-card'; card.role='dialog'; card.ariaModal='true';
    card.innerHTML=`
      <div class="flex items-start justify-between gap-3 mb-2">
        <h3 class="font-bold">${d.t}</h3>
        <button class="btn" id="hx-close" aria-label="Chiudi"><i data-lucide="x"></i></button>
      </div>
      <div class="src">Fonte: Tradelia · Help</div>
      <div class="text-sm text-slate-800">${d.a}</div>`;
    wrap.appendChild(card); document.body.appendChild(wrap);
    if (window.lucide) window.lucide.createIcons();
    const close=()=>{ wrap.remove(); document.removeEventListener('keydown',onEsc,true); };
    const onEsc=(e)=>{ if(e.key==='Escape'){ e.stopPropagation(); e.preventDefault(); close(); } };
    wrap.addEventListener('click',(e)=>{ if(e.target===wrap) close(); });
    card.querySelector('#hx-close').addEventListener('click', close);
    document.addEventListener('keydown', onEsc, true);
    setTimeout(()=> card.querySelector('#hx-close')?.focus(), 0);
  };

  document.addEventListener('click',(e)=>{
    const btn=e.target.closest('.hx'); if(!btn) return;
    e.preventDefault();
    const k=btn.getAttribute('data-k'); const d = HELP[k] || { t:(k||'?'), a:'—' };
    open(d);
  }, true);
}
