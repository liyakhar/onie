import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { getRequest } from '@tanstack/react-start/server'
import { getPrisma } from '#/db.server'

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24)
}

async function uniqueUsername(base: string) {
  const prisma = getPrisma()
  let username = slugify(base) || 'agent'
  let attempt = 0

  while (true) {
    const candidate = attempt === 0 ? username : `${username}-${attempt}`
    const existing = await prisma.profile.findUnique({
      where: { username: candidate },
    })
    if (!existing) return candidate
    attempt += 1
  }
}

type Auth = ReturnType<typeof createAuth>

const requestAuth = new WeakMap<Request, Auth>()
let fallbackAuth: Auth | undefined

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET is not set')
  }

  const trustedOrigins =
    process.env.NODE_ENV === 'development'
      ? [
          'http://localhost:*',
          'http://127.0.0.1:*',
        ]
      : undefined

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins,
    secret,
    database: prismaAdapter(getPrisma(), {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url }) => {
        if (process.env.NODE_ENV === 'development') {
          console.info(`[wollie] Password reset for ${user.email}: ${url}`)
        }
      },
    },
    socialProviders: {
      ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            },
          }
        : {}),
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            const prisma = getPrisma()
            const base = user.name || user.email.split('@')[0]
            const username = await uniqueUsername(base)
            await prisma.profile.create({
              data: {
                userId: user.id,
                username,
                field: 'FINANCE',
                onboarded: true,
              },
            })
          },
        },
      },
    },
    plugins: [tanstackStartCookies()],
  })
}

export function getAuth() {
  try {
    const request = getRequest()
    const cached = requestAuth.get(request)
    if (cached) return cached

    const instance = createAuth()
    requestAuth.set(request, instance)
    return instance
  } catch {
    if (!fallbackAuth) {
      fallbackAuth = createAuth()
    }
    return fallbackAuth
  }
}

export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    return Reflect.get(getAuth(), prop, receiver)
  },
})
