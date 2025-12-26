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
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Tradelia logo"
    >
      <defs>
        <linearGradient id="t-accent" x1="14" y1="12" x2="106" y2="108" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
        <radialGradient id="t-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 54) rotate(90) scale(54)">
          <stop stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--accent-2)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="54" fill="#0f172a" />
      <circle cx="60" cy="60" r="52" stroke="url(#t-accent)" strokeWidth="2.2" />
      <circle cx="60" cy="60" r="50" fill="url(#t-glow)" opacity="0.45" />
      <g filter="url(#shadow-soft)">
        <path
          d="M36 30c0-2.209 1.791-4 4-4h40c2.209 0 4 1.791 4 4v14c0 2.209-1.791 4-4 4H70v31.5c0 2.209-1.791 4-4 4H50c-2.761 0-5-2.239-5-5V30Z"
          fill="url(#t-accent)"
          opacity="0.95"
        />
        <path
          d="M52 28v12c0 2.209-1.791 4-4 4h-5"
          stroke="#0f172a"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M73 28v9c0 2.209-1.791 4-4 4H52"
          stroke="#0f172a"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <filter id="shadow-soft" x="22" y="16" width="82" height="92" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
          <feOffset dy="4" />
          <feComposite in2="blur" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.08 0 0 0 0 0.2 0 0 0 0.35 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  )
}

export default TradeliaLogo
