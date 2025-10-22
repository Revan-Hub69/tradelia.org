// /assets/js/components/helpx.js
function P(...s){ return s.map(x=>`<p class="mb-1.5">${x}</p>`).join(""); }
function UL(arr){ return `<ul class="list-disc ml-5">${arr.map(x=>`<li>${x}</li>`).join("")}</ul>`; }

const HELP = {
  DataStart:{ t:"Inizio report (timestamp)", a:P("Istante locale da cui inizia la finestra analitica.","Usare timezone esplicita.") },
  DataEnd:{ t:"Fine report (timestamp)", a:P("Istante di chiusura della finestra.","Evitare look-ahead bias.") },
  Ticker:{ t:"Ticker", a:P("Simbolo di listing primario (no alias).") },
  Venue:{ t:"Venue/MIC", a:P("Mercato di quotazione primario.") },
  Freshness:{ t:"Freshness", a:UL(["T-0 → verde","T-1 → giallo","T-2+ → rosso"]) },
  OCR_Conf:{ t:"OCR_Conf (0–1)", a:UL(["≥0.85 buono","0.65–0.85 discreto","<0.65 critico"]) },
  DataIntegrity:{ t:"DataIntegrity (0–1)", a:UL(["≥0.85 buono","0.65–0.85 discreto","<0.65 critico"]) },
  FeedSync:{ t:"FeedSync (0–1)", a:UL(["≥0.85 ok","0.65–0.85 discreto","<0.65 critico"]) },
  ConfidenceFinal:{ t:"Affidabilità complessiva", a:UL(["≥0.80 verde","0.60–0.80 giallo","<0.60 rosso"]) },
  StatoReport:{ t:"Stato report", a:UL(["ACTIVE → ok","REVIEW → verifiche","HOLD → sospeso"]) },
  F1B_VIX:{ t:"VIX", a:UL(["<15 bassa","15–22 moderata",">22 elevata"]) },
  F1B_Breadth:{ t:"Breadth 1M", a:P("% settori SPDR positivi a 1M.") },
  F1B_RiskTilt:{ t:"Risk Tilt", a:P("Δ ciclici − difensivi (1M).") },
  F1B_FlowScore:{ t:"FlowScore", a:P("0.45·z(Inflow5D)+0.35·z(Perf1M)+0.20·z(RiskTilt)") },
  F1B_Regime:{ t:"RegimeScore", a:UL(["Momentum ≥0.35","Momentum-light 0.10–0.35","Pullback <0.10"]) },
  F1B_Mode:{ t:"StrategyMode", a:P("Traduzione operativa del regime.") },
  F2_Ticker:{ t:"Ticker (F2)", a:P("Solo contesto.") },
  F2_MacroConcordance:{ t:"Concordanza Macro", a:UL(["ALTA → tailwind","MEDIA → neutro","BASSA → headwind"]) },
  F2_Conf:{ t:"Confidence (F2)", a:UL(["≥0.80 verde","0.60–0.80 giallo","<0.60 rosso"]) },
  F2_IV:{ t:"Implied Volatility (IV)", a:P("Near-term ATM.") },
  F2_PCR:{ t:"Put/Call Ratio", a:P(">1 difensivo; <1 risk-on.") },
  F2_Profile:{ t:"Profilo sintetico", a:P("Business e posizionamento.") },
  F2_Upcoming:{ t:"Prossimi eventi", a:P("Earnings, EX-div, conferenze.") },
  F2_ETFs:{ t:"ETF collegati", a:P("Peso su titolo.") },
  F2_Peers:{ t:"Peer-set", a:P("Comparabili diretti.") },
};

export function initHelpX(){
  document.addEventListener('click',(e)=>{
    const btn=e.target.closest('.hx'); if(!btn) return;
    e.preventDefault(); const k=btn.getAttribute('data-k'); const d=HELP[k]||{t:k,a:'—'};
    const wrap=document.createElement('div'); wrap.className='fixed inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center z-[100]';
    const card=document.createElement('div'); card.className='bg-white border border-slate-200 rounded-xl p-4 max-w-xl w-[92%] shadow-2xl';
    card.innerHTML=`<div class="flex justify-between items-start gap-3 mb-2"><h3 class="font-bold">${d.t}</h3><button class="btn" id="hx-close"><i data-lucide="x"></i></button></div><div class="text-sm text-slate-800">${d.a}</div>`;
    wrap.appendChild(card); document.body.appendChild(wrap); lucide.createIcons();
    wrap.addEventListener('click',(ev)=>{ if(ev.target===wrap) wrap.remove(); });
    card.querySelector('#hx-close').addEventListener('click', ()=> wrap.remove());
  }, true);
}
