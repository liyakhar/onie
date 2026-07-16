import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, CalendarDays, Download, Globe2, Landmark, ReceiptText, ShieldCheck, Users, WalletCards } from 'lucide-react'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
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
  activity: '/product/wollie-transactions.png',
  plan: '/product/wollie-budgets.png',
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
      'Wollie is a personal finance dashboard that brings balances, transactions, monthly budgets, and upcoming bills into one clear view.',
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
      'Wollie combines your connected balance with the monthly limits and bills you set, giving you a clearer view of what remains available to spend.',
  },
  {
    question: 'Can couples or households use Wollie together?',
    answer:
      'Yes. Each person signs in separately, connects only their own bank credentials, and can view household, mine, yours, and joint account ownership.',
  },
] as const

const features = [
  {
    title: 'See your month',
    description: 'Safe-to-spend, cash, and upcoming bills.',
    icon: WalletCards,
    image: productImages.dashboard,
    alt: 'Wollie dashboard showing available spending, cash, and upcoming bills',
  },
  {
    title: 'Understand spending',
    description: 'Review and categorize transactions.',
    icon: ReceiptText,
    image: productImages.activity,
    alt: 'Wollie activity page for reviewing and categorizing transactions',
  },
  {
    title: 'Plan what is next',
    description: 'Budgets, bills, and planned expenses.',
    icon: CalendarDays,
    image: productImages.plan,
    alt: 'Wollie monthly plan with category limits and spending progress',
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

const supportedBanks = [
  { name: 'BBVA', country: 'ES', logoUrl: 'https://enablebanking.com/brands/ES/BBVA/' },
  { name: 'Rabobank', country: 'NL', logoUrl: 'https://enablebanking.com/brands/NL/Rabobank/' },
  { name: 'Nordea', country: 'DK', logoUrl: 'https://enablebanking.com/brands/DK/Nordea/' },
  { name: 'Swedbank', country: 'EE', logoUrl: 'https://enablebanking.com/brands/EE/Swedbank/' },
  { name: 'Citadele', country: 'EE', logoUrl: 'https://enablebanking.com/brands/EE/Citadele/' },
  { name: 'OP', country: 'FI', logoUrl: 'https://enablebanking.com/brands/FI/OP/' },
  { name: 'Banco de Sabadell', country: 'ES', logoUrl: 'https://enablebanking.com/brands/ES/Banco%20de%20Sabadell/' },
  { name: 'UniCredit', country: 'IT', logoUrl: 'https://enablebanking.com/brands/IT/UniCredit/' },
  { name: 'Luminor', country: 'EE', logoUrl: 'https://enablebanking.com/brands/EE/Luminor/' },
  { name: 'LHV Pank', country: 'EE', logoUrl: 'https://enablebanking.com/brands/EE/LHV%20Pank/' },
  { name: 'S-Pankki', country: 'FI', logoUrl: 'https://enablebanking.com/brands/FI/S-Pankki/' },
  { name: 'Handelsbanken', country: 'SE', logoUrl: 'https://enablebanking.com/brands/SE/Handelsbanken/' },
  { name: 'Vestjysk Bank', country: 'DK', logoUrl: 'https://enablebanking.com/brands/DK/Vestjysk%20Bank/' },
  { name: 'Saxo Bank', country: 'DK', logoUrl: 'https://enablebanking.com/brands/DK/Saxo%20Bank/' },
  { name: 'Artea', country: 'LT', logoUrl: 'https://enablebanking.com/brands/LT/Artea/' },
  { name: 'DKB', country: 'DE', logoUrl: 'https://enablebanking.com/brands/DE/DKB/' },
  { name: 'BBBank', country: 'DE', logoUrl: 'https://enablebanking.com/brands/DE/BBBank/' },
  { name: 'Bank 1 Saar', country: 'DE', logoUrl: 'https://enablebanking.com/brands/DE/Bank%201%20Saar/' },
  { name: 'Airbus Bank', country: 'DE', logoUrl: 'https://enablebanking.com/brands/DE/Airbus%20Bank/' },
  { name: 'Bank11', country: 'DE', logoUrl: 'https://enablebanking.com/brands/DE/Bank11/' },
  { name: 'Südtiroler Sparkasse', country: 'DE', logoUrl: 'https://enablebanking.com/brands/DE/S%C3%BCdtiroler%20Sparkasse/' },
  { name: 'Sparbanken Skåne', country: 'SE', logoUrl: 'https://enablebanking.com/brands/SE/Sparbanken%20Sk%C3%A5ne/' },
] as const

const featuredBanks = supportedBanks.slice(0, 12)

const householdHighlights = [
  'Invite a partner with a separate login',
  'Mark accounts as mine, yours, or joint',
  'Split joint accounts by ownership percentage',
  'See household and personal safe-to-spend',
] as const

const trustHighlights = [
  {
    title: 'Read-only bank access',
    description: 'Balances and transactions only.',
    icon: ShieldCheck,
  },
  {
    title: 'Export-ready data',
    description: 'CSV, tables, backup, and reports.',
    icon: Download,
  },
  {
    title: 'Separate credentials',
    description: 'Each person connects their own bank.',
    icon: Users,
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

  return (
    <div className="wollie-landing min-h-screen bg-white text-black">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Wollie home" className="text-black">
            <span className="text-xl font-semibold tracking-[-0.04em]">Wollie</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-3" aria-label="Main navigation">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <a href="#features">Features</a>
            </Button>
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

      <main>
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
            <div className="mb-7 flex items-center gap-2.5 text-sm font-medium text-black/55">
              <span
                aria-hidden="true"
                className="size-2 bg-[var(--color-wollie-accent)]"
              />
              <span>Personal finance, simplified</span>
            </div>
            <h1
              className="w-full text-center text-5xl font-semibold leading-[1.04] tracking-normal sm:text-7xl lg:text-8xl"
              style={{ marginBottom: '1.75rem' }}
            >
              <span className="block">Know what</span>
              <span className="block translate-x-[0.035em]">you can spend.</span>
            </h1>
            <p className="max-w-2xl text-center text-lg leading-8 text-black/60 sm:text-xl">
              Wollie brings your accounts, spending, budgets, and bills into one
              clear monthly view.
            </p>
            <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
              <Button size="lg" asChild className="wollie-primary-action w-full sm:w-auto">
                <Link to="/app">
                  Explore the demo
                  <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <a href="#features">See how it works</a>
              </Button>
            </div>
          </div>

          <div className="mt-14 overflow-hidden rounded-xl border border-black/10 bg-white sm:mt-20">
            <img
              src={productImages.dashboard}
              alt="Wollie dashboard showing what is available to spend"
              width="1440"
              height="900"
              className="block aspect-[16/8] w-full object-cover grayscale"
            />
          </div>
        </section>

        <section id="coverage" className="border-t border-black/10 bg-white py-24 sm:py-36">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-black/50">
                European bank coverage
              </p>
              <h2 className="text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl">
                Connect your European bank.
              </h2>
            </div>

            <div className="mt-16 grid gap-16">
              <div>
                <div className="mb-5 flex items-center gap-2 text-sm font-medium text-black/55">
                  <Globe2 className="size-4" aria-hidden="true" /> Countries
                </div>
                <div className="flex max-w-4xl flex-wrap gap-x-4 gap-y-2">
                  {coverageCountries.map((country) => (
                    <span
                      key={country.name}
                      className="inline-flex h-7 items-center gap-1.5 text-sm font-medium text-black/60"
                    >
                      <span className="text-base leading-none" aria-hidden="true">{country.flag}</span>
                      {country.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-5 flex items-center gap-2 text-sm font-medium text-black/55">
                  <Landmark className="size-4" aria-hidden="true" /> Banks
                </div>
                <div>
                  <div className="flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-5">
                    {featuredBanks.map((bank) => (
                      <span
                        key={`${bank.country}:${bank.name}`}
                        title={`${bank.name} · ${bank.country}`}
                        className="inline-flex h-9 w-20 items-center justify-start transition-opacity hover:opacity-70"
                      >
                        <img
                          src={bank.logoUrl}
                          alt={bank.name}
                          className="block object-contain"
                          style={{ maxHeight: 22, maxWidth: 72, width: 'auto', height: 'auto' }}
                          loading="lazy"
                        />
                      </span>
                    ))}
                  </div>
                  <div className="mt-14 max-w-3xl border-t border-black/10 pt-10">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.035em] text-black">
                        Check if your bank is supported.
                      </h3>
                    </div>
                    <div className="mt-7 grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
                      <label className="grid gap-2 text-sm font-medium text-black/55">
                        Country
                        <select
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
                          value={bankSearch}
                          onChange={(event) => setBankSearch(event.currentTarget.value)}
                          placeholder="Type your bank name"
                          className="h-11 rounded-full border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none placeholder:text-black/35 focus-visible:ring-2 focus-visible:ring-black"
                        />
                      </label>
                    </div>

                    <div className="mt-4 min-h-12">
                      {coverageLoading ? (
                        <p className="text-sm text-black/45">Loading available banks…</p>
                      ) : coverageError ? (
                        <p className="text-sm text-black/45">{coverageError}</p>
                      ) : filteredCoverageBanks.length ? (
                        <div className="flex flex-wrap gap-2">
                          {filteredCoverageBanks.map((bank) => (
                            <span key={`${bank.country}:${bank.name}`} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-black/70">
                              {bank.logoUrl ? (
                                <img src={bank.logoUrl} alt="" className="size-5 rounded-full object-contain" loading="lazy" />
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
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-black/10 bg-white py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-black/50">
                Shared households
              </p>
              <h2 className="text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl">
                Mine, yours, and ours.
              </h2>
            </div>
            <div className="mt-14 grid border-y border-black/10 md:grid-cols-4">
              {householdHighlights.map((item, index) => (
                <div key={item} className="grid gap-5 border-b border-black/10 py-7 md:border-b-0 md:border-r md:px-6 md:last:border-r-0 md:first:pl-0">
                  <span className="text-sm font-medium tabular-nums text-black/35">
                    0{index + 1}
                  </span>
                  <p className="max-w-56 text-base font-medium leading-6 tracking-[-0.02em] text-black/75">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-black/10 bg-white py-24 sm:py-36">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <h2
                className="text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl"
              >
                Your month, clearly organized.
              </h2>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {features.map(({ title, description, icon: Icon, image, alt }) => (
                <Card key={title} className="overflow-hidden border-black/10 bg-white py-0 shadow-none">
                  <CardHeader className="px-6 pt-6">
                    <div className="mb-2 flex size-9 items-center justify-center rounded-lg border border-black/10 bg-neutral-50">
                      <Icon className="size-4" aria-hidden="true" />
                    </div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="text-sm leading-6 text-black/50">
                      {description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-2 px-0">
                    <div className="overflow-hidden border-t border-black/10 bg-neutral-100">
                      <img
                        src={image}
                        alt={alt}
                        width="1440"
                        height="900"
                        loading="lazy"
                        className="block aspect-[4/3] w-full object-cover object-left-top grayscale"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-black/10 bg-white py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-black/50">
                Trust
              </p>
              <h2 className="text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl">
                Safe by design.
              </h2>
            </div>
            <div className="mt-16 grid border-y border-black/10 md:grid-cols-3">
              {trustHighlights.map(({ title, description, icon: Icon }) => (
                <article key={title} className="grid gap-3 border-b border-black/10 py-7 md:border-b-0 md:border-r md:px-8 md:last:border-r-0 md:first:pl-0">
                  <Icon className="size-4 text-black/35" aria-hidden="true" />
                  <div>
                    <h3 className="text-base font-semibold tracking-[-0.02em]">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-black/50">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-black/10 bg-white py-24 sm:py-36" aria-labelledby="faq-title">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-black/50">
                Questions
              </p>
              <h2 id="faq-title" className="text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl">
                Wollie, clearly explained.
              </h2>
            </div>
            <div className="divide-y divide-black/10 border-y border-black/10">
              {faqs.map((faq) => (
                <article key={faq.question} className="py-6 sm:py-8">
                  <h3 className="text-lg font-semibold tracking-[-0.02em]">{faq.question}</h3>
                  <p className="mt-3 max-w-2xl leading-7 text-black/60">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-black/10 bg-black text-white">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <h2
                className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
                style={{ marginBottom: '1.25rem' }}
              >
                See your money clearly.
              </h2>
            </div>
            <Button size="lg" variant="secondary" asChild className="bg-white text-black hover:bg-white/90">
              <Link to="/app">
                Open the demo
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10 bg-white">
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
