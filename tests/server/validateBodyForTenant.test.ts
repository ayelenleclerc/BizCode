/**
 * @en Body validation follows the tax jurisdiction of the requesting tenant (#440).
 * @es La validación del cuerpo sigue la jurisdicción fiscal del tenant que llama (#440).
 * @pt-BR A validação do corpo segue a jurisdição fiscal do tenant que chama (#440).
 */

import type { NextFunction, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { validateBodyForTenant } from '../../apps/server/middleware/validateBodyForTenant'
import { buildClienteBodySchema } from '../../apps/server/schemas/domain'
import { ValidationAppError } from '../../apps/server/errors/AppError'

const VALID_CUIT = '20123456786'
const VALID_RUT_UY = '012345678908'

function makePrisma(jurisdiccionFiscal: string): PrismaClient {
  return {
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({ jurisdiccionFiscal }),
    },
  } as unknown as PrismaClient
}

function makeReq(body: unknown, authenticated = true): Request {
  const req = { body } as Request & { auth?: unknown; tenantId?: number }
  if (authenticated) {
    req.auth = { claims: { tenantId: 1 } }
    req.tenantId = 1
  }
  return req
}

function makeRes(): Response & { statusCode?: number; payload?: unknown } {
  const res = {
    statusCode: undefined as number | undefined,
    payload: undefined as unknown,
    status(code: number) {
      res.statusCode = code
      return res
    },
    json(body: unknown) {
      res.payload = body
      return res
    },
  }
  return res as unknown as Response & { statusCode?: number; payload?: unknown }
}

function clienteBody(overrides: Record<string, unknown> = {}) {
  return { codigo: 1, rsocial: 'ACME SA', condIva: 'RI', activo: true, ...overrides }
}

describe('validateBodyForTenant (#440)', () => {
  let next: NextFunction & { mock: { calls: unknown[][] } }

  beforeEach(() => {
    next = vi.fn() as unknown as NextFunction & { mock: { calls: unknown[][] } }
  })

  it('rejects unauthenticated requests with 401 before parsing', async () => {
    const res = makeRes()
    const middleware = validateBodyForTenant(makePrisma('AR'), buildClienteBodySchema)

    await middleware(makeReq(clienteBody(), false), res, next)

    expect(res.statusCode).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('accepts an Argentine CUIT for an Argentine tenant', async () => {
    const req = makeReq(clienteBody({ cuit: VALID_CUIT }))
    const middleware = validateBodyForTenant(makePrisma('AR'), buildClienteBodySchema)

    await middleware(req, makeRes(), next)

    expect(next).toHaveBeenCalledWith()
    expect((req.body as { cuit: string }).cuit).toBe(VALID_CUIT)
  })

  it('rejects an Argentine CUIT and its tax condition for a Uruguayan tenant', async () => {
    const middleware = validateBodyForTenant(makePrisma('UY'), buildClienteBodySchema)

    await middleware(makeReq(clienteBody({ cuit: VALID_CUIT })), makeRes(), next)

    const error = next.mock.calls[0][0]
    expect(error).toBeInstanceOf(ValidationAppError)
    expect((error as Error).message).toBe('condIva must be one of: IVA, CF, Exento')
  })

  it('accepts the Uruguayan identifier and tax condition for a Uruguayan tenant', async () => {
    const middleware = validateBodyForTenant(makePrisma('UY'), buildClienteBodySchema)

    await middleware(makeReq(clienteBody({ condIva: 'IVA', cuit: VALID_RUT_UY })), makeRes(), next)

    expect(next).toHaveBeenCalledWith()
  })

  it('forwards an unexpected jurisdiction lookup failure to the error handler', async () => {
    const prisma = {
      tenantConfig: { findUnique: vi.fn().mockRejectedValue(new Error('db down')) },
    } as unknown as PrismaClient
    const middleware = validateBodyForTenant(prisma, buildClienteBodySchema)

    await middleware(makeReq(clienteBody()), makeRes(), next)

    expect((next.mock.calls[0][0] as Error).message).toBe('db down')
  })
})
