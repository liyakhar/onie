import type { BlogPost } from '#/content/blog/types'

export const shareClaudeCodeSkillsPost: BlogPost = {
  slug: 'share-claude-code-skills-with-team',
  title: 'Share Claude Code skills with your team',
  description:
    'Three methods to distribute Claude Code skills: git-commit project skills, package plugins, or use managed platforms. Team conventions, review workflows, and best practices.',
  publishedAt: '2026-07-18',
  readingMinutes: 12,
  primaryKeyword: 'share claude code skills with team',
  keywordCluster: [
    'share claude code skills with team',
    'team claude code skills',
    'shared skills library claude code',
    'claude code plugin marketplace',
    'team prompt management',
    'claude code conventions',
  ],
  author: {
    name: 'Emma Chen',
    role: 'Agent engineer · Team infrastructure',
    bio: 'Ships team workflows with Claude Code and MCP. Focuses on scaling agent assets across organizations without manual overhead.',
  },
  tldr:
    'Share skills via git commit (repo-scoped), plugin marketplace (org-scoped), or managed platforms (20+ skills). For most teams: start with .claude/skills/ in version control, add a shared CLAUDE.md for conventions, and manage changes through pull requests like code.',
  relatedSlugs: [
    'how-to-write-claude-code-skills',
    'claude-code-skills-vs-rules',
    'shared-prompt-library-for-teams',
    'agent-skills-best-practices',
  ],
  body: `
## Why teams need shared skills

When you write a skill, you encode a workflow: how to review code, deploy safely, document decisions, or debug production issues. A skill is institutional knowledge made executable.

Without sharing, each team member rewrites that skill on their laptop. With sharing, you codify best practices once and every developer inherits them on day one.

Claude Code makes this distribution possible through three methods, depending on scope:

1. **Project-level skills** — commit to \`.claude/skills/\` in the repo
2. **Organization-level skills** — package as a plugin, distribute via Git
3. **Managed platforms** — centralized distribution for 20+ skills and growing teams

This post covers each method, the review workflows that keep them clean, and how to document so new hires find what they need.

## Method 1: Project-level skills (git commit)

The fastest path is to commit skills directly to your repo.

Create a \`.claude/skills/\` directory at the root:

\`\`\`bash
mkdir -p .claude/skills/code-review
\`\`\`

Each skill lives in its own folder with a \`SKILL.md\` file:

\`\`\`
.claude/
  skills/
    code-review/
      SKILL.md
      examples/
        before-and-after.md
    write-unit-test/
      SKILL.md
    deploy-staging/
      SKILL.md
\`\`\`

Push to version control:

\`\`\`bash
git add .claude/skills/
git commit -m "Add team code review and test-writing skills"
git push
\`\`\`

Every developer who clones or pulls the repo gets these skills automatically. No setup steps. No manual installation. No links to follow.

### How Claude Code loads project skills

When you open a Claude Code session in a project, Claude scans \`.claude/skills/\` at session start. Each skill's name and description load into context (negligible tokens). The full body loads only when you invoke the skill or when Claude detects the description matches your current task.

If a teammate updates a skill and pushes to main, your next session picks up the new version automatically — same as pulling fresh code.

### Organizing by task and domain

Use descriptive folder names so teammates discover skills without hunting:

| Folder | Use when | Example skill |
|--------|----------|---------------|
| \`code-review/\` | Code quality tasks | /review-typescript-file, /check-for-async-bugs |
| \`testing/\` | Test coverage | /write-unit-test, /test-edge-cases |
| \`infrastructure/\` | Deployment and ops | /deploy-staging, /emergency-rollback |
| \`documentation/\` | Docs and runbooks | /write-incident-postmortem, /update-architecture-adr |
| \`refactoring/\` | Modernization tasks | /migrate-to-typescript, /extract-component |

Within each domain, skills stay focused: one skill, one task, one description that matches a common prompt.

### Managing changes through pull requests

Skills are code, so treat them like code. Changes go through pull requests:

\`\`\`bash
git checkout -b update/add-async-warning-to-review

# Edit .claude/skills/code-review/SKILL.md
# Add checklist item: "Check for unhandled promise rejections"

git add .claude/skills/code-review/SKILL.md
git commit -m "code-review: add async error handling checks"
git push origin update/add-async-warning-to-review

# Open PR for team review
\`\`\`

The pull request lets teammates discuss the change, suggest improvements, and approve before merging. Over time, your skills library becomes a living changelog of team best practices.

## Method 2: Plugins (cross-repo organization skills)

When your team uses the same standards across multiple repositories, package skills as a plugin.

A plugin is a separate Git repository containing your skills:

\`\`\`
your-org-plugins/
  plugin.json
  .claude-plugin/
    metadata.json
  skills/
    company-voice/
      SKILL.md
    incident-postmortem/
      SKILL.md
    code-style/
      SKILL.md
    database-migrations/
      SKILL.md
\`\`\`

The \`plugin.json\` file tells Claude Code what to install:

\`\`\`json
{
  "name": "Your Company Skills",
  "description": "Shared agent workflows for all teams",
  "version": "1.2.0",
  "skills": [
    {
      "id": "company-voice",
      "path": "skills/company-voice"
    },
    {
      "id": "incident-postmortem",
      "path": "skills/incident-postmortem"
    }
  ]
}
\`\`\`

Teammates install once:

\`\`\`bash
/plugin marketplace add your-org/your-org-plugins
/plugin install your-skills@your-org-plugins --scope user
\`\`\`

When you bump the version and merge to main, every teammate's next Claude Code session gets the updated skills. Improvements propagate automatically — no manual re-installation needed.

### When to reach for plugins

Use plugins when:

- Your team spans multiple repositories
- You have 5+ skills used across projects
- Changes need to roll out to all teams at once
- You want central governance (who can edit, version history, deprecation notices)

If you have a single project with 3 skills, commit them to \`.claude/skills/\` instead. Simpler, fewer moving parts.

## Method 3: Managed platforms

When you hit 20+ skills or onboard many teams, managed platforms handle distribution automatically.

Platforms like Duet provide:

- **Central admin dashboard** — upload once, every developer gets it
- **Automatic versioning** — bump a version number, updates roll out next session
- **Org-wide visibility** — search all skills, see who uses what, deprecate gracefully
- **Role-based access** — skills for frontend only, skills for ops only
- **Audit logs** — who changed what skill and when

For most teams starting out, start with project-level skills or plugins. Platforms become useful at scale or when you need administrative controls that Git workflows don't provide.

## Documenting for discoverability

Skills are useless if nobody knows they exist. Create a shared \`CLAUDE.md\` file at the repo root documenting your skill library and conventions:

\`\`\`markdown
# Claude Code setup for our team

## Available skills

### Code review
- **Skill:** \`/review\` — Comprehensive code review checklist
- **When:** Use before pushing to main; checks for security, performance, and style
- **Example:** \`/review app/components/Button.tsx\`

### Testing
- **Skill:** \`/test-unit\` — Write unit tests with edge cases
- **When:** Use after implementing a new function or module
- **Example:** \`/test-unit src/utils/formatDate.ts\`

### Deployment
- **Skill:** \`/deploy-staging\` — Deploy to staging environment
- **Skill:** \`/deploy-production\` — Deploy to production with rollback plan
- **Convention:** Always deploy to staging first; get approval before production

## Team conventions

- One skill per file; keep descriptions to one sentence
- Skill names in lowercase with hyphens: \`code-review\`, not \`CodeReview\`
- Include concrete examples in skill descriptions
- New skills start in draft state (document with [DRAFT]) until reviewed
\`\`\`

With this file, every new hire reads one page and knows what skills exist, when to use them, and how the team names things. Plus, internal links let them jump to specific examples.

## Managing skill sprawl

Without discipline, skill libraries grow chaotic. A few patterns prevent this:

**One skill per task.** Don't bundle "code review" and "test writing" into a single mega-skill. Keep each focused. Multiple small skills are easier to maintain and compose than one large one.

**Review changes before merge.** Someone proposes an update to the deployment skill. A senior engineer reviews, ensures it reflects current practice, and approves. Over time, your skills become a codified source of truth.

**Deprecate gracefully.** If a skill becomes obsolete (you migrated from a tool, changed your deployment strategy), keep the skill but add a deprecation notice to its description: "Deprecated as of 2026-01-15. Use /deploy-v2 instead." Teammates can still find the old skill if they're context-switching; you've pointed them to the new one.

**Archive quarterly.** Every three months, review unused skills. If a skill hasn't been invoked in months, mark it [ARCHIVED] and move it to a separate \`archived-skills/\` folder. This keeps your active library lean and focused.

## Scaling with new hires

When someone joins the team, onboard them with Claude Code skills:

1. **Day 1:** Clone the repo, read \`CLAUDE.md\`
2. **Day 2:** Try three skills interactively (/code-review on a recent PR, /test-unit on a new function, /deploy-staging on a branch)
3. **Day 3:** Pair with a senior dev on a real task; watch them use skills
4. **Day 4:** Submit a pull request that uses at least one team skill; get feedback

With skills as your onboarding backbone, new developers inherit institutional knowledge without sitting through a three-day knowledge dump.

## FAQ

### Can I use both project skills and plugins together?

Yes. Claude Code loads skills from \`.claude/skills/\` (project-level) and any installed plugins (org-level). If two skills cover similar tasks, both are available. If skills have the same name, project skills take precedence.

### What if I want skills only for certain team members?

Project skills in \`.claude/skills/\` are visible to anyone with repo access. If you need role-based access (only senior engineers see the "emergency-rollback" skill), use a managed platform or manual governance: document the skill in a private org wiki, not in the repo.

### How do I handle breaking changes to a shared skill?

Treat it like code. If a skill's behavior changes significantly, increment the version (or, for project skills, mention it in the commit message). Add a migration note in \`CLAUDE.md\`: "As of 2026-02-01, /deploy-staging now requires a staging-config.yml file. See [setup guide](./setup-guide.md)." This gives teammates time to adjust.

### What if two developers propose conflicting skill updates?

Use pull requests to resolve. One person proposes an update, another suggests a different approach, you discuss in the PR and land on a shared version. The git history becomes your decision log.

### Can I share skills across a GitHub organization?

Yes. Create a shared org repository called \`org-skills\` or \`agent-assets\`. Use it as a plugin marketplace (teams run \`/plugin marketplace add your-org/org-skills\`). Or, use a Git submodule: add it to each project as \`.claude/skills\` via \`git submodule add\`. Both approaches work; plugins are cleaner for large organizations.

### How do I prevent skill drift?

Document conventions in your \`CLAUDE.md\`: one skill per file, descriptive names, examples required, version control everything. When someone proposes a new skill, check it against these rules in the PR review. Over time, consistency becomes a habit.

## Next steps

- Start with 3 skills for the tasks your team does most: code review, writing tests, and your primary deployment path
- Commit them to \`.claude/skills/\` and push
- Write one page of \`CLAUDE.md\` documenting what each does
- Share with your team; ask for feedback in a PR
- Use them on real tasks and refine based on experience

As your library grows, you'll move toward plugins or managed platforms. But most teams ship value fastest by starting with version control, one directory, and pull requests to manage change.
`.trim(),
  faqs: [
    {
      question: 'How do I share Claude Code skills with my team?',
      answer:
        'Place skills in a `.claude/skills/` directory at the root of your repository, commit and push to Git. Every team member who clones or pulls the repo gets them automatically. No setup steps or additional installation needed.',
    },
    {
      question: 'What is the difference between project skills and plugins?',
      answer:
        'Project skills live in `.claude/skills/` in a single repository and apply only to that project. Plugins are separate repositories that distribute skills across multiple projects in your organization. Start with project skills; graduate to plugins as your library grows.',
    },
    {
      question: 'How do we manage changes to shared skills?',
      answer:
        'Treat skills like code. Changes go through pull requests for review. Someone proposes an update, the team discusses, and an approval merges it to main. Your git history becomes a changelog of evolving best practices.',
    },
    {
      question: 'Can I use project skills and plugins together?',
      answer:
        'Yes. Claude Code loads skills from `.claude/skills/` (project) and any installed plugins (org-level). If skills have the same name, project skills take precedence.',
    },
    {
      question: 'What if I have too many skills and they become hard to manage?',
      answer:
        'Establish naming conventions, keep each skill focused on one task, and review quarterly for unused skills. Archive stale skills to a separate folder. Use a managed platform if you exceed 20+ skills across multiple teams.',
    },
    {
      question: 'How do I onboard new team members with Claude Code skills?',
      answer:
        'Have them read `CLAUDE.md`, try three skills interactively, pair with a senior dev on a real task, and submit a PR using team skills. In 3-4 days they inherit institutional knowledge without a manual knowledge dump.',
    },
    {
      question: 'What if two teams have conflicting skill conventions?',
      answer:
        'Align conventions through a shared `CLAUDE.md` or governance doc. Use namespacing if needed: `frontend-review`, `backend-review` for different stacks. Git workflows make consensus clear because disagreements surface in PR discussions.',
    },
    {
      question: 'Can I share skills across a GitHub organization?',
      answer:
        'Yes. Create an org repository as a plugin marketplace and teams install via `/plugin marketplace add`. Alternatively, use a Git submodule in each project. Plugins are cleaner for large organizations; submodules work for smaller teams.',
    },
  ],
}
