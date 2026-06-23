import type { PrismaClient } from '@prisma/client'
import { modulesInclude } from './TenantConfigService'
import type { ModuleKey } from '@bizcode/types'

export type PortalPedidoDto = {
  id: number
  estado: string
  total: string
  createdAt: string
  validUntil: string | null
  facturaRef: string | null
  remitoEstado: string | null
}

export type PortalPedidoListResult = {
  pedidos: PortalPedidoDto[]
  total: number
}

function formatFacturaRef(tipo: string, prefijo: string, numero: number): string {
  return `${tipo}-${prefijo.padStart(4, '0')}-${String(numero).padStart(8, '0')}`
}

/**
 * @en Customer-scoped order listing for the B2B portal (#240).
 * @es Listado de pedidos del cliente en el portal B2B (#240).
 * @pt-BR Listagem de pedidos do cliente no portal B2B (#240).
 */
export class PortalPedidoService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    tenantId: number,
    portalClienteId: number,
    tenantModules: readonly ModuleKey[],
    take: number,
    skip: number,
  ): Promise<PortalPedidoListResult> {
    const where = { tenantId, clienteId: portalClienteId }
    const remitoEnabled = modulesInclude(tenantModules, 'fiscal.remito')
    const [total, pedidos] = await Promise.all([
      this.prisma.pedido.count({ where }),
      this.prisma.pedido.findMany({
        where,
        include: {
          factura: { select: { tipo: true, prefijo: true, numero: true } },
          ...(remitoEnabled ? { remito: { select: { estado: true } } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    ])

    const mapped: PortalPedidoDto[] = pedidos.map((p) => {
      const remitoEstado =
        remitoEnabled && 'remito' in p && p.remito ? p.remito.estado : null
      return {
        id: p.id,
        estado: p.estado,
        total: p.total.toFixed(2),
        createdAt: p.createdAt.toISOString(),
        validUntil: p.validUntil?.toISOString() ?? null,
        facturaRef: p.factura
          ? formatFacturaRef(p.factura.tipo, p.factura.prefijo, p.factura.numero)
          : null,
        remitoEstado,
      }
    })

    return { pedidos: mapped, total }
  }
}
