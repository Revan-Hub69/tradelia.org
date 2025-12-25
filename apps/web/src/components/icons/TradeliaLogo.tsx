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
        <linearGradient id="t-accent" x1="14" y1="10" x2="50" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      <rect x="6.5" y="6.5" width="51" height="51" rx="14" fill="url(#t-accent)" opacity="0.15" />
      <path
        d="M18 18.5c0-1.933 1.567-3.5 3.5-3.5h21c1.933 0 3.5 1.567 3.5 3.5v11.2c0 6.63-3.86 12.67-9.9 15.48l-4.6 2.17-4.6-2.17C21.86 42.37 18 36.33 18 29.7V18.5Z"
        stroke="var(--ink)"
        strokeWidth="2.2"
        fill="white"
        fillOpacity="0.9"
        strokeLinejoin="round"
      />
      <path
        d="M24 22h16c1.657 0 3 1.343 3 3v1.2c0 1.657-1.343 3-3 3h-6.2V42"
        stroke="var(--ink)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 22v6.6c0 1.657 1.343 3 3 3h4"
        stroke="var(--accent)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default TradeliaLogo
