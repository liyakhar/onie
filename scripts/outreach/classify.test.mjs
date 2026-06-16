import { describe, expect, it } from 'vitest'
import { classifyPost } from './lib/classify.mjs'

const signals = {
  keywords: ['claude code skill', 'harness', 'workflow'],
  hashtags: ['#ClaudeCode'],
  negative: ['giveaway', 'waitlist'],
  blocklist: [],
  minEngagement: 0,
}

describe('classifyPost', () => {
  it('skips giveaway posts', () => {
    const r = classifyPost('Join our giveaway — waitlist open!', signals)
    expect(r.variant).toBe('skip')
    expect(r.score).toBeLessThan(3)
  })

  it('scores skill shares highly', () => {
    const r = classifyPost(
      'Here is my Claude Code skill for refactors — SKILL.md in the repo with cursor rules.',
      signals,
    )
    expect(r.variant).toBe('skill')
    expect(r.score).toBeGreaterThanOrEqual(3)
    expect(r.specific_detail).toBeTruthy()
  })

  it('detects harness variant', () => {
    const r = classifyPost('My subagent harness loops until tests pass. Full harness breakdown 🧵', signals)
    expect(r.variant).toBe('harness')
    expect(r.score).toBeGreaterThanOrEqual(3)
  })
})
