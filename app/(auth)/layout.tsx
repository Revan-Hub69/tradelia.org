import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.12),_rgba(10,14,26,1))] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        {children}
      </div>
    </div>
  );
}
