import React from 'react'

interface TradeliaLogoProps {
  className?: string
  size?: number
}

export const TradeliaLogo: React.FC<TradeliaLogoProps> = ({
  className = '',
  size = 32
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Tradelia mark"
    >
      <defs>
        <linearGradient id="t-accent" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      <rect x="7" y="7" width="50" height="50" rx="14" fill="url(#t-accent)" opacity="0.1" />
      <rect x="12" y="12" width="40" height="40" rx="10" fill="#0f172a" />
      <path
        d="M22 20.5C22 19.12 23.12 18 24.5 18h15c1.38 0 2.5 1.12 2.5 2.5v4.75c0 1.38-1.12 2.5-2.5 2.5H29v14.75c0 1.38-1.12 2.5-2.5 2.5H24c-1.1 0-2-.9-2-2V20.5Z"
        fill="url(#t-accent)"
      />
      <path
        d="M29 19v8.25c0 1.38-1.12 2.5-2.5 2.5H24"
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M38 19v5c0 1.38-1.12 2.5-2.5 2.5H29"
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default TradeliaLogo
