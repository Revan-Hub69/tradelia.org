type FadeInProps = {
  children: React.ReactNode
  className?: string
}

export function FadeIn({ children, className }: FadeInProps) {
  return <div className={className}>{children}</div>
}
