import type { Application, Request, Response } from 'express'
import { requireAnyPermission } from '../auth'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'
import { SUGERENCIAS_TOP_N } from '../services/sugerenciasPedidoAlgo'

function parsePositiveIntParam(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

function parseOptionalNonNegInt(raw: unknown, fallback: number, max: number): number {
  if (raw == null || raw === '') return fallback
  const n = Number.parseInt(String(raw), 10)
  if (!Number.isInteger(n) || n < 0) return fallback
  return Math.min(n, max)
}

/**
 * @en Customer order-suggestion routes for App Seller check mode (#254).
 * @es Rutas de sugerencias de pedido para modo check App Seller (#254).
 * @pt-BR Rotas de sugestões de pedido para modo check App Seller (#254).
 */
export function registerSugerenciasPedidoRoutes(app: Application, ctx: RestRouteContext): void {
  const { sugerenciasPedido } = ctx.services
  const read = requireAnyPermission('orders.create', 'customers.manage')

  app.get(
    '/api/clientes/:id/sugerencias-pedido',
    read,
    async (req: Request, res: Response) => {
      try {
        const clienteId = parsePositiveIntParam(String(req.params.id))
        if (clienteId === null) {
          res.status(400).json({ success: false, error: 'id must be a positive integer' })
          return
        }
        const limit = parseOptionalNonNegInt(req.query.limit, SUGERENCIAS_TOP_N, SUGERENCIAS_TOP_N)
        const offset = parseOptionalNonNegInt(req.query.offset, 0, 10_000)
        const result = await sugerenciasPedido.getByCliente(getTenantId(req), clienteId, {
          limit: Math.max(limit, 1),
          offset,
        })
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.status(200).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
