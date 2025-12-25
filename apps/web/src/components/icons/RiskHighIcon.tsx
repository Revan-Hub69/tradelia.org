import React from 'react'

interface RiskHighIconProps {
  className?: string
}

export const RiskHighIcon: React.FC<RiskHighIconProps> = ({ className = '' }) => {
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
        d="M12 2L3 7v10l9 5 9-5V7l-9-5z M12 9v6 M9 12h6"
      />
    </svg>
  )
}
