import type { PostKind } from '#/generated/prisma/client'

export const POST_KINDS: {
  value: PostKind
  label: string
  description: string
}[] = [
  {
    value: 'WORKFLOW',
    label: 'Workflow',
    description: 'End-to-end process — steps, files, and how you run it',
  },
  {
    value: 'PROMPT',
    label: 'Prompt',
    description: 'A prompt, chain, or instruction set you reuse',
  },
  {
    value: 'HARNESS',
    label: 'Harness',
    description: 'Agent harness, rules, or configuration that shapes behavior',
  },
  {
    value: 'SKILL',
    label: 'Skill',
    description: 'SKILL.md, slash command, or packaged agent capability',
  },
  {
    value: 'SETUP',
    label: 'Setup',
    description: 'Tooling, environment, or project wiring',
  },
  {
    value: 'MCP',
    label: 'MCP',
    description: 'MCP server, tool integration, or connector',
  },
  {
    value: 'PLAYBOOK',
    label: 'Playbook',
    description: 'Repeatable playbook for a recurring job',
  },
  {
    value: 'TEMPLATE',
    label: 'Template',
    description: 'Starter template you copy and adapt',
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Does not fit the categories above',
  },
]

export function kindLabel(value: PostKind) {
  return POST_KINDS.find((k) => k.value === value)?.label ?? value
}
