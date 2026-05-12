import type { PrismaClient } from '@prisma/client'
import { ArticuloService } from './ArticuloService'
import { ClienteService } from './ClienteService'
import { FacturaService } from './FacturaService'
import { ImportService } from './ImportService'

export type DomainServices = {
  cliente: ClienteService
  articulo: ArticuloService
  factura: FacturaService
  import: ImportService
}

/**
 * @en Builds tenant-scoped domain services for REST route handlers.
 * @es Construye servicios de dominio por tenant para handlers REST.
 * @pt-BR Constrói serviços de domínio por tenant para handlers REST.
 */
export function createDomainServices(prisma: PrismaClient): DomainServices {
  return {
    cliente: new ClienteService(prisma),
    articulo: new ArticuloService(prisma),
    factura: new FacturaService(prisma),
    import: new ImportService(prisma),
  }
}
