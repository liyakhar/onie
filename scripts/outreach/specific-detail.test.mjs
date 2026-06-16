import { describe, expect, it } from 'vitest'
import { extractSpecificDetail } from './lib/specific-detail.mjs'

describe('extractSpecificDetail', () => {
  it('pulls quoted snippets', () => {
    expect(extractSpecificDetail('Check out my "refactor skill" for Claude', 'skill')).toBe('refactor skill')
  })

  it('pulls SKILL.md reference', () => {
    const d = extractSpecificDetail('Sharing my SKILL.md for code review automation', 'skill')
    expect(d.toLowerCase()).toContain('skill.md')
  })

  it('defaults for harness', () => {
    expect(extractSpecificDetail('Great day today', 'harness')).toBe('this harness structure')
  })
})
