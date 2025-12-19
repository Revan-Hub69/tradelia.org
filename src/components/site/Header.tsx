'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const navItems = [
  { href: '#domini', label: 'Domini' },
  { href: '/metodo', label: 'Metodo' },
  { href: '/trasparenza', label: 'Trasparenza' }
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const toggleRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
        return
      }

      const menuEl = menuRef.current
      if (event.key !== 'Tab' || !menuEl) {
        return
      }

      const focusable = menuEl.querySelectorAll<HTMLElement>('a, button')
      if (focusable.length === 0) {
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const firstLink = menuRef.current?.querySelector<HTMLElement>('a, button')
    firstLink?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [open])

  const handleNavClick = () => setOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-semibold tracking-tight text-white transition hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/70 to-slate-900 text-sm font-black text-slate-950 shadow-lg shadow-sky-900/40 transition group-hover:scale-105 group-hover:shadow-sky-900/60">
            T
          </span>
          <span className="leading-none">Tradelia</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigazione principale">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-200 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/metodo"
            className="rounded-lg border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-400/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Metodo
          </Link>
          <Link
            href="/trasparenza"
            className="rounded-lg border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Trasparenza
          </Link>
        </div>

        <button
          type="button"
          ref={toggleRef}
          className="inline-flex h-10 w-11 items-center justify-center rounded-lg border border-slate-800 text-slate-200 transition hover:border-slate-700 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Apri menu di navigazione"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">Menu</span>
          <span className="relative h-4 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-full bg-current transition ${open ? 'translate-y-1.5 rotate-45' : ''}`}
            />
            <span
              className={`absolute left-0 top-1.5 h-0.5 w-full bg-current transition ${open ? 'opacity-0' : ''}`}
            />
            <span
              className={`absolute left-0 top-3 h-0.5 w-full bg-current transition ${open ? '-translate-y-1.5 -rotate-45' : ''}`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm" />
          <div
            id="mobile-menu"
            ref={menuRef}
            className="absolute inset-x-4 top-20 z-50 space-y-4 rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className="block rounded-xl px-4 py-3 text-base font-semibold text-slate-100 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-3">
              <Link
                href="/metodo"
                onClick={handleNavClick}
                className="flex-1 rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-center text-sm font-semibold text-sky-100 transition hover:border-sky-400/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Metodo
              </Link>
              <Link
                href="/trasparenza"
                onClick={handleNavClick}
                className="flex-1 rounded-xl border border-slate-800 px-4 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Trasparenza
              </Link>
            </div>
            <button
              type="button"
              className="w-full rounded-xl border border-slate-800 px-4 py-3 text-center text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              onClick={() => {
                setOpen(false)
                toggleRef.current?.focus()
              }}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
