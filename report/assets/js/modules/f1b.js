// /report/assets/js/modules/f1b.js
// Tradelia · F1B (Market Strategy) — scheda chiusa + Drawer Dettagli
// Tutte le voci hanno tooltip (popover già gestito dall'index tramite .info-btn + data-metric)

const $ = (s, r = document) => r.querySelector(s);

/* -----------------------------
   Helpers
----------------------------- */
const safeNum = (v) => (Number.isFinite(+v) ? +v : null);
const fmt = {
  pct(v, d = 0) { const n = safeNum(v); return n == null ? "—" : `${n.toFixed(d)}%`; },
  num(v, d = 2) { const n = safeNum(v); return n == null ? "—" : n.toFixed(d); },
  moneyMM(v)    { const n = safeNum(v); return n == null ? "—" : `${n.toLocaleString(undefined,{maximumFractionDigits:0})}M`; },
  date(s)       { return s || "—"; }
};
const toneDot = (t) => ({g:"dot-g",y:"dot-y",r:"dot-r",n:"dot-n"}[String(t||"n").toLowerCase()] || "dot-n");
const toneBadge = (t)=>({g:"badge--g",y:"badge--y",r:"badge--r",n:"badge--n"}[String(t||"n").toLowerCase()] || "badge--n");

// Tono derivato da StrategyMode / Breadth / RegimeScore
function toneForStrategy(mode, regimeScore) {
  const m = String(mode||"").toLowerCase();
  if (m === "momentum") return "g";
  if (m === "momentum-light") return "y";
  if (m === "pullback") return "r";
  // fallback su score:
  const s = safeNum(regimeScore);
  if (s == null) return "n";
  if (s >= 0.35) return "g";
  if (s >= 0.10) return "y";
  return "r";
}
function toneForBreadth(breadth) {
  const b = safeNum(breadth);
  if (b == null) return "n";
  if (b >= 0.60) return "g";
  if (b >= 0.40) return "y";
  return "r";
}

/* -----------------------------
   UI Snippets (con tooltip su ogni voce)
----------------------------- */
function labelWithInfo(label, metricKey) {
  return `
    <div class="flex items-center gap-1">
      <div class="meta-label">${label}</div>
      <button class="info-btn" data-metric="${metricKey}" aria-label="Info ${label}">?</button>
    </div>`;
}
function kpiLine({label, metricKey, value, tone='n', extraHTML=''}) {
  return `
    <div class="kpi">
      <span class="dot ${toneDot(tone)}"></span>
      <span>${label}:
        <strong>${value}</strong>${extraHTML?` ${extraHTML}`:''}
      </span>
      <button class="info-btn" data-metric="${metricKey}" aria-label="Info ${label}">?</button>
    </div>`;
}
function smallMeta(label, metricKey, value) {
  return `
    <div class="text-muted-11" style="display:inline-flex;align-items:center;gap:.35rem">
      <span>${label}: <strong>${value}</strong></span>
      <button class="info-btn" data-metric="${metricKey}" aria-label="Info ${label}">?</button>
    </div>`;
}

/* -----------------------------
   Render (scheda CHIUSA)
----------------------------- */
export function renderCard(data, { featured = false, title = "F1B · Market Strategy" } = {}) {
  const wrap = document.createElement(featured ? "section" : "article");
  if (featured) {
    wrap.style.border = "1px solid var(--br)";
    wrap.style.borderRadius = "18px";
    wrap.style.background = "var(--card)";
    wrap.style.boxShadow = "var(--shadow-2)";
    wrap.style.padding = "14px";
    wrap.style.marginBottom = "16px";
  } else {
    wrap.className = "card-compact";
  }

  // Estratti principali per la card chiusa
  const meta = data?.meta || {};
  const calc = data?.calc || {};
  const decision = data?.decision || {};
  const asof = meta.asof || "—";
  const freshness = meta.freshness || "—";

  const strategyMode = decision?.strategy_mode || "—";
  const breadth = safeNum(calc?.breadth);
  const breadthPct = breadth != null ? fmt.pct(breadth*100,0) : "—";

  const top3 = Array.isArray(decision?.top3_inflow) ? decision.top3_inflow.slice(0,3) : [];
  const chips = top3.length
    ? top3.map(s => `<span class="badge badge--n"><code>${s.symbol||"—"}</code></span>`).join(" ")
    : `<span class="text-muted-12">—</span>`;

  const toneStrategy = toneForStrategy(strategyMode, calc?.regime_score);
  const toneBreadth  = toneForBreadth(breadth);

  wrap.innerHTML = `
    <div class="card-compact__head">
      <div class="card-compact__title">${title}</div>
      <span class="badge ${toneBadge(toneStrategy)}">${strategyMode}</span>
    </div>

    <div class="card-compact__body">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px">
        ${kpiLine({ label:"StrategyMode", metricKey:"StrategyMode", value:strategyMode, tone:toneStrategy })}
        ${kpiLine({ label:"Breadth (1m)", metricKey:"Breadth", value:breadthPct, tone:toneBreadth })}
        <div class="kpi">
          <span class="dot ${toneDot('n')}"></span>
          <span>Top inflow (5d): ${chips}</span>
          <button class="info-btn" data-metric="Inflow5d" aria-label="Info Top inflow (5d)">?</button>
        </div>
      </div>

      <div style="margin-top:10px; display:flex; align-items:center; justify-content:space-between; gap:8px">
        <div class="flex items-center gap-4">
          ${smallMeta("As of", "AsOf", fmt.date(asof))}
          ${smallMeta("Freshness", "Freshness", freshness)}
        </div>
        <div>
          <button class="u-btn" type="button" data-act="details">
            <i data-lucide="file-text"></i><span>Dettagli</span>
          </button>
        </div>
      </div>
    </div>
  `;

  return wrap;
}

/* -----------------------------
   Bind — Drawer “Dettagli” (unico, 7 sezioni, TUTTE le voci con tooltip)
----------------------------- */
export function bindCard(root, data, ctx) {
  const meta = data?.meta || {};
  const regime = data?.regime || {};
  const trends = data?.trends || {};
  const drivers = data?.drivers || {};
  const sectors = Array.isArray(data?.sectors) ? data.sectors : [];
  const calc = data?.calc || {};
  const decision = data?.decision || {};
  const f2 = data?.f2_filters || {};
  const audit = data?.audit || {};

  function row(label, metricKey, valueRight) {
    return `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid var(--br);width:42%;color:var(--muted)">
          ${labelWithInfo(label, metricKey)}
        </td>
        <td style="padding:6px 8px;border-bottom:1px solid var(--br);color:var(--ink)">${valueRight}</td>
      </tr>`;
  }
  function table(rowsHTML) {
    return `<table style="width:100%;border-collapse:collapse;font-size:13px"><tbody>${rowsHTML}</tbody></table>`;
  }
  function chipList(list) {
    if (!list || !list.length) return "—";
    return list.map(s => `<span class="badge badge--n"><code>${s}</code></span>`).join(" ");
  }

  // Sezione 1 — Decisione & Regole
  const s1 = table(
    row("StrategyMode", "StrategyMode", `<strong>${decision?.strategy_mode || "—"}</strong>`) +
    row("RegimeScore", "RegimeScore", fmt.num(calc?.regime_score)) +
    row("FlowScore",   "FlowScore",   fmt.num(calc?.flow_score)) +
    row("Soglie",      "StrategyThresholds", "≥ +0.35 Momentum · +0.10–+0.35 Momentum-light · < +0.10 Pullback")
  );

  // Sezione 2 — Input & Calcoli
  const vixTier = (() => {
    const v = safeNum(data?.inputs?.vix?.value);
    if (v == null) return "—";
    if (v < 15) return `${fmt.num(v,1)} · basso`;
    if (v <= 22) return `${fmt.num(v,1)} · medio`;
    return `${fmt.num(v,1)} · alto`;
  })();
  const s2 = table(
    row("VIX (T-1)",       "VIX",       vixTier) +
    row("Breadth (1m)",    "Breadth",   (() => { const b=safeNum(calc?.breadth); return b==null?"—":fmt.pct(b*100,0); })()) +
    row("Risk Tilt (z)",   "RiskTilt",  fmt.num(calc?.z_risk_tilt)) +
    row("Z-score (def.)",  "ZScore",    "Standardizzazione su 10 settori SPDR")
  );

  // Sezione 3 — Trends macro
  const s3 = table(
    row("Growth Momentum",    "GrowthMomentum",    trends?.growth_momentum?.value ?? "—") +
    row("Inflation Momentum", "InflationMomentum", trends?.inflation_momentum?.value ?? "—") +
    row("Liquidity Impulse",  "LiquidityImpulse",  `${fmt.num(trends?.liquidity_impulse?.score)} (${trends?.liquidity_impulse?.value ?? "—"})`) +
    row("Credit HY Spread",   "CreditHYSpread",    `${fmt.num(trends?.credit_hy_spread?.score)} (${trends?.credit_hy_spread?.value ?? "—"})`)
  );

  // Sezione 4 — Drivers di mercato
  const s4 = table(
    row("DXY Trend",          "DXYTrend",          `${fmt.num(drivers?.dxy_trend?.score)} (${drivers?.dxy_trend?.value ?? "—"})`) +
    row("UST10Y Trend",       "UST10YTrend",       `${fmt.num(drivers?.ust10y_trend?.score)} (${drivers?.ust10y_trend?.value ?? "—"})`) +
    row("Commodities Beta",   "CommoditiesBeta",   `${fmt.num(drivers?.commodities_beta?.score)} (${drivers?.commodities_beta?.value ?? "—"})`) +
    row("Policy Stance (1M)", "PolicyStance",      drivers?.policy_stance_1m?.value ?? "—")
  );

  // Sezione 5 — Flussi settoriali (tabella)
  const top3 = Array.isArray(decision?.top3_inflow) ? decision.top3_inflow : [];
  const s5TableRows = sectors.map(s => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid var(--br)"><code>${s.symbol||"—"}</code></td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--br)">${s.name||"—"}</td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--br)">${fmt.num(s.perf_1m,2)}%</td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--br)">${fmt.moneyMM(s.inflow_5d)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--br)">${fmt.num(s.z_inflow)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--br)">${fmt.num(s.z_perf1m)}</td>
    </tr>`).join("");
  const s5 = `
    <div style="margin-bottom:6px;display:flex;align-items:center;gap:.5rem">
      ${labelWithInfo("Top 3 inflow (5d)", "Inflow5d")}
      <div>${chipList(top3.map(x=>x.symbol))}</div>
    </div>
    <div style="overflow:auto">
      <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:560px">
        <thead>
          <tr style="text-align:left;color:var(--muted)">
            <th style="padding:6px 8px;border-bottom:1px solid var(--br)">Ticker</th>
            <th style="padding:6px 8px;border-bottom:1px solid var(--br)">Settore</th>
            <th style="padding:6px 8px;border-bottom:1px solid var(--br)">${labelWithInfo("Perf 1m", "Perf1m")}</th>
            <th style="padding:6px 8px;border-bottom:1px solid var(--br)">${labelWithInfo("Inflow 5d", "Inflow5d")}</th>
            <th style="padding:6px 8px;border-bottom:1px solid var(--br)">${labelWithInfo("z(Inflow)", "ZInflow")}</th>
            <th style="padding:6px 8px;border-bottom:1px solid var(--br)">${labelWithInfo("z(Perf1m)", "ZPerf1m")}</th>
          </tr>
        </thead>
        <tbody>${s5TableRows || `<tr><td colspan="6" class="text-muted-12">—</td></tr>`}</tbody>
      </table>
    </div>
  `;

  // Sezione 6 — Filtri F2 coerenti
  const s6 = table(
    row("Preset screening (F2)", "F2Filters",
        Array.isArray(f2?.filters)&&f2.filters.length ? `<ul style="margin:.25rem 0 .1rem 1.1rem;list-style:disc">${f2.filters.map(f=>`<li>${f}</li>`).join("")}</ul>` : "—"
    )
  );

  // Sezione 7 — Audit (in fondo)
  const s7 = table(
    row("AuditPathID", "AuditPathID", audit?.path_id || "—") +
    row("Fonti",       "Sources",     (audit?.sources||[]).join(", ") || "—") +
    row("As of",       "AsOf",        meta?.asof || "—") +
    row("Freshness",   "Freshness",   meta?.freshness || "—") +
    row("Coverage",    "Coverage",    meta?.coverage!=null ? fmt.pct(meta.coverage*100,0) : "—") +
    row("Confidence",  "Confidence",  meta?.confidence!=null ? fmt.num(meta.confidence,2) : (meta?.confidence_f1!=null?fmt.num(meta.confidence_f1,2):"—"))
  );

  // Monta HTML Drawer
  const html = `
    <div style="display:grid;gap:14px">
      <section>
        <h4 style="margin:0 0 6px;font-weight:800">Decisione & Regole</h4>
        ${s1}
      </section>
      <section>
        <h4 style="margin:6px 0;font-weight:800">Input & Calcoli</h4>
        ${s2}
      </section>
      <section>
        <h4 style="margin:6px 0;font-weight:800">Trends macro</h4>
        ${s3}
      </section>
      <section>
        <h4 style="margin:6px 0;font-weight:800">Drivers di mercato</h4>
        ${s4}
      </section>
      <section>
        <h4 style="margin:6px 0;font-weight:800">Flussi settoriali (Top 10 SPDR)</h4>
        ${s5}
      </section>
      <section>
        <h4 style="margin:6px 0;font-weight:800">Filtri F2 coerenti</h4>
        ${s6}
      </section>
      <section>
        <h4 style="margin:6px 0;font-weight:800">Audit</h4>
        ${s7}
      </section>
    </div>
  `;

  // Bind bottone Dettagli → Drawer unico
  root.querySelector('[data-act="details"]')?.addEventListener("click", () => {
    const subtitle = meta?.asof ? `As of ${fmt.date(meta.asof)}` : "—";
    ctx.openDrawer?.("F1B · Dettagli", subtitle, html);
    if (window.lucide) { try { window.lucide.createIcons(); } catch {} }
  });
}
