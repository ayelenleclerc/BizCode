import type { PrismaClient } from '@prisma/client'
import type { DespachanteInput, DespachanteNotificationResult, Incoterm } from '@bizcode/types'
import { INCOTERMS_2020, LOCAL_CURRENCY } from '@bizcode/types'
import { sendDespachanteNotificationEmail } from '../channels'
import { buildDespachanteEmailBody, normalizeDespachanteInput } from './exportOperationMath'
import type { ServiceResult } from './serviceResults'

const PEDIDO_INCLUDE = {
  cliente: { select: { id: true, rsocial: true } },
  items: { select: { descripcion: true, cantidad: true } },
} as const

/**
 * @en Export vertical services (#206): Incoterms catalog and customs broker notification.
 * @es Servicios del vertical exportación (#206): catálogo de Incoterms y aviso al despachante.
 * @pt-BR Serviços do vertical exportação (#206): catálogo de Incoterms e aviso ao despachante.
 *
 * @en Local record only: no AFIP type E voucher and no customs filing is performed.
 * @es Registro local únicamente: sin comprobante AFIP tipo E ni despacho aduanero.
 * @pt-BR Somente registro local: sem comprovante AFIP tipo E nem despacho aduaneiro.
 */
export class ExportacionService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * @en Returns the Incoterms 2020 rule set used by invoices and orders.
   * @es Devuelve el conjunto de reglas Incoterms 2020 usado por facturas y pedidos.
   * @pt-BR Retorna o conjunto de regras Incoterms 2020 usado por faturas e pedidos.
   */
  listIncoterms(): readonly Incoterm[] {
    return INCOTERMS_2020
  }

  /**
   * @en Stores the customs broker contact on the order and emails the shipment detail (#206).
   * @es Guarda el contacto del despachante en el pedido y envía por email el detalle de la mercadería (#206).
   * @pt-BR Salva o contato do despachante no pedido e envia por email o detalhe da mercadoria (#206).
   */
  async notifyDespachante(
    tenantId: number,
    pedidoId: number,
    input: DespachanteInput,
  ): Promise<ServiceResult<DespachanteNotificationResult>> {
    if (!Number.isInteger(pedidoId) || pedidoId < 1) {
      return { ok: false, status: 400, error: 'Invalid pedido id' }
    }

    const pedido = await this.prisma.pedido.findFirst({
      where: { id: pedidoId, tenantId },
      include: PEDIDO_INCLUDE,
    })
    if (!pedido) {
      return { ok: false, status: 404, error: 'Pedido not found' }
    }

    const overrides = normalizeDespachanteInput(input)
    if (!overrides.ok) return overrides

    const despachanteNombre = overrides.data.despachanteNombre ?? pedido.despachanteNombre
    const despachanteEmail = overrides.data.despachanteEmail ?? pedido.despachanteEmail
    if (!despachanteEmail) {
      return { ok: false, status: 422, error: 'despachanteEmail is required to notify the broker' }
    }

    if (
      despachanteEmail !== pedido.despachanteEmail ||
      despachanteNombre !== pedido.despachanteNombre
    ) {
      await this.prisma.pedido.update({
        where: { id: pedido.id },
        data: { despachanteNombre, despachanteEmail },
      })
    }

    const body = buildDespachanteEmailBody({
      pedidoId: pedido.id,
      clienteRsocial: pedido.cliente.rsocial,
      incoterm: pedido.incoterm,
      paisDestino: pedido.paisDestino,
      moneda: LOCAL_CURRENCY,
      total: pedido.total.toNumber(),
      items: pedido.items.map((item) => ({
        descripcion: item.descripcion,
        cantidad: item.cantidad.toNumber(),
      })),
    })

    const enviado = await sendDespachanteNotificationEmail(
      despachanteEmail,
      `BizCode - Pedido #${pedido.id}`,
      body,
    )

    return { ok: true, data: { pedidoId: pedido.id, despachanteEmail, enviado } }
  }
}
