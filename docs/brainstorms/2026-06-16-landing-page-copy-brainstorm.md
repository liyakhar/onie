---
date: 2026-06-16
topic: landing-page-copy
---

# Landing Page Copy

## What We're Building

Sharper landing page copy for Onie that works for **both** AI-native builders (Cursor, Claude Code, skills) and curious professionals exploring agents for the first time. Hero splits between **why now** (problem) and **concrete examples** (proof).

## Why This Approach

Three directions were considered: problem-first (A), category-first (B), and example-first (C). User chose **(c) both equally** — split the hero between problem and examples. Recommended hybrid: B + C with a problem-led headline and example-led second beat.

## Key Decisions

- **Drop meta copy**: No "scannable index" — state product value immediately
- **Dual-register language**: Plain terms first ("setups", "step-by-step"), technical terms where relevant ("Cursor skills", "Claude projects")
- **Name fields explicitly**: UX, SaaS, science, engineering — not vague "builders"
- **Why now in hero**: Agents are capable; know-how doesn't travel across fields
- **Keep 4-section layout**: Index → Who → How → Start
- **Rename What → Who** in TOC: Section 01 focuses on audience and use cases

## Final Copy

See `src/routes/index.tsx` for implementation.

## Open Questions

- None for MVP copy; revisit after user testing with cold traffic

## Next Steps

→ Implement in `src/routes/index.tsx`
→ Consider A/B testing headline variants later
