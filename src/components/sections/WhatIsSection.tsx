import { whatIsCopy } from '@/content/copy'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'

export function WhatIsSection() {
  return (
    <Section
      eyebrow="Cosa fa Tradelia"
      title={whatIsCopy.title}
      description={whatIsCopy.text}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {whatIsCopy.bullets.map((item) => (
          <Card key={item} className="text-sm text-slate-600">
            {item}
          </Card>
        ))}
      </div>
    </Section>
  )
}
