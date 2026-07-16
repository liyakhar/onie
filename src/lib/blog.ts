import type { BlogPost } from '#/content/blog/types'
import { claudeCodeSkillsPost } from '#/content/blog/how-to-write-claude-code-skills'
import { claudeCodeSkillsVsRulesPost } from '#/content/blog/claude-code-skills-vs-rules'
import { cursorRulesVsSkillsPost } from '#/content/blog/cursor-rules-vs-skills'
import { documentWorkflowsPost } from '#/content/blog/document-ai-agent-workflows'
import { claudeCodeWorkflowExamplesPost } from '#/content/blog/claude-code-workflow-examples'
import { buildMcpServerPost } from '#/content/blog/build-mcp-server'
import { sharedPromptLibraryPost } from '#/content/blog/shared-prompt-library-for-teams'
import { mcpServerCursorSetupPost } from '#/content/blog/mcp-server-cursor-setup'
import { installClaudeCodePost } from '#/content/blog/install-claude-code'
import { agentSkillsBestPracticesPost } from '#/content/blog/agent-skills-best-practices'

const posts: BlogPost[] = [
  installClaudeCodePost,
  mcpServerCursorSetupPost,
  agentSkillsBestPracticesPost,
  sharedPromptLibraryPost,
  claudeCodeSkillsVsRulesPost,
  claudeCodeSkillsPost,
  cursorRulesVsSkillsPost,
  documentWorkflowsPost,
  claudeCodeWorkflowExamplesPost,
  buildMcpServerPost,
]

export function getAllBlogPosts(): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug)
}

export { extractToc, slugifyHeading } from '#/lib/markdown-toc'

export function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
