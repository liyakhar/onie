import { createFileRoute } from '@tanstack/react-router'
import { LegalDocument, LegalSection } from '#/components/LegalDocument'
import { buildPageMeta } from '#/lib/seo'
import { getLegalIdentity } from '#/server/legal'

const meta = buildPageMeta({
  path: '/terms',
  title: 'Terms of Service',
  description: 'The terms for using Wollie and its read-only financial dashboard.',
})

export const Route = createFileRoute('/terms/')({
  head: () => ({ meta: meta.meta, links: meta.links }),
  loader: () => getLegalIdentity(),
  component: TermsPage,
})

function TermsPage() {
  const legal = Route.useLoaderData()
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Terms of Service"
      summary="These terms apply when you access or use Wollie."
      updated="July 15, 2026"
    >
      <LegalSection title="Using Wollie">
        <p>These terms form a contract between you and {legal.businessName}. You must be at least 18 years old, provide accurate account information, keep your sign-in secure, and use Wollie only for lawful personal purposes.</p>
        <p>You may not misuse the service, interfere with its operation, attempt unauthorised access, scrape or reverse engineer protected parts of the service, or use it to harm others.</p>
      </LegalSection>

      <LegalSection title="Trial, price, and subscription">
        <p>New accounts receive the no-card trial shown on the pricing page. Choosing a paid plan starts a recurring monthly or yearly subscription at the total price displayed by Stripe Checkout before you confirm payment. The subscription renews automatically for the same interval until cancelled.</p>
        <p>Applicable taxes and the billing currency are shown before payment. Stripe processes payment details and issues billing documents. Wollie does not store full card details.</p>
        <p>You can manage invoices, payment details, and renewal cancellation through Billing in your account. A cancellation stops the next renewal and access continues until the displayed paid-period end unless applicable law or a refund decision requires otherwise.</p>
      </LegalSection>

      <LegalSection title="Withdrawal and refunds">
        <p>If consumer law gives you a right to withdraw from a distance contract, you may exercise it within 14 days of the paid subscription by emailing <a className="underline underline-offset-4" href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a> with your account email and an unambiguous withdrawal request.</p>
        <p>By confirming a paid subscription, you expressly request immediate access before the withdrawal period ends. Where the law permits, a proportionate amount may be due for service already supplied before withdrawal. Statutory refund and conformity rights are not limited by these terms.</p>
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

      <LegalSection title="Availability and support">
        <p>Wollie may perform maintenance, change providers, or temporarily limit a feature to protect the service or comply with law. We do not guarantee uninterrupted bank coverage because banks and connectivity providers control parts of the service.</p>
        <p>Service and billing questions can be sent to <a className="underline underline-offset-4" href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>.</p>
      </LegalSection>

      <LegalSection title="Liability">
        <p>To the extent permitted by law, Wollie is not responsible for indirect or consequential losses, losses caused by inaccurate third-party data, unavailable bank connections, unauthorised access outside our reasonable control, or decisions made using the service. Nothing in these terms excludes rights or liability that cannot legally be excluded.</p>
      </LegalSection>

      <LegalSection title="Ending use and changes">
        <p>You may stop using Wollie, disconnect financial accounts, export your data, and request account deletion at any time. Active subscription renewal must be cancelled before account deletion. Deletion removes local financial data but records that must be kept for tax, accounting, fraud prevention, or legal claims may be retained for the applicable legal period.</p>
        <p>We may update these terms as the product develops. We will give reasonable advance notice of material changes affecting an active paid subscription. Changes do not remove mandatory consumer rights.</p>
      </LegalSection>

      <LegalSection title="Law, complaints, and mediation">
        <p>Belgian law applies, without depriving consumers of mandatory protections available in their country of residence. Courts with jurisdiction under applicable consumer law may hear disputes.</p>
        <p>Contact us first at <a className="underline underline-offset-4" href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>. If a consumer complaint is not resolved, you may contact {legal.mediatorName}: <a className="underline underline-offset-4" href={legal.mediatorUrl} rel="noreferrer">{legal.mediatorUrl}</a>.</p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>{legal.businessName}, {legal.businessAddress}. Questions about these terms can be sent to <a className="underline underline-offset-4" href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>.</p>
      </LegalSection>
    </LegalDocument>
  )
}
