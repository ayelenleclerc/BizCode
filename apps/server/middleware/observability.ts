import type { NextFunction, Request, Response } from 'express'
import { logger } from '../logger'
import type { AuthenticatedRequest } from '../auth'

type CounterMap = Record<string, number>

type ObservabilityState = {
  startedAtMs: number
  totalRequests: number
  totalDurationMs: number
  errors4xx: number
  errors5xx: number
  requestsByMethod: CounterMap
  responsesByStatus: CounterMap
  requestsByRoute: CounterMap
}

const ROUTE_UUID_RE = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i
const ROUTE_NUMBER_RE = /^\d+$/
const ROUTE_HEX_RE = /^[\da-f]{16,}$/i

const state: ObservabilityState = {
  startedAtMs: Date.now(),
  totalRequests: 0,
  totalDurationMs: 0,
  errors4xx: 0,
  errors5xx: 0,
  requestsByMethod: {},
  responsesByStatus: {},
  requestsByRoute: {},
}

function increment(map: CounterMap, key: string): void {
  map[key] = (map[key] ?? 0) + 1
}

function normalizePath(path: string): string {
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) {
    return '/'
  }
  const normalized = segments.map((segment) => {
    if (ROUTE_NUMBER_RE.test(segment)) return ':id'
    if (ROUTE_UUID_RE.test(segment)) return ':uuid'
    if (ROUTE_HEX_RE.test(segment)) return ':id'
    return segment
  })
  return `/${normalized.join('/')}`
}

function resolveRouteTemplate(req: Request): string {
  const routePath = req.route?.path
  if (typeof routePath === 'string') {
    const base = req.baseUrl ?? ''
    const merged = `${base}${routePath}` || req.path
    return normalizePath(merged)
  }
  return normalizePath(req.path)
}

export function resetObservabilityStateForTests(): void {
  state.startedAtMs = Date.now()
  state.totalRequests = 0
  state.totalDurationMs = 0
  state.errors4xx = 0
  state.errors5xx = 0
  state.requestsByMethod = {}
  state.responsesByStatus = {}
  state.requestsByRoute = {}
}

export function getAppVersion(): string | undefined {
  return process.env.npm_package_version
}

export function getObservabilitySnapshot() {
  const uptimeSeconds = Math.max(0, Math.floor((Date.now() - state.startedAtMs) / 1000))
  const averageDurationMs = state.totalRequests > 0 ? Number((state.totalDurationMs / state.totalRequests).toFixed(2)) : 0
  return {
    startedAt: new Date(state.startedAtMs).toISOString(),
    uptimeSeconds,
    appEnv: process.env.NODE_ENV ?? 'development',
    appVersion: getAppVersion(),
    totals: {
      requests: state.totalRequests,
      errors4xx: state.errors4xx,
      errors5xx: state.errors5xx,
      averageDurationMs,
    },
    requestsByMethod: { ...state.requestsByMethod },
    responsesByStatus: { ...state.responsesByStatus },
    requestsByRoute: { ...state.requestsByRoute },
  }
}

export function isMetricsEnabled(): boolean {
  return (process.env.METRICS_ENABLED ?? 'true').toLowerCase() !== 'false'
}

export function observabilityMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint()

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000
    const statusCode = res.statusCode
    const method = req.method.toUpperCase()
    const route = resolveRouteTemplate(req)

    state.totalRequests += 1
    state.totalDurationMs += durationMs
    if (statusCode >= 400 && statusCode < 500) state.errors4xx += 1
    if (statusCode >= 500) state.errors5xx += 1
    increment(state.requestsByMethod, method)
    increment(state.responsesByStatus, String(statusCode))
    increment(state.requestsByRoute, route)

    const authReq = req as AuthenticatedRequest
    const tenantId = authReq.tenantId
    const userId = authReq.auth?.claims.userId

    logger.info(
      {
        requestId: req.requestId,
        ...(tenantId !== undefined ? { tenantId } : {}),
        ...(userId !== undefined ? { userId } : {}),
        method,
        path: route,
        statusCode,
        durationMs: Number(durationMs.toFixed(2)),
      },
      'HTTP request',
    )
  })

  next()
}
