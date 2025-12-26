import React, { useId } from 'react'

interface TradeliaLogoProps {
  className?: string
  size?: number
}

export const TradeliaLogo: React.FC<TradeliaLogoProps> = ({
  className = '',
  size = 32
}) => {
  const gradientId = useId()
  const glowId = useId()
  const filterId = useId()

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
        <linearGradient id={gradientId} x1="20" y1="18" x2="102" y2="104" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F8CFF" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
        <radialGradient id={glowId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 58) rotate(90) scale(54)">
          <stop stopColor="#4F8CFF" stopOpacity="0.22" />
          <stop offset="1" stopColor="#06B6D4" stopOpacity="0" />
        </radialGradient>
        <filter id={filterId} x="10" y="10" width="100" height="100" filterUnits="userSpaceOnUse">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feOffset dy="2" />
          <feComposite in2="blur" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.08 0 0 0 0 0.2 0 0 0 0.25 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>

      <rect x="10" y="10" width="100" height="100" rx="26" fill="#0B1220" />
      <rect x="10" y="10" width="100" height="100" rx="26" stroke={`url(#${gradientId})`} strokeWidth="2" />
      <rect x="14" y="14" width="92" height="92" rx="22" fill={`url(#${glowId})`} opacity="0.9" />

      <path d="M32 38c0-2.2 1.8-4 4-4h48c2.2 0 4 1.8 4 4v10c0 2.2-1.8 4-4 4H66v38c0 2.2-1.8 4-4 4H52c-2.8 0-5-2.2-5-5V56H36c-2.2 0-4-1.8-4-4V38Z" fill={`url(#${gradientId})`} opacity="0.95" filter={`url(#${filterId})`} />
      <path d="M84 56l-10 10" stroke="#0B1220" strokeWidth="4" strokeLinecap="round" />
      <circle cx="74" cy="66" r="2.6" fill="#0B1220" />
    </svg>
  )
}

export default TradeliaLogo
