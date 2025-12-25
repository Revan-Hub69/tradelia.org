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
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Tradelia AI Logo"
    >
      {/* Academic mortarboard/graduation cap */}
      <path
        d="M4 20 L16 8 L28 20 L24 20 L16 12 L8 20 Z"
        fill="#2563eb"
        stroke="#1e40af"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Tassel hanging from cap */}
      <path
        d="M20 8 Q22 6 24 8 Q22 10 20 8"
        fill="#fbbf24"
        stroke="#f59e0b"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Tassel string */}
      <line
        x1="22"
        y1="8"
        x2="22"
        y2="12"
        stroke="#f59e0b"
        strokeWidth="1"
      />

      {/* AI Circuit pattern on cap */}
      <circle cx="12" cy="14" r="1.5" fill="#06b6d4" />
      <circle cx="20" cy="14" r="1.5" fill="#06b6d4" />

      {/* Circuit connections */}
      <path
        d="M13.5 14 L18.5 14"
        stroke="#06b6d4"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Neural network nodes */}
      <circle cx="16" cy="16" r="1" fill="#8b5cf6" />
      <circle cx="12" cy="18" r="1" fill="#8b5cf6" />
      <circle cx="20" cy="18" r="1" fill="#8b5cf6" />

      {/* Neural connections */}
      <path
        d="M16 16 L12 18 M16 16 L20 18"
        stroke="#8b5cf6"
        strokeWidth="0.8"
        strokeLinecap="round"
      />

      {/* Academic scroll/book */}
      <rect
        x="10"
        y="22"
        width="12"
        height="8"
        rx="1"
        fill="#374151"
        stroke="#4b5563"
        strokeWidth="1"
      />

      {/* Scroll lines */}
      <line x1="12" y1="24" x2="20" y2="24" stroke="#6b7280" strokeWidth="0.5" />
      <line x1="12" y1="26" x2="18" y2="26" stroke="#6b7280" strokeWidth="0.5" />
      <line x1="12" y1="28" x2="19" y2="28" stroke="#6b7280" strokeWidth="0.5" />

      {/* Graduation ribbon */}
      <path
        d="M14 22 Q16 20 18 22"
        fill="none"
        stroke="#dc2626"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default TradeliaLogo
