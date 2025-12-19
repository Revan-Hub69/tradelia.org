type LogoMarkProps = {
  className?: string
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="tradelia-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop stopColor="#38bdf8" offset="0%" />
          <stop stopColor="#0ea5e9" offset="40%" />
          <stop stopColor="#0b1729" offset="100%" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="68" height="68" rx="16" fill="url(#tradelia-grad)" />
      <path
        d="M22 20h12v20l20-20h12l-32 34v14H22V20Z"
        fill="#e2e8f0"
      />
      <path
        d="M40 48l16-18h8L40 56l-6 6"
        stroke="#0ea5e9"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  )
}
