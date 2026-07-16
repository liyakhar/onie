---
date: 2026-07-15
topic: shared-household-finances
---

# Shared Household Finances

## What We're Building

Wollie will let two separately authenticated people share one household budget. An owner invites a partner, the partner accepts while signed in, and both can see the same household data without sharing credentials. Accounts are classified as mine, partner's, or joint; joint accounts carry explicit ownership percentages. The dashboard can switch between personal and household views and explains how each safe-to-spend number is derived.

The first release also makes trust visible: every account shows freshness and connection health, and imported transactions remain idempotent. The broader research backlog—weekly reviews, sinking funds, full restore, a public coverage checker, and a public status page—stays outside this slice.

## Why This Approach

Separate logins are the smallest version that is genuinely shared. A single user pretending to manage two people would not solve collaboration, privacy, or account ownership. The existing `BudgetWorkspace` remains the household boundary, while a membership relation grants access and preserves the current owner for compatibility.

## Key Decisions

- Membership: one owner and initially one partner per live household workspace.
- Invitations: email-addressed, single-use, expiring invitation links sent through Wollie's existing account-email service and also exposed as a copyable in-app link.
- Permissions: both members can manage budgets and categorization; only the owner can invite/remove a partner or change membership. A member can connect or disconnect only their own bank connection.
- Ownership: each account is personal or joint. Personal accounts belong 100% to one member; joint accounts store member percentages totaling 100%.
- Views: household totals use 100% of every account; personal totals use the signed-in member's ownership percentage.
- Safe-to-spend: personal and household values use the same existing calculation, with a visible breakdown of income, spending, budgets, recurring bills, and unresolved data.
- Trust: account freshness and connection state are visible; provider transaction identifiers continue to enforce idempotent imports.
- Migration: existing workspaces receive an owner membership and existing accounts become 100% owner-held.

## Open Questions

- More than two household members and granular read-only roles are future extensions, not MVP requirements.

## Next Steps

Create and execute a deep implementation plan covering migration safety, membership authorization, household calculations, invitation acceptance, responsive UI, tests, and rollout checks.
