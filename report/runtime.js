(function () {
  // helpers
  const $ = (id) => document.getElementById(id);
  const qp = new URLSearchParams(location.search);
  const id = qp.get("id") || "sample-qyld-2025-10-20";
  // se usi la pagina in /report/, i JSON stanno in /reports/ alla root del sito
  const src = `/reports/${id}.json`;

  const pct = (v) => (typeof v === "number" ? `${(v * 100).toFixed(0)}%` : "—");
  const chip = (state) => {
    const map = {
      ACTIVE: "bg-emerald-100 text-emerald-700",
      HOLD: "bg-amber-100 text-amber-700",
      REVIEW: "bg-rose-100 text-rose-700",
    };
    const cls = map[state] || map.ACTIVE;
    return `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cls}">${state || "ACTIVE"}</span>`;
  };

  // debug UI
  const setText = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  setText("DebugId", id);
  setText("DebugSrc", src);

  // topbar actions
  const btnCopy = $("btn-copy");
  if (btnCopy) btnCopy.onclick = () => {
    navigator.clipboard.writeText(location.href);
    alert("Link copiato ✔");
  };
  const btnReload = $("btn-reload");
  if (btnReload) btnReload.onclick = () => location.reload();

  // fetch JSON
  fetch(src, { cache: "no-store" })
    .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then((data) => {
      const H  = data.Header || {};
      const F1 = data.F1 || {};
      const F3 = data.F3 || {};
      const F4 = data.F4 || {};
      const F5 = data.F5 || {};
      const F6 = data.F6 || {};
      const F7 = (data.F7 && data.F7.Feedback) || {};

      // top bar
      setText("bar-title", `${H.Ticker || "—"} · ${H.Date || "—"}`);
      const chipHost = $("chip-state");
      if (chipHost) chipHost.innerHTML = chip(H.State);

      // header
      setText("H-Ticker", H.Ticker || "—");
      setText("H-Date", H.Date || "—");
      setText("H-Audit", H.AuditPathID || "—");
      setText("H-Version", H.Version || "—");
      setText("H-Analyst", H.Analyst || "Swing Master AI");
      setText("H-Ts", H.Timestamp || "—");

      // F1–F2
      setText("F1-RiskWindow", F1.RiskWindow ?? "—");
      setText("F1-Macro",      F1.MacroRegime ?? "—");
      setText("F1-SCI",        F1.SCI ?? "—");
      setText("F1-IPI",        F1.IPI ?? "—");
      setText("F1-OPI",        F1.OPI ?? "—");
      setText("F1-ICR",        F1.ICR ?? "—");
      setText("F1-Geo",        F1.GeoRisk ?? "—");

      // F3 / F4
      setText("F3-MTF",    F3.MTF_Score ?? "—");
      setText("F3-Pswing", pct(F3.Prob_SwingUp));
      setText("F3-Plt",    pct(F3.Prob_LTUp));
      setText("F4-Bias",   F4.BiasIntermarketScore ?? "—");

      // F5
      setText("F5-Bias", F5.Bias ?? "—");
      setText("F5-Flow", F5.FlowScore ?? "—");

      // F6
      setText("F6-Disc", F6.DisciplineScore ?? "—");
      setText("F6-Cons", F6.ConsistencyIndex ?? "—");
      setText("F6-Edu",  F6.EducationalEfficiency ?? "—");

      // F7 lists
      const fillList = (id, arr) => {
        const el = $(id);
        if (!el) return;
        el.innerHTML = "";
        (arr && arr.length ? arr : ["—"]).forEach((x) => {
          const li = document.createElement("li"); li.textContent = x; el.appendChild(li);
        });
      };
      fillList("F7-Ok", F7.Funziona);
      fillList("F7-Ko", F7.NonFunziona);
      fillList("F7-Ls", F7.Lesson);

      // notes
      const notes = $("Notes");
      if (notes) notes.textContent = data.Notes || "Analisi educativa e informativa.";

    })
    .catch((err) => {
      const alert = $("Alert");
      if (alert) alert.innerHTML = `<span class="text-rose-600">Report JSON non trovato (${src}) — crea /reports/${id}.json</span>`;
      // fallback minimale
      setText("bar-title", "Demo · —");
    });
})();
