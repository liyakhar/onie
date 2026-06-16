import { createFileRoute, Link } from '@tanstack/react-router'
import Footer from '#/components/Footer'
import { OnieMark } from '#/components/OnieMark'
import { authClient } from '#/lib/auth-client'

const SECTIONS = [
  { id: 'index', num: '00', label: 'Overview' },
  { id: 'what', num: '01', label: "Who it's for" },
  { id: 'how', num: '02', label: 'How it works' },
  { id: 'start', num: '03', label: 'Get started' },
] as const

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const { data: session } = authClient.useSession()

  return (
    <div className="index-page">
      <main className="index-page__grid" id="main">
        <aside className="index-toc" aria-label="Table of contents">
          <a href="#index" className="index-toc__wordmark">
            <OnieMark variant="display" as="p" />
          </a>
          <span className="index-toc__role">Agent workflows · by field</span>

          <nav>
            <ul className="index-toc__list">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    <span className="index-toc__num">{section.num}</span>
                    <span>{section.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="index-toc__actions">
            <Link to="/app/explore" className="btn btn--compact">
              <span className="btn__label">Explore</span>
            </Link>
            {session?.user ? (
              <Link to="/app" className="index-toc__link">
                Open app
              </Link>
            ) : (
              <Link to="/login" className="index-toc__link">
                Sign in
              </Link>
            )}
          </div>

          <div className="index-toc__meta">
            <span>Press tokens · Bricolage + Fraunces</span>
            <span>v. 26.06</span>
          </div>
        </aside>

        <article className="index-main">
          <section className="index-section" id="index">
            <p className="index-section__num">00 · Overview</p>
            <h1 className="index-section__head index-section__head--lede">
              AI agents work. The setups that make them useful rarely get shared.
            </h1>
            <div className="index-section__body">
              <p>
                <strong>Onie</strong> is a public feed of agent workflows from practitioners in
                the field. Each post documents what they run, how it is wired, and which tools
                it depends on — tagged by discipline and stack.
              </p>
              <p>
                UX research synthesis, SaaS shipping loops, literature reviews, code review
                pipelines — searchable in Explore.
              </p>
              <p>
                Follow peers in your discipline. Publish the setups you run in your own work.
              </p>
            </div>
          </section>

          <section className="index-section" id="what">
            <p className="index-section__num">01 · Who it&apos;s for</p>
            <h2 className="index-section__head">Workflows by field and tool.</h2>
            <div className="index-section__body">
              <p>
                Workflows are tagged by discipline and tool so you can filter to your practice:
              </p>
              <ul>
                <li>
                  <strong>UX / design</strong> — research synthesis, prototyping, design QA
                </li>
                <li>
                  <strong>SaaS / product</strong> — PRDs, scaffolding, launch checklists
                </li>
                <li>
                  <strong>Science / research</strong> — paper triage, replication notes, lab drafts
                </li>
                <li>
                  <strong>Engineering / DevOps</strong> — code review, CI, infra scaffolding
                </li>
              </ul>
              <p>
                Your feed tracks who you follow. Explore is the public catalog — search by field,
                tool, or keyword.
              </p>
            </div>
          </section>

          <section className="index-section" id="how">
            <p className="index-section__num">02 · How it works</p>
            <h2 className="index-section__head">Browse, follow, share.</h2>
            <div className="index-section__body">
              <table className="index-table" aria-label="How Onie works">
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Action</th>
                    <th>Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>01</td>
                    <td>Browse Explore</td>
                    <td>Browse workflows by field or tool in Explore</td>
                  </tr>
                  <tr>
                    <td>02</td>
                    <td>Follow practitioners</td>
                    <td>Your feed collects workflows from people in your field</td>
                  </tr>
                  <tr>
                    <td>03</td>
                    <td>Publish a workflow</td>
                    <td>Post prompts, skills, and file layouts with full context</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="index-section" id="start">
            <p className="index-section__num">03 · Get started</p>
            <h2 className="index-section__head">Open Explore or sign in.</h2>
            <div className="index-section__body">
              <ul className="index-links">
                <li>
                  <span className="index-links__label">Explore</span>
                  <div>
                    <Link to="/app/explore">Browse workflows and people</Link>
                    <span className="index-links__sub">
                      Search by field, tool, or keyword.
                    </span>
                  </div>
                </li>
                <li>
                  <span className="index-links__label">Feed</span>
                  <div>
                    <Link to="/app">Your following feed</Link>
                    <span className="index-links__sub">
                      Sign in to follow practitioners and build your feed.
                    </span>
                  </div>
                </li>
                <li>
                  <span className="index-links__label">Account</span>
                  <div>
                    <Link to="/login">{session?.user ? 'You are signed in' : 'Create an account'}</Link>
                    <span className="index-links__sub">
                      Publish workflows from your own practice.
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </section>
        </article>
      </main>
      <Footer variant="landing" />
    </div>
  )
}
