import React from 'react'

interface RiskMidIconProps {
  className?: string
}

export const RiskMidIcon: React.FC<RiskMidIconProps> = ({ className = '' }) => {
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
        d="M12 2L3 7v10l9 5 9-5V7l-9-5z M9 9l6 6 M15 9l-6 6"
      />
    </svg>
  )
}
