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
} else if (process.env.NODE_ENV === 'production') {
  // In production, DATABASE_URL should always be set
  console.warn('[PRISMA_WARN] DATABASE_URL not found in production environment')
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
      
      // Add connection timeout for Vercel deployments - reduce from 60 to 30 seconds
      if (!url.searchParams.has('connect_timeout')) {
        url.searchParams.set('connect_timeout', '30')
      }
      
      // Add pool timeout to prevent hanging connections
      if (!url.searchParams.has('pool_timeout')) {
        url.searchParams.set('pool_timeout', '30')
      }
      
      finalOptions.datasources.db.url = url.toString()
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
    prisma = { 
      $connect: async () => { throw new Error('Database connection unavailable') }, 
      $disconnect: async () => {},
      // Add stubs for common model operations to prevent crashes
      assembly: { findUnique: async () => null, findMany: async () => [] },
      user: { findUnique: async () => null, findMany: async () => [] },
      heroSlide: { findMany: async () => [] },
      youtubeChannel: { findUnique: async () => null },
      event: { findMany: async () => [] },
      devotional: { findFirst: async () => null },
      game: { findFirst: async () => null }
    }
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
                  err?.code === 'P1017' ||
                  err?.message?.includes('ECONNREFUSED') ||
                  err?.message?.includes('Can\'t reach database') ||
                  err?.message?.includes('Too many database connections') ||
                  err?.message?.includes('Connection terminated') ||
                  err?.message?.includes('Connection is closed')
                
                if (isConnErr && attempt < 2) {
                  const backoff = Math.min(1000 * Math.pow(2, attempt), 5000)
                  await new Promise(r => setTimeout(r, backoff))
                  try { 
                    if (target.$connect) {
                      await target.$disconnect().catch(() => {})
                      await target.$connect()
                    }
                  } catch (_) {}
                  continue
                }
                
                console.error(`[PRISMA_ERROR] Method ${methodName} failed after ${attempt + 1} attempts:`, err)
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

const prismaWithProxy = new Proxy(prisma, handler)
export default prismaWithProxy
