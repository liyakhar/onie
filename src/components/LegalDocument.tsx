import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

export function LegalDocument({
  eyebrow,
  title,
  summary,
  updated,
  children,
}: {
  eyebrow: string
  title: string
  summary: string
  updated: string
  children: ReactNode
}) {
  return (
    <main id="main" className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <header className="border-b border-black/10 pb-8 sm:pb-10">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/45">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-black/60 sm:text-lg">{summary}</p>
        <p className="mt-4 text-sm text-black/45">Last updated {updated}</p>
      </header>

      <article className="max-w-3xl space-y-10 py-10 text-base leading-7 text-black/75 sm:py-12">
        {children}
      </article>

      <nav className="flex flex-wrap gap-x-6 gap-y-3 border-t border-black/10 pt-8 text-sm" aria-label="Legal pages">
        <Link to="/privacy" className="text-black/60 underline decoration-black/20 underline-offset-4 hover:text-black">
          Privacy
        </Link>
        <Link to="/terms" className="text-black/60 underline decoration-black/20 underline-offset-4 hover:text-black">
          Terms
        </Link>
        <Link to="/legal-notice" className="text-black/60 underline decoration-black/20 underline-offset-4 hover:text-black">
          Legal notice
        </Link>
        <Link to="/" className="text-black/60 underline decoration-black/20 underline-offset-4 hover:text-black">
          Back to Wollie
        </Link>
      </nav>
    </main>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold tracking-[-0.02em] text-black sm:text-2xl">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}
