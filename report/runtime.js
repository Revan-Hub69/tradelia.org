(function(){
  const $ = (id) => document.getElementById(id);
  const get = (obj, path, fallback="—") =>
    path.split(".").reduce((o,k)=> (o && o[k]!=null ? o[k] : null), obj) ?? fallback;

  // mappa JSON -> ID nel DOM
  const MAP = {
    "H-Session":       "Header.Session",
    "H-Start":         "Header.StartDate",
    "H-End":           "Header.EndDate",
    "H-Ticker":        "Header.Ticker",
    "H-Venue":         "Header.Venue",
    "H-Validation":    "Header.Validation",
    "H-VersionTag":    "Header.VersionTag",
    "H-SyncID":        "Header.SyncID",
    "H-Freshness":     "Header.Freshness",
    "H-OCR":           "Header.OCR_Conf",
    "H-DataIntegrity": "Header.DataIntegrity",
    "H-FeedSync":      "Header.FeedSync",
    "H-Confidence":    "Header.ConfidenceFinal",
    "H-State":         "Header.State",
    "H-TapeNotes":     "Header.TapeNotes",
    "H-Missing":       "Header.Missing"
  };

  const setText = (id, v) => { const el = $(id); if (el) el.textContent = Array.isArray(v) ? v.join(", ") : (v ?? "—"); };

  async function load(){
    const qp = new URLSearchParams(location.search);
    const id = qp.get("id") || "sample-qyld-2025-10-20";   // cambia l'id via ?id=
    const src = `/reports/${id}.json`;

    try{
      const r = await fetch(src, { cache: "no-store" });
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      Object.entries(MAP).forEach(([domId, path]) => setText(domId, get(data, path, "—")));
    }catch(err){
      console.error("Report JSON non trovato o invalido:", err);
      // lascio i placeholder "—"
    }
  }

  document.addEventListener("DOMContentLoaded", load);
})();
