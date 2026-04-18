import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

const prismaOptions = {
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
}

// Only override datasources if the URL is actually present.
// This prevents Prisma from throwing a validation error during build time
// (e.g., when collecting page data for layouts or static pages).
if (process.env.DATABASE_URL) {
<<<<<<< HEAD
  try {
    const url = new URL(process.env.DATABASE_URL)

    // Set safe connection limits to prevent "too many connections"
    if (!url.searchParams.has('connection_limit')) {
      const limit = process.env.NODE_ENV === 'production' ? '5' : '3'
      url.searchParams.set('connection_limit', limit)
    }

    // Add timeouts to prevent hanging connections
    if (!url.searchParams.has('connect_timeout')) {
      url.searchParams.set('connect_timeout', '30')
    }
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', '30')
    }

    prismaOptions.datasources = {
      db: {
        url: url.toString(),
      },
    }

    console.log(`[PRISMA_INIT] Environment: ${process.env.NODE_ENV}. Pool limit: ${url.searchParams.get('connection_limit')}`)
  } catch (e) {
    console.warn('[PRISMA_INIT] Failed to parse DATABASE_URL:', e.message)
    // Fallback to original URL if parsing fails
    prismaOptions.datasources = {
      db: {
        url: process.env.DATABASE_URL,
      },
    }
=======
  prismaOptions.datasources = {
    db: {
      url: process.env.DATABASE_URL,
    },
>>>>>>> origin/main
  }
}

const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Auto-reconnect proxy — wraps every model operation
// Aiven free tier connections can drop; this retries up to 3 times
const handler = {
  get(target, prop) {
    const value = target[prop]
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // It's a model delegate (e.g. prisma.user, prisma.assembly)
      return new Proxy(value, {
        get(modelTarget, methodName) {
          const method = modelTarget[methodName]
          if (typeof method !== 'function') return method
          return async (...args) => {
            let lastErr
            for (let attempt = 0; attempt < 3; attempt++) {
              try {
                return await method.apply(modelTarget, args)
              } catch (err) {
                lastErr = err
                const isConnErr =
                  err?.code === 'P1001' ||
                  err?.message?.includes('ECONNREFUSED') ||
<<<<<<< HEAD
                  err?.message?.includes("Can't reach database") ||
                  err?.message?.includes('too many clients') ||
                  err?.message?.includes('remaining connection slots')
                if (isConnErr && attempt < 2) {
                  console.warn(`[PRISMA_RETRY] Connection failed (attempt ${attempt + 1}/3):`, err.message)
=======
                  err?.message?.includes("Can't reach database")
                if (isConnErr && attempt < 2) {
>>>>>>> origin/main
                  await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
                  try { await target.$connect() } catch (_) {}
                  continue
                }
                throw err
              }
            }
            throw lastErr
          }
        },
      })
    }
    // For $transaction, $connect, $disconnect etc.
    if (typeof value === 'function') return value.bind(target)
    return value
  },
}

<<<<<<< HEAD
export default new Proxy(prisma, handler)
=======
export default new Proxy(prisma, handler)
>>>>>>> origin/main
