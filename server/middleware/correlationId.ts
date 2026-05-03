import { randomUUID } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'

const REQ_ID_HEADER = 'x-request-id'

function normalizeIncomingId(raw: string | undefined): string | undefined {
  if (!raw) {
    return undefined
  }
  const trimmed = raw.trim()
  if (trimmed.length === 0 || trimmed.length > 128) {
    return undefined
  }
  return trimmed
}

/**
 * @en Attaches `req.requestId` and echoes `X-Request-Id` on the response for traceability.
 * @es Adjunta `req.requestId` y devuelve `X-Request-Id` en la respuesta.
 * @pt-BR Anexa `req.requestId` e devolve `X-Request-Id` na resposta.
 */
export function correlationId(req: Request, res: Response, next: NextFunction): void {
  const fromHeaderRaw = req.headers[REQ_ID_HEADER]
  const fromHeader =
    normalizeIncomingId(
      typeof fromHeaderRaw === 'string' ? fromHeaderRaw : Array.isArray(fromHeaderRaw) ? fromHeaderRaw[0] : undefined,
    ) ?? undefined
  const id = fromHeader ?? randomUUID()
  req.requestId = id
  res.setHeader('X-Request-Id', id)
  next()
}
