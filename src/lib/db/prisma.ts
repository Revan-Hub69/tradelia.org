import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const prismaDisabled = process.env.NEXT_EXPORT === 'true' || process.env.SKIP_PRISMA === 'true'

function createPrismaStub(): PrismaClient {
  return new Proxy(
    {},
    {
      get() {
        return () => {
          throw new Error('Prisma client is disabled during static export.')
        }
      }
    }
  ) as PrismaClient
}

export const prisma =
  global.prisma ??
  (prismaDisabled
    ? createPrismaStub()
    : new PrismaClient())

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
