import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, CalendarDays, ReceiptText, WalletCards } from 'lucide-react'
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
      'Wollie supports read-only connections to participating European banks through regulated open-banking providers. Availability depends on your country and financial institution.',
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
] as const

const features = [
  {
    title: 'See your month',
    description: 'Balances, budgets, and recent activity in one calm dashboard.',
    icon: WalletCards,
    image: productImages.dashboard,
    alt: 'Wollie dashboard showing available spending, cash, and upcoming bills',
  },
  {
    title: 'Understand spending',
    description: 'Review every transaction and quickly resolve anything unclear.',
    icon: ReceiptText,
    image: productImages.activity,
    alt: 'Wollie activity page for reviewing and categorizing transactions',
  },
  {
    title: 'Plan what is next',
    description: 'Keep everyday spending and upcoming bills inside one monthly plan.',
    icon: CalendarDays,
    image: productImages.plan,
    alt: 'Wollie monthly plan with category limits and spending progress',
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

        <section id="features" className="border-t border-black/10 bg-neutral-50 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2
                className="text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-5xl"
                style={{ marginBottom: '2.25rem' }}
              >
                Your month, clearly organized.
              </h2>
              <p className="text-lg leading-8 text-black/60">
                See what changed, what is already planned, and what is still
                yours to spend.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {features.map(({ title, description, icon: Icon, image, alt }) => (
                <Card key={title} className="overflow-hidden border-black/10 bg-white py-0 shadow-none">
                  <CardHeader className="px-6 pt-6">
                    <div className="mb-2 flex size-9 items-center justify-center rounded-lg border border-black/10 bg-neutral-50">
                      <Icon className="size-4" aria-hidden="true" />
                    </div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="leading-6 text-black/55">
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

        <section className="border-t border-black/10 bg-white py-20 sm:py-28" aria-labelledby="faq-title">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-black/50">
                Questions
              </p>
              <h2 id="faq-title" className="text-balance text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
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
              <p className="text-white/60">Explore the complete product with realistic sample data.</p>
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
