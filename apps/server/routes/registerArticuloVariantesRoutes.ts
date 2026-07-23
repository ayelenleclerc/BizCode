import type { Application, Request, Response } from 'express'
import multer from 'multer'
import type {
  ArticuloOfertaCreateInput,
  ArticuloOfertaPatchInput,
  GenerarVariantesInput,
} from '@bizcode/types'
import { requireAnyPermission, requirePermission, type AuthenticatedRequest } from '../auth'
import { requireModule } from '../middleware/requireModule'
import { validateBody } from '../middleware/validateBody'
import {
  articuloImagenReorderBodySchema,
  articuloOfertaCreateBodySchema,
  articuloOfertaPatchBodySchema,
  generarVariantesBodySchema,
  precioCatalogoEfectivoQuerySchema,
  safeParseBodySchema,
} from '../schemas/domain'
import { errorMessage, getTenantId } from './restDomainShared'
import type { RestRouteContext } from './restRouteTypes'

function pathId(req: Request, key = 'id'): number {
  return Number.parseInt(String(req.params[key]), 10)
}

const imagenUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
})

/**
 * @en Variant, offer and image REST endpoints under articles (#235).
 * @es Endpoints REST de variantes, ofertas e imágenes bajo artículos (#235).
 * @pt-BR Endpoints REST de variantes, ofertas e imagens sob artigos (#235).
 */
export function registerArticuloVariantesRoutes(app: Application, ctx: RestRouteContext): void {
  const { articuloVariante } = ctx.services
  const variantsModule = requireModule('catalog.variants')
  const readPermission = requireAnyPermission('products.read', 'products.manage')
  const writePermission = requirePermission('products.manage')

  app.get(
    '/api/articulos/precio-catalogo-efectivo',
    variantsModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const parsed = safeParseBodySchema(precioCatalogoEfectivoQuerySchema, req.query)
        if (!parsed.ok) {
          res.status(400).json({ success: false, error: parsed.error })
          return
        }
        const result = await articuloVariante.resolvePrecioCatalogo(
          getTenantId(req),
          parsed.value.articuloId,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json(result.data)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/articulos/:id/variantes',
    variantsModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await articuloVariante.listVariantes(getTenantId(req), pathId(req))
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
    '/api/articulos/:id/variantes/generar',
    variantsModule,
    writePermission,
    validateBody(generarVariantesBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await articuloVariante.generarVariantes(
          getTenantId(req),
          pathId(req),
          req.body as GenerarVariantesInput,
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        await ctx.writeAudit(
          req as AuthenticatedRequest,
          'generate',
          'articulo_variantes',
          String(pathId(req)),
          { creadas: result.data.creadas },
        )
        res.status(201).json(result.data)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/articulos/:id/stock-familia',
    variantsModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await articuloVariante.stockFamilia(getTenantId(req), pathId(req))
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json(result.data)
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/articulos/:id/ofertas',
    variantsModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await articuloVariante.listOfertas(getTenantId(req), pathId(req))
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
    '/api/articulos/:id/ofertas',
    variantsModule,
    writePermission,
    validateBody(articuloOfertaCreateBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await articuloVariante.createOferta(
          getTenantId(req),
          pathId(req),
          req.body as ArticuloOfertaCreateInput & { activa: boolean },
        )
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
    '/api/articulos/:id/ofertas/:ofertaId',
    variantsModule,
    writePermission,
    validateBody(articuloOfertaPatchBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await articuloVariante.updateOferta(
          getTenantId(req),
          pathId(req),
          pathId(req, 'ofertaId'),
          req.body as ArticuloOfertaPatchInput,
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

  app.delete(
    '/api/articulos/:id/ofertas/:ofertaId',
    variantsModule,
    writePermission,
    async (req: Request, res: Response) => {
      try {
        const result = await articuloVariante.removeOferta(
          getTenantId(req),
          pathId(req),
          pathId(req, 'ofertaId'),
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )

  app.get(
    '/api/articulos/:id/imagenes',
    variantsModule,
    readPermission,
    async (req: Request, res: Response) => {
      try {
        const result = await articuloVariante.listImagenes(getTenantId(req), pathId(req))
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
    '/api/articulos/:id/imagenes',
    variantsModule,
    writePermission,
    imagenUpload.single('file'),
    async (req: Request, res: Response) => {
      try {
        const file = req.file
        if (!file) {
          res.status(400).json({ success: false, error: 'Expected multipart field "file"' })
          return
        }
        const result = await articuloVariante.uploadImagen(getTenantId(req), pathId(req), {
          buffer: file.buffer,
          mimetype: file.mimetype,
          originalname: file.originalname,
        })
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

  app.put(
    '/api/articulos/:id/imagenes/orden',
    variantsModule,
    writePermission,
    validateBody(articuloImagenReorderBodySchema),
    async (req: Request, res: Response) => {
      try {
        const result = await articuloVariante.reorderImagenes(
          getTenantId(req),
          pathId(req),
          (req.body as { ordenIds: number[] }).ordenIds,
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

  app.delete(
    '/api/articulos/:id/imagenes/:imagenId',
    variantsModule,
    writePermission,
    async (req: Request, res: Response) => {
      try {
        const result = await articuloVariante.removeImagen(
          getTenantId(req),
          pathId(req),
          pathId(req, 'imagenId'),
        )
        if (!result.ok) {
          res.status(result.status).json({ success: false, error: result.error })
          return
        }
        res.json({ success: true })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
