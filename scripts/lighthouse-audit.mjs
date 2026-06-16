#!/usr/bin/env node
/**
 * Run Lighthouse on key SEO pages against the production build.
 * Starts vite preview if BASE_URL is not set.
 */
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { setTimeout as sleep } from 'node:timers/promises'

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'explore', path: '/app/explore' },
  { name: 'blog', path: '/blog' },
]

const PORT = process.env.LIGHTHOUSE_PORT || '4173'
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`
const OUT_DIR = new URL('../.lighthouse', import.meta.url).pathname

function auditEnv() {
  return {
    ...process.env,
    NODE_ENV: 'production',
    SITE_URL: BASE_URL,
    VITE_SITE_URL: BASE_URL,
    BETTER_AUTH_URL: BASE_URL,
  }
}

let previewProc

async function waitForServer(url, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { redirect: 'follow' })
      if (res.ok || res.status === 404) return true
    } catch {
      // retry
    }
    await sleep(500)
  }
  return false
}

async function startPreview() {
  if (process.env.BASE_URL) return

  previewProc = spawn(
    'pnpm',
    ['exec', 'vite', 'preview', '--port', PORT, '--strictPort'],
    {
      cwd: new URL('..', import.meta.url).pathname,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: auditEnv(),
    },
  )

  const ready = await waitForServer(`${BASE_URL}/`)
  if (!ready) {
    previewProc.kill()
    throw new Error(`Preview server did not start on ${BASE_URL}`)
  }
}

async function resolvePostPath() {
  try {
    const res = await fetch(`${BASE_URL}/sitemap.xml`)
    const xml = await res.text()
    const match = xml.match(/<loc>[^<]*\/p\/([^<]+)<\/loc>/)
    return match ? `/p/${match[1]}` : null
  } catch {
    return null
  }
}

function runLighthouse(url, outPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '--yes',
      'lighthouse',
      url,
      '--quiet',
      '--chrome-flags=--headless --no-sandbox --disable-gpu',
      '--only-categories=performance,accessibility,best-practices,seo',
      '--output=json',
      `--output-path=${outPath}`,
      '--preset=desktop',
    ]

    const child = spawn('npx', args, { stdio: 'inherit' })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Lighthouse failed for ${url} (exit ${code})`))
    })
  })
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  if (!process.env.BASE_URL) {
    console.log('Building production bundle…')
    await new Promise((resolve, reject) => {
      const build = spawn('pnpm', ['run', 'build'], {
        cwd: new URL('..', import.meta.url).pathname,
        stdio: 'inherit',
        env: auditEnv(),
      })
      build.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`build failed (${code})`))))
    })
  }

  await startPreview()

  const postPath = await resolvePostPath()
  const targets = [...PAGES]
  if (postPath) targets.push({ name: 'post', path: postPath })

  const summary = []

  for (const { name, path } of targets) {
    const url = `${BASE_URL}${path}`
    const outPath = `${OUT_DIR}/${name}.json`
    console.log(`\n▶ Lighthouse ${name}: ${url}`)
    await runLighthouse(url, outPath)
    const report = JSON.parse(await (await import('node:fs/promises')).readFile(outPath, 'utf8'))
    const scores = Object.fromEntries(
      report.categories &&
        Object.entries(report.categories).map(([key, cat]) => [key, Math.round(cat.score * 100)]),
    )
    summary.push({ name, url, scores })
    console.log(`  performance=${scores.performance} accessibility=${scores.accessibility} best-practices=${scores['best-practices']} seo=${scores.seo}`)
  }

  await writeFile(`${OUT_DIR}/summary.json`, JSON.stringify(summary, null, 2))
  console.log(`\n✓ Reports saved to .lighthouse/`)

  if (previewProc) previewProc.kill()

  const failing = summary.filter((row) =>
    Object.values(row.scores).some((score) => score < 90),
  )
  if (failing.length > 0) {
    console.warn('\n⚠ Some scores are below 90 — see .lighthouse/summary.json')
    process.exitCode = 1
  }
}

main().catch((err) => {
  if (previewProc) previewProc.kill()
  console.error(err)
  process.exit(1)
})
