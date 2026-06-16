import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import {
  buildPageMeta,
  defaultHeadLinks,
  googleSiteVerificationMeta,
  jsonLdScript,
  organizationJsonLd,
} from '#/lib/seo'

interface MyRouterContext {
  queryClient: QueryClient
}

const rootMeta = buildPageMeta({ path: '/' })

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#1a1a18' },
      ...googleSiteVerificationMeta(),
      ...rootMeta.meta,
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      ...defaultHeadLinks(),
    ],
    scripts: [jsonLdScript(organizationJsonLd())],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="press" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased [overflow-wrap:anywhere]">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        {import.meta.env.DEV ? (
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        ) : null}
        <Scripts />
      </body>
    </html>
  )
}
