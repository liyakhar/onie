import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, CalendarDays, ReceiptText, WalletCards } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
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
import { buildPageMeta, jsonLdScript, webSiteJsonLd } from '#/lib/seo'

const abstractHeroImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'%3E%3Crect width='1600' height='900' fill='%23f4f4f4'/%3E%3Ccircle cx='260' cy='220' r='230' fill='%23d9d9d9'/%3E%3Ccircle cx='1220' cy='220' r='280' fill='%23cfcfcf'/%3E%3Ccircle cx='980' cy='720' r='340' fill='%23e5e5e5'/%3E%3Crect x='260' y='360' width='820' height='180' rx='90' fill='%230f0f0f' fill-opacity='0.08' transform='rotate(-12 670 450)'/%3E%3Crect x='620' y='180' width='700' height='130' rx='65' fill='%230f0f0f' fill-opacity='0.12' transform='rotate(18 970 245)'/%3E%3Crect x='180' y='620' width='540' height='110' rx='55' fill='%230f0f0f' fill-opacity='0.1' transform='rotate(8 450 675)'/%3E%3C/svg%3E"

const abstractWaveImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'%3E%3Crect width='1200' height='900' fill='%23f7f7f7'/%3E%3Cpath d='M0 570C180 500 250 420 420 420s250 100 420 100 230-80 360-110v390H0Z' fill='%23d8d8d8'/%3E%3Cpath d='M0 690c170-70 270-130 430-130s230 80 390 80 210-40 380-100v360H0Z' fill='%23c9c9c9' fill-opacity='.85'/%3E%3C/svg%3E"

const abstractGridImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'%3E%3Crect width='1200' height='900' fill='%23f5f5f5'/%3E%3Cg stroke='%23bdbdbd' stroke-opacity='.6' fill='none'%3E%3Cpath d='M160 0v900M360 0v900M560 0v900M760 0v900M960 0v900'/%3E%3Cpath d='M0 160h1200M0 360h1200M0 560h1200M0 760h1200'/%3E%3C/g%3E%3Crect x='170' y='170' width='860' height='560' rx='36' fill='%23ffffff' fill-opacity='.7' stroke='%23111111' stroke-opacity='.08'/%3E%3C/svg%3E"

const abstractStoneImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'%3E%3Crect width='1200' height='900' fill='%23f3f3f3'/%3E%3Ccircle cx='300' cy='240' r='150' fill='%23d2d2d2'/%3E%3Ccircle cx='690' cy='470' r='220' fill='%23bfbfbf'/%3E%3Ccircle cx='980' cy='250' r='130' fill='%23dfdfdf'/%3E%3Ccircle cx='950' cy='700' r='190' fill='%23cecece'/%3E%3C/svg%3E"

const landingMeta = buildPageMeta({
  path: '/',
  title: 'Know what you can spend',
  description:
    'Wollie brings your accounts, activity, budgets, and bills into one clear monthly view.',
})

const features = [
  {
    title: 'See your month',
    description: 'Balances, budgets, and recent activity in one calm dashboard.',
    icon: WalletCards,
    image: abstractWaveImage,
    alt: 'Abstract grayscale background image',
  },
  {
    title: 'Understand spending',
    description: 'Review every transaction and quickly resolve anything unclear.',
    icon: ReceiptText,
    image: abstractGridImage,
    alt: 'Abstract grayscale background image',
  },
  {
    title: 'Plan what is next',
    description: 'Keep everyday spending and upcoming bills inside one monthly plan.',
    icon: CalendarDays,
    image: abstractStoneImage,
    alt: 'Abstract grayscale background image',
  },
] as const

export const Route = createFileRoute('/')({
  head: () => ({
    meta: landingMeta.meta,
    links: landingMeta.links,
    scripts: [jsonLdScript(webSiteJsonLd())],
  }),
  component: LandingPage,
})

function LandingPage() {
  const { data: session } = authClient.useSession()

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Wollie home" className="text-black">
            <span className="text-xl font-semibold tracking-[-0.04em]">Wollie</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-3" aria-label="Main navigation">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <a href="#features">Features</a>
            </Button>
            {session?.user ? (
              <Button asChild className="bg-black text-white hover:bg-black/80">
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
            <Badge className="mb-6 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
              Personal finance, simplified
            </Badge>
            <h1
              className="w-full text-center text-5xl font-semibold leading-[1.04] tracking-normal sm:text-7xl lg:text-8xl"
              style={{ marginBottom: '1.75rem' }}
            >
              <span className="block">Know what</span>
              <span className="block">you can spend.</span>
            </h1>
            <p className="max-w-2xl text-center text-lg leading-8 text-black/60 sm:text-xl">
              Wollie brings your accounts, spending, budgets, and bills into one
              clear monthly view.
            </p>
            <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
              <Button size="lg" asChild className="w-full bg-black text-white hover:bg-black/80 sm:w-auto">
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

          <div className="mt-14 overflow-hidden rounded-xl border border-black/15 bg-black shadow-2xl shadow-black/10 sm:mt-20 sm:rounded-2xl">
            <img
              src={abstractHeroImage}
              alt="Abstract grayscale background image"
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
                        className="block aspect-[4/3] w-full object-cover grayscale"
                      />
                    </div>
                  </CardContent>
                </Card>
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
          <span>Demo ready · bank sync coming next</span>
        </div>
      </footer>
    </div>
  )
}
