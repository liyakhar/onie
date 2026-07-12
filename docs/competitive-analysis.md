---
date: 2026-06-17
status: active
topic: competitive-analysis
product: Onie
method: competitor-analysis skill
---

# Onie Competitive Analysis

## Market overview

The agent-skills ecosystem exploded in late 2025 with the open Agent Skills standard (`agentskills.io`). Thousands of skills now ship via GitHub repos and CLI installers. The market splits into three layers:

1. **Registries / marketplaces** — discover and install skills (`skills.sh`, Cursor Marketplace, `skills-hub.ai`)
2. **Team artifact stores** — version-controlled prompts/skills for orgs (`Sharebench`, `Agentver`, `PromptHub`, `AICamp`)
3. **Social / editorial** — humans sharing how they work (scattered: X threads, blogs, GitHub READMEs, DEV.to)

Onie sits in layer 3 with discovery features borrowed from layer 1. The gap: no product combines **practitioner identity + field context + social follow graph + browsable workflow posts** in one public feed.

**Key success factors:** trust (who published it), context (field + tools + full setup), discoverability (search/filter), and low friction to adopt (read, fork, follow — not necessarily `npx install`).

**Competitive intensity:** High and fast-moving. Vercel/Microsoft/Anthropic are investing in skills infrastructure. Onie's wedge is narrow but defensible if supply quality stays practitioner-led.

---

## Competitive set summary

| Competitor | Position | Threat to Onie |
|---|---|---|
| **skills.sh** | Open skill registry + CLI; 90K+ installs leaderboard | High for dev workflows; low for non-dev fields |
| **Sharebench** | Team MCP registry; 5K artifacts | High for B2B teams; different buyer |
| **Agentver** | GitHub-for-skills; version control + 40+ agents | Medium; overlaps on skill sharing, not social feed |
| **skills-hub.ai / cursor.directory** | Rules + skills library for Cursor | Medium; tool-specific, not cross-discipline social |
| **Anthropic / platform skills** | Official skill authoring in Claude | High ecosystem gravity; not a discovery feed |

---

## Competitor profiles

### 1. skills.sh (Vercel Labs)

**Profile:** Open-source skill directory and CLI. Install telemetry drives a leaderboard. 38+ agent platforms supported. Top skills have millions of installs.

**Strengths:** Default discovery layer for coding agents; one-command install; backed by Vercel; production teams publishing (Microsoft, Supabase, shadcn).

**Weaknesses:** Optimized for installable `SKILL.md` packages, not narrative workflow posts. No social graph, no practitioner profiles, no field taxonomy beyond topic tags. Leaderboard favors popular dev stacks, not UX/science/legal workflows.

**Pricing:** Free, open source.

**Threat:** Becomes the "npm for skills" — practitioners may publish there first and skip Onie.

**Onie opportunity:** Field-tagged workflow posts with author context and follow graph for disciplines skills.sh doesn't serve well.

---

### 2. Sharebench

**Profile:** Team registry for prompts, skills, agents, workflows. MCP pull model — agents read artifacts on demand. 5,040 public artifacts.

**Strengths:** Solves team versioning and stale-copy problem elegantly. Cross-tool (Claude, Cursor, ChatGPT, Codex). Author attribution on every pull.

**Weaknesses:** Team/private-first, not a public practitioner discovery feed. No discipline taxonomy or social following. Optimized for org reuse, not "find a UX researcher whose synthesis workflow I'd trust."

**Pricing:** Free for crews of 5.

**Threat:** If Onie tries to be a team registry, Sharebench wins on MCP integration.

**Onie opportunity:** Public cross-org discovery — workflows from practitioners you don't work with, organized by field.

---

### 3. Agentver

**Profile:** "GitHub for AI agents." Open-source CLI + desktop + cloud. Version control, security scanning, proposals/reviews. 40+ agent auto-detection.

**Strengths:** Full git lifecycle for skills; import from GitHub/Drive; team workspaces with permissions.

**Weaknesses:** Developer/tooling audience. No feed, no explore-by-field, no lightweight markdown post format. Heavy ops for casual practitioners.

**Pricing:** Open source; cloud from $4/seat.

**Threat:** Absorbs serious skill authors who want version control.

**Onie opportunity:** Low-friction publish for practitioners who won't set up git workflows — post markdown, tag field, done.

---

### 4. skills-hub.ai / cursor.directory

**Profile:** Aggregated rules and skills for Cursor; 4,400+ entries with security grades. Community + official sources.

**Strengths:** Cursor-native; rules + skills combo; quality scoring; team install via `npx @skills-hub-ai/cli install`.

**Weaknesses:** Cursor-specific. Index/registry model, not social. No practitioner identity or follow graph.

**Threat:** Default starting point for Cursor users looking for skills.

**Onie opportunity:** Cross-tool, cross-discipline workflows with human context — not just Cursor rules.

---

### 5. Anthropic Skills + Claude ecosystem

**Profile:** Official skill format, Claude.ai upload, Claude Code native support, open spec. Anthropic publishes example skills; enterprises build private skills.

**Strengths:** Standard-setter; deepest agent integration; trust from platform vendor.

**Weaknesses:** No public cross-practitioner discovery feed. Skills are capabilities, not "here's my full weekly research synthesis workflow with tools listed."

**Threat:** Defines the format everyone uses; Onie must interoperate, not fight the spec.

**Onie opportunity:** Be where practitioners *discuss and discover* workflows before they formalize them as installable skills.

---

## Differentiation opportunities

| Gap in market | Onie can own |
|---|---|
| Workflows trapped in DMs and private repos | Public feed with one-click publish |
| Generic prompt libraries lack field context | 19 discipline categories + tool tags |
| Registries optimize for installs, not trust | Follow practitioners, see their feed |
| Non-dev fields underserved by skills.sh | UX, science, legal, healthcare, education workflows |
| No "fork with attribution" social loop | `forkedFromId` on posts — lean into this |

## Recommended positioning

**Onie is Dev.to meets Are.na for agent workflows** — a public feed from practitioners, browsable by field and tool, with a social graph. Not the npm of skills. Not the team MCP registry.

**Emphasize:** "Workflows from people doing the work" / "where they publish how they work."

**Target first:** UX/product/science practitioners on X who already share agent setups in threads.

**Avoid competing on:** CLI installs, enterprise team permissions, MCP registries, skill security scanning.

## 12–18 month risks

- **skills.sh adds social profiles or workflow posts** — monitor Vercel roadmap
- **Sharebench goes public-discovery-first** — they'd need field taxonomy + follow graph
- **Platform vendors ship native sharing** (Cursor community tab, Claude shared skills) — Onie must be cross-platform and cross-discipline
- **Supply cold start** — without weekly publishing, Onie is an empty feed; outreach track is load-bearing
