import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Landmark } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { authClient } from '#/lib/auth-client'
import { loginSearch } from '#/lib/auth-nav'
import {
  buildPageMeta,
  faqPageJsonLd,
  jsonLdScript,
  softwareApplicationJsonLd,
  webSiteJsonLd,
} from '#/lib/seo'
import { getPublicEnableBankingInstitutions } from '#/server/enable-banking-sync'

const productImages = {
  dashboard: '/product/wollie-dashboard.png',
} as const

const landingMeta = buildPageMeta({
  path: '/',
  title: 'Personal Finance Dashboard & Budget Planner',
  description:
    'Connect accounts, organize spending, track bills, and plan what you can safely spend each month with Wollie’s clear personal finance dashboard.',
})

const faqs = [
  {
    question: 'What is Wollie?',
    answer:
      'Wollie is a personal finance dashboard for balances, transactions, monthly budgets, upcoming bills, and household finances.',
  },
  {
    question: 'Can Wollie connect to my bank account?',
    answer:
      'Wollie is built for read-only European bank connections through Enable Banking. Availability depends on your country, institution, and Wollie production approval before public launch.',
  },
  {
    question: 'Can Wollie move money or make payments?',
    answer:
      'No. Wollie uses read-only account access for balances and transactions. It cannot move money, make payments, or see your bank password.',
  },
  {
    question: 'How does Wollie calculate what I can spend?',
    answer:
      'Wollie combines connected balances with the monthly limits and bills you set to estimate what remains available to spend.',
  },
  {
    question: 'Can couples or households use Wollie together?',
    answer:
      'Yes. Each person signs in separately, connects their own bank credentials, and can view personal and shared accounts in one household.',
  },
] as const

const coverageCountries = [
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
] as const

const safeSpendSteps = [
  {
    label: 'Cash',
    title: 'Start with the money that is actually there.',
    copy: 'Connected balances give Wollie the starting point.',
  },
  {
    label: 'Plans',
    title: 'Set aside bills, budgets, and yearly costs.',
    copy: 'Money already spoken for is separated before you spend.',
  },
  {
    label: 'Left',
    title: 'See the amount you can use now.',
    copy: 'The final number is what remains for everyday spending.',
  },
] as const

const householdHighlights = [
  {
    label: 'Mine',
    copy: 'Personal accounts stay personal.',
  },
  {
    label: 'Ours',
    copy: 'Shared accounts can show clear ownership.',
  },
  {
    label: 'Together',
    copy: 'See your own number next to the household number.',
  },
] as const

export const Route = createFileRoute('/')({
  head: () => ({
    meta: landingMeta.meta,
    links: landingMeta.links,
    scripts: [
      jsonLdScript(webSiteJsonLd()),
      jsonLdScript(softwareApplicationJsonLd()),
      jsonLdScript(faqPageJsonLd([...faqs])),
    ],
  }),
  component: LandingPage,
})

function LandingPage() {
  const landingRef = useRef<HTMLDivElement>(null)
  const { data: session } = authClient.useSession()
  const [coverageCountry, setCoverageCountry] = useState('DE')
  const [bankSearch, setBankSearch] = useState('')
  const [coverageBanks, setCoverageBanks] = useState<Array<{ name: string; country: string; beta: boolean; logoUrl: string | null }>>([])
  const [coverageLoading, setCoverageLoading] = useState(false)
  const [coverageError, setCoverageError] = useState('')
  const filteredCoverageBanks = useMemo(() => {
    const query = bankSearch.trim().toLowerCase()
    if (!query) return coverageBanks.slice(0, 8)
    return coverageBanks.filter((bank) => bank.name.toLowerCase().includes(query)).slice(0, 8)
  }, [bankSearch, coverageBanks])

  useEffect(() => {
    let cancelled = false
    setCoverageLoading(true)
    setCoverageError('')
    setBankSearch('')
    void getPublicEnableBankingInstitutions({ data: { country: coverageCountry } })
      .then((banks) => {
        if (!cancelled) setCoverageBanks(banks)
      })
      .catch(() => {
        if (!cancelled) {
          setCoverageBanks([])
          setCoverageError('Bank coverage could not be loaded right now.')
        }
      })
      .finally(() => {
        if (!cancelled) setCoverageLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [coverageCountry])

  useEffect(() => {
    const root = landingRef.current
    if (!root) return

    const revealItems = Array.from(root.querySelectorAll<HTMLElement>('.wollie-reveal'))
    root.dataset.motionReady = 'true'

    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => {
        item.dataset.visible = 'true'
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).dataset.visible = 'true'
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.16 },
    )

    revealItems.forEach((item) => observer.observe(item))

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={landingRef} className="wollie-landing min-h-screen bg-neutral-50 text-black">
      <header className="border-b border-black/10 bg-neutral-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Wollie home" className="text-black">
            <span className="text-xl font-semibold tracking-[-0.04em]">Wollie</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-3" aria-label="Main navigation">
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <a href="#coverage">Coverage</a>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/pricing" search={{ checkout: undefined }}>Pricing</Link>
            </Button>
            {session?.user ? (
              <Button asChild className="wollie-primary-action">
                <Link to="/app">Open app</Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link to="/login" search={loginSearch({ signup: false })}>Sign in</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="wollie-reveal mx-auto flex w-full max-w-5xl flex-col items-center text-center">
            <div className="mb-7 flex items-center gap-2.5 text-sm font-medium text-black/55">
              <span
                aria-hidden="true"
                className="size-2 bg-[var(--color-wollie-accent)]"
              />
              <span>Personal and household finance</span>
            </div>
            <h1
              className="w-full text-center text-5xl font-semibold leading-[1.04] tracking-normal sm:text-7xl lg:text-8xl"
              style={{ marginBottom: '1.75rem' }}
            >
              <span className="block">Know what</span>
              <span className="block translate-x-[0.035em]">you can spend.</span>
            </h1>
            <p className="max-w-2xl text-center text-lg leading-8 text-black/60 sm:text-xl">
              See what you have, what is planned, and what is safe to spend—across
              personal and shared accounts.
            </p>
            <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
              {session?.user ? (
                <Button size="lg" asChild className="wollie-primary-action w-full sm:w-auto">
                  <Link to="/app">
                    Open app
                    <ArrowRight />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="wollie-primary-action w-full sm:w-auto">
                  <Link to="/login" search={loginSearch({ signup: true })}>
                    Start free trial
                    <ArrowRight />
                  </Link>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link to="/app">Explore demo</Link>
              </Button>
            </div>
          </div>

          <div className="wollie-reveal wollie-platform-frame mt-14 overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.08)] sm:mt-20" style={{ '--reveal-delay': '120ms' } as CSSProperties}>
            <img
              src={productImages.dashboard}
              alt="Wollie dashboard showing what is available to spend"
              width="1920"
              height="960"
              fetchPriority="high"
              className="block aspect-[16/8] w-full object-cover"
            />
          </div>
        </section>

        <section className="wollie-reveal border-t border-black/10 bg-neutral-50 py-24 sm:py-32" aria-labelledby="safe-spend-title">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-black/50">
                Safe to spend
              </p>
              <h2 id="safe-spend-title" className="text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl">
                From balance to a number you can trust.
              </h2>
            </div>

            <div className="divide-y divide-black/10 border-y border-black/10">
              {safeSpendSteps.map((step, index) => (
                <article key={step.label} className="grid gap-4 py-7 sm:grid-cols-[5rem_minmax(0,1fr)] sm:py-8">
                  <div className="flex items-baseline gap-3 text-sm font-medium text-black/40">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span>{step.label}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.025em] text-black">
                      {step.title}
                    </h3>
                    <p className="wollie-item-description max-w-2xl text-black/60">{step.copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="wollie-reveal overflow-hidden border-t border-black/10 bg-neutral-50 py-24 sm:py-32" aria-labelledby="household-title">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-5xl flex-col items-center">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-black/50">
                Shared households
              </p>
              <h2
                id="household-title"
                className="max-w-[17ch] text-center text-[clamp(2.75rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.045em]"
              >
                Mine, yours, and ours
                <span className="block">without the spreadsheet.</span>
              </h2>
              <p className="wollie-section-description max-w-2xl px-2 text-center text-black/60">
                Plan together without sharing bank passwords or flattening every account into one pot.
              </p>
            </div>

            <div className="mt-16 grid gap-px overflow-hidden border-y border-black/10 bg-black/10 text-left md:grid-cols-3">
              {householdHighlights.map((item) => (
                <article key={item.label} className="bg-neutral-50 py-7 md:px-8 md:py-9 md:first:pl-0 md:last:pr-0">
                  <h3 className="text-4xl font-semibold tracking-[-0.055em] text-black/85 sm:text-5xl">{item.label}</h3>
                  <p className="wollie-item-description max-w-sm text-black/60">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="coverage" className="wollie-reveal scroll-mt-6 border-t border-black/10 bg-neutral-50 py-24 sm:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:px-8">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-black/50">
                <Landmark className="size-4" aria-hidden="true" />
                European bank coverage
              </div>
              <h2 className="text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl">
                Check whether your bank is supported.
              </h2>
            </div>

            <div className="wollie-reveal rounded-xl border border-black/10 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.05)] sm:p-7" style={{ '--reveal-delay': '90ms' } as CSSProperties}>
              <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
                <label className="grid gap-2 text-sm font-medium text-black/55">
                  Country
                  <select
                    name="coverageCountry"
                    value={coverageCountry}
                    onChange={(event) => setCoverageCountry(event.currentTarget.value)}
                    className="h-11 rounded-full border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none focus-visible:ring-2 focus-visible:ring-black"
                  >
                    {coverageCountries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-black/55">
                  Bank name
                  <input
                    name="bankSearch"
                    value={bankSearch}
                    onChange={(event) => setBankSearch(event.currentTarget.value)}
                    placeholder="Type your bank name..."
                    autoComplete="off"
                    spellCheck={false}
                    className="h-11 rounded-full border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none placeholder:text-black/35 focus-visible:ring-2 focus-visible:ring-black"
                  />
                </label>
              </div>

              <div className="mt-5 min-h-12" aria-live="polite" aria-busy={coverageLoading}>
                {coverageLoading ? (
                  <p className="text-sm text-black/45">Loading available banks...</p>
                ) : coverageError ? (
                  <p className="text-sm text-black/45">{coverageError}</p>
                ) : filteredCoverageBanks.length ? (
                  <div className="flex flex-wrap gap-2">
                    {filteredCoverageBanks.map((bank) => (
                      <span key={`${bank.country}:${bank.name}`} className="wollie-bank-chip inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-black/70">
                        {bank.logoUrl ? (
                          <img src={bank.logoUrl} alt="" width="20" height="20" className="size-5 rounded-full object-contain" loading="lazy" />
                        ) : null}
                        {bank.name}
                        {bank.beta ? <span className="text-black/35">beta</span> : null}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-black/45">
                    No matching bank found for this country.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="wollie-reveal border-t border-black/10 bg-neutral-50 py-24 sm:py-36" aria-labelledby="faq-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-black/50">
                Questions
              </p>
              <h2 id="faq-title" className="text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl">
                Common questions.
              </h2>
            </div>
            <div className="mt-14 divide-y divide-black/10 border-y border-black/10">
              {faqs.map((faq) => (
                <article key={faq.question} className="wollie-faq-item py-6 sm:py-8">
                  <h3 className="text-lg font-semibold tracking-[-0.02em]">{faq.question}</h3>
                  <p className="wollie-item-description max-w-3xl text-black/60">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="wollie-reveal border-t border-black/10 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-8 rounded-xl border border-black/10 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.05)] sm:p-8 md:flex-row md:items-center">
            <div>
              <h2
                className="text-3xl font-semibold tracking-[-0.035em] text-black sm:text-4xl"
                style={{ marginBottom: '1.25rem' }}
              >
                Start managing your money in one place.
              </h2>
            </div>
            {session?.user ? (
              <Button size="lg" asChild className="wollie-primary-action w-full sm:w-auto">
                <Link to="/app">Open app <ArrowRight /></Link>
              </Button>
            ) : (
              <Button size="lg" asChild className="wollie-primary-action w-full sm:w-auto">
                <Link to="/login" search={loginSearch({ signup: true })}>Start free trial <ArrowRight /></Link>
              </Button>
            )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10 bg-neutral-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-black/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© 2026 Wollie</span>
          <nav className="flex gap-5" aria-label="Legal">
            <Link to="/about" className="hover:text-black">About</Link>
            <Link to="/pricing" search={{ checkout: undefined }} className="hover:text-black">Pricing</Link>
            <Link to="/privacy" className="hover:text-black">Privacy</Link>
            <Link to="/terms" className="hover:text-black">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
