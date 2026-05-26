import type { Application, Request, Response } from 'express'
import { requirePermission } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { libroIvaVentasQuerySchema, safeParseBodySchema } from '../schemas/domain'
import type { RestRouteContext } from './restRouteTypes'
import { errorMessage, getTenantId } from './restDomainShared'

/**
 * @en Accounting exports — Libro IVA Ventas Fase 1 (#147); Compras out of scope.
 * @es Exportaciones contables — Libro IVA Ventas Fase 1 (#147); Compras fuera de alcance.
 * @pt-BR Exportações contábeis — Livro IVA Vendas Fase 1 (#147); Compras fora de escopo.
 */
export function registerContabilidadRoutes(app: Application, ctx: RestRouteContext): void {
  const { services } = ctx
  const { libroIvaVentas } = services
  const ledgerModule = requireModule('finance.ledger')

  app.get(
    '/api/contabilidad/libro-iva-ventas',
    ledgerModule,
    requirePermission('reports.financial.read'),
    async (req: Request, res: Response) => {
      try {
        const tenantId = getTenantId(req)
        const parsed = safeParseBodySchema(libroIvaVentasQuerySchema, req.query)
        if (!parsed.ok) {
          res.status(400).json({ success: false, error: parsed.error })
          return
        }

        const { periodo, format } = parsed.value

        if (format === 'preview') {
          const data = await libroIvaVentas.buildPreview(tenantId, periodo)
          res.json({
            success: true,
            data: {
              periodo: data.periodo,
              recordCountCbtv: data.recordCountCbtv,
              recordCountAlicuotas: data.recordCountAlicuotas,
              totalsByAlicuota: data.totalsByAlicuota,
              totalNeto: data.totalNeto,
              totalIva: data.totalIva,
              totalExento: data.totalExento,
              totalGeneral: data.totalGeneral,
              arcaValidationPending: data.arcaValidationPending,
            },
          })
          return
        }

        if (format === 'txt') {
          const zip = await libroIvaVentas.buildZip(tenantId, periodo)
          const filename = `libro-iva-ventas-${periodo}.zip`
          res.setHeader('Content-Type', 'application/zip')
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
          res.status(200).send(zip)
          return
        }

        const xlsx = await libroIvaVentas.buildExcel(tenantId, periodo)
        const filename = `libro-iva-ventas-${periodo}.xlsx`
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
        res.status(200).send(xlsx)
      } catch (err: unknown) {
        const msg = errorMessage(err)
        if (msg === 'INVALID_PERIODO') {
          res.status(400).json({ success: false, error: 'Invalid periodo (expected YYYY-MM)' })
          return
        }
        res.status(500).json({ success: false, error: msg })
      }
    },
  )
}
