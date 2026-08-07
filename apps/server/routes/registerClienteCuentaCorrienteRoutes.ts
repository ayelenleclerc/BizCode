import type { Application, Request, Response } from 'express'
import type { AuthenticatedRequest } from '../auth'
import { requireAnyPermission, requirePermission } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import {
  clienteCuentaCorrienteAjusteBodySchema,
  clienteCuentaCorrienteEnviarBodySchema,
  movimientoClienteCCTipoSchema,
} from '../schemas/domain'
import type { MovimientoClienteCCTipo } from '../services/ClienteCuentaCorrienteService'
import { buildEstadoCuentaClientePdfBuffer } from '../finance/estadoCuentaClientePdf'
import { sendClienteEstadoCuentaEmail } from '../channels'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function parsePositiveIntParam(value: string): number | null {
  const n = Number.parseInt(value, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

function parseIsoDateQuery(value: unknown): Date | undefined {
  if (typeof value !== 'string' || value.trim() === '') return undefined
  const d = new Date(value.trim())
  if (Number.isNaN(d.getTime())) return undefined
  return d
}

function parsePaginationQuery(req: Request): { limit?: number; offset?: number } {
  const limitRaw = req.query.limit
  const offsetRaw = req.query.offset
  const limit =
    typeof limitRaw === 'string' && limitRaw.trim() !== ''
      ? Number.parseInt(limitRaw, 10)
      : undefined
  const offset =
    typeof offsetRaw === 'string' && offsetRaw.trim() !== ''
      ? Number.parseInt(offsetRaw, 10)
      : undefined
  return {
    ...(limit != null && Number.isInteger(limit) ? { limit } : {}),
    ...(offset != null && Number.isInteger(offset) ? { offset } : {}),
  }
}

/**
 * @en Customer accounts-receivable ledger routes (#232).
 * @es Rutas de cuenta corriente de cliente (#232).
 * @pt-BR Rotas de conta corrente de cliente (#232).
 */
export function registerClienteCuentaCorrienteRoutes(
  app: Application,
  ctx: RestRouteContext,
): void {
  const { prisma, services, writeAudit } = ctx
  const { clienteCuentaCorriente } = services
  const ledgerModule = requireModule('finance.ledger')

  app.get(
    '/api/clientes/:id/cuenta-corriente',
    ledgerModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      const clienteId = parsePositiveIntParam(String(req.params.id))
      if (clienteId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }

      const tipoParam = req.query.tipo
      let tipo: MovimientoClienteCCTipo | undefined
      if (typeof tipoParam === 'string' && tipoParam.trim() !== '') {
        const parsed = movimientoClienteCCTipoSchema.safeParse(tipoParam)
        if (!parsed.success) {
          res.status(400).json({ success: false, error: 'Invalid tipo filter' })
          return
        }
        tipo = parsed.data
      }

      try {
        const tenantId = getTenantId(req)
        const { limit, offset } = parsePaginationQuery(req)
        const data = await clienteCuentaCorriente.getStatement(tenantId, clienteId, {
          tipo,
          from: parseIsoDateQuery(req.query.desde ?? req.query.from),
          to: parseIsoDateQuery(req.query.hasta ?? req.query.to),
          limit,
          offset,
        })
        if (!data) {
          res.status(404).json({ success: false, error: 'Cliente not found' })
          return
        }
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/clientes/:id/cuenta-corriente/saldo',
    ledgerModule,
    // App Seller (#168): field roles with customers.read need AR balance snapshot (not full ledger).
    requireAnyPermission('customers.read', 'reports.financial.read'),
    async (req: Request, res: Response) => {
      const clienteId = parsePositiveIntParam(String(req.params.id))
      if (clienteId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }

      try {
        const tenantId = getTenantId(req)
        const data = await clienteCuentaCorriente.getSaldo(tenantId, clienteId)
        if (!data) {
          res.status(404).json({ success: false, error: 'Cliente not found' })
          return
        }
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/clientes/:id/cuenta-corriente/antiguedad',
    ledgerModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      const clienteId = parsePositiveIntParam(String(req.params.id))
      if (clienteId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }

      try {
        const tenantId = getTenantId(req)
        const asOf = parseIsoDateQuery(req.query.asOf) ?? new Date()
        const data = await clienteCuentaCorriente.getAntiguedad(tenantId, clienteId, asOf)
        if (!data) {
          res.status(404).json({ success: false, error: 'Cliente not found' })
          return
        }
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/clientes/:id/cuenta-corriente/estado-de-cuenta/pdf',
    ledgerModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      const clienteId = parsePositiveIntParam(String(req.params.id))
      if (clienteId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }

      try {
        const tenantId = getTenantId(req)
        const from = parseIsoDateQuery(req.query.desde)
        const to = parseIsoDateQuery(req.query.hasta)
        const data = await clienteCuentaCorriente.getEstadoCuentaPdfData(
          tenantId,
          clienteId,
          from,
          to,
        )
        if (!data) {
          res.status(404).json({ success: false, error: 'Cliente not found' })
          return
        }
        const pdf = await buildEstadoCuentaClientePdfBuffer(data)
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader(
          'Content-Disposition',
          `inline; filename="estado-cuenta-cliente-${clienteId}.pdf"`,
        )
        res.send(pdf)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/clientes/:id/cuenta-corriente/estado-de-cuenta/enviar',
    ledgerModule,
    requirePermission('sales.create'),
    validateBody(clienteCuentaCorrienteEnviarBodySchema),
    async (req: Request, res: Response) => {
      const clienteId = parsePositiveIntParam(String(req.params.id))
      if (clienteId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }

      const body = req.body as { email?: string; desde?: string; hasta?: string }

      try {
        const tenantId = getTenantId(req)
        const cliente = await prisma.cliente.findFirst({
          where: { id: clienteId, tenantId },
          select: { email: true, rsocial: true },
        })
        if (!cliente) {
          res.status(404).json({ success: false, error: 'Cliente not found' })
          return
        }

        const to = body.email?.trim() || cliente.email?.trim()
        if (!to) {
          res.status(400).json({ success: false, error: 'No email address available' })
          return
        }

        const from = body.desde ? parseIsoDateQuery(body.desde) : undefined
        const toDate = body.hasta ? parseIsoDateQuery(body.hasta) : undefined
        const data = await clienteCuentaCorriente.getEstadoCuentaPdfData(
          tenantId,
          clienteId,
          from,
          toDate,
        )
        if (!data) {
          res.status(404).json({ success: false, error: 'Cliente not found' })
          return
        }

        const pdf = await buildEstadoCuentaClientePdfBuffer(data)
        await sendClienteEstadoCuentaEmail(to, cliente.rsocial, data.saldo, pdf)

        res.json({ success: true, data: { sent: true, email: to } })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/clientes/:id/cuenta-corriente/ajuste',
    ledgerModule,
    requirePermission('sales.create'),
    validateBody(clienteCuentaCorrienteAjusteBodySchema),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      if (!authReq.auth) {
        res.status(401).json({ success: false, error: 'Authentication required' })
        return
      }

      const clienteId = parsePositiveIntParam(String(req.params.id))
      if (clienteId === null) {
        res.status(400).json({ success: false, error: 'id must be a positive integer' })
        return
      }

      const body = req.body as { monto: number; motivo: string }

      try {
        const tenantId = getTenantId(req)
        const movimiento = await clienteCuentaCorriente.createAjuste(
          tenantId,
          clienteId,
          authReq.auth.claims.userId,
          body.monto,
          body.motivo,
        )
        await writeAudit(
          authReq,
          'cliente_cc_ajuste',
          'cliente_cuenta_corriente',
          String(movimiento.id),
          { clienteId, monto: body.monto, motivo: body.motivo },
        )
        res.status(201).json({ success: true, data: movimiento })
      } catch (err: unknown) {
        const msg = errorMessage(err)
        if (msg.includes('not found') || msg.includes('Not found')) {
          res.status(404).json({ success: false, error: msg })
          return
        }
        if (msg.includes('required') || msg.includes('must be')) {
          res.status(400).json({ success: false, error: msg })
          return
        }
        res.status(500).json({ success: false, error: msg })
      }
    },
  )
}
