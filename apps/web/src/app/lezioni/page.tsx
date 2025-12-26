export default function LessonsIndexPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-16 text-[var(--ink)]">
      <section className="space-y-3">
        <p className="text-sm text-[var(--muted)] uppercase tracking-wide">Lezioni</p>
        <h1 className="text-3xl font-semibold leading-tight">Indice lezioni</h1>
        <p className="text-lg text-[var(--muted)] leading-relaxed">
          Le micro-lezioni statiche saranno pubblicate qui. Ogni voce seguirà la struttura obbligatoria: situazione reale, errore comune, perché è rischioso, regola pratica, cosa fare ora con CTA affiliata, disclaimer educativo.
        </p>
      </section>
    </main>
  )
}
