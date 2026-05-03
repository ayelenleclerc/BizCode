import type { PrismaClient, Prisma } from '@prisma/client'
import type { AuthenticatedRequest } from '../auth'

export type RestRouteContext = {
  prisma: PrismaClient
  writeAudit: (
    req: AuthenticatedRequest,
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Prisma.InputJsonValue,
  ) => Promise<void>
}
