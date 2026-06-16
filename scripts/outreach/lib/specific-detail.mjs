/**
 * Pull a short, reply-friendly detail from a post (not the whole sentence).
 */
const SNIPPET_PATTERNS = [
  /"([^"]{5,70})"/,
  /'([^']{5,70})'/,
  /`([^`]{5,70})`/,
  /(?:especially|love|like)\s+(?:the\s+)?([^.!?\n]{8,70})/i,
  /(?:the way you|how you)\s+([^.!?\n]{8,70})/i,
]

const KEYWORD_SNIPPETS = [
  [/\b(SKILL\.md\b[^.!?\n]{0,40})/i, 1],
  [/\b(\.cursorrules\b[^.!?\n]{0,30})/i, 1],
  [/\b(cursor\s+rules?[^.!?\n]{0,35})/i, 1],
  [/\b(subagent[^.!?\n]{0,40})/i, 1],
  [/\b(harness[^.!?\n]{0,40})/i, 1],
  [/\b(MCP\s+server[^.!?\n]{0,35})/i, 1],
  [/\b(file\s+layout[^.!?\n]{0,35})/i, 1],
  [/\b(prompt\s+chain[^.!?\n]{0,35})/i, 1],
]

function cleanSnippet(s) {
  return s
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^the\s+/i, '')
    .replace(/[.,;:]+$/, '')
}

export function extractSpecificDetail(text, variant = 'workflow') {
  const normalized = text.trim().replace(/\s+/g, ' ')

  for (const pattern of SNIPPET_PATTERNS) {
    const m = normalized.match(pattern)
    if (m?.[1]) {
      const s = cleanSnippet(m[1])
      if (s.length >= 5) return s.length > 70 ? `${s.slice(0, 67)}…` : s
    }
  }

  for (const [pattern, group] of KEYWORD_SNIPPETS) {
    const m = normalized.match(pattern)
    if (m?.[group]) {
      const s = cleanSnippet(m[group])
      if (s.length >= 5) return s.length > 70 ? `${s.slice(0, 67)}…` : s
    }
  }

  const defaults = {
    skill: 'this skill setup',
    harness: 'this harness structure',
    workflow: 'this workflow',
  }
  return defaults[variant] || defaults.workflow
}
