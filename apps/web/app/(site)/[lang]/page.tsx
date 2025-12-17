import { isLang, loadUi } from '@/lib/i18n'

export default async function HomePage({
  params,
}: {
  params: { lang: string }
}) {
  const lang = isLang(params.lang) ? params.lang : 'en'
  const ui = await loadUi(lang)

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Tradelia</h1>
        <p style={{ marginTop: 8 }}>{ui.global.not_trading_signals}</p>
      </header>

      <section style={{ marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>{ui.sections.market_snapshot.title}</h2>
        <p style={{ marginTop: 8 }}>{ui.sections.market_snapshot.subtitle}</p>
      </section>

      <section style={{ marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>{ui.sections.risk_regime.title}</h2>
        <p style={{ marginTop: 8 }}>{ui.sections.risk_regime.subtitle}</p>

        <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span>🟢 {ui.badges.risk_on.label} — {ui.badges.risk_on.description}</span>
          <span>🟡 {ui.badges.neutral.label} — {ui.badges.neutral.description}</span>
          <span>🔴 {ui.badges.risk_off.label} — {ui.badges.risk_off.description}</span>
        </div>
      </section>

      <footer style={{ marginTop: 28, borderTop: '1px solid #ddd', paddingTop: 14 }}>
        <small>{ui.footer.disclaimer}</small>
      </footer>
    </main>
  )
}
