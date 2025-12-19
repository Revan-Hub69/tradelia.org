import { footerDisclaimer } from '@/content/copy'

export function FooterSection() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 py-10 text-slate-200">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 text-sm">
        <span className="text-base font-semibold text-white">Tradelia</span>
        <p className="text-slate-300">
          Tool di analisi informativa sui costi operativi nei mercati finanziari.
        </p>
        <p className="text-xs text-slate-400">{footerDisclaimer}</p>
      </div>
    </footer>
  )
}
