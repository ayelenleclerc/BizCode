import type { PrismaClient } from '@prisma/client'
import { ArticuloService } from './ArticuloService'
import { ClienteService } from './ClienteService'
import { CobroService } from './CobroService'
import { FacturaService } from './FacturaService'
import { ImportService } from './ImportService'
import { ReportesFinancierosService } from './ReportesFinancierosService'

export type DomainServices = {
  cliente: ClienteService
  articulo: ArticuloService
  factura: FacturaService
  cobro: CobroService
  reportes: ReportesFinancierosService
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
    cobro: new CobroService(prisma),
    reportes: new ReportesFinancierosService(prisma),
    import: new ImportService(prisma),
  }
}
