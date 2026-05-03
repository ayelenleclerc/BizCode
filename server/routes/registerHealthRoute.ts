import type { Application, Request, Response } from 'express'
import type { RestRouteContext } from './restRouteTypes'

/**
 * @en Liveness endpoint (no auth).
 */
export function registerHealthRoute(app: Application, _ctx: RestRouteContext): void {

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })
}
