import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3 max-w-xl">
          <p className="text-sm font-semibold tracking-tight text-white">Tradelia</p>
          <p className="text-sm text-slate-400">
            Analisi istituzionale per decisioni finanziarie informate. Nessun ranking, nessuna promozione camuffata
            da guida.
          </p>
          <p className="text-xs text-slate-500">
            Informativo/educativo. Non è consulenza finanziaria.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 text-sm text-slate-300 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Piattaforma</p>
            <ul className="space-y-2">
              <li>
                <Link className="hover-link" href="/metodo">
                  Metodo
                </Link>
              </li>
              <li>
                <Link className="hover-link" href="/trasparenza">
                  Trasparenza
                </Link>
              </li>
              <li>
                <Link className="hover-link" href="/investimenti">
                  Investimenti
                </Link>
              </li>
              <li>
                <Link className="hover-link" href="/finanza-personale">
                  Finanza personale
                </Link>
              </li>
              <li>
                <Link className="hover-link" href="/business">
                  Business
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Policy</p>
            <ul className="space-y-2">
              <li>
                <Link className="hover-link" href="/privacy">
                  Privacy
                </Link>
              </li>
              <li>
                <Link className="hover-link" href="/disclaimer">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
