import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl space-y-3">
          <p className="text-sm font-semibold tracking-tight text-white">Tradelia</p>
          <p className="text-sm text-slate-300">
            Analisi rigorosa per decisioni finanziarie informate. Nessun ranking, nessuna promozione camuffata
            da guida.
          </p>
          <p className="text-xs text-slate-400">
            Informativo/educativo. Non è consulenza finanziaria.
          </p>
          <p className="text-xs text-slate-400">
            Cookie e privacy: no tracking, nessuna profilazione, nessuna memorizzazione dati su Tradelia Main.
          </p>
        </div>

        <div className="flex flex-col gap-6 text-sm text-slate-300 sm:grid sm:grid-cols-3 sm:gap-8">
          <div className="space-y-3 border-t border-slate-800/60 pt-6 first:border-t-0 first:pt-0 sm:border-t-0 sm:pt-0">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Piattaforma</p>
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

          <div className="space-y-3 border-t border-slate-800/60 pt-6 first:border-t-0 first:pt-0 sm:border-t-0 sm:pt-0">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Policy</p>
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

          <div className="space-y-3 border-t border-slate-800/60 pt-6 first:border-t-0 first:pt-0 sm:border-t-0 sm:pt-0">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Contatti</p>
            <ul className="space-y-2">
              <li>
                <a className="hover-link" href="mailto:info@tradelia.org">
                  info@tradelia.org
                </a>
              </li>
              <li>
                <a className="hover-link" href="mailto:support@tradelia.org">
                  support@tradelia.org
                </a>
              </li>
              <li>
                <a className="hover-link" href="mailto:privacy@tradelia.org">
                  privacy@tradelia.org
                </a>
              </li>
              <li>
                <a className="hover-link" href="mailto:transparency@tradelia.org">
                  transparency@tradelia.org
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
