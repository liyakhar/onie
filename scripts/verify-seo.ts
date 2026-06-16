#!/usr/bin/env tsx
/**
 * Pre-deploy SEO gate — static assets, env, blog registry, optional live checks.
 *
 * Usage:
 *   pnpm seo:verify
 *   pnpm seo:verify -- --production        # fail on warnings (CI / pre-release)
 *   BASE_URL=https://example.com pnpm seo:verify -- --fetch
 */
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAllBlogPosts } from '../src/lib/blog.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const REQUIRED_FILES = [
  'public/og/default.png',
  'public/apple-touch-icon.png',
  'public/manifest.json',
  'public/onie-logo.svg',
  'src/routes/sitemap[.]xml.ts',
  'src/routes/robots[.]txt.ts',
  'src/lib/site.ts',
  'src/lib/seo.ts',
  'src/server/seo.server.ts',
  'keywords.csv',
  'references/used-keywords.md',
]

const errors: string[] = []
const warnings: string[] = []

function fail(message: string) {
  errors.push(message)
}

function warn(message: string) {
  warnings.push(message)
}

async function exists(rel: string): Promise<boolean> {
  try {
    await access(path.join(ROOT, rel))
    return true
  } catch {
    return false
  }
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

async function checkStaticAssets() {
  for (const file of REQUIRED_FILES) {
    if (!(await exists(file))) {
      fail(`Missing required file: ${file}`)
    }
  }

  const seoSource = await readFile(path.join(ROOT, 'src/lib/seo.ts'), 'utf8')
  if (!seoSource.includes("href: '/apple-touch-icon.png'")) {
    fail('src/lib/seo.ts defaultHeadLinks must reference /apple-touch-icon.png')
  }

  const manifest = JSON.parse(
    await readFile(path.join(ROOT, 'public/manifest.json'), 'utf8'),
  ) as { icons?: Array<{ src?: string }> }
  if (!manifest.icons?.some((icon) => icon.src === '/apple-touch-icon.png')) {
    fail('public/manifest.json must include /apple-touch-icon.png icon')
  }
}

async function checkEnv(strictProduction: boolean) {
  const siteUrl = process.env.SITE_URL?.trim() ?? ''
  const authUrl = process.env.BETTER_AUTH_URL?.trim() ?? ''
  const gsc = process.env.GOOGLE_SITE_VERIFICATION?.trim() ?? ''

  if (!siteUrl) {
    if (strictProduction) fail('SITE_URL is not set')
    else warn('SITE_URL is not set — canonicals and sitemap will fall back to localhost')
  } else if (!isValidUrl(siteUrl)) {
    fail(`SITE_URL is not a valid URL: ${siteUrl}`)
  } else if (strictProduction) {
    const parsed = new URL(siteUrl)
    if (parsed.protocol !== 'https:') {
      fail('SITE_URL must use https in production')
    }
    if (/localhost|127\.0\.0\.1/.test(parsed.hostname)) {
      fail('SITE_URL must not point at localhost in production')
    }
  }

  if (authUrl && siteUrl && authUrl.replace(/\/$/, '') !== siteUrl.replace(/\/$/, '')) {
    warn('SITE_URL and BETTER_AUTH_URL differ — OAuth redirects and SEO URLs may disagree')
  }

  if (strictProduction && !gsc) {
    warn('GOOGLE_SITE_VERIFICATION is not set — add before submitting to Search Console')
  }

  if (gsc && !(await exists(`public/google${gsc}.html`))) {
    warn('GSC HTML file missing — run pnpm seo:gsc after setting GOOGLE_SITE_VERIFICATION')
  }
}

async function checkBlogRegistry() {
  const posts = getAllBlogPosts()

  if (posts.length === 0) {
    fail('No blog posts registered in src/lib/blog.ts')
  }

  const slugs = new Set<string>()
  const keywords = new Set<string>()

  for (const post of posts) {
    if (!post.slug?.trim()) fail(`Blog post missing slug: ${post.title ?? '(untitled)'}`)
    if (!post.title?.trim()) fail(`Blog post missing title: ${post.slug}`)
    if (!post.description?.trim()) warn(`Blog post missing description: ${post.slug}`)
    if (!post.body?.trim()) fail(`Blog post missing body: ${post.slug}`)

    if (slugs.has(post.slug)) fail(`Duplicate blog slug: ${post.slug}`)
    slugs.add(post.slug)

    const keyword = post.primaryKeyword?.trim().toLowerCase()
    if (!keyword) {
      warn(`Blog post missing primaryKeyword: ${post.slug}`)
    } else if (keywords.has(keyword)) {
      fail(`Duplicate blog primaryKeyword: ${keyword}`)
    } else {
      keywords.add(keyword)
    }
  }
}

async function checkLive(baseUrl: string) {
  const normalized = baseUrl.replace(/\/$/, '')
  const paths = ['/', '/robots.txt', '/sitemap.xml', '/blog']

  for (const route of paths) {
    const url = `${normalized}${route}`
    try {
      const res = await fetch(url, { redirect: 'follow' })
      if (!res.ok) fail(`Live check failed (${res.status}): ${url}`)
    } catch (cause) {
      fail(`Live check unreachable: ${url} (${cause instanceof Error ? cause.message : cause})`)
    }
  }

  const robots = await fetch(`${normalized}/robots.txt`).then((r) => r.text())
  if (!robots.includes('Sitemap:')) {
    fail('robots.txt is missing a Sitemap directive')
  }

  const sitemap = await fetch(`${normalized}/sitemap.xml`).then((r) => r.text())
  if (!sitemap.includes('<urlset')) {
    fail('sitemap.xml is not valid XML urlset')
  }
  if (!sitemap.includes('/blog')) {
    warn('sitemap.xml does not list /blog')
  }

  const home = await fetch(`${normalized}/`).then((r) => r.text())
  if (!home.includes('rel="canonical"') && !home.includes("rel='canonical'")) {
    warn('Home HTML has no canonical link — check SSR head output')
  }
  if (!home.includes('/apple-touch-icon.png')) {
    fail('Home HTML does not reference /apple-touch-icon.png')
  }
}

async function main() {
  const args = process.argv.slice(2)
  const strictProduction = args.includes('--production')
  const fetchLive = args.includes('--fetch') || Boolean(process.env.BASE_URL?.trim())

  console.log('\nOnie SEO verify\n')

  await checkStaticAssets()
  await checkEnv(strictProduction)
  await checkBlogRegistry()

  if (fetchLive) {
    const baseUrl = process.env.BASE_URL?.trim() || 'http://localhost:4173'
    console.log(`Live checks against ${baseUrl}…`)
    await checkLive(baseUrl)
  } else {
    console.log('Skipping live checks (set BASE_URL or pass --fetch after preview is up)')
  }

  if (warnings.length > 0) {
    console.log('\nWarnings:')
    for (const message of warnings) console.log(`  ⚠ ${message}`)
  }

  if (errors.length > 0) {
    console.log('\nErrors:')
    for (const message of errors) console.log(`  ✗ ${message}`)
    process.exitCode = 1
    return
  }

  if (strictProduction && warnings.length > 0) {
    console.log('\n✗ Failed (--production treats warnings as errors)')
    process.exitCode = 1
    return
  }

  console.log('\n✓ SEO checks passed')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
