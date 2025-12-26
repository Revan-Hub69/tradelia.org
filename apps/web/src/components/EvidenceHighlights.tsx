'use client'

type EvidenceItem = {
  title: string
  body: string
  sourceLabel: string
  sourceHref: string
}

interface EvidenceHighlightsProps {
  items: EvidenceItem[]
}

export function EvidenceHighlights({ items }: EvidenceHighlightsProps) {
  return (
    <section className="bg-[var(--bg-2)] py-6">
      <div className="mx-auto max-w-6xl px-6 lg:px-8 grid gap-4 md:grid-cols-3">
        {items.map((item, idx) => (
          <article
            key={`${item.title}-${idx}`}
            className="glass-panel p-5 border border-[var(--br)]/70 space-y-3 shadow-md hover:shadow-lg transition-shadow"
          >
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{item.title}</p>
            <p className="text-base leading-relaxed text-[var(--muted)]">{item.body}</p>
            <a
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              href={item.sourceHref}
              target="_blank"
              rel="noreferrer"
            >
              {item.sourceLabel}
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
