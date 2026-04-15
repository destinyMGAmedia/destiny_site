// src/lib/prisma.js
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const options = {
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
  }

  // Safely add connection parameters only if DATABASE_URL exists
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL)

      // Set safe connection limits
      if (!url.searchParams.has('connection_limit')) {
        const limit = process.env.NODE_ENV === 'production' ? '5' : '3'
        url.searchParams.set('connection_limit', limit)
      }

      // Add timeouts to prevent hanging
      if (!url.searchParams.has('connect_timeout')) {
        url.searchParams.set('connect_timeout', '30')
      }
      if (!url.searchParams.has('pool_timeout')) {
        url.searchParams.set('pool_timeout', '30')
      }

      options.datasources = {
        db: {
          url: url.toString(),
        },
      }

      console.log(`[PRISMA_INIT] Environment: ${process.env.NODE_ENV}. Pool limit: ${url.searchParams.get('connection_limit')}`)
    } catch (e) {
      console.warn('[PRISMA_INIT] Failed to parse DATABASE_URL:', e.message)
    }
  }

  return new PrismaClient(options)
}

// Simple singleton without 'declare global' to avoid ESLint parsing error
let prisma

if (process.env.NODE_ENV === 'production') {
  prisma = prismaClientSingleton()
} else {
  if (!globalThis.prisma) {
    globalThis.prisma = prismaClientSingleton()
  }
  prisma = globalThis.prisma
}

export default prisma