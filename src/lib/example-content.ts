/** IDs from `prisma/seed.ts` — demo workflows and builders for cold-start / staging. */
export const EXAMPLE_POST_IDS = new Set([
  'post-ux-research',
  'post-saas-mvp',
  'post-science-lit',
])

export const EXAMPLE_AUTHOR_IDS = new Set([
  'demo-ux-designer',
  'demo-saas-builder',
  'demo-scientist',
])

export function isExamplePost(post: { id: string; author?: { id: string } }) {
  return EXAMPLE_POST_IDS.has(post.id) || EXAMPLE_AUTHOR_IDS.has(post.author?.id ?? '')
}

export function isExampleAuthor(authorId: string) {
  return EXAMPLE_AUTHOR_IDS.has(authorId)
}
