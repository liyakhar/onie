import { createFileRoute } from '@tanstack/react-router'
import { buildRobotsTxt } from '#/server/seo.server'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () => {
        return new Response(buildRobotsTxt(), {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
          },
        })
      },
    },
  },
})
