import { DEMO_ACCOUNT_IDS } from '#/lib/demo-accounts'

/** IDs from `prisma/seed.ts` — demo workflows and builders for cold-start / staging. */
export const EXAMPLE_POST_IDS = new Set([
  'post-liya-ui-audit',
  'post-liya-research-skill',
  'post-sasha-triage-bot',
  'post-sasha-bug-playbook',
  'post-mathiew-48h-mvp',
  'post-mathiew-stack-template',
  'post-matios-widget-loop',
  'post-matios-release',
  'post-rayan-real-estate',
  'post-rayan-photographer-tools',
  'post-liya-skill-review-loop',
  'post-sasha-evidence-loop',
  'post-mathiew-ship-checkpoints',
  'post-matios-screen-proof',
  'post-rayan-image-proof',
])

export const EXAMPLE_AUTHOR_IDS = DEMO_ACCOUNT_IDS

export function isExamplePost(post: { id: string; author?: { id: string } }) {
  return EXAMPLE_POST_IDS.has(post.id) || EXAMPLE_AUTHOR_IDS.has(post.author?.id ?? '')
}

export function isExampleAuthor(authorId: string) {
  return EXAMPLE_AUTHOR_IDS.has(authorId)
}
