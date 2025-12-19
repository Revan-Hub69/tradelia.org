import { cn } from '@/lib/utils'

interface Step {
  id: string
  title: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={cn('mb-8', className)}>
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <li key={step.id} className="flex-1">
              <div className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium',
                      {
                        'border-slate-800 bg-slate-800 text-white': isCompleted,
                        'border-slate-800 bg-white text-slate-800': isCurrent,
                        'border-slate-300 bg-white text-slate-500': isUpcoming,
                      }
                    )}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {isCompleted ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        {
                          'text-slate-900': isCompleted || isCurrent,
                          'text-slate-500': isUpcoming,
                        }
                      )}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="text-xs text-slate-500">{step.description}</p>
                    )}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'ml-4 h-0.5 w-full',
                      {
                        'bg-slate-800': stepNumber < currentStep,
                        'bg-slate-300': stepNumber >= currentStep,
                      }
                    )}
                  />
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}