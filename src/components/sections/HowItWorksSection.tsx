import { howItWorksCopy } from '@/content/copy'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'

export function HowItWorksSection() {
  return (
    <Section id="come-funziona" title={howItWorksCopy.title}>
      <div className="grid gap-6 md:grid-cols-3">
        {howItWorksCopy.steps.map((step, index) => (
          <Card key={step.title} className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Step {index + 1}
            </span>
            <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
            <p className="text-sm text-slate-600">{step.text}</p>
          </Card>
        ))}
      </div>
    </Section>
  )
}
