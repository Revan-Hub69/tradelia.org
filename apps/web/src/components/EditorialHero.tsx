'use client'

interface EditorialHeroProps {
  title: string
  lede: string[]
}

export function EditorialHero({ title, lede }: EditorialHeroProps) {
  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center">
          {/* Main title */}
          <h1 className="text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl lg:text-6xl mb-8">
            {title}
          </h1>

          {/* Lede paragraphs */}
          <div className="space-y-6 text-lg text-[var(--muted)] leading-relaxed max-w-2xl mx-auto">
            {lede.map((paragraph, index) => (
              <p key={index} className="text-xl sm:text-2xl">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
