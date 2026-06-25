import type { Application, Request, Response } from 'express'
import { requirePermission } from '../auth'
import { validateBody } from '../middleware/validateBody'
import { printingTestBodySchema } from '../schemas/domain'
import type { PrintingTestInput } from '@bizcode/types'
import {
  getPrintingStatus,
  runPrintingTest,
} from '../services/FacturaPrintService'
import { errorMessage } from './restDomainShared'

/**
 * @en Printing device status and mock test routes (phase 1, no hardware).
 * @es Rutas de estado y prueba mock de dispositivos de impresión (fase 1, sin hardware).
 * @pt-BR Rotas de status e teste mock de dispositivos de impressão (fase 1, sem hardware).
 */
export function registerPrintingRoutes(app: Application): void {
  app.get(
    '/api/printing/status',
    requirePermission('settings.business.manage'),
    (_req: Request, res: Response) => {
      res.json({ success: true, data: getPrintingStatus() })
    },
  )

  app.post(
    '/api/printing/test',
    requirePermission('settings.business.manage'),
    validateBody(printingTestBodySchema),
    async (req: Request, res: Response) => {
      try {
        const body = req.body as PrintingTestInput
        const result = await runPrintingTest(body.device)
        res.json({ success: true, data: result })
      } catch (err: unknown) {
        res.status(500).json({ success: false, error: errorMessage(err) })
      }
    },
  )
}
