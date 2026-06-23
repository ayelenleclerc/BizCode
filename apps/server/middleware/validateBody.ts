import type { NextFunction, Request, Response } from 'express'
import type { z } from 'zod'
import { ValidationAppError } from '../errors/AppError'

function firstZodMessage(err: z.ZodError): string {
  const m = err.errors[0]?.message
  return m && m.length > 0 ? m : 'Validation failed'
}

/**
 * @en Parses `req.body` with a Zod schema; on failure forwards `ValidationAppError` to the error handler.
 * @es Parsea `req.body` con Zod; si falla, delega `ValidationAppError` al manejador de errores.
 */
export function validateBody<S extends z.ZodTypeAny>(schema: S) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      next(new ValidationAppError(firstZodMessage(parsed.error)))
      return
    }
    req.body = parsed.data as Request['body']
    next()
  }
}
