import { createMiddleware, createStart } from '@tanstack/react-start'
import { stagingAccessResponse } from '#/lib/staging-access'

const stagingAccess = createMiddleware().server(async ({ next, request }) => {
  const denied = stagingAccessResponse(request, {
    username: process.env.STAGING_ACCESS_USERNAME,
    password: process.env.STAGING_ACCESS_PASSWORD,
  })
  return denied || next()
})

export const startInstance = createStart(() => ({
  requestMiddleware: [stagingAccess],
}))
