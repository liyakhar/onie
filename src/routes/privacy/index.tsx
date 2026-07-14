import { createFileRoute } from '@tanstack/react-router'
import { LegalDocument, LegalSection } from '#/components/LegalDocument'
import { buildPageMeta } from '#/lib/seo'

const meta = buildPageMeta({
  path: '/privacy',
  title: 'Privacy Policy',
  description: 'How Wollie handles account, transaction, and personal information.',
})

export const Route = createFileRoute('/privacy/')({
  head: () => ({ meta: meta.meta, links: meta.links }),
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Privacy Policy"
      summary="This policy explains what Wollie collects, why it is used, and the choices you have."
      updated="July 14, 2026"
    >
      <LegalSection title="Information we collect">
        <p>We collect the account information you provide when you register, such as your name and email address.</p>
        <p>When you connect a financial account, Wollie may receive the institution name, account name and type, currency, balances, and transaction history. We also store the budgets, categories, recurring items, and settings you create.</p>
        <p>Basic technical information may be processed to keep you signed in, secure the service, diagnose errors, and prevent abuse.</p>
      </LegalSection>

      <LegalSection title="Bank connections">
        <p>European bank connections are provided through Enable Banking. Authentication happens with your bank or its authorised interface. Wollie does not ask for or receive your bank password.</p>
        <p>Access is read-only. Wollie uses encrypted provider credentials on the server to refresh the account information you authorised.</p>
      </LegalSection>

      <LegalSection title="How we use information">
        <p>We use your information to show balances and activity, organise spending, calculate budget information, detect recurring items, maintain your account, and improve the reliability and security of Wollie.</p>
        <p>We do not sell your personal or financial information.</p>
      </LegalSection>

      <LegalSection title="Service providers">
        <p>We may share only the information needed to operate Wollie with providers that support bank connectivity, authentication, hosting, databases, security, and error monitoring. They process information for those services under their own terms and applicable data-protection obligations.</p>
        <p>We may also disclose information when required by law or when reasonably necessary to protect users, Wollie, or others.</p>
      </LegalSection>

      <LegalSection title="Retention and deletion">
        <p>We keep information while your account is active and as needed to operate the service or meet legal obligations. Disconnecting a bank removes that connection and its locally stored account and transaction data. You may also request deletion of your Wollie account and associated information.</p>
      </LegalSection>

      <LegalSection title="Your choices and rights">
        <p>You can disconnect bank access at any time. Depending on where you live, you may also have rights to access, correct, export, restrict, object to, or delete personal information.</p>
      </LegalSection>

      <LegalSection title="Security and changes">
        <p>We use reasonable technical and organisational measures to protect information, but no online service can guarantee absolute security. We may update this policy as Wollie develops and will publish the new date on this page.</p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>For privacy questions or requests, email <a className="underline underline-offset-4" href="mailto:hello@wollie.app">hello@wollie.app</a>.</p>
      </LegalSection>
    </LegalDocument>
  )
}
