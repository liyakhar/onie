#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import process from 'node:process'

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  })
  if (result.status !== 0) process.exit(result.status || 1)
}

run(process.execPath, ['scripts/preflight-staging.mjs'])
run('pnpm', ['build:cf'])
run('npx', [
  'wrangler',
  'pages',
  'deploy',
  'dist',
  `--project-name=${process.env.CLOUDFLARE_PAGES_PROJECT}`,
])
