#!/usr/bin/env node

import fs from 'node:fs'
import process from 'node:process'

const requiredEnv = [
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'SITE_URL',
]

const optionalEnv = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'ENABLE_LIVE_BANK_SYNC',
  'BANK_SYNC_ENCRYPTION_KEY',
  'SIMPLEFIN_ACCESS_URL',
  'ENABLE_BANKING_APPLICATION_ID',
  'ENABLE_BANKING_PRIVATE_KEY',
  'ENABLE_BANKING_REDIRECT_URL',
]

const failures = []
const warnings = []

function value(key) {
  return process.env[key]?.trim() ?? ''
}

function assertPresent(key) {
  if (!value(key)) {
    failures.push(`${key} is missing`)
  }
}

function assertNotPlaceholder(key, placeholders) {
  const current = value(key)
  if (!current) return
  if (placeholders.some((placeholder) => current.includes(placeholder))) {
    failures.push(`${key} still looks like a local/demo placeholder`)
  }
}

function assertHttpsUrl(key) {
  const current = value(key)
  if (!current) return

  try {
    const parsed = new URL(current)
    if (parsed.protocol !== 'https:') {
      failures.push(`${key} must use https in production`)
    }
  } catch {
    failures.push(`${key} is not a valid URL`)
  }
}

for (const key of requiredEnv) {
  assertPresent(key)
}

assertNotPlaceholder('DATABASE_URL', ['localhost', 'postgres:postgres'])
assertNotPlaceholder('BETTER_AUTH_SECRET', ['change-me'])
assertNotPlaceholder('BETTER_AUTH_URL', ['localhost', '127.0.0.1'])
assertNotPlaceholder('SITE_URL', ['localhost', '127.0.0.1'])
assertHttpsUrl('BETTER_AUTH_URL')
assertHttpsUrl('SITE_URL')

if (value('BETTER_AUTH_SECRET') && value('BETTER_AUTH_SECRET').length < 32) {
  failures.push('BETTER_AUTH_SECRET should be at least 32 characters')
}

const hasGoogleClientId = Boolean(value('GOOGLE_CLIENT_ID'))
const hasGoogleClientSecret = Boolean(value('GOOGLE_CLIENT_SECRET'))
const liveBankSyncEnabled = value('ENABLE_LIVE_BANK_SYNC') === 'true'
const bankSyncEncryptionKey = value('BANK_SYNC_ENCRYPTION_KEY')
const hasSimpleFinAccessUrl = Boolean(value('SIMPLEFIN_ACCESS_URL'))
const enableBankingApplicationId = value('ENABLE_BANKING_APPLICATION_ID')
const enableBankingPrivateKey = value('ENABLE_BANKING_PRIVATE_KEY')
const enableBankingRedirectUrl = value('ENABLE_BANKING_REDIRECT_URL')

if (hasGoogleClientId !== hasGoogleClientSecret) {
  warnings.push('Google OAuth is partially configured; set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET or neither')
}

if (value('ENABLE_LIVE_BANK_SYNC') && !['true', 'false'].includes(value('ENABLE_LIVE_BANK_SYNC'))) {
  failures.push('ENABLE_LIVE_BANK_SYNC must be either true or false')
}

if (liveBankSyncEnabled && !bankSyncEncryptionKey) {
  failures.push('ENABLE_LIVE_BANK_SYNC=true requires BANK_SYNC_ENCRYPTION_KEY')
}

if (liveBankSyncEnabled && (!enableBankingApplicationId || !enableBankingPrivateKey || !enableBankingRedirectUrl)) {
  failures.push('ENABLE_LIVE_BANK_SYNC=true requires the Enable Banking application ID, private key, and redirect URL')
}

if (enableBankingRedirectUrl) {
  assertHttpsUrl('ENABLE_BANKING_REDIRECT_URL')
}

if (enableBankingPrivateKey && !enableBankingPrivateKey.includes('BEGIN PRIVATE KEY')) {
  failures.push('ENABLE_BANKING_PRIVATE_KEY must be a PKCS#8 PEM private key')
}

if (bankSyncEncryptionKey && bankSyncEncryptionKey.length < 32) {
  failures.push('BANK_SYNC_ENCRYPTION_KEY must be at least 32 characters')
}

if (!liveBankSyncEnabled) {
  warnings.push('ENABLE_LIVE_BANK_SYNC is not true; production will not connect real bank accounts')
}

if (hasSimpleFinAccessUrl) {
  failures.push('SIMPLEFIN_ACCESS_URL must not be set in production; use per-user tokens entered in the app')
}

if (process.env.SEED_LEGACY_ONIE_CONTENT === 'true') {
  failures.push('SEED_LEGACY_ONIE_CONTENT must not be true for production')
}

const migrationsDir = 'prisma/migrations'
const hasPrismaMigrations =
  fs.existsSync(migrationsDir) &&
  fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .some((entry) => entry.isDirectory())

if (!hasPrismaMigrations) {
  warnings.push('No prisma/migrations directory found; review and apply the schema change explicitly before production deploy')
}

if (!fs.existsSync('dist/_worker.js')) {
  warnings.push('dist/_worker.js is missing; run pnpm build:cf before deploying')
}

console.log('Wollie production preflight')
console.log('')
for (const key of requiredEnv) {
  console.log(`${value(key) ? '✓' : '✕'} ${key}`)
}
for (const key of optionalEnv) {
  console.log(`${value(key) ? '✓' : '○'} ${key}`)
}

if (warnings.length) {
  console.log('')
  console.log('Warnings:')
  for (const warning of warnings) {
    console.log(`- ${warning}`)
  }
}

if (failures.length) {
  console.log('')
  console.log('Failures:')
  for (const failure of failures) {
    console.log(`- ${failure}`)
  }
  process.exit(1)
}

console.log('')
console.log('Preflight passed.')
