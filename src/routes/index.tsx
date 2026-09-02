import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ExternalLink,
  Landmark,
} from "lucide-react";
import { Button } from "#/components/ui/button";
import { authClient } from "#/lib/auth-client";
import { loginSearch } from "#/lib/auth-nav";
import {
  buildPageMeta,
  faqPageJsonLd,
  jsonLdScript,
  softwareApplicationJsonLd,
  webSiteJsonLd,
} from "#/lib/seo";
import {
  defaultSynciCountryCode,
  findSynciDirectoryBanks,
  getSynciDirectoryCountry,
  synciDirectoryCountries,
  synciDirectoryUrl,
} from "#/lib/synci-coverage";

const productImages = {
  householdHero: "/brand/wollie-shared-plan-hero-v3.png",
} as const;

const landingMeta = buildPageMeta({
  path: "/",
  title: "A Shared Money Plan for Couples",
  description:
    "Bring separate bank accounts into one calm household plan. Wollie helps couples plan everyday spending, savings, tax, pension, and future goals together.",
});

const faqs = [
  {
    question: "Who is Wollie for?",
    answer:
      "Wollie is for couples who manage a life together, whether their money is in one joint account, separate accounts, or both.",
  },
  {
    question: "Do we need a joint bank account?",
    answer:
      "No. Each partner connects their own accounts. Wollie combines the view and the plan without merging your bank accounts or sharing bank passwords.",
  },
  {
    question: "Can we use both separate and joint accounts?",
    answer:
      "Yes. Connect the accounts that matter to your household. The accounts stay where they are, while Wollie gives you one shared view and one plan.",
  },
  {
    question: "How does inviting my partner work?",
    answer:
      "Send an invitation by email. Your partner signs in or creates an account, accepts the invitation, and then joins your shared household.",
  },
  {
    question: "What happens when income arrives?",
    answer:
      "Income is assigned proportionally across the goals in your plan. If more income arrives later, Wollie fills the same plan again until the goals are funded.",
  },
  {
    question: "How do purchases affect our plan?",
    answer:
      "Imported purchases are categorized automatically. A grocery purchase, for example, reduces the amount left in Food for that month.",
  },
  {
    question: "What does left to spend mean?",
    answer:
      "It is the amount currently available for everyday spending after the money assigned to savings, reserves, and other goals. It updates when income or purchases appear.",
  },
  {
    question: "How are savings, tax, and pension shown?",
    answer:
      "They are set-aside goals, not purchases. Wollie shows how much has been assigned to each goal separately from the money left for everyday spending.",
  },
  {
    question: "Can we track something without a monthly budget?",
    answer:
      "Yes. Use a track-only category when you want to see spending, such as Health or Shopping, without setting aside an amount every month.",
  },
  {
    question: "Can we change or add categories?",
    answer:
      "Yes. You can correct a category on a transaction and add categories that fit the way your household thinks about money.",
  },
  {
    question: "Can Wollie move our money?",
    answer:
      "No. Bank connections are read-only. Wollie cannot make payments, move money, or see your bank password.",
  },
  {
    question: "What if our bank is not available?",
    answer:
      "Bank availability depends on your country and the connection provider. Use the bank checker to see current coverage before you connect an account.",
  },
] as const;

export const Route = createFileRoute("/")({
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
});

function ProductDemo() {
  return (
    <div className="wollie-real-demo">
      <div className="wollie-real-demo__notice">
        <span>Interactive example</span>
        <p>This is the real Wollie workspace using example data.</p>
      </div>
      <iframe src="/demo" title="Interactive Wollie workspace demo" />
    </div>
  );
}

function LandingPage() {
  const landingRef = useRef<HTMLDivElement>(null);
  const { data: session } = authClient.useSession();
  const [coverageCountryCode, setCoverageCountryCode] = useState(
    defaultSynciCountryCode,
  );
  const [bankSearch, setBankSearch] = useState("");
  const [showAllBanks, setShowAllBanks] = useState(false);

  const selectedSynciCountry = useMemo(
    () => getSynciDirectoryCountry(coverageCountryCode),
    [coverageCountryCode],
  );
  const matchedSynciBanks = useMemo(
    () => findSynciDirectoryBanks(coverageCountryCode, bankSearch),
    [bankSearch, coverageCountryCode],
  );
  const visibleSynciBanks = bankSearch.trim()
    ? matchedSynciBanks
    : showAllBanks
      ? selectedSynciCountry.banks
      : selectedSynciCountry.banks.slice(0, 8);

  const selectCoverageCountry = (countryCode: string) => {
    setCoverageCountryCode(countryCode);
    setBankSearch("");
    setShowAllBanks(false);
  };

  useEffect(() => {
    const root = landingRef.current;
    if (!root) return;

    const revealItems = Array.from(
      root.querySelectorAll<HTMLElement>(".wollie-reveal"),
    );
    root.dataset.motionReady = "true";

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => {
        item.dataset.visible = "true";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.visible = "true";
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const primaryAction = session?.user ? (
    <Button size="lg" asChild className="wollie-brand-primary">
      <Link to="/app">
        Open Wollie <ArrowRight aria-hidden="true" />
      </Link>
    </Button>
  ) : (
    <Button size="lg" asChild className="wollie-brand-primary">
      <Link to="/login" search={loginSearch({ signup: true })}>
        Start planning together <ArrowRight aria-hidden="true" />
      </Link>
    </Button>
  );

  return (
    <div ref={landingRef} className="wollie-landing">
      <header className="wollie-site-header">
        <div className="wollie-shell wollie-header-inner">
          <Link to="/" aria-label="Wollie home" className="wollie-wordmark">
            Wollie
          </Link>
          <nav className="wollie-main-nav" aria-label="Main navigation">
            {session?.user ? (
              <Link to="/app" className="wollie-nav-cta">
                Open app
              </Link>
            ) : (
              <Link
                to="/login"
                search={loginSearch({ signup: false })}
                className="wollie-nav-cta"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="wollie-hero">
          <div className="wollie-shell wollie-hero-grid">
            <div className="wollie-hero-copy wollie-reveal">
              <h1>
                <span>Money planning,</span>
                <span>built for couples.</span>
              </h1>
              <p className="wollie-hero-lede">
                See spending, savings, tax, pension, and future goals in one
                place, whether you share one account, keep separate accounts,
                or use both.
              </p>
              <div className="wollie-hero-actions">
                {primaryAction}
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="wollie-brand-secondary"
                >
                  <Link to="/login" search={loginSearch({ signup: true })}>
                    Use for free
                  </Link>
                </Button>
              </div>
            </div>

            <figure
              className="wollie-hero-art wollie-reveal"
              aria-label="A couple organizing their money into one shared plan"
            >
              <img
                src={productImages.householdHero}
                alt="A couple bringing their money into shared everyday and future plans"
                width="1536"
                height="1024"
                fetchPriority="high"
              />
            </figure>
          </div>
        </section>

        <section id="how-it-works" className="wollie-live-demo">
          <div className="wollie-shell">
            <div className="wollie-demo-intro wollie-reveal">
              <div>
                <h2>See the whole month together.</h2>
                <p>
                  Try the real Wollie workspace with example data. Explore the
                  same main money pages you would use in the app.
                </p>
              </div>
              <Link to="/demo" className="wollie-text-link">
                Open the full demo <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div className="wollie-reveal">
              <ProductDemo />
            </div>
          </div>
        </section>

        <section
          id="coverage"
          className="wollie-essentials"
          aria-labelledby="essentials-title"
        >
          <div className="wollie-shell wollie-coverage-grid">
            <div className="wollie-section-heading wollie-reveal">
              <Landmark className="wollie-section-icon" aria-hidden="true" />
              <h2 id="essentials-title">Ready when your banks are.</h2>
              <p>Search Synci's published bank directory by country.</p>
            </div>

            <div className="wollie-coverage-panel">
              <div className="wollie-bank-finder wollie-reveal">
                <div className="wollie-bank-finder-heading">
                  <div>
                    <p className="wollie-bank-eyebrow">
                      {selectedSynciCountry.name}
                    </p>
                    <h3>Find your bank</h3>
                  </div>
                  <strong>{selectedSynciCountry.bankCount} banks</strong>
                </div>
                <p className="wollie-bank-finder-intro">
                  Synci lists {selectedSynciCountry.bankCount} institutions in{" "}
                  {selectedSynciCountry.name}. Search to check for yours.
                </p>
                <div className="wollie-bank-fields">
                  <label>
                    Country
                    <select
                      name="coverageCountry"
                      value={coverageCountryCode}
                      onChange={(event) =>
                        selectCoverageCountry(event.currentTarget.value)
                      }
                    >
                      {synciDirectoryCountries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name} · {country.bankCount} banks
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Bank name
                    <input
                      name="bankSearch"
                      value={bankSearch}
                      onChange={(event) =>
                        setBankSearch(event.currentTarget.value)
                      }
                      placeholder={`Search ${selectedSynciCountry.name} banks`}
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </label>
                </div>

                <div
                  className="wollie-bank-results"
                  aria-live="polite"
                >
                  {visibleSynciBanks.length ? (
                    <>
                      <p className="wollie-bank-result-count">
                        {bankSearch.trim()
                          ? `${matchedSynciBanks.length} match${matchedSynciBanks.length === 1 ? "" : "es"}`
                          : `${selectedSynciCountry.bankCount} banks listed by Synci`}
                      </p>
                      <div className="wollie-bank-list">
                        {visibleSynciBanks.map((bank) => (
                          <span key={bank} className="wollie-bank-chip">
                            {bank}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p>
                      We could not find that bank in this {selectedSynciCountry.name} directory snapshot.
                    </p>
                  )}
                </div>
                {!bankSearch.trim() ? (
                  <button
                    type="button"
                    className="wollie-bank-list-toggle"
                    onClick={() => setShowAllBanks((current) => !current)}
                  >
                    {showAllBanks
                      ? "Show fewer banks"
                      : `Show all ${selectedSynciCountry.bankCount} banks`}
                  </button>
                ) : null}
                <p className="wollie-bank-finder-note">
                  This is a published directory preview. Final availability is
                  confirmed when you connect your bank.
                  <a
                    href={synciDirectoryUrl(coverageCountryCode)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Synci's current {selectedSynciCountry.name} directory{" "}
                    <ExternalLink aria-hidden="true" />
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="questions"
          className="wollie-faq"
          aria-labelledby="questions-title"
        >
          <div className="wollie-shell wollie-faq-grid">
            <div className="wollie-section-heading wollie-reveal">
              <h2 id="questions-title">Questions, answered.</h2>
              <p>
                The practical details of sharing a plan, connecting accounts,
                and keeping track of the month.
              </p>
            </div>

            <div className="wollie-faq-list" aria-label="Questions about Wollie">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="wollie-faq-item wollie-reveal"
                >
                  <summary>
                    {faq.question}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="wollie-final-cta">
          <div className="wollie-shell wollie-final-card wollie-reveal">
            <div>
              <h2>Try Wollie for free.</h2>
              <p>
                A shared budgeting app for spending, savings, and future goals.
              </p>
            </div>
            {primaryAction}
          </div>
        </section>
      </main>

      <footer className="wollie-footer">
        <div className="wollie-shell wollie-footer-inner">
          <div>
            <Link to="/" className="wollie-wordmark">
              Wollie
            </Link>
            <p>A calmer shared money plan for couples.</p>
          </div>
          <nav aria-label="Footer navigation">
            <Link to="/about">About</Link>
            <Link to="/pricing" search={{ checkout: undefined }}>
              Pricing
            </Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </nav>
          <span>© 2026 Wollie</span>
        </div>
      </footer>
    </div>
  );
}
