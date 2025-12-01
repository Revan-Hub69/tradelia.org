'use client';

import { useEffect } from 'react';

/**
 * Print Watermark Component
 * Aggiunge filigrana pesante quando si stampa (browser print)
 * Riferimento: Security Best Practices, Copyright Protection
 * 
 * La filigrana appare SOLO in print (@media print), non sullo schermo
 * Questo impedisce condivisione non autorizzata via screenshot o print
 */
export function PrintWatermark() {
  useEffect(() => {
    // Aggiungi style per watermark solo in print
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        /* Watermark pesante - Riferimento: Security Best Practices */
        body::before {
          content: 'CONFIDENTIAL - TRADELIA PLATFORM - NON DISTRIBUIRE';
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 48px;
          font-weight: bold;
          color: rgba(30, 64, 175, 0.15); /* Accent color con opacità */
          z-index: 9999;
          pointer-events: none;
          white-space: nowrap;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
          letter-spacing: 8px;
          user-select: none;
        }

        /* Watermark pattern ripetuto */
        body::after {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 100px,
            rgba(30, 64, 175, 0.03) 100px,
            rgba(30, 64, 175, 0.03) 200px
          );
          z-index: 9998;
          pointer-events: none;
          user-select: none;
        }

        /* Impedisci selezione testo in print (opzionale, può essere rimosso se necessario) */
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* Watermark in ogni pagina stampata */
        @page {
          @top-center {
            content: 'TRADELIA - CONFIDENTIAL';
            font-size: 10px;
            color: rgba(30, 64, 175, 0.3);
          }
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null; // Component invisibile, solo CSS
}

