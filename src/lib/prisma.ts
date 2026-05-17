import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient } from '@/generated/prisma/client'
import { getDatabaseUrl } from '@/lib/database-url'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const pool = new Pool({ connectionString: getDatabaseUrl() })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

function isPrismaClient(value: unknown): value is PrismaClient {
  return (
    typeof value === 'object' &&
    value !== null &&
    'userSettings' in value &&
    typeof (value as PrismaClient).userSettings?.upsert === 'function' &&
    'notification' in value
  )
}

const cached = globalForPrisma.prisma
export const prisma = isPrismaClient(cached) ? cached : createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
