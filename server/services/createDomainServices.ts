import type { PrismaClient } from '@prisma/client'
import { ArticuloService } from './ArticuloService'
import { ClienteService } from './ClienteService'
import { CobroService } from './CobroService'
import { FacturaService } from './FacturaService'
import { ImportService } from './ImportService'
import { ReportesFinancierosService } from './ReportesFinancierosService'
import { ReportesOperacionalesService } from './ReportesOperacionalesService'
import { OrdenEntregaService } from './OrdenEntregaService'
import { EmpresaService } from './EmpresaService'
import { StockAjusteService } from './StockAjusteService'

export type DomainServices = {
  cliente: ClienteService
  articulo: ArticuloService
  factura: FacturaService
  cobro: CobroService
  ordenEntrega: OrdenEntregaService
  empresa: EmpresaService
  stockAjuste: StockAjusteService
  reportes: ReportesFinancierosService
  reportesOperacionales: ReportesOperacionalesService
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
    ordenEntrega: new OrdenEntregaService(prisma),
    empresa: new EmpresaService(prisma),
    stockAjuste: new StockAjusteService(prisma),
    reportes: new ReportesFinancierosService(prisma),
    reportesOperacionales: new ReportesOperacionalesService(prisma),
    import: new ImportService(prisma),
  }
}
