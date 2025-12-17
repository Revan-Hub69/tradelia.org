'use client';

export function ErrorState({
  title = 'Errore',
  message = 'Qualcosa è andato storto.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="w-full py-12">
      <div className="max-w-xl mx-auto border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="opacity-80 mb-4">{message}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-2 rounded-lg border text-sm"
            type="button"
          >
            Riprova
          </button>
        )}
      </div>
    </div>
  );
}
