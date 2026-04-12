import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

const prismaOptions = {
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
}

// Only override datasources if the URL is actually present.
// This prevents Prisma from throwing a validation error during build time
// (e.g., when collecting page data for layouts or static pages).
if (process.env.DATABASE_URL) {
  prismaOptions.datasources = {
    db: {
      url: process.env.DATABASE_URL,
    },
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
                  err?.message?.includes("Can't reach database")
                if (isConnErr && attempt < 2) {
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

export default new Proxy(prisma, handler)
