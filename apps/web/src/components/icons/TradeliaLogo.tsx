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
        <linearGradient id="accent" x1="12" y1="8" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="48" height="48" rx="12" fill="url(#accent)" opacity="0.14" />
      <path
        d="M16 18.5c0-1.657 1.343-3 3-3h26c1.657 0 3 1.343 3 3v9.5c0 6.903-3.61 13.34-9.734 16.743l-6.266 3.507-6.266-3.507C19.61 41.34 16 34.903 16 28V18.5Z"
        stroke="var(--ink)"
        strokeWidth="2.4"
        fill="white"
        fillOpacity="0.82"
        strokeLinejoin="round"
      />
      <path
        d="M24 22h16c1.657 0 3 1.343 3 3v1c0 1.657-1.343 3-3 3h-8v10.5"
        stroke="var(--ink)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 22v7c0 1.657 1.343 3 3 3h5"
        stroke="var(--accent)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default TradeliaLogo
