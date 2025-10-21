(function(){
  const $id = (id) => document.getElementById(id);
  const get = (obj, path, fb = null) =>
    path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : null), obj) ?? fb;
  const toNum = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
  const fmtNum = (v) => { if (v == null || isNaN(v)) return "N/D"; const str = Number(v).toPrecision(6); return str.replace(/\.?0+$/, ""); };

  const MAP = {
    "H-Session":"Header.Session","H-Start":"Header.StartDate","H-End":"Header.EndDate",
    "H-Ticker":"Header.Ticker","H-Venue":"Header.Venue","H-Validation":"Header.Validation",
    "H-VersionTag":"Header.VersionTag","H-SyncID":"Header.SyncID","H-Freshness":"Header.Freshness",
    "H-OCR":"Header.OCR_Conf","H-DataIntegrity":"Header.DataIntegrity","H-FeedSync":"Header.FeedSync",
    "H-Confidence":"Header.ConfidenceFinal","H-State":"Header.State",
    "H-TapeNotes":"Header.TapeNotes","H-Missing":"Header.Missing"
  };

  const setText = (id, v) => {
    const el = $id(id);
    if (!el) return;
    if (Array.isArray(v)) el.textContent = v.length ? v.join(", ") : "—";
    else if (v == null || v === "") el.textContent = "—";
    else el.textContent = String(v);
  };

  function toBinderPayload(data){
    const h = data && data.Header ? data.Header : {};
    const toBadge = (x, c="neutral") =>
      (x && typeof x === "object") ? { label: x.label ?? "N/D", color: x.color ?? c } :
      (x != null ? { label: String(x), color: c } : null);
    const toConf = (x) =>
      (x && typeof x === "object") ? { value: toNum(x.value), color: x.color ?? "neutral" } :
      { value: toNum(x), color: "neutral" };
    const fNum = toNum(h.Freshness);
    return {
      session:h.Session, dateStart:h.StartDate, dateEnd:h.EndDate, ticker:h.Ticker, venue:h.Venue,
      validation:toBadge(h.Validation), versionTag:h.VersionTag, syncID:h.SyncID,
      freshnessDays:fNum!=null?fNum:h.Freshness,
      ocr_conf:toNum(h.OCR_Conf), dataIntegrity:toNum(h.DataIntegrity), feedSync:toNum(h.FeedSync),
      confidence_final:toConf(h.ConfidenceFinal), state:toBadge(h.State),
      tapeNotes:h.TapeNotes, missing:Array.isArray(h.Missing)?h.Missing:(h.Missing==null?[]:[h.Missing]),
      colorize:Array.isArray(h.Colorize)?h.Colorize:undefined
    };
  }

  function fillPlainTexts(data){
    Object.entries(MAP).forEach(([domId, path])=>{
      let v = get(data, path, "—");

      // se Validation è oggetto, mostra solo label nel fallback
      if (domId === "H-Validation" && v && typeof v === "object") v = v.label ?? "—";

      // numerici con formato
      if (["H-OCR","H-DataIntegrity","H-FeedSync"].includes(domId)) v = fmtNum(toNum(v));

      // confidence: può essere numero o oggetto {value}
      if (domId === "H-Confidence"){
        if (v && typeof v === "object") v = fmtNum(toNum(v.value));
        else v = fmtNum(toNum(v));
      }

      // freshness → testo
      if (domId === "H-Freshness"){
        const n = toNum(v);
        if (n != null) v = (n <= 1 ? "≤ T-1" : `${n} giorni`);
      }

      setText(domId, v);
    });
  }

  async function load(){
    const qp = new URLSearchParams(location.search);
    const id = qp.get("id") || "sample-qyld-2025-10-20";
    // JSON in /reports (minuscolo), una cartella sopra /report
    const src = `../reports/${id}.json?t=${Date.now()}`;

    try{
      const r = await fetch(src, { cache: "no-store" });
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();

      // 1) Riempimento testo
      fillPlainTexts(data);

      // 2) Binder cromatico + evento
      const payload = toBinderPayload(data);
      if(window.TradeliaHeaderColors?.apply) window.TradeliaHeaderColors.apply(payload);
      window.dispatchEvent(new CustomEvent("tradelia:header:update", { detail: payload }));
    }catch(err){
      console.error("Report JSON non trovato o invalido:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", load);
})();
// apri drawer F1B
window.TradeliaF1B.open();

// aggiorna con il tuo payload
window.TradeliaF1B.update({
  state:'ACTIVE',
  vix:18.23,
  breadth:'60% positivi',
  risktilt:'+5.17 pp verso difensivi',
  flowScore:0.18,
  regimeScore:0.22,
  mode:'Momentum-light',
  top1:'XLU · Utilities', top2:'XLV · Health Care', top3:'XLF · Financials',
  weak1:'XLE · Energy', weak2:'XLI · Industrials', weak3:'XLK · Technology',
  auditId:'F1B-20251021-IT-001', version:'v1.1', ts:'2025-10-21 09:45 CET'
});

// oppure via evento
window.dispatchEvent(new CustomEvent('tradelia:f1b:update',{detail:{ /* ... */ }}));
