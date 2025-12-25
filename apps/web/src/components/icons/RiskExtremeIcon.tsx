import React from 'react'

interface RiskExtremeIconProps {
  className?: string
}

export const RiskExtremeIcon: React.FC<RiskExtremeIconProps> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2L3 7v10l9 5 9-5V7l-9-5z M9.5 9.5l5 5 M14.5 9.5l-5 5 M12 7v3 M12 14v3"
      />
    </svg>
  )
}
