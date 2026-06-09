import type { PrismaClient, Prisma } from '@prisma/client'
import type { AuthenticatedRequest } from '../auth'
import type { DomainServices } from '../services/createDomainServices'

export type RestRouteContext = {
  prisma: PrismaClient
  services: DomainServices
  writeAudit: (
    req: AuthenticatedRequest,
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Prisma.InputJsonValue,
  ) => Promise<void>
}
