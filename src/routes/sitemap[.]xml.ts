import { createFileRoute } from '@tanstack/react-router'
import { buildSitemapXml, getSitemapEntries } from '#/server/seo.server'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const entries = await getSitemapEntries()
        const xml = buildSitemapXml(entries)
        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
