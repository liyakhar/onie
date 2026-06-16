import { prisma } from '#/db.server'
import { getAllBlogPosts } from '#/lib/blog'
import { absoluteUrl } from '#/lib/site'

export type SitemapEntry = {
  path: string
  lastModified: Date
  priority: number
}

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const now = new Date()

  const staticRoutes: SitemapEntry[] = [
    { path: '/', lastModified: now, priority: 1 },
    { path: '/about', lastModified: now, priority: 0.8 },
    { path: '/blog', lastModified: now, priority: 0.9 },
    { path: '/app/explore', lastModified: now, priority: 0.9 },
  ]

  const [posts, profiles] = await Promise.all([
    prisma.post.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.profile.findMany({
      select: { username: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  const postEntries: SitemapEntry[] = posts.map((post) => ({
    path: `/p/${post.id}`,
    lastModified: post.updatedAt,
    priority: 0.7,
  }))

  const profileEntries: SitemapEntry[] = profiles.map((profile) => ({
    path: `/u/${profile.username}`,
    lastModified: profile.updatedAt,
    priority: 0.6,
  }))

  const blogEntries: SitemapEntry[] = getAllBlogPosts().map((post) => ({
    path: `/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    priority: 0.85,
  }))

  return [...staticRoutes, ...blogEntries, ...postEntries, ...profileEntries]
}

export function buildSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${absoluteUrl(entry.path)}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

export function buildRobotsTxt(): string {
  const sitemap = absoluteUrl('/sitemap.xml')
  return `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Allow: /blog
Allow: /p/
Allow: /u/
Allow: /app/explore
Disallow: /app/
Disallow: /login
Disallow: /settings
Disallow: /new
Disallow: /demo/
Disallow: /api/

Sitemap: ${sitemap}
`
}
