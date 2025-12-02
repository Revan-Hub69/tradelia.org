/**
 * Glossary Icon Component
 * Icona SVG (?) molto discreta e piccola per tooltip glossario
 * Design non invasivo, minimale
 */

interface GlossaryIconProps {
  className?: string;
  size?: number;
}

export function GlossaryIcon({ className = '', size = 10 }: GlossaryIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="5"
        cy="5"
        r="4.5"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
      />
      <path
        d="M5 3.5V5M5 6.5H5.01"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

