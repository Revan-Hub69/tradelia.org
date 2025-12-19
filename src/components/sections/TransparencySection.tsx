import { transparencyCopy } from '@/content/copy'
import { Section } from '@/components/ui/Section'

export function TransparencySection() {
  return (
    <Section
      id="trasparenza"
      eyebrow="Trasparenza & Fonti"
      title={transparencyCopy.title}
      description={transparencyCopy.text}
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Ogni report include audit, assunzioni e note di copertura per spiegare dove
        l’attrito è stimato e dove non valutabile.
      </div>
    </Section>
  )
}
