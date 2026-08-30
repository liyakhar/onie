import { createCsrfMiddleware, createMiddleware, createStart } from '@tanstack/react-start'
import { canonicalAppResponse, stagingAccessResponse } from '#/lib/staging-access'

const canonicalApp = createMiddleware().server(async ({ next, request }) => {
  return (await canonicalAppResponse(request)) || next()
})

const stagingAccess = createMiddleware().server(async ({ next, request }) => {
  const denied = stagingAccessResponse(request, {
    username: process.env.STAGING_ACCESS_USERNAME,
    password: process.env.STAGING_ACCESS_PASSWORD,
  })
  return denied || next()
})

// A custom request-middleware list disables Start's implicit default, so server
// functions need explicit same-origin protection.
const csrfProtection = createCsrfMiddleware({
  filter: (context) => context.handlerType === 'serverFn',
})

export const startInstance = createStart(() => ({
  requestMiddleware: [canonicalApp, stagingAccess, csrfProtection],
}))
