type LogoMarkProps = {
  className?: string
}

import { useMemo } from 'react'

export function LogoMark({ className }: LogoMarkProps) {
  const gradientId = useMemo(
    () => `tradelia-grad-${Math.random().toString(36).slice(2, 7)}`,
    []
  )

  return (
    <svg
      viewBox="0 0 80 80"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop stopColor="#38bdf8" offset="0%" />
          <stop stopColor="#0ea5e9" offset="40%" />
          <stop stopColor="#0b1729" offset="100%" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="68" height="68" rx="16" fill={`url(#${gradientId})`} />
      <rect x="11" y="11" width="58" height="58" rx="12" fill="#0b1729" opacity="0.25" />
      <path
        d="M22 20h36v8H46v32h-8V28H22v-8Z"
        fill="#e2e8f0"
      />
      <path
        d="M22 20h36v8H46v4l-8 9V28H22v-8Z"
        fill="#38bdf8"
        opacity="0.85"
      />
    </svg>
  )
}
