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
      aria-label="Tradelia logo"
    >
      <defs>
        <linearGradient id="t-accent" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="48" height="48" rx="14" fill="url(#t-accent)" opacity="0.12" />
      <rect x="13.5" y="13.5" width="37" height="37" rx="10" fill="#0f172a" stroke="url(#t-accent)" strokeWidth="1.2" />
      <path
        d="M22 20.5c0-1.38 1.12-2.5 2.5-2.5h15c1.38 0 2.5 1.12 2.5 2.5v4.4c0 1.38-1.12 2.5-2.5 2.5h-6.4v16.1c0 1.38-1.12 2.5-2.5 2.5h-3.1c-1.1 0-2-.9-2-2V20.5Z"
        fill="url(#t-accent)"
      />
      <path
        d="M30 18v7.9c0 1.38-1.12 2.5-2.5 2.5H24"
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M38.5 18v5c0 1.38-1.12 2.5-2.5 2.5H30"
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M35 32c2 1.6 3.2 4.1 3.2 6.8 0 2-0.7 3.8-2 5.3"
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default TradeliaLogo
