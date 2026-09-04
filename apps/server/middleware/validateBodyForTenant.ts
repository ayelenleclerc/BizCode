import type { NextFunction, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import type { FiscalJurisdictionCode } from '@bizcode/types'
import type { z } from 'zod'
import type { AuthenticatedRequest } from '../auth'
import { ValidationAppError } from '../errors/AppError'
import { getTenantJurisdiction } from '../services/tenantJurisdiction'

function firstZodMessage(err: z.ZodError): string {
  const m = err.errors[0]?.message
  return m && m.length > 0 ? m : 'Validation failed'
}

/**
 * @en Parses `req.body` with a schema built for the tax jurisdiction of the requesting tenant (#440),
 *   so validation rules such as the tax identifier algorithm or the accepted tax conditions follow
 *   the country instead of being fixed to Argentina.
 * @es Parsea `req.body` con un esquema construido para la jurisdicción fiscal del tenant que llama
 *   (#440), de modo que reglas como el algoritmo del identificador fiscal o las condiciones fiscales
 *   admitidas sigan al país en vez de quedar fijas en Argentina.
 * @pt-BR Analisa `req.body` com um esquema construído para a jurisdição fiscal do tenant que chama
 *   (#440), de modo que regras como o algoritmo do identificador fiscal ou as condições fiscais
 *   aceitas sigam o país em vez de ficarem fixas na Argentina.
 *
 * @en Unauthenticated requests are rejected with 401 before any parsing, because the jurisdiction
 *   cannot be resolved without a tenant.
 * @es Las peticiones sin autenticar se rechazan con 401 antes de parsear, porque sin tenant no se
 *   puede resolver la jurisdicción.
 * @pt-BR Requisições não autenticadas são rejeitadas com 401 antes de analisar, porque sem tenant
 *   não é possível resolver a jurisdição.
 */
export function validateBodyForTenant<S extends z.ZodTypeAny>(
  prisma: PrismaClient,
  buildSchema: (jurisdiction: FiscalJurisdictionCode) => S,
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    try {
      const tenantId = authReq.tenantId ?? authReq.auth.claims.tenantId
      const jurisdiction = await getTenantJurisdiction(prisma, tenantId)
      const parsed = buildSchema(jurisdiction).safeParse(req.body)
      if (!parsed.success) {
        next(new ValidationAppError(firstZodMessage(parsed.error)))
        return
      }
      req.body = parsed.data as Request['body']
      next()
    } catch (err) {
      next(err)
    }
  }
}
