/**
 * @en Express middleware that records HTTP 403 responses for burst detection (#221).
 * @es Middleware Express que registra respuestas HTTP 403 para detección de ráfagas (#221).
 * @pt-BR Middleware Express que registra respostas HTTP 403 para detecção de rajadas (#221).
 */

import type { NextFunction, Request, Response } from 'express'
import { recordForbiddenResponse } from './forbiddenBurstCounter'

/**
 * @en Attaches a finish listener; does not alter status codes or latency path beyond a light listener.
 * @es Adjunta un listener finish; no altera códigos de estado ni la latencia más allá del listener.
 * @pt-BR Anexa um listener finish; não altera códigos de status nem a latência além do listener.
 */
export function forbiddenBurstMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on('finish', () => {
      if (res.statusCode === 403) {
        recordForbiddenResponse(req.ip)
      }
    })
    next()
  }
}
