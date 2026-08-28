import type { Application, Request, Response } from 'express'
import type {
  LibroPsicotropicoCreateInput,
  RecetaDispensacionCreateInput,
} from '@bizcode/types'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { farmaciaMutationHttpRateLimiter } from '../middleware/routeRateLimit'
import { validateBody } from '../middleware/validateBody'
import {
  libroPsicotropicoCreateBodySchema,
  libroPsicotropicoListQuerySchema,
  loteSerialUpdateBodySchema,
  recetaCreateBodySchema,
  recetaListQuerySchema,
} from '../schemas/domain'
import { errorMessage, getTenantId } from './restDomainShared'
import type { RestRouteContext } from './restRouteTypes'

function idParam(req: Request): number {
  return Number.parseInt(String(req.params.id), 10)
}

/**
 * @en Pharmacy vertical REST endpoints (#204): prescriptions, internal psychotropic book, lot serials.
 * @es Endpoints REST del vertical farmacia (#204): recetas, libro interno de psicotrópicos, seriales de lote.
 * @pt-BR Endpoints REST do vertical farmácia (#204): receitas, livro interno de psicotrópicos, seriais de lote.
 *
 * @en The book export is an internal audit trail; it is not the official SEDRONAR filing format.
 * @es La exportación del libro es una traza interna de auditoría; no es el formato oficial de SEDRONAR.
 * @pt-BR A exportação do livro é uma trilha interna de auditoria; não é o formato oficial do SEDRONAR.
 */
export function registerFarmaciaRoutes(app: Application, ctx: RestRouteContext): void {
  const { farmacia } = ctx.services
  const pharmacyModule = requireModule('vertical.pharmacy')
  const readPermission = requirePermission('products.read')
  const writePermission = requirePermission('inventory.adjust')

  app.get(
    '/api/farmacia/recetas',
    pharmacyModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const parsed = recetaListQuerySchema.safeParse(req.query)
        if (!parsed.success) {
          res.status(400).json({ success: false, error: 'Invalid query parameters' })
          return
        }
        const result = await farmacia.listRecetas(getTenantId(req), parsed.data)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/farmacia/recetas/:id',
    pharmacyModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await farmacia.getReceta(getTenantId(req), idParam(req))
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/farmacia/recetas',
    pharmacyModule,
    writePermission,
    farmaciaMutationHttpRateLimiter,
    validateBody(recetaCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await farmacia.createReceta(
          getTenantId(req),
          req.body as RecetaDispensacionCreateInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'receta_dispensacion_create',
          'receta_dispensacion',
          String(result.data.id),
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/farmacia/libro-psicotropicos',
    pharmacyModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const parsed = libroPsicotropicoListQuerySchema.safeParse(req.query)
        if (!parsed.success) {
          res.status(400).json({ success: false, error: 'Invalid query parameters' })
          return
        }
        const result = await farmacia.listLibro(getTenantId(req), parsed.data)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/farmacia/libro-psicotropicos/export',
    pharmacyModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const parsed = libroPsicotropicoListQuerySchema.safeParse(req.query)
        if (!parsed.success) {
          res.status(400).json({ success: false, error: 'Invalid query parameters' })
          return
        }
        const result = await farmacia.exportLibroCsv(getTenantId(req), parsed.data)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="libro-psicotropicos.csv"',
        )
        res.status(200).send(result.data)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/farmacia/libro-psicotropicos',
    pharmacyModule,
    writePermission,
    farmaciaMutationHttpRateLimiter,
    validateBody(libroPsicotropicoCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await farmacia.createLibroMovimiento(
          getTenantId(req),
          req.body as LibroPsicotropicoCreateInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'libro_psicotropico_create',
          'libro_psicotropico_movimiento',
          String(result.data.id),
        )
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.put(
    '/api/farmacia/lotes/:id/serial',
    pharmacyModule,
    writePermission,
    farmaciaMutationHttpRateLimiter,
    validateBody(loteSerialUpdateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const body = req.body as { serialUnidad?: string | null; codigoDatamatrix?: string | null }
        const result = await farmacia.setLoteSerial(getTenantId(req), idParam(req), body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'lote_serial_update',
          'lote',
          String(result.data.id),
        )
        res.json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
