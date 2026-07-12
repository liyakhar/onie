/** Seed builders used for cold-start content and non-production demos. */

export type DemoAccount = {
  id: string
  name: string
  email: string
  username: string
  field:
    | 'UX_UI'
    | 'ENGINEERING'
    | 'SAAS'
    | 'MOBILE'
    | 'CONTENT'
  headline: string
  bio: string
  loginLabel: string
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo-liya-k',
    name: 'Liya K',
    email: 'liya@onie.dev',
    username: 'liya-k',
    field: 'UX_UI',
    loginLabel: 'liya_k',
    headline: 'UX/UI · agent skills for design systems & review loops',
    bio: 'I publish Cursor skills and workflows for UI audits, component polish, and research synthesis — stuff that actually ships.',
  },
  {
    id: 'demo-sasha-zelts',
    name: 'Sasha Zelts',
    email: 'sasha.zelts@onie.dev',
    username: 'sasha-zelts',
    field: 'ENGINEERING',
    loginLabel: 'sasha_zelts',
    headline: 'Internal tools · automation that closes user-reported bugs',
    bio: 'I build in-house automations that turn support tickets and repro steps into fixes — triage, patch, verify, notify.',
  },
  {
    id: 'demo-mathiew-builds',
    name: 'Mathiew Builds',
    email: 'mathiew@onie.dev',
    username: 'mathiew-builds',
    field: 'SAAS',
    loginLabel: 'mathiew_builds',
    headline: 'Ship apps in days, not weeks',
    bio: 'Full-stack builder sharing the exact agent loops I use to go from idea → deployed MVP before the week ends.',
  },
  {
    id: 'demo-matios-apps',
    name: 'Matios Apps',
    email: 'matios@onie.dev',
    username: 'matios-apps',
    field: 'MOBILE',
    loginLabel: 'matios_apps',
    headline: 'Flutter + agents · widgets, state, and store releases',
    bio: 'Mobile dev focused on Flutter. Workflows for scaffolding screens, golden tests, and App Store / Play release checklists.',
  },
  {
    id: 'demo-rayan-roberts',
    name: 'Rayan Roberts',
    email: 'rayan@onie.dev',
    username: 'rayan-roberts',
    field: 'CONTENT',
    loginLabel: 'rayan_roberts',
    headline: 'Image AI for real estate & photography clients',
    bio: 'I run enhancement pipelines for agencies — sky replacement, staging, upscale — and document the tools + prompts that hold up in production.',
  },
]

export const DEMO_ACCOUNT_BY_EMAIL = Object.fromEntries(
  DEMO_ACCOUNTS.map((account) => [account.email, account]),
) as Record<string, DemoAccount>

export const DEMO_ACCOUNT_IDS = new Set(DEMO_ACCOUNTS.map((account) => account.id))
