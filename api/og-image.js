// /api/og-image.js
// Genera immagini Open Graph personalizzate per i report
// Usa @vercel/og (gratuito su Vercel)
// Endpoint: /api/og-image?ticker=AAPL&company=Apple+Inc&rating=8.5&trend=BULLISH

import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parametri dinamici
    const ticker = searchParams.get('ticker') || 'REPORT';
    const company = searchParams.get('company') || 'Tradelia AI';
    const rating = searchParams.get('rating') || null;
    const trend = searchParams.get('trend') || null;
    const version = searchParams.get('version') || '5.0';
    const start = searchParams.get('start') || null;
    const end = searchParams.get('end') || null;
    
    // Font Inter (caricato da CDN o sistema)
    // Nota: @vercel/og supporta font personalizzati, ma per semplicità usiamo system fonts
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #0f0f0f 0%, #111111 100%)',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            padding: '60px',
            position: 'relative',
          }}
        >
          {/* Header con Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                fontSize: '42px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              TRADELIA
            </div>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#2563eb',
                boxShadow: '0 0 12px rgba(37, 99, 235, 0.6)',
              }}
            />
            <div
              style={{
                fontSize: '42px',
                fontWeight: 700,
                color: '#2563eb',
                letterSpacing: '-0.01em',
              }}
            >
              AI
            </div>
          </div>
          
          {/* Contenuto Principale */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              flex: 1,
              width: '100%',
            }}
          >
            {/* Ticker e Company */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '72px',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.1',
                }}
              >
                {company}
              </div>
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 600,
                  color: '#2563eb',
                  letterSpacing: '0.02em',
                }}
              >
                ({ticker})
              </div>
            </div>
            
            {/* Metriche */}
            {(rating || trend) && (
              <div
                style={{
                  display: 'flex',
                  gap: '32px',
                  marginTop: '16px',
                }}
              >
                {rating && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '18px',
                        color: '#a8a8a8',
                        fontWeight: 400,
                      }}
                    >
                      Rating
                    </div>
                    <div
                      style={{
                        fontSize: '36px',
                        color: '#ffffff',
                        fontWeight: 700,
                      }}
                    >
                      {rating}/10
                    </div>
                  </div>
                )}
                {trend && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '18px',
                        color: '#a8a8a8',
                        fontWeight: 400,
                      }}
                    >
                      Trend
                    </div>
                    <div
                      style={{
                        fontSize: '36px',
                        color: trend.includes('BULLISH') ? '#16a34a' : trend.includes('BEARISH') ? '#dc2626' : '#64748b',
                        fontWeight: 700,
                      }}
                    >
                      {trend}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Snapshot Date */}
            {start && end && (
              <div
                style={{
                  marginTop: '24px',
                  padding: '16px 24px',
                  background: 'rgba(37, 99, 235, 0.1)',
                  border: '1px solid rgba(37, 99, 235, 0.2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '20px',
                    color: '#2563eb',
                    fontWeight: 600,
                  }}
                >
                  {start} → {end}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              marginTop: 'auto',
              paddingTop: '40px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                color: '#a8a8a8',
                fontWeight: 400,
              }}
            >
              Framework Accademico AI v{version}
            </div>
            <div
              style={{
                fontSize: '18px',
                color: '#707070',
                fontWeight: 400,
              }}
            >
              tradelia.org
            </div>
          </div>
          
          {/* Linea decorativa blu in alto */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, transparent 0%, #2563eb 50%, transparent 100%)',
              opacity: 0.6,
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error('Errore generazione OG image:', e);
    return new Response('Errore generazione immagine', { status: 500 });
  }
}

