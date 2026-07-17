import { createMiddleware, createStart } from '@tanstack/react-start'
import { canonicalAppRedirect, stagingAccessResponse } from '#/lib/staging-access'

const canonicalApp = createMiddleware().server(async ({ next, request }) => {
  return canonicalAppRedirect(request) || next()
})

const stagingAccess = createMiddleware().server(async ({ next, request }) => {
  const denied = stagingAccessResponse(request, {
    username: process.env.STAGING_ACCESS_USERNAME,
    password: process.env.STAGING_ACCESS_PASSWORD,
  })
  return denied || next()
})

export const startInstance = createStart(() => ({
  requestMiddleware: [canonicalApp, stagingAccess],
}))
