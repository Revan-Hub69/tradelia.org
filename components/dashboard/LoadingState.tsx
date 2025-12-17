'use client';

export function LoadingState({ message = 'Caricamento...' }: { message?: string }) {
  return (
    <div className="w-full flex items-center justify-center py-12">
      <div className="text-sm opacity-80">{message}</div>
    </div>
  );
}

