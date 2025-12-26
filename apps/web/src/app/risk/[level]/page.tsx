interface RiskLevelPageProps {
  params: {
    level: string
  }
}

export default function RiskLevelPage({ params }: RiskLevelPageProps) {
  const { level } = params

  const levelLabels = {
    'contenuto': 'Contenuto',
    'intermedio': 'Intermedio',
    'elevato': 'Elevato',
    'molto-elevato': 'Molto Elevato'
  }

  const levelLabel = levelLabels[level as keyof typeof levelLabels] || level

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-[var(--ink)] mb-6">
          Livello di Rischio: {levelLabel}
        </h1>
        <p className="text-lg text-[var(--muted)]">
          {`Contenuto specifico per il livello di rischio "${levelLabel}".`}
          <br />
          Informazioni dettagliate sulla gestione del rischio a questo livello.
        </p>
      </main>
    </div>
  )
}
