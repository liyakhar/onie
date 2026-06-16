const VARIANT_RULES = [
  {
    variant: 'skill',
    patterns: [
      /\bskill\.md\b/i,
      /\bcursor\s+skill/i,
      /\bcursor\s*rules?\b/i,
      /\.cursorrules\b/i,
      /\bclaude\s+code\s+skill/i,
      /\bslash\s+command/i,
    ],
  },
  {
    variant: 'harness',
    patterns: [
      /\bharness\b/i,
      /\bsubagent/i,
      /\bagent\s+loop\b/i,
      /\borchestrat/i,
      /\bmulti-?agent/i,
    ],
  },
  {
    variant: 'workflow',
    patterns: [
      /\bworkflow\b/i,
      /\bprompt\s+chain/i,
      /\bfile\s+layout/i,
      /\bmcp\s+server/i,
      /\bhow\s+i\s+use\s+(claude|cursor|agents?)\b/i,
      /\bmy\s+setup\b/i,
    ],
  },
]

const FIELD_RULES = [
  { field: 'UX', patterns: [/\bux\b/i, /\bdesign\b/i, /\bfigma\b/i] },
  { field: 'engineering', patterns: [/\bengineer/i, /\bdeveloper\b/i, /\bcodebase\b/i] },
  { field: 'science', patterns: [/\bscience\b/i, /\bresearch\b/i, /\blab\b/i] },
  { field: 'SaaS', patterns: [/\bsaas\b/i, /\bstartup\b/i, /\bfounder\b/i] },
]

function containsAny(text, terms) {
  const lower = text.toLowerCase()
  return terms.some((t) => lower.includes(t.toLowerCase()))
}

import { extractSpecificDetail } from './specific-detail.mjs'

function detectVariant(text) {
  for (const { variant, patterns } of VARIANT_RULES) {
    if (patterns.some((p) => p.test(text))) return variant
  }
  return 'workflow'
}

function detectField(text) {
  for (const { field, patterns } of FIELD_RULES) {
    if (patterns.some((p) => p.test(text))) return field
  }
  return 'your field'
}

/**
 * Heuristic classifier — no LLM or X API required.
 * Replace or augment with LLM via prompts/classify-post.md later.
 */
export function classifyPost(postText, signals) {
  const text = postText.trim()
  const lower = text.toLowerCase()

  if (!text) {
    return { score: 1, variant: 'skip', reason: 'empty post', specific_detail: null, field: null }
  }

  if (containsAny(text, signals.negative)) {
    return {
      score: 1,
      variant: 'skip',
      reason: 'matches negative filter',
      specific_detail: null,
      field: null,
    }
  }

  const keywordHits = [...signals.keywords, ...signals.hashtags].filter((k) =>
    lower.includes(k.toLowerCase().replace(/^#/, '')),
  )

  const variant = detectVariant(text)
  const specific_detail = extractSpecificDetail(text, variant)
  const field = detectField(text)

  let score
  let reason
  if (keywordHits.length >= 2 || (keywordHits.length >= 1 && variant !== 'workflow')) {
    score = 5
    reason = `strong match (${keywordHits.slice(0, 2).join(', ')})`
  } else if (keywordHits.length === 1) {
    score = 4
    reason = `keyword match (${keywordHits[0]})`
  } else if (variant !== 'workflow' || text.length > 120) {
    score = 3
    reason = 'substantive agent/workflow share'
  } else if (text.length > 60) {
    score = 2
    reason = 'weak signal — review manually'
  } else {
    score = 1
    reason = 'too short or off-topic'
  }

  if (score < 3) {
    return { score, variant: 'skip', reason, specific_detail, field }
  }

  return { score, variant, reason, specific_detail, field }
}
