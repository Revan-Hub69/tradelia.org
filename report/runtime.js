(function () {
  // ---------- utils ----------
  const $id = (id) => document.getElementById(id);
  const get = (obj, path, fb = null) =>
    path.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : null), obj) ?? fb;
  const toNum = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
  const fmtNum = (v) => { if (v == null || isNaN(v)) return "N/D"; const s = Number(v).toPrecision(6); return s.replace(/\.?0+$/, ""); };

  // ---------- header map (segna-posti) ----------
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

  // ---------- binder payload per stile cromatico header ----------
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

  // ---------- riempie i segnaposti plain dell'header ----------
  function fillPlainTexts(data){
    Object.entries(MAP).forEach(([domId, path])=>{
      let v = get(data, path, "—");

      if (domId === "H-Validation" && v && typeof v === "object") v = v.label ?? "—";
      if (["H-OCR","H-DataIntegrity","H-FeedSync"].includes(domId)) v = fmtNum(toNum(v));

      if (domId === "H-Confidence"){
        if (v && typeof v === "object") v = fmtNum(toNum(v.value));
        else v = fmtNum(toNum(v));
      }

      if (domId === "H-Freshness"){
        const n = toNum(v);
        if (n != null) v = (n <= 1 ? "≤ T-1" : `${n} giorni`);
      }

      setText(domId, v);
    });
  }

  // ---------- main loader ----------
  async function load(){
    const qp = new URLSearchParams(location.search);
    const id = qp.get("id") || "sample-qyld-2025-10-20";
    const src = `../reports/${id}.json?t=${Date.now()}`;

    try{
      const r = await fetch(src, { cache: "no-store" });
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();

      // 1) Header plain
      fillPlainTexts(data);

      // 2) Header cromatico + evento ufficiale
      const payload = toBinderPayload(data);
      if(window.TradeliaHeaderColors?.apply) window.TradeliaHeaderColors.apply(payload);
      window.dispatchEvent(new CustomEvent("tradelia:header:update", { detail: payload }));

      // 3) F1B (desk): aggiorna card/drawer dal JSON completo
      if (window.TradeliaF1B && data.F1B) {
        window.TradeliaF1B.update(data.F1B);
      }

      // 4) opzionale: auto-open drawer con ?open=f1b (solo se presenti i dati)
      if (qp.get("open")==="f1b" && data.F1B) {
        document.querySelector('[data-f1b="open"]')?.click();
      }
    }catch(err){
      console.error("Report JSON non trovato o invalido:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", load);
})();
