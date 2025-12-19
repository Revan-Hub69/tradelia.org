import { methodCopy } from '@/content/copy'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'

export function MethodSection() {
  return (
    <Section id="metodo" eyebrow="Metodo" title={methodCopy.title}>
      <div className="grid gap-6 md:grid-cols-3">
        {methodCopy.levels.map((level) => (
          <Card key={level.title} className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">{level.title}</h3>
            <p className="text-sm text-slate-600">{level.text}</p>
          </Card>
        ))}
      </div>
    </Section>
  )
}
