import { createFileRoute } from '@tanstack/react-router'
import { LegalDocument, LegalSection } from '#/components/LegalDocument'
import { buildPageMeta } from '#/lib/seo'

const meta = buildPageMeta({
  path: '/terms',
  title: 'Terms of Service',
  description: 'The terms for using Wollie and its read-only financial dashboard.',
})

export const Route = createFileRoute('/terms/')({
  head: () => ({ meta: meta.meta, links: meta.links }),
  component: TermsPage,
})

function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Terms of Service"
      summary="These terms apply when you access or use Wollie."
      updated="July 14, 2026"
    >
      <LegalSection title="Using Wollie">
        <p>You must provide accurate account information, keep your sign-in secure, and use Wollie only for lawful personal purposes. You may not misuse the service, interfere with its operation, attempt unauthorised access, or use it to harm others.</p>
      </LegalSection>

      <LegalSection title="Financial information">
        <p>Wollie is a read-only personal finance dashboard. It is not a bank, financial adviser, accountant, broker, or payment service. Information shown in Wollie is for organisation and general informational purposes, not financial, tax, legal, or investment advice.</p>
        <p>Balances, transactions, categories, recurring items, and calculations may be delayed, incomplete, or inaccurate. Confirm important information with your financial institution before making decisions.</p>
      </LegalSection>

      <LegalSection title="Connected services">
        <p>Bank connectivity and other features depend on third-party services, including Enable Banking and participating financial institutions. Their availability, terms, consent periods, and data may change independently of Wollie.</p>
        <p>You authorise Wollie and its connectivity providers to retrieve the account information you select. You can withdraw that access by disconnecting the account.</p>
      </LegalSection>

      <LegalSection title="Accounts and access">
        <p>You are responsible for activity under your Wollie account. We may suspend or restrict access when reasonably necessary for security, legal compliance, service integrity, or a serious breach of these terms.</p>
      </LegalSection>

      <LegalSection title="Early-stage service">
        <p>Wollie is under active development. Features may change, become unavailable, or contain errors. The service is provided on an “as is” and “as available” basis to the extent permitted by applicable law.</p>
      </LegalSection>

      <LegalSection title="Liability">
        <p>To the extent permitted by law, Wollie is not responsible for indirect or consequential losses, losses caused by inaccurate third-party data, unavailable bank connections, unauthorised access outside our reasonable control, or decisions made using the service. Nothing in these terms excludes rights or liability that cannot legally be excluded.</p>
      </LegalSection>

      <LegalSection title="Ending use and changes">
        <p>You may stop using Wollie and disconnect financial accounts at any time. We may update these terms as the product develops. Continued use after an update means the revised terms apply from their published date.</p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>Questions about these terms can be sent to <a className="underline underline-offset-4" href="mailto:hello@wollie.app">hello@wollie.app</a>.</p>
      </LegalSection>
    </LegalDocument>
  )
}
