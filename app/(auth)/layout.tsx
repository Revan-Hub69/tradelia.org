import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  // Layout vuoto - le pagine gestiscono il loro layout interno
  return <>{children}</>;
}
