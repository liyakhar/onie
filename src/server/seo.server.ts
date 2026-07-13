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
  ]

  return staticRoutes
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
Disallow: /app/
Disallow: /blog
Disallow: /p/
Disallow: /u/
Disallow: /login
Disallow: /settings
Disallow: /new
Disallow: /demo/
Disallow: /api/

Sitemap: ${sitemap}
`
}
