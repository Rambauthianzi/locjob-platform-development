'use client'

import type { ReactNode } from 'react'

export function FormShell({ children, title, aside = false }: { children: ReactNode; title?: string; aside?: boolean }) {
  return (
    <main className="form-stage page-fade min-h-dvh px-4 py-8 sm:px-6 sm:py-12">
      <div className={`mx-auto grid w-full max-w-5xl gap-8 ${aside ? 'lg:grid-cols-[minmax(0,440px)_1fr]' : ''}`}>
        <section className="form-card animate-fade-up rounded-3xl border border-[#dce6ee] bg-white p-5 shadow-xl shadow-[#0d3b66]/8 sm:p-8" aria-labelledby={title ? 'form-title' : undefined}>
          {title && <h1 id="form-title" className="text-balance text-3xl font-bold text-[#0d3b66] sm:text-4xl">{title}</h1>}
          {children}
        </section>
        {aside && <aside className="form-aside hidden rounded-3xl bg-[#0d3b66] p-10 text-white lg:block"><div className="text-5xl" aria-hidden="true">⌂</div><h2 className="mt-10 text-4xl font-bold text-balance">Local opportunities. Real experience.</h2><ul className="mt-8 grid gap-4 text-white/85"><li>Free to join</li><li>Employers you can contact</li><li>Never pay to apply</li></ul></aside>}
      </div>
    </main>
  )
}
