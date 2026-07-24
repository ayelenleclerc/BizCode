import type { PrismaClient } from '@prisma/client'
import { ArticuloService } from './ArticuloService'
import { ClienteService } from './ClienteService'
import { CobroService } from './CobroService'
import { CobranzasService } from './CobranzasService'
import { CompraService } from './CompraService'
import { FacturaService } from './FacturaService'
import { ImportService } from './ImportService'
import { ReportesFinancierosService } from './ReportesFinancierosService'
import { NotaCreditoService } from './NotaCreditoService'
import { ComprobanteCompraService } from './ComprobanteCompraService'
import { DocumentoCompraImportService } from './DocumentoCompraImportService'
import { ArticuloProveedoresComparadorService } from './ArticuloProveedoresComparadorService'
import { ProveedorCatalogoService } from './ProveedorCatalogoService'
import { ProveedorCuentaCorrienteService } from './ProveedorCuentaCorrienteService'
import { ClienteCuentaCorrienteService } from './ClienteCuentaCorrienteService'
import { ReciboPagoService } from './ReciboPagoService'
import { ReciboCobroService } from './ReciboCobroService'
import { RemitoService } from './RemitoService'
import { ChequeService } from './ChequeService'
import { LibroIvaComprasService } from './LibroIvaComprasService'
import { LibroIvaVentasService } from './LibroIvaVentasService'
import { LogisticaReportesService } from './LogisticaReportesService'
import { ReportesOperacionalesService } from './ReportesOperacionalesService'
import { OrdenEntregaService } from './OrdenEntregaService'
import { PedidoService } from './PedidoService'
import { EmpresaService } from './EmpresaService'
import { StockAjusteService } from './StockAjusteService'
import { RecuentoService } from './RecuentoService'
import { RepartoService } from './RepartoService'
import { RepartoUbicacionService } from './RepartoUbicacionService'
import { ContratoService } from './ContratoService'
import { ContratoBillingService } from './ContratoBillingService'
import { OrdenTrabajoService } from './OrdenTrabajoService'
import { GarantiaService } from './GarantiaService'
import { TurnoCajaService } from './TurnoCajaService'
import { ListaPrecioService } from './ListaPrecioService'
import { CategoriaArticuloService } from './CategoriaArticuloService'
import { ArticuloVarianteService } from './ArticuloVarianteService'
import { DepositoService } from './DepositoService'
import { TransferenciaDepositoService } from './TransferenciaDepositoService'
import { ComisionConfigService } from './ComisionConfigService'
import { LiquidacionComisionService } from './LiquidacionComisionService'

export type DomainServices = {
  cliente: ClienteService
  articulo: ArticuloService
  factura: FacturaService
  cobro: CobroService
  cobranzas: CobranzasService
  compras: CompraService
  ordenEntrega: OrdenEntregaService
  pedido: PedidoService
  empresa: EmpresaService
  stockAjuste: StockAjusteService
  recuentos: RecuentoService
  repartos: RepartoService
  repartoUbicacion: RepartoUbicacionService
  reportes: ReportesFinancierosService
  reportesOperacionales: ReportesOperacionalesService
  logisticaReportes: LogisticaReportesService
  notaCredito: NotaCreditoService
  libroIvaVentas: LibroIvaVentasService
  libroIvaCompras: LibroIvaComprasService
  comprobanteCompra: ComprobanteCompraService
  documentoCompraImport: DocumentoCompraImportService
  proveedorCatalogo: ProveedorCatalogoService
  articuloProveedoresComparador: ArticuloProveedoresComparadorService
  proveedorCuentaCorriente: ProveedorCuentaCorrienteService
  clienteCuentaCorriente: ClienteCuentaCorrienteService
  reciboPago: ReciboPagoService
  reciboCobro: ReciboCobroService
  remito: RemitoService
  cheque: ChequeService
  import: ImportService
  contrato: ContratoService
  contratoBilling: ContratoBillingService
  ordenTrabajo: OrdenTrabajoService
  garantia: GarantiaService
  turnoCaja: TurnoCajaService
  listaPrecio: ListaPrecioService
  categoriaArticulo: CategoriaArticuloService
  articuloVariante: ArticuloVarianteService
  deposito: DepositoService
  transferenciaDeposito: TransferenciaDepositoService
  comisionConfig: ComisionConfigService
  liquidacionComision: LiquidacionComisionService
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
    cobranzas: new CobranzasService(prisma),
    compras: new CompraService(prisma),
    ordenEntrega: new OrdenEntregaService(prisma),
    pedido: new PedidoService(prisma),
    empresa: new EmpresaService(prisma),
    stockAjuste: new StockAjusteService(prisma),
    recuentos: new RecuentoService(prisma),
    repartos: new RepartoService(prisma),
    repartoUbicacion: new RepartoUbicacionService(prisma),
    reportes: new ReportesFinancierosService(prisma),
    reportesOperacionales: new ReportesOperacionalesService(prisma),
    logisticaReportes: new LogisticaReportesService(prisma),
    notaCredito: new NotaCreditoService(prisma),
    libroIvaVentas: new LibroIvaVentasService(prisma),
    libroIvaCompras: new LibroIvaComprasService(prisma),
    comprobanteCompra: new ComprobanteCompraService(prisma),
    documentoCompraImport: new DocumentoCompraImportService(prisma),
    proveedorCatalogo: new ProveedorCatalogoService(prisma),
    articuloProveedoresComparador: new ArticuloProveedoresComparadorService(prisma),
    proveedorCuentaCorriente: new ProveedorCuentaCorrienteService(prisma),
    clienteCuentaCorriente: new ClienteCuentaCorrienteService(prisma),
    reciboPago: new ReciboPagoService(prisma),
    reciboCobro: new ReciboCobroService(prisma),
    remito: new RemitoService(prisma),
    cheque: new ChequeService(prisma),
    import: new ImportService(prisma),
    contrato: new ContratoService(prisma),
    contratoBilling: new ContratoBillingService(prisma),
    ordenTrabajo: new OrdenTrabajoService(prisma),
    garantia: new GarantiaService(prisma),
    turnoCaja: new TurnoCajaService(prisma),
    listaPrecio: new ListaPrecioService(prisma),
    categoriaArticulo: new CategoriaArticuloService(prisma),
    articuloVariante: new ArticuloVarianteService(prisma),
    deposito: new DepositoService(prisma),
    transferenciaDeposito: new TransferenciaDepositoService(prisma),
    comisionConfig: new ComisionConfigService(prisma),
    liquidacionComision: new LiquidacionComisionService(prisma),
  }
}
