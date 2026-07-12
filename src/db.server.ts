import { PrismaClient } from './generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { getRequest } from '@tanstack/react-start/server'

declare global {
  var __prisma: PrismaClient | undefined
}

type CloudflareRequest = Request & {
  runtime?: {
    cloudflare?: {
      env?: {
        HYPERDRIVE?: {
          connectionString: string
        }
      }
    }
  }
}

const requestPrisma = new WeakMap<Request, PrismaClient>()

function getConnectionString() {
  try {
    const req = getRequest() as CloudflareRequest
    const hyperdrive = req.runtime?.cloudflare?.env?.HYPERDRIVE
    if (hyperdrive?.connectionString) {
      return hyperdrive.connectionString
    }
  } catch {
    // Outside a request (seed scripts, etc.)
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }

  return connectionString
}

function createPrisma() {
  const adapter = new PrismaPg({ connectionString: getConnectionString() })
  return new PrismaClient({ adapter })
}

export function getPrisma() {
  try {
    const req = getRequest()
    const cached = requestPrisma.get(req)
    if (cached) return cached

    const client = createPrisma()
    requestPrisma.set(req, client)
    return client
  } catch {
    if (!globalThis.__prisma) {
      globalThis.__prisma = createPrisma()
    }
    return globalThis.__prisma
  }
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getPrisma(), prop, receiver)
  },
})
