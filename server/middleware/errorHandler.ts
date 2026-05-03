import type { NextFunction, Request, Response } from 'express'
import type { AuthenticatedRequest } from '../auth'
import { AppError } from '../errors/AppError'
import { logger } from '../logger'

/**
 * @en Express error middleware; preserves API envelope `{ success: false, error: string }`.
 * @es Middleware de errores Express; preserva `{ success: false, error: string }`.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (res.headersSent) {
    return
  }

  const requestId =
    typeof req.requestId === 'string' ? req.requestId : undefined
  const authReq = req as AuthenticatedRequest
  const userId = authReq.auth?.claims.userId

  if (err instanceof AppError) {
    logger.warn(
      {
        requestId,
        userId,
        path: req.path,
        httpStatus: err.statusCode,
        code: err.code,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
      err.message,
    )
    res.status(err.statusCode).json({ success: false, error: err.message })
    return
  }

  const message = err instanceof Error ? err.message : String(err)
  logger.error(
    {
      requestId,
      userId,
      path: req.path,
      err: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
    },
    'Unhandled error',
  )

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
  })
}
