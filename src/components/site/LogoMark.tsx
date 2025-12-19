type LogoMarkProps = {
  className?: string
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="tradelia-grad" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop stopColor="#38bdf8" offset="0%" />
          <stop stopColor="#0ea5e9" offset="50%" />
          <stop stopColor="#0b1729" offset="100%" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#tradelia-grad)" />
      <path
        d="M23 14h10v18l16-18h-10l-6 7.2V14h-10v36h10v-9.2l6-7.2V50h10V28.5L33 44V14H23Z"
        fill="#e2e8f0"
      />
    </svg>
  )
}
