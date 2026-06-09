import type { Application, Request, Response } from 'express'
import type { RestRouteContext } from './restRouteTypes'
import { getAppVersion } from '../middleware/observability'

/**
 * @en Liveness endpoint (no auth).
 */
export function registerHealthRoute(app: Application, ctx: RestRouteContext): void {
  app.get('/api/health', async (_req: Request, res: Response) => {
    const dbStartedAt = process.hrtime.bigint()
    let dbOk = true
    try {
      await ctx.prisma.$queryRawUnsafe('SELECT 1')
    } catch {
      dbOk = false
    }
    const dbLatencyMs = Number(process.hrtime.bigint() - dbStartedAt) / 1_000_000
    res.json({
      status: dbOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      db: {
        ok: dbOk,
        latencyMs: Number(dbLatencyMs.toFixed(2)),
      },
      uptimeSeconds: Number(process.uptime().toFixed(2)),
      ...(getAppVersion() ? { version: getAppVersion() } : {}),
    })
  })
}
