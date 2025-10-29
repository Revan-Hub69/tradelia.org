function metricRowUniform(label, metricObj, desc, metricKeyForTooltip) {
  const { dotColor, textColor } = toneColors(metricObj?.tone);
  const rawVal = metricObj?.raw || "—";
  const note   = metricObj?.ai_note || "";

  return `
    <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-start gap-2 min-w-0">
          <span class="inline-block w-[8px] h-[8px] rounded-full flex-shrink-0"
            style="background:${dotColor};"></span>

          <div class="min-w-0">
            <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide flex items-center gap-1">
              <span class="truncate">${escapeHtml(label)}</span>
              <button
                class="info-btn flex-shrink-0"
                data-metric="${escapeAttr(metricKeyForTooltip || label)}"
                aria-label="Info ${escapeAttr(metricKeyForTooltip || label)}"
                style="line-height:1"
              >?</button>
            </div>

            <div class="font-mono font-bold text-[13px] leading-[1.4] break-words"
              style="color:${textColor};">
              ${escapeHtml(rawVal)}
            </div>

            <div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">
              ${escapeHtml(desc || "")}
            </div>

            <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">
              ${escapeHtml(note)}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function listBlockUniform(title, arr, opts={}) {
  const mono = !!opts.mono;
  const items = Array.isArray(arr) && arr.length
    ? arr.map(item => `
        <li class="${mono
          ? 'font-mono text-[12px] leading-[1.4] text-[color:var(--ink)]'
          : 'text-[12.5px] leading-[1.45] text-[color:var(--ink)]'
        }">
          ${escapeHtml(item)}
        </li>
      `).join("")
    : `<li class="text-[12.5px] leading-[1.45] text-[color:var(--muted)]">N/A</li>`;

  return `
    <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
      <div class="flex items-start gap-2 mb-1">
        <span class="inline-block w-[8px] h-[8px] rounded-full flex-shrink-0"
          style="background:var(--tone-neu-fg);"></span>
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide">
          ${escapeHtml(title)}
        </div>
      </div>

      <ul class="pl-4 list-disc space-y-1">
        ${items}
      </ul>
    </div>
  `;
}

function headlineBlockUniform(title, body) {
  if (!body) return "";
  return `
    <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
      <div class="flex items-start gap-2 mb-1">
        <span class="inline-block w-[8px] h-[8px] rounded-full flex-shrink-0"
          style="background:var(--tone-neu-fg);"></span>
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide">
          ${escapeHtml(title)}
        </div>
      </div>

      <div class="whitespace-pre-line">
        ${escapeHtml(body)}
      </div>
    </div>
  `;
}

function conclusionPointRow(pointObj = {}) {
  return `
    <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
      <div class="flex items-start gap-2 mb-1">
        <span class="inline-block w-[8px] h-[8px] rounded-full flex-shrink-0"
          style="background:var(--tone-neu-fg);"></span>
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide">
          ${escapeHtml(pointObj.title || "")}
        </div>
      </div>

      <div class="font-mono text-[12px] leading-[1.4] text-[color:var(--ink)] mb-1">
        ${escapeHtml(pointObj.raw || "")}
      </div>

      <div class="text-[11px] leading-[1.4] text-[color:var(--muted)]">
        ${escapeHtml(pointObj.ai_note || "")}
      </div>
    </div>
  `;
}

function qualityRow(keyName, qObj) {
  if (!qObj) return "";
  const { dotColor, textColor } = toneColors(qObj.tone);

  return `
    <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-start gap-2 min-w-0">
          <span class="inline-block w-[8px] h-[8px] rounded-full flex-shrink-0"
            style="background:${dotColor};"></span>

          <div class="min-w-0">
            <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide flex items-center gap-1">
              <span class="truncate">${escapeHtml(keyName || "")}</span>
              <button
                class="info-btn flex-shrink-0"
                data-metric="${escapeAttr(keyName || "")}"
                aria-label="Info ${escapeAttr(keyName || "")}"
                style="line-height:1"
              >?</button>
            </div>

            <div class="font-mono font-bold text-[13px] leading-[1.4] break-words"
              style="color:${textColor};">
              ${escapeHtml(qObj.raw || "—")}
            </div>

            <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">
              ${escapeHtml(qObj.ai_note || "")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function noteBlockMuted(noteStr) {
  if (!noteStr) return "";
  return `
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)]">
      ${escapeHtml(noteStr)}
    </div>
  `;
}
