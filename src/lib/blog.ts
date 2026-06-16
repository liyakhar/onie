import type { BlogPost } from '#/content/blog/types'
import { claudeCodeSkillsPost } from '#/content/blog/how-to-write-claude-code-skills'
import { cursorRulesVsSkillsPost } from '#/content/blog/cursor-rules-vs-skills'
import { documentWorkflowsPost } from '#/content/blog/document-ai-agent-workflows'
import { claudeCodeWorkflowExamplesPost } from '#/content/blog/claude-code-workflow-examples'

const posts: BlogPost[] = [
  claudeCodeSkillsPost,
  cursorRulesVsSkillsPost,
  documentWorkflowsPost,
  claudeCodeWorkflowExamplesPost,
]

export function getAllBlogPosts(): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug)
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function extractToc(body: string): Array<{ id: string; label: string; level: 2 | 3 }> {
  const items: Array<{ id: string; label: string; level: 2 | 3 }> = []
  for (const line of body.split('\n')) {
    const h2 = line.match(/^## (.+)$/)
    if (h2) {
      items.push({ id: slugifyHeading(h2[1]), label: h2[1], level: 2 })
      continue
    }
    const h3 = line.match(/^### (.+)$/)
    if (h3) {
      items.push({ id: slugifyHeading(h3[1]), label: h3[1], level: 3 })
    }
  }
  return items
}

export function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
