import { cn } from '@/lib/utils'

type StepperProps = {
  steps: string[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <ol className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isComplete = index < currentStep
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold',
                isActive && 'border-slate-900 text-slate-900',
                isComplete && 'border-emerald-500 bg-emerald-50 text-emerald-600',
                !isActive && !isComplete && 'border-slate-200 text-slate-400'
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              {index + 1}
            </span>
            <span className={cn(isActive && 'text-slate-900')}>{step}</span>
          </li>
        )
      })}
    </ol>
  )
}
