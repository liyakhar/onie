#!/usr/bin/env node

import process from 'node:process'

const PRODUCTION_PROJECT = 'wollie'
const KNOWN_PRODUCTION_HYPERDRIVE_ID = 'fdf126ff544b473c87540b89bacedca7'
const failures = []
const warnings = []

function value(key) {
  return process.env[key]?.trim() ?? ''
}

function requireValue(key) {
  if (!value(key)) failures.push(`${key} is missing`)
}

for (const key of [
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'SITE_URL',
  'STAGING_ACCESS_PASSWORD',
  'CLOUDFLARE_PAGES_PROJECT',
  'CLOUDFLARE_HYPERDRIVE_ID',
]) {
  requireValue(key)
}

if (value('CLOUDFLARE_PAGES_PROJECT') === PRODUCTION_PROJECT) {
  failures.push('CLOUDFLARE_PAGES_PROJECT must be a separate staging project, never "wollie"')
}
if (value('CLOUDFLARE_HYPERDRIVE_ID') === KNOWN_PRODUCTION_HYPERDRIVE_ID) {
  failures.push('CLOUDFLARE_HYPERDRIVE_ID is the known production database binding')
}
if (/localhost|127\.0\.0\.1/.test(value('DATABASE_URL'))) {
  failures.push('DATABASE_URL must be a separate remotely reachable staging database')
}
if (value('BETTER_AUTH_SECRET').length < 32) {
  failures.push('BETTER_AUTH_SECRET must be at least 32 characters')
}
if (value('STAGING_ACCESS_PASSWORD').length < 20) {
  failures.push('STAGING_ACCESS_PASSWORD must be at least 20 characters')
}

for (const key of ['BETTER_AUTH_URL', 'SITE_URL', 'ENABLE_BANKING_REDIRECT_URL']) {
  const current = value(key)
  if (!current && key === 'ENABLE_BANKING_REDIRECT_URL') continue
  try {
    if (new URL(current).protocol !== 'https:') failures.push(`${key} must use https on staging`)
  } catch {
    failures.push(`${key} must be a valid URL`)
  }
}

const stripeKey = value('STRIPE_SECRET_KEY')
if (stripeKey && !stripeKey.startsWith('sk_test_')) {
  failures.push('STRIPE_SECRET_KEY must be a Stripe test-mode key or remain unset')
}
if (value('STRIPE_WEBHOOK_SECRET') && !value('STRIPE_WEBHOOK_SECRET').startsWith('whsec_')) {
  failures.push('STRIPE_WEBHOOK_SECRET must be a Stripe webhook signing secret')
}
if (value('ENABLE_BANKING_ENVIRONMENT') !== 'sandbox') {
  failures.push('ENABLE_BANKING_ENVIRONMENT must be sandbox')
}
if (value('ENABLE_BANKING_PUBLIC_ACCESS_APPROVED') === 'true') {
  failures.push('ENABLE_BANKING_PUBLIC_ACCESS_APPROVED must remain false on pre-company staging')
}
if (value('LEGAL_LAUNCH_FACTS_CONFIRMED') === 'true') {
  failures.push('LEGAL_LAUNCH_FACTS_CONFIRMED must remain false before the operator exists')
}
if (value('TAX_LAUNCH_POSITION_CONFIRMED') === 'true') {
  failures.push('TAX_LAUNCH_POSITION_CONFIRMED must remain false before accountant confirmation')
}
if (!stripeKey) warnings.push('Stripe is not configured; only offline webhook simulations can run')
if (!value('RESEND_API_KEY')) warnings.push('Resend is not configured; real account emails cannot be verified')

console.log('Wollie private staging preflight')
if (warnings.length) {
  console.log('\nWarnings:')
  for (const warning of warnings) console.log(`- ${warning}`)
}
if (failures.length) {
  console.log('\nFailures:')
  for (const failure of failures) console.log(`- ${failure}`)
  process.exit(1)
}
console.log('\nPreflight passed: staging remains private, isolated, and test-only.')
