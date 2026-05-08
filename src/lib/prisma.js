import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

const connectionLogger = {
  log: (event) => {
    if (event.level === 'warn' || event.level === 'error') {
      console.error(`[${event.level.toUpperCase()}] DB: ${event.message}`);
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`[${event.level.toUpperCase()}] DB: ${event.message}`);
    }
  }
};

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  connectionTimeout: 30000,
  poolTimeout: 60000,
  idleTimeout: 5000,
  retry: {
    maxRetries: 3,
    initialDelay: 500,
    multiplier: 2
  },
  log: ['info', 'warn', 'error'].map((level) => (event) => {
    connectionLogger.log({ level, message: event.message });
  })
})

// Add cleanup handlers
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Add heartbeat every 10 minutes to keep connection alive
setInterval(() => {
  prisma.$queryRaw`SELECT 1`
    .catch(() => {
      console.log('Heartbeat failed - reconnecting...');
      prisma.$connect();
    });
}, 600000);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma

