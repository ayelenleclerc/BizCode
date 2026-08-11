import type { PrismaClient } from '@prisma/client'
import type {
  EstadoCredito,
  SellerAlertAction,
  SellerCreditNivel,
  SellerPolicies,
  SellerPoliciesPatchInput,
  SellerStockEstado,
  StockMultipleResult,
} from '@bizcode/types'
import { NEW_TENANT_MODULES } from '@bizcode/types'
import { ClienteCuentaCorrienteService } from './ClienteCuentaCorrienteService'
import { ReciboCobroService } from './ReciboCobroService'
import { computeDaysPastDue } from './ReportesFinancierosService'

const DEFAULT_POLICIES: SellerPolicies = {
  sellerCreditOverLimitAction: 'block',
  sellerCreditOverdueAction: 'warn',
  sellerStockZeroAction: 'warn',
  sellerStockCapQtyToAvailable: true,
}

const ACTIONS = new Set<SellerAlertAction>(['warn', 'block'])
const STOCK_MULTIPLE_MAX_IDS = 100

function decimalMoney(n: number): string {
  return n.toFixed(2)
}

function parseAction(value: string | null | undefined, fallback: SellerAlertAction): SellerAlertAction {
  if (value === 'warn' || value === 'block') return value
  return fallback
}

/**
 * @en Derives seller credit alert level from debt / limit / overdue (#256).
 * @es Deriva el nivel de alerta de crédito Seller (#256).
 * @pt-BR Deriva o nível de alerta de crédito Seller (#256).
 */
export function deriveCreditNivel(params: {
  deudaTotal: number
  deudaVencida: number
  disponible: number | null
  excedeLimite: boolean
}): SellerCreditNivel {
  if (params.excedeLimite || (params.disponible != null && params.disponible < 0)) {
    return 'rojo'
  }
  if (params.deudaVencida > 0) {
    return 'naranja'
  }
  if (params.deudaTotal > 0) {
    return 'amarillo'
  }
  return 'ok'
}

/**
 * @en Maps stock qty + min threshold to line status (#256).
 * @es Mapea cantidad y mínimo a estado de línea (#256).
 * @pt-BR Mapeia quantidade e mínimo para status da linha (#256).
 */
export function deriveStockEstado(stock: number, stockMin: number): SellerStockEstado {
  if (stock <= 0) return 'cero'
  if (stockMin > 0 && stock <= stockMin) return 'bajo'
  return 'ok'
}

/**
 * @en Lightweight seller credit / stock / policy helpers (#256).
 * @es Helpers livianos de crédito / stock / políticas Seller (#256).
 * @pt-BR Helpers leves de crédito / estoque / políticas Seller (#256).
 */
export class SellerAlertService {
  private readonly cc: ClienteCuentaCorrienteService
  private readonly recibos: ReciboCobroService

  constructor(
    private readonly prisma: PrismaClient,
    cc?: ClienteCuentaCorrienteService,
    recibos?: ReciboCobroService,
  ) {
    this.cc = cc ?? new ClienteCuentaCorrienteService(prisma)
    this.recibos = recibos ?? new ReciboCobroService(prisma)
  }

  async getSellerPolicies(tenantId: number): Promise<SellerPolicies> {
    const row = await this.prisma.tenantConfig.findUnique({
      where: { tenantId },
      select: {
        sellerCreditOverLimitAction: true,
        sellerCreditOverdueAction: true,
        sellerStockZeroAction: true,
        sellerStockCapQtyToAvailable: true,
      },
    })
    if (!row) {
      return { ...DEFAULT_POLICIES }
    }
    return {
      sellerCreditOverLimitAction: parseAction(
        row.sellerCreditOverLimitAction,
        DEFAULT_POLICIES.sellerCreditOverLimitAction,
      ),
      sellerCreditOverdueAction: parseAction(
        row.sellerCreditOverdueAction,
        DEFAULT_POLICIES.sellerCreditOverdueAction,
      ),
      sellerStockZeroAction: parseAction(
        row.sellerStockZeroAction,
        DEFAULT_POLICIES.sellerStockZeroAction,
      ),
      sellerStockCapQtyToAvailable: row.sellerStockCapQtyToAvailable,
    }
  }

  async patchSellerPolicies(
    tenantId: number,
    input: SellerPoliciesPatchInput,
    changedById: number,
  ): Promise<SellerPolicies> {
    const patch: {
      sellerCreditOverLimitAction?: string
      sellerCreditOverdueAction?: string
      sellerStockZeroAction?: string
      sellerStockCapQtyToAvailable?: boolean
      updatedById: number
    } = { updatedById: changedById }

    if (input.sellerCreditOverLimitAction !== undefined) {
      if (!ACTIONS.has(input.sellerCreditOverLimitAction)) {
        throw Object.assign(new Error('invalid_seller_credit_over_limit_action'), { status: 400 })
      }
      patch.sellerCreditOverLimitAction = input.sellerCreditOverLimitAction
    }
    if (input.sellerCreditOverdueAction !== undefined) {
      if (!ACTIONS.has(input.sellerCreditOverdueAction)) {
        throw Object.assign(new Error('invalid_seller_credit_overdue_action'), { status: 400 })
      }
      patch.sellerCreditOverdueAction = input.sellerCreditOverdueAction
    }
    if (input.sellerStockZeroAction !== undefined) {
      if (!ACTIONS.has(input.sellerStockZeroAction)) {
        throw Object.assign(new Error('invalid_seller_stock_zero_action'), { status: 400 })
      }
      patch.sellerStockZeroAction = input.sellerStockZeroAction
    }
    if (input.sellerStockCapQtyToAvailable !== undefined) {
      patch.sellerStockCapQtyToAvailable = Boolean(input.sellerStockCapQtyToAvailable)
    }

    const existing = await this.prisma.tenantConfig.findUnique({ where: { tenantId } })
    if (!existing) {
      await this.prisma.tenantConfig.create({
        data: {
          tenantId,
          businessType: 'ambos',
          rubros: [],
          plan: 'starter',
          modules: [...NEW_TENANT_MODULES],
          integrations: [],
          sellerCreditOverLimitAction:
            patch.sellerCreditOverLimitAction ?? DEFAULT_POLICIES.sellerCreditOverLimitAction,
          sellerCreditOverdueAction:
            patch.sellerCreditOverdueAction ?? DEFAULT_POLICIES.sellerCreditOverdueAction,
          sellerStockZeroAction:
            patch.sellerStockZeroAction ?? DEFAULT_POLICIES.sellerStockZeroAction,
          sellerStockCapQtyToAvailable:
            patch.sellerStockCapQtyToAvailable ?? DEFAULT_POLICIES.sellerStockCapQtyToAvailable,
          updatedById: changedById,
        },
      })
    } else {
      await this.prisma.tenantConfig.update({
        where: { tenantId },
        data: patch,
      })
    }

    return this.getSellerPolicies(tenantId)
  }

  async getEstadoCredito(tenantId: number, clienteId: number): Promise<EstadoCredito | null> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: { id: true, creditLimit: true, creditDays: true },
    })
    if (!cliente) return null

    const asOf = new Date()
    const saldoRow = await this.cc.getSaldo(tenantId, clienteId)
    const deudaTotalNum = saldoRow ? Number.parseFloat(saldoRow.saldo) : 0
    const limiteNum =
      saldoRow?.creditLimit != null ? Number.parseFloat(saldoRow.creditLimit) : null
    const disponibleNum =
      limiteNum != null && Number.isFinite(limiteNum) ? limiteNum - deudaTotalNum : null

    const pendientes = await this.recibos
      .listFacturasPendientes(tenantId, clienteId)
      .catch(() => [] as Awaited<ReturnType<ReciboCobroService['listFacturasPendientes']>>)

    const creditDays = cliente.creditDays ?? 0
    const facturas = pendientes.map((f) => {
      const fecha = new Date(f.fecha)
      const diasMora = computeDaysPastDue(fecha, creditDays, asOf)
      const due = new Date(fecha)
      due.setDate(due.getDate() + creditDays)
      return {
        id: f.facturaId,
        saldo: f.pendiente,
        vencimiento: due.toISOString(),
        diasMora,
      }
    })

    const deudaVencidaNum = facturas
      .filter((f) => f.diasMora > 0)
      .reduce((sum, f) => sum + Number.parseFloat(f.saldo), 0)

    const diasMoraMax = facturas.reduce((max, f) => Math.max(max, f.diasMora), 0)
    const excedeLimite = Boolean(saldoRow?.excedeLimite) || (disponibleNum != null && disponibleNum < 0)

    return {
      deudaTotal: decimalMoney(Number.isFinite(deudaTotalNum) ? deudaTotalNum : 0),
      deudaVencida: decimalMoney(Number.isFinite(deudaVencidaNum) ? deudaVencidaNum : 0),
      limiteCredito: limiteNum != null && Number.isFinite(limiteNum) ? decimalMoney(limiteNum) : null,
      disponible: disponibleNum != null && Number.isFinite(disponibleNum) ? decimalMoney(disponibleNum) : null,
      diasMoraMax,
      nivel: deriveCreditNivel({
        deudaTotal: deudaTotalNum,
        deudaVencida: deudaVencidaNum,
        disponible: disponibleNum,
        excedeLimite,
      }),
      facturasPendientes: facturas,
      asOf: asOf.toISOString(),
    }
  }

  async getStockMultiple(tenantId: number, ids: number[]): Promise<StockMultipleResult> {
    const unique = [...new Set(ids.filter((id) => Number.isInteger(id) && id > 0))]
    if (unique.length > STOCK_MULTIPLE_MAX_IDS) {
      throw Object.assign(new Error(`ids exceeds max of ${STOCK_MULTIPLE_MAX_IDS}`), { status: 400 })
    }

    const asOf = new Date()
    if (unique.length === 0) {
      return { asOf: asOf.toISOString(), items: [] }
    }

    const rows = await this.prisma.articulo.findMany({
      where: { tenantId, id: { in: unique } },
      select: { id: true, stock: true, minimo: true },
    })

    const items = rows.map((row) => {
      const stock = Number(row.stock)
      const stockMin = Number(row.minimo)
      return {
        articuloId: row.id,
        stock,
        stockMin,
        estado: deriveStockEstado(stock, stockMin),
      }
    })

    return { asOf: asOf.toISOString(), items }
  }
}

export { DEFAULT_POLICIES as DEFAULT_SELLER_POLICIES, STOCK_MULTIPLE_MAX_IDS }
