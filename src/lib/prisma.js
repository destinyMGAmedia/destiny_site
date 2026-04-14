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

let prisma = globalForPrisma.prisma

// If cached prisma is missing new models, recreate it
if (prisma && (!prisma.serviceData || !prisma.growthStage || !prisma.visitor)) {
  // We don't await because it's top-level, but we trigger the disconnect
  prisma.$disconnect().catch(() => {})
  prisma = undefined
}

if (!prisma) {
  const finalOptions = { ...prismaOptions }
  
  // For development with HMR, use a very small connection pool to avoid "too many connections"
  if (process.env.NODE_ENV !== 'production' && finalOptions.datasources?.db?.url) {
    const url = new URL(finalOptions.datasources.db.url)
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', '3')
      finalOptions.datasources.db.url = url.toString()
    }
  }

  prisma = new PrismaClient(finalOptions)
}

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
