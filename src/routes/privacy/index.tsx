import { createFileRoute } from '@tanstack/react-router'
import { LegalDocument, LegalSection } from '#/components/LegalDocument'
import { buildPageMeta } from '#/lib/seo'
import { getLegalIdentity } from '#/server/legal'

const meta = buildPageMeta({
  path: '/privacy',
  title: 'Privacy Policy',
  description: 'How Wollie handles account, transaction, and personal information.',
})

export const Route = createFileRoute('/privacy/')({
  head: () => ({ meta: meta.meta, links: meta.links }),
  loader: () => getLegalIdentity(),
  component: PrivacyPage,
})

function PrivacyPage() {
  const legal = Route.useLoaderData()
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Privacy Policy"
      summary="This policy explains what Wollie collects, why it is used, and the choices you have."
      updated="July 15, 2026"
    >
      <LegalSection title="Information we collect">
        <p>We collect the account information you provide when you register, such as your name and email address.</p>
        <p>When you connect a financial account, Wollie may receive the institution name, account name and type, currency, balances, and transaction history. We also store the budgets, categories, recurring items, and settings you create.</p>
        <p>Basic technical information may be processed to keep you signed in, secure the service, diagnose errors, and prevent abuse.</p>
      </LegalSection>

      <LegalSection title="Controller and legal bases">
        <p>{legal.businessName}, at {legal.businessAddress}, is responsible for Wollie's processing of personal data. Contact: <a className="underline underline-offset-4" href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>.</p>
        <p>We process registration, authentication, bank, budget, and billing-status data to perform the Wollie contract. We process security, abuse-prevention, and reliability data where necessary for our legitimate interests in protecting the service. We process invoice and transaction records where required by tax, accounting, or other law. Optional marketing or non-essential tracking requires a separate consent.</p>
      </LegalSection>

      <LegalSection title="Bank connections">
        <p>European bank connections are provided through Enable Banking. Authentication happens with your bank or its authorised interface. Wollie does not ask for or receive your bank password.</p>
        <p>Access is read-only. Wollie uses encrypted provider credentials on the server to refresh the account information you authorised.</p>
      </LegalSection>

      <LegalSection title="How we use information">
        <p>We use your information to show balances and activity, organise spending, calculate budget information, detect recurring items, maintain your account, and improve the reliability and security of Wollie.</p>
        <p>We do not sell your personal or financial information.</p>
      </LegalSection>

      <LegalSection title="Shared households">
        <p>If you join a shared household, its other member can see the financial accounts, balances, transactions, budgets, recurring items, and ownership or cost-share settings in that household. Only accept an invitation from someone you trust.</p>
        <p>Each person signs in separately and connects their own bank provider credentials. Wollie does not reveal those credentials to the other household member. The household owner manages the shared Wollie subscription.</p>
      </LegalSection>

      <LegalSection title="Service providers">
        <p>We share only the information needed to operate Wollie with providers supporting bank connectivity (Enable Banking and participating banks), payment and invoices (Stripe), hosting and delivery (Cloudflare), database infrastructure, and transactional email (Resend). Authentication is operated within Wollie using its database and authentication software.</p>
        <p>Provider roles and locations differ. When personal data is transferred outside the European Economic Area, we use an applicable transfer mechanism such as an adequacy decision or contractual safeguards, as supported by the relevant provider agreement.</p>
        <p>We may also disclose information when required by law or when reasonably necessary to protect users, Wollie, or others.</p>
      </LegalSection>

      <LegalSection title="Retention and deletion">
        <p>Account, budget, and financial data is kept while your Wollie account is active. Provider session credentials are kept until you disconnect, consent expires, or the account is deleted. Disconnecting a bank revokes provider access where supported and removes that connection and its locally stored account and transaction data.</p>
        <p>Account deletion removes Wollie profile and locally stored financial data. Limited billing, tax, fraud-prevention, dispute, and security records may be retained when and for as long as required by law or necessary to establish or defend legal claims. Provider backups are removed according to documented backup-retention schedules.</p>
      </LegalSection>

      <LegalSection title="Your choices and rights">
        <p>You can disconnect bank access, download a structured account-data export, and request account deletion from Settings. Depending on where you live, you may also have rights to access, correct, restrict, object to, or obtain portability of personal information.</p>
        <p>Requests can be sent to <a className="underline underline-offset-4" href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>. We may verify identity before acting. You may lodge a complaint with the Belgian Data Protection Authority or your competent local data-protection authority.</p>
      </LegalSection>

      <LegalSection title="Automated suggestions">
        <p>Wollie uses transaction descriptions and amounts to suggest categories, recurring payments, and budget summaries. These suggestions do not make legal or similarly significant decisions about you. You can review and correct them in the app.</p>
      </LegalSection>

      <LegalSection title="Cookies and age">
        <p>Wollie uses essential authentication and security cookies needed to keep you signed in. We do not currently use advertising cookies. If non-essential analytics or advertising technologies are introduced, this policy and the consent controls will be updated before they are enabled.</p>
        <p>Wollie is intended for adults aged 18 and over and is not directed to children.</p>
      </LegalSection>

      <LegalSection title="Security and changes">
        <p>We use reasonable technical and organisational measures to protect information, but no online service can guarantee absolute security. We may update this policy as Wollie develops and will publish the new date on this page.</p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>For privacy questions or requests, email <a className="underline underline-offset-4" href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>.</p>
      </LegalSection>
    </LegalDocument>
  )
}
