export const site = {
  name: 'Onie',
  tagline: 'Agent workflows from people doing the work',
  description:
    'A public feed of agent workflows from practitioners in the field — prompts, skills, and setups tagged by discipline and stack.',
  locale: 'en_US',
  twitterHandle: '@onie',
  email: 'hello@onie.app',
} as const

export function getSiteUrl(): string {
  const url =
    import.meta.env.SITE_URL ||
    import.meta.env.VITE_SITE_URL ||
    process.env.SITE_URL ||
    process.env.BETTER_AUTH_URL ||
    'http://localhost:3000'
  return url.replace(/\/$/, '')
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl()
  if (path === '/' || path === '') return `${base}/`
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}
