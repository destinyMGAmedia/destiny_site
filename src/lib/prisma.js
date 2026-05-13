import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Always cache — prevents multiple PrismaClient instances in both dev hot-reload and prod serverless workers
globalForPrisma.prisma = prisma

export default prisma

