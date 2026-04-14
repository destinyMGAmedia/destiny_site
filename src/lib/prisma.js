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
  try {
    prisma.$disconnect().catch(() => {})
  } catch (_) {}
  prisma = undefined
}

if (!prisma) {
  const finalOptions = { ...prismaOptions }
  
  // Apply a safe connection pool limit for all environments if not present.
  // This is especially important for Vercel/Aiven combinations to avoid
  // "too many connections" FATAL errors.
  if (finalOptions.datasources?.db?.url) {
    try {
      const url = new URL(finalOptions.datasources.db.url)
      if (!url.searchParams.has('connection_limit')) {
        // Default to 3 for dev, 5 for production to stay safe on free database tiers
        const limit = process.env.NODE_ENV === 'production' ? '5' : '3'
        url.searchParams.set('connection_limit', limit)
        finalOptions.datasources.db.url = url.toString()
      }
      console.log(`[PRISMA_INIT] Environment: ${process.env.NODE_ENV}. Pool limit: ${url.searchParams.get('connection_limit')}`)
    } catch (e) {
      console.warn('[PRISMA_INIT] Failed to parse DATABASE_URL to add connection_limit', e)
    }
  } else {
    console.warn('[PRISMA_INIT] DATABASE_URL is missing in constructor options.')
  }

  try {
    prisma = new PrismaClient(finalOptions)
    console.log('[PRISMA_INIT] PrismaClient successfully instantiated.')
  } catch (err) {
    console.error('[PRISMA_FATAL] Failed to instantiate PrismaClient:', err)
    // Create a dummy client to avoid Proxy crash, but it will fail on query
    prisma = { $connect: async () => {}, $disconnect: async () => {} }
  }
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Auto-reconnect proxy — wraps every model operation
// Aiven free tier connections can drop; this retries up to 3 times
const handler = {
  get(target, prop) {
    if (!target) return undefined
    const value = target[prop]
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // It's a model delegate (e.g. prisma.user, prisma.assembly)
      return new Proxy(value, {
        get(modelTarget, methodName) {
          const method = modelTarget[modelTarget.hasOwnProperty(methodName) ? methodName : methodName] // proxy stability
          if (typeof method !== 'function') {
            // Check if it's a property (e.g. name of the model)
            const val = modelTarget[methodName]
            if (typeof val === 'function') return val.bind(modelTarget)
            return val
          }
          return async (...args) => {
            let lastErr
            for (let attempt = 0; attempt < 3; attempt++) {
              try {
                return await method.apply(modelTarget, args)
              } catch (err) {
                lastErr = err
                const isConnErr =
                  err?.code === 'P1001' ||
                  err?.code === 'P1008' ||
                  err?.message?.includes('ECONNREFUSED') ||
                  err?.message?.includes('Can\'t reach database') ||
                  err?.message?.includes('Too many database connections')
                
                if (isConnErr && attempt < 2) {
                  await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
                  try { if (target.$connect) await target.$connect() } catch (_) {}
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
