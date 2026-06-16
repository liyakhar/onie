import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { prisma } from '#/db.server'

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24)
}

async function uniqueUsername(base: string) {
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

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      if (process.env.NODE_ENV === 'development') {
        console.info(`[onie] Password reset for ${user.email}: ${url}`)
      }
      // Production: plug in your email provider here (Resend, Postmark, etc.)
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
          const base = user.name || user.email.split('@')[0]
          const username = await uniqueUsername(base)
          await prisma.profile.create({
            data: {
              userId: user.id,
              username,
              field: 'OTHER',
              onboarded: false,
            },
          })
        },
      },
    },
  },
  plugins: [tanstackStartCookies()],
})
