'use client';

export function DownloadPDFModal({
  isOpen,
  onClose,
  reportId,
}: {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-[min(520px,calc(100vw-32px))] rounded-xl border bg-white p-6">
        <h3 className="text-lg font-semibold mb-2">Download PDF</h3>
        <p className="opacity-80 mb-4">
          Placeholder (reportId: <span className="font-mono text-xs">{reportId}</span>)
        </p>

        <div className="flex gap-2 justify-end">
          <button className="px-3 py-2 rounded-lg border text-sm" onClick={onClose} type="button">
            Chiudi
          </button>
          <button
            className="px-3 py-2 rounded-lg border text-sm"
            onClick={() => {
              // TODO: implementare export PDF
              onClose();
            }}
            type="button"
          >
            Scarica
          </button>
        </div>
      </div>
    </div>
  );
}
