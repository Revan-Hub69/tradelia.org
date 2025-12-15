'use client';

import { useState, useEffect } from 'react';
import { RequestAnalysisModal } from './modals/RequestAnalysisModal';
import { ProposeAssetModal } from './modals/ProposeAssetModal';
import { DownloadPDFModal } from './modals/DownloadPDFModal';

/**
 * Modal Providers
 * Gestisce l'apertura/chiusura di tutti i modal tramite eventi custom
 */
export function ModalProviders() {
  const [requestAnalysisOpen, setRequestAnalysisOpen] = useState(false);
  const [proposeAssetOpen, setProposeAssetOpen] = useState(false);
  const [downloadPDFOpen, setDownloadPDFOpen] = useState(false);
  const [downloadPDFReportId, setDownloadPDFReportId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handleOpenRequestAnalysis = () => {
      setRequestAnalysisOpen(true);
    };

    const handleOpenProposeAsset = () => {
      setProposeAssetOpen(true);
    };

    const handleOpenDownloadPDF = (e: CustomEvent) => {
      setDownloadPDFReportId(e.detail?.reportId);
      setDownloadPDFOpen(true);
    };

    window.addEventListener('open-request-analysis-modal', handleOpenRequestAnalysis);
    window.addEventListener('open-propose-asset-modal', handleOpenProposeAsset);
    window.addEventListener('open-download-pdf-modal', handleOpenDownloadPDF as EventListener);

    return () => {
      window.removeEventListener('open-request-analysis-modal', handleOpenRequestAnalysis);
      window.removeEventListener('open-propose-asset-modal', handleOpenProposeAsset);
      window.removeEventListener('open-download-pdf-modal', handleOpenDownloadPDF as EventListener);
    };
  }, []);

  // DISABLED: Solo dashboard scalping intraday crypto per ora
  // TODO: Riabilitare quando necessario
  return null;
  
  /* DISABLED MODALS - Solo dashboard scalping intraday crypto
  return (
    <>
      <RequestAnalysisModal
        isOpen={requestAnalysisOpen}
        onClose={() => setRequestAnalysisOpen(false)}
        onSuccess={() => {
          // Refresh data se necessario
          window.dispatchEvent(new CustomEvent('refresh-requests'));
        }}
      />
      <ProposeAssetModal
        isOpen={proposeAssetOpen}
        onClose={() => setProposeAssetOpen(false)}
        onSuccess={() => {
          // Refresh data se necessario
          window.dispatchEvent(new CustomEvent('refresh-voting'));
        }}
      />
      <DownloadPDFModal
        isOpen={downloadPDFOpen}
        onClose={() => {
          setDownloadPDFOpen(false);
          setDownloadPDFReportId(undefined);
        }}
        reportId={downloadPDFReportId}
        onSuccess={() => {
          // Refresh data se necessario
          window.dispatchEvent(new CustomEvent('refresh-reports'));
        }}
      />
    </>
  );
  */
}

