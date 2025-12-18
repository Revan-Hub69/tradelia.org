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
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Geometric pattern background */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer hexagon */}
        <path
          d="M24 4L36 12V28L24 36L12 28V12L24 4Z"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse-slow"
        />
        
        {/* Inner T shape */}
        <path
          d="M16 16H32M24 16V32"
          stroke="url(#logoGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#glow)"
        />
        
        {/* Corner accents */}
        <circle cx="24" cy="12" r="2" fill="url(#logoGradient)" className="animate-pulse" />
        <circle cx="30" cy="28" r="1.5" fill="url(#logoGradient)" className="animate-pulse" style={{animationDelay: '0.5s'}} />
        <circle cx="18" cy="28" r="1.5" fill="url(#logoGradient)" className="animate-pulse" style={{animationDelay: '1s'}} />
      </svg>
    </div>
  )
}