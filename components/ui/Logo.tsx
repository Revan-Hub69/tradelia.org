interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>
        
        {/* Institutional shield/badge shape */}
        <path
          d="M50 10 L75 25 L75 60 Q75 75 50 85 Q25 75 25 60 L25 25 Z"
          fill="url(#logoGradient)"
          stroke="#64748b"
          strokeWidth="0.5"
        />
        
        {/* Academic lettermark - stylized T */}
        <g fill="#f8fafc">
          <rect x="35" y="30" width="30" height="3" rx="1.5" />
          <rect x="48.5" y="30" width="3" height="35" rx="1.5" />
          
          {/* Verification mark - subtle checkmark */}
          <path 
            d="M42 50 L45 53 L52 46" 
            stroke="#94a3b8" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
          />
        </g>
        
        {/* Institutional border */}
        <path
          d="M50 10 L75 25 L75 60 Q75 75 50 85 Q25 75 25 60 L25 25 Z"
          fill="none"
          stroke="#475569"
          strokeWidth="1"
          opacity="0.3"
        />
      </svg>
    </div>
  )
}