/**
 * @en Pharmacy insurer / prepaid REST endpoints (#252).
 * @es Endpoints REST de obras sociales / prepagas (#252).
 * @pt-BR Endpoints REST de planos / prepagas (#252).
 */

import type { Application, Request, Response } from 'express'
import { requirePermission } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { farmaciaMutationHttpRateLimiter } from '../middleware/routeRateLimit'
import { validateBody } from '../middleware/validateBody'
import {
  coberturaOsUpsertBodySchema,
  obraSocialCreateBodySchema,
  obraSocialUpdateBodySchema,
  presentacionOsCobroBodySchema,
  presentacionOsCreateBodySchema,
  presentacionOsListQuerySchema,
  presentacionOsRechazoBodySchema,
  ventaConOsCreateBodySchema,
  ventaConOsListQuerySchema,
} from '../schemas/domain'
import { errorMessage, getTenantId } from './restDomainShared'
import type { RestRouteContext } from './restRouteTypes'

function idParam(req: Request): number {
  return Number.parseInt(String(req.params.id), 10)
}

export function registerObraSocialRoutes(app: Application, ctx: RestRouteContext): void {
  const { obraSocial } = ctx.services
  const pharmacyModule = requireModule('vertical.pharmacy')
  const readPermission = requirePermission('products.read')
  const writePermission = requirePermission('inventory.adjust')

  app.get(
    '/api/farmacia/obras-sociales',
    pharmacyModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await obraSocial.listObrasSociales(getTenantId(req))
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
    '/api/farmacia/obras-sociales/:id',
    pharmacyModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await obraSocial.getObraSocial(getTenantId(req), idParam(req))
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
    '/api/farmacia/obras-sociales',
    pharmacyModule,
    writePermission,
    farmaciaMutationHttpRateLimiter,
    validateBody(obraSocialCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await obraSocial.createObraSocial(getTenantId(req), req.body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.patch(
    '/api/farmacia/obras-sociales/:id',
    pharmacyModule,
    writePermission,
    farmaciaMutationHttpRateLimiter,
    validateBody(obraSocialUpdateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await obraSocial.updateObraSocial(getTenantId(req), idParam(req), req.body)
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

  app.put(
    '/api/farmacia/obras-sociales/:id/coberturas',
    pharmacyModule,
    writePermission,
    farmaciaMutationHttpRateLimiter,
    validateBody(coberturaOsUpsertBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await obraSocial.upsertCobertura(getTenantId(req), idParam(req), req.body)
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
    '/api/farmacia/ventas-os',
    pharmacyModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const parsed = ventaConOsListQuerySchema.safeParse(req.query)
        if (!parsed.success) {
          res.status(400).json({ success: false, error: 'Invalid query parameters' })
          return
        }
        const result = await obraSocial.listVentas(getTenantId(req), parsed.data)
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
    '/api/farmacia/ventas-os',
    pharmacyModule,
    writePermission,
    farmaciaMutationHttpRateLimiter,
    validateBody(ventaConOsCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await obraSocial.createVenta(getTenantId(req), req.body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/farmacia/presentaciones-os',
    pharmacyModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const parsed = presentacionOsListQuerySchema.safeParse(req.query)
        if (!parsed.success) {
          res.status(400).json({ success: false, error: 'Invalid query parameters' })
          return
        }
        const result = await obraSocial.listPresentaciones(
          getTenantId(req),
          parsed.data.obraSocialId,
        )
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
    '/api/farmacia/presentaciones-os',
    pharmacyModule,
    writePermission,
    farmaciaMutationHttpRateLimiter,
    validateBody(presentacionOsCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await obraSocial.createPresentacion(getTenantId(req), req.body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/farmacia/presentaciones-os/:id/export',
    pharmacyModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await obraSocial.exportPresentacionCsv(getTenantId(req), idParam(req))
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${result.data.filename.replace(/"/g, '')}"`,
        )
        res.status(200).send(result.data.csv)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.post(
    '/api/farmacia/presentaciones-os/:id/marcar-presentada',
    pharmacyModule,
    writePermission,
    farmaciaMutationHttpRateLimiter,
    async (req: Request, res: Response) => {
      try {
        const result = await obraSocial.markPresentacionPresentada(getTenantId(req), idParam(req))
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
    '/api/farmacia/presentaciones-os/:id/cobro',
    pharmacyModule,
    writePermission,
    farmaciaMutationHttpRateLimiter,
    validateBody(presentacionOsCobroBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await obraSocial.registerCobro(getTenantId(req), idParam(req), req.body)
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
    '/api/farmacia/presentaciones-os/:id/rechazos',
    pharmacyModule,
    writePermission,
    farmaciaMutationHttpRateLimiter,
    validateBody(presentacionOsRechazoBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await obraSocial.registerRechazo(getTenantId(req), idParam(req), req.body)
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.status(201).json({ success: true, data: result.data })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/farmacia/obras-sociales-cc',
    pharmacyModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await obraSocial.cuentaCorriente(getTenantId(req))
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
}
