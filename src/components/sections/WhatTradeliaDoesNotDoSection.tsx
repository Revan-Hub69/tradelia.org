import { whatTradeliaDoesNotDoCopy } from '@/content/copy'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'

export function WhatTradeliaDoesNotDoSection() {
  return (
    <Section
      id="cosa-non-fa"
      eyebrow="Limiti chiari"
      title={whatTradeliaDoesNotDoCopy.title}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {whatTradeliaDoesNotDoCopy.bullets.map((item) => (
          <Card key={item} className="text-sm text-slate-600">
            {item}
          </Card>
        ))}
      </div>
    </Section>
  )
}
