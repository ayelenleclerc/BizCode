import type { NextFunction, Request, RequestHandler, Response } from 'express'

/**
 * @en Parses `WEBHOOK_IP_ALLOWLIST` (comma-separated). Empty / unset → no IP filter (#217).
 * @es Parsea `WEBHOOK_IP_ALLOWLIST` (CSV). Vacío / unset → sin filtro IP (#217).
 * @pt-BR Faz parse de `WEBHOOK_IP_ALLOWLIST` (CSV). Vazio / unset → sem filtro IP (#217).
 */
export function parseWebhookIpAllowlist(
  raw: string | undefined = process.env.WEBHOOK_IP_ALLOWLIST,
): Set<string> | null {
  if (!raw?.trim()) {
    return null
  }
  const ips = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  return ips.length > 0 ? new Set(ips) : null
}

/**
 * @en Rejects requests whose `req.ip` is not in `WEBHOOK_IP_ALLOWLIST` when the list is non-empty.
 * @es Rechaza peticiones cuyo `req.ip` no está en `WEBHOOK_IP_ALLOWLIST` si la lista no está vacía.
 * @pt-BR Rejeita requisições cujo `req.ip` não está em `WEBHOOK_IP_ALLOWLIST` se a lista não estiver vazia.
 */
export function webhookIpAllowlistMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const allowlist = parseWebhookIpAllowlist()
  if (!allowlist) {
    next()
    return
  }
  const ip = (req.ip ?? '').trim()
  if (!ip || !allowlist.has(ip)) {
    res.status(403).json({ success: false, error: 'Forbidden' })
    return
  }
  next()
}

/**
 * @en Convenience typed export for route arrays.
 * @es Export tipado de conveniencia para arrays de rutas.
 * @pt-BR Export tipado de conveniência para arrays de rotas.
 */
export const webhookIpAllowlist: RequestHandler = webhookIpAllowlistMiddleware
