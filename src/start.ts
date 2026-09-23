import { createCsrfMiddleware, createMiddleware, createStart } from '@tanstack/react-start'
import { canonicalAppResponse, stagingAccessResponse } from '#/lib/staging-access'
import { bankReturnHandoffResponse } from '#/lib/native-bank-return'

const canonicalApp = createMiddleware().server(async ({ next, request }) => {
  return (await canonicalAppResponse(request)) || next()
})

const bankReturnHandoff = createMiddleware().server(async ({ next, request }) => {
  return bankReturnHandoffResponse(request) || next()
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
  requestMiddleware: [canonicalApp, bankReturnHandoff, stagingAccess, csrfProtection],
}))
