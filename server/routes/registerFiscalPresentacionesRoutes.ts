import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import { presentacionRetencionBodySchema } from '../schemas/domain'
import { FiscalPresentacionService } from '../services/FiscalPresentacionService'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

function parsePositiveIntParam(value: string | string[]): number | null {
  const raw = Array.isArray(value) ? value[0] : value
  const n = Number.parseInt(raw, 10)
  if (!Number.isInteger(n) || n < 1) return null
  return n
}

function parseFormato(value: unknown): 'sicore' | 'sifere' | null {
  const raw = String(value ?? '').toLowerCase()
  if (raw === 'sicore' || raw === 'sifere') return raw
  return null
}

/**
 * @en Monthly SICORE/SIFERE presentation routes (#242).
 * @es Rutas de presentaciones mensuales SICORE/SIFERE (#242).
 * @pt-BR Rotas de apresentações mensais SICORE/SIFERE (#242).
 */
export function registerFiscalPresentacionesRoutes(app: Application, ctx: RestRouteContext): void {
  const { prisma, writeAudit } = ctx
  const service = new FiscalPresentacionService(prisma)
  const retencionesModule = requireModule('finance.retenciones')

  app.get(
    '/api/fiscal/presentaciones/preview',
    retencionesModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      const formato = parseFormato(req.query.formato)
      const periodo = String(req.query.periodo ?? '').trim()
      if (!formato) {
        res.status(400).json({ success: false, error: 'formato must be sicore or sifere' })
        return
      }
      if (!periodo) {
        res.status(400).json({ success: false, error: 'periodo is required (YYYY-MM)' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const data = await service.preview(tenantId, formato, periodo)
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(400).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/fiscal/presentaciones',
    retencionesModule,
    requirePermission('reports.financial.read'),
    validateBody(presentacionRetencionBodySchema),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      const { formato, periodo } = req.body as { formato: 'sicore' | 'sifere'; periodo: string }
      try {
        const tenantId = getTenantId(req)
        const userId = authReq.auth?.claims.userId ?? null
        const data = await service.generar(tenantId, formato, periodo, userId)
        await writeAudit(authReq, 'presentacion_retencion_create', 'fiscal_presentacion', String(data.id), {
          formato,
          periodo,
        })
        res.status(201).json({ success: true, data })
      } catch (err: unknown) {
        res.status(400).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/fiscal/presentaciones',
    retencionesModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const data = await service.listar(tenantId)
        res.json({ success: true, data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/fiscal/presentaciones/:id/archivo',
    retencionesModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      const id = parsePositiveIntParam(req.params.id)
      if (id == null) {
        res.status(400).json({ success: false, error: 'Invalid id' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const archivo = await service.getArchivo(tenantId, id)
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="presentacion-${archivo.formato}-${id}.txt"`,
        )
        res.send(archivo.contenido)
      } catch (err: unknown) {
        const msg = errorMessage(err)
        res.status(msg.includes('not found') ? 404 : 500).json({ success: false, error: msg })
      }
    },
  )

  app.patch(
    '/api/fiscal/presentaciones/:id/presentado',
    retencionesModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      const id = parsePositiveIntParam(req.params.id)
      if (id == null) {
        res.status(400).json({ success: false, error: 'Invalid id' })
        return
      }
      try {
        const tenantId = getTenantId(req)
        const data = await service.marcarPresentado(tenantId, id)
        await writeAudit(authReq, 'presentacion_retencion_marked', 'fiscal_presentacion', String(id))
        res.json({ success: true, data })
      } catch (err: unknown) {
        const msg = errorMessage(err)
        res.status(msg.includes('not found') ? 404 : 500).json({ success: false, error: msg })
      }
    },
  )
}
