// Tradelia · F1B (Market Strategy) — V3 istituzionale 2026
// Card chiusa essenziale + Drawer unico. Tutte le voci hanno tooltip.
// Dipendenze: tokens.css (badge/kpi/btn/card-compact) + popover già in index.

const safeNum = v => (Number.isFinite(+v) ? +v : null);
const fmt = {
  pct(v, d = 0) { const n = safeNum(v); return n == null ? "—" : `${n.toFixed(d)}%`; },
  num(v, d = 2) { const n = safeNum(v); return n == null ? "—" : n.toFixed(d); },
  moneyMM(v)    { const n = safeNum(v); return n == null ? "—" : `${n.toLocaleString(undefined,{maximumFractionDigits:0})}M`; },
  date(s)       { return s || "—"; }
};
const toneDot   = t => ({g:"dot-g",y:"dot-y",r:"dot-r",n:"dot-n"}[String(t||"n").toLowerCase()]||"dot-n");
const toneBadge = t => ({g:"badge--g",y:"badge--y",r:"badge--r",n:"badge--n"}[String(t||"n").toLowerCase()]||"badge--n");

// semaforo coerente con le soglie F1B
function toneForStrategy(mode, score){
  const m = String(mode||"").toLowerCase();
  if (m==="momentum") return "g";
  if (m==="momentum-light") return "y";
  if (m==="pullback") return "r";
  const s = safeNum(score);
  if (s==null) return "n";
  if (s>=0.35) return "g";
  if (s>=0.10) return "y";
  return "r";
}
function toneForBreadth(b){
  const n = safeNum(b);
  if (n==null) return "n";
  if (n>=0.60) return "g";
  if (n>=0.40) return "y";
  return "r";
}

/* ---------- micro componenti con tooltip ---------- */
function infoBtn(key, labelA11y) {
  return `<button class="info-btn" data-metric="${key}" aria-label="Info ${labelA11y}" title="Info">?</button>`;
}
function kv(label, key, valueHTML) {
  // Riga “chiave : valore” con tooltip. Layout consistente da report.
  return `
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:.75rem">
      <div class="text-muted-12" style="display:inline-flex;align-items:center;gap:.35rem">
        <span>${label}</span>${infoBtn(key, label)}
      </div>
      <div style="font-weight:700">${valueHTML}</div>
    </div>`;
}
function table(rowsHTML) {
  return `<table style="width:100%;border-collapse:collapse;font-size:13px"><tbody>${rowsHTML}</tbody></table>`;
}
function trow(label, key, valueHTML) {
  return `
  <tr>
    <td style="padding:6px 8px;border-bottom:1px solid var(--br);width:42%;color:var(--muted)">
      <div class="flex items-center gap-1"><span class="meta-label">${label}</span>${infoBtn(key,label)}</div>
    </td>
    <td style="padding:6px 8px;border-bottom:1px solid var(--br);color:var(--ink)">${valueHTML}</td>
  </tr>`;
}

/* =========================
   CARD CHIUSA — versione istituzionale
========================= */
export function renderCard(data, { featured=false, title="F1B · Market Strategy" } = {}) {
  const wrap = document.createElement(featured ? "section" : "article");
  if (featured) {
    Object.assign(wrap.style, {
      border:"1px solid var(--br)", borderRadius:"18px", background:"var(--card)",
      boxShadow:"var(--shadow-2)", padding:"16px", marginBottom:"16px"
    });
  } else {
    wrap.className = "card-compact";
  }

  const meta = data?.meta||{};
  const calc = data?.calc||{};
  const decision = data?.decision||{};
  const asof = meta.asof||"—";
  const fresh = meta.freshness||"—";

  const mode = decision?.strategy_mode || "—";
  const toneS = toneForStrategy(mode, calc?.regime_score);

  const breadth = safeNum(calc?.breadth);
  const breadthPct = breadth!=null ? fmt.pct(breadth*100,0) : "—";
  const toneB = toneForBreadth(breadth);

  const top3 = Array.isArray(decision?.top3_inflow) ? decision.top3_inflow.slice(0,3) : [];
  const chips = top3.length
    ? top3.map(x=>`<span class="badge badge--n" style="font-weight:700"><code>${x.symbol||'—'}</code></span>`).join(" ")
    : `<span class="text-muted-12">—</span>`;

  // Testata sobria: titolo + pill di stato a destra
  wrap.innerHTML = `
    <div class="card-compact__head" style="align-items:center;padding-bottom:8px">
      <div class="card-compact__title" style="font-weight:800">${title}</div>
      <span class="badge ${toneBadge(toneS)}" style="font-weight:800">${mode}</span>
    </div>

    <div class="card-compact__body" style="display:grid;gap:12px">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
        ${kv("StrategyMode","StrategyMode",
            `<span class="kpi"><span class="dot ${toneDot(toneS)}"></span><span>${mode}</span></span>`)}
        ${kv("Breadth (1m)","Breadth",
            `<span class="kpi"><span class="dot ${toneDot(toneB)}"></span><span>${breadthPct}</span></span>`)}
        <div>
          <div class="text-muted-12" style="display:inline-flex;align-items:center;gap:.35rem;margin-bottom:6px">
            <span>Top inflow (5d)</span>${infoBtn("Inflow5d","Top inflow (5d)")}
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">${chips}</div>
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:4px">
        <div class="flex items-center gap-5">
          <span class="text-muted-12" style="display:inline-flex;align-items:center;gap:.35rem">
            <strong>${fmt.date(asof)}</strong>${infoBtn("AsOf","As of")}
          </span>
          <span class="text-muted-12" style="display:inline-flex;align-items:center;gap:.35rem">
            <strong>${fresh}</strong>${infoBtn("Freshness","Freshness")}
          </span>
        </div>
        <button class="btn btn-sm" type="button" data-act="details"><i data-lucide="file-text"></i><span>Dettagli</span></button>
      </div>
    </div>
  `;
  return wrap;
}

/* =========================
   DRAWER “Dettagli” — 7 sezioni, griglia da report
========================= */
export function bindCard(root, data, ctx) {
  const meta = data?.meta||{};
  const regime = data?.regime||{};
  const trends = data?.trends||{};
  const drivers = data?.drivers||{};
  const sectors = Array.isArray(data?.sectors)? data.sectors: [];
  const calc = data?.calc||{};
  const decision = data?.decision||{};
  const f2 = data?.f2_filters||{};
  const audit = data?.audit||{};

  // Sez. 1 — Decisione & Regole
  const s1 = table(
    trow("StrategyMode","StrategyMode", `<strong>${decision?.strategy_mode||"—"}</strong>`) +
    trow("RegimeScore","RegimeScore", fmt.num(calc?.regime_score)) +
    trow("FlowScore","FlowScore", fmt.num(calc?.flow_score)) +
    trow("Soglie","StrategyThresholds","≥ +0.35 Momentum · +0.10–+0.35 Momentum-light · < +0.10 Pullback")
  );

  // Sez. 2 — Input & Calcoli
  const vixTier = (()=> {
    const v = safeNum(data?.inputs?.vix?.value);
    if (v==null) return "—";
    if (v < 15) return `${fmt.num(v,1)} · basso`;
    if (v <= 22) return `${fmt.num(v,1)} · medio`;
    return `${fmt.num(v,1)} · alto`;
  })();
  const s2 = table(
    trow("VIX (T-1)","VIX", vixTier) +
    trow("Breadth (1m)","Breadth", (()=>{const b=safeNum(calc?.breadth); return b==null?"—":fmt.pct(b*100,0);})()) +
    trow("Risk Tilt (z)","RiskTilt", fmt.num(calc?.z_risk_tilt)) +
    trow("Z-score (def.)","ZScore","(valore − media)/σ sui 10 SPDR")
  );

  // Sez. 3 — Trends macro
  const s3 = table(
    trow("Growth Momentum","GrowthMomentum", trends?.growth_momentum?.value ?? "—") +
    trow("Inflation Momentum","InflationMomentum", trends?.inflation_momentum?.value ?? "—") +
    trow("Liquidity Impulse","LiquidityImpulse", `${fmt.num(trends?.liquidity_impulse?.score)} (${trends?.liquidity_impulse?.value ?? "—"})`) +
    trow("Credit HY Spread","CreditHYSpread", `${fmt.num(trends?.credit_hy_spread?.score)} (${trends?.credit_hy_spread?.value ?? "—"})`)
  );

  // Sez. 4 — Drivers di mercato
  const s4 = table(
    trow("DXY Trend","DXYTrend", `${fmt.num(drivers?.dxy_trend?.score)} (${drivers?.dxy_trend?.value ?? "—"})`) +
    trow("UST10Y Trend","UST10YTrend", `${fmt.num(drivers?.ust10y_trend?.score)} (${drivers?.ust10y_trend?.value ?? "—"})`) +
    trow("Commodities Beta","CommoditiesBeta", `${fmt.num(drivers?.commodities_beta?.score)} (${drivers?.commodities_beta?.value ?? "—"})`) +
    trow("Policy Stance (1M)","PolicyStance", drivers?.policy_stance_1m?.value ?? "—")
  );

  // Sez. 5 — Flussi settoriali (Top 10 SPDR)
  const top3 = Array.isArray(decision?.top3_inflow) ? decision.top3_inflow : [];
  const s5Head = `
    <div style="margin-bottom:6px;display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">
      <div class="flex items-center gap-1">
        <div class="meta-label">Top 3 inflow (5d)</div>${infoBtn("Inflow5d","Inflow 5d")}
      </div>
      <div>
        ${top3.length ? top3.map(x=>`<span class="badge badge--n" style="font-weight:700"><code>${x.symbol}</code></span>`).join(" ") : "—"}
      </div>
    </div>`;
  const s5Rows = sectors.map(s=>`
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid var(--br)"><code>${s.symbol||"—"}</code></td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--br)">${s.name||"—"}</td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--br)">${fmt.num(s.perf_1m,2)}%</td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--br)">${fmt.moneyMM(s.inflow_5d)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--br)">${fmt.num(s.z_inflow)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--br)">${fmt.num(s.z_perf1m)}</td>
    </tr>`).join("");
  const s5 = `
    ${s5Head}
    <div style="overflow:auto">
      <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:560px">
        <thead>
          <tr style="text-align:left;color:var(--muted)">
            <th style="padding:6px 8px;border-bottom:1px solid var(--br)">Ticker</th>
            <th style="padding:6px 8px;border-bottom:1px solid var(--br)">Settore</th>
            <th style="padding:6px 8px;border-bottom:1px solid var(--br)">
              <div class="flex items-center gap-1"><span class="meta-label">Perf 1m</span>${infoBtn("Perf1m","Perf 1m")}</div>
            </th>
            <th style="padding:6px 8px;border-bottom:1px solid var(--br)">
              <div class="flex items-center gap-1"><span class="meta-label">Inflow 5d</span>${infoBtn("Inflow5d","Inflow 5d")}</div>
            </th>
            <th style="padding:6px 8px;border-bottom:1px solid var(--br)">
              <div class="flex items-center gap-1"><span class="meta-label">z(Inflow)</span>${infoBtn("ZInflow","z Inflow")}</div>
            </th>
            <th style="padding:6px 8px;border-bottom:1px solid var(--br)">
              <div class="flex items-center gap-1"><span class="meta-label">z(Perf1m)</span>${infoBtn("ZPerf1m","z Perf1m")}</div>
            </th>
          </tr>
        </thead>
        <tbody>${s5Rows || `<tr><td colspan="6" class="text-muted-12">—</td></tr>`}</tbody>
      </table>
    </div>`;

  // Sez. 6 — Filtri F2 coerenti
  const s6 = table(
    trow("Preset screening (F2)","F2Filters",
      (Array.isArray(f2?.filters)&&f2.filters.length)
        ? `<ul style="margin:.25rem 0 .1rem 1.1rem;list-style:disc">${f2.filters.map(f=>`<li>${f}</li>`).join("")}</ul>`
        : "—"
    )
  );

  // Sez. 7 — Audit (in coda, stesso drawer)
  const s7 = table(
    trow("AuditPathID","AuditPathID", audit?.path_id || "—") +
    trow("Fonti","Sources", (audit?.sources||[]).join(", ") || "—") +
    trow("As of","AsOf", meta?.asof || "—") +
    trow("Freshness","Freshness", meta?.freshness || "—") +
    trow("Coverage","Coverage", meta?.coverage!=null ? `${fmt.pct(meta.coverage*100,0)}` : "—") +
    trow("Confidence","Confidence", meta?.confidence!=null ? fmt.num(meta.confidence,2) : (meta?.confidence_f1!=null? fmt.num(meta.confidence_f1,2) : "—"))
  );

  const html = `
    <div style="display:grid;gap:14px">
      <section><h4 style="margin:0 0 6px;font-weight:800">Decisione & Regole</h4>${s1}</section>
      <section><h4 style="margin:6px 0;font-weight:800">Input & Calcoli</h4>${s2}</section>
      <section><h4 style="margin:6px 0;font-weight:800">Trends macro</h4>${s3}</section>
      <section><h4 style="margin:6px 0;font-weight:800">Drivers di mercato</h4>${s4}</section>
      <section><h4 style="margin:6px 0;font-weight:800">Flussi settoriali (Top 10 SPDR)</h4>${s5}</section>
      <section><h4 style="margin:6px 0;font-weight:800">Filtri F2 coerenti</h4>${s6}</section>
      <section><h4 style="margin:6px 0;font-weight:800">Audit</h4>${s7}</section>
    </div>`;

  root.querySelector('[data-act="details"]')?.addEventListener("click", () => {
    const subtitle = meta?.asof ? `As of ${fmt.date(meta.asof)}` : "—";
    ctx.openDrawer?.("F1B · Dettagli", subtitle, html);
    if (window.lucide) { try { window.lucide.createIcons(); } catch {} }
  });
}
