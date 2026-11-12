/**
 * @en FCEM MiPyME API tests (homologación mock, #239).
 * @es Tests API FCEM MiPyME (mock homologación, #239).
 * @pt-BR Testes API FCEM MiPyME (mock homologação, #239).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { FCEM_DEFAULT_UMBRAL_ARS } from '@bizcode/types'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const facturaRow = {
    id: 9,
    total: FCEM_DEFAULT_UMBRAL_ARS,
    tipo: 'A',
    estadoCae: 'pending',
    cae: null,
    caeVto: null,
    fcemEstado: null,
    fcemTipoCbte: null,
    fcemPlazoPagoDias: null,
    fcemRejectReason: null,
    fcemEmittedAt: null,
    fcemResolvedAt: null,
    cliente: { condIva: 'RI', creditDays: 45 },
  }
  return {
    deliveryZone: { findMany: vi.fn().mockResolvedValue([]) },
    cliente: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(facturaRow),
      update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
        ...facturaRow,
        ...data,
      })),
    },
    tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({ jurisdiccionFiscal: 'AR' }),
    },
    fiscalProviderConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockResolvedValue({ id: 1 }),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    fiscalDocument: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
    },
    paramEmpresa: {
      findUnique: vi.fn().mockResolvedValue({
        nombre: 'Demo',
        cuit: '30123456789',
        domicilio: '',
        esMipyme: true,
        fcemUmbralMonto: null,
      }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appUser: { count: vi.fn().mockResolvedValue(1) },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('FCEM API (#239)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('GET /api/fcem/facturas/:id evaluates detection and matches OpenAPI', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/fcem/facturas/9').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.detection.required).toBe(true)
    expect(res.body.data.detection.fcemTipoCbte).toBe(201)
    await assertMatchesOpenApi('/api/fcem/facturas/{facturaId}', 'get', '200', res.body)
  })

  it('POST emitir issues mock CAE and sets pendiente_aceptacion', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/fcem/facturas/9/emitir').expect(200)
    expect(res.body.data.fcemEstado).toBe('pendiente_aceptacion')
    expect(res.body.data.cae).toMatch(/^\d{14}$/)
    await assertMatchesOpenApi('/api/fcem/facturas/{facturaId}/emitir', 'post', '200', res.body)
  })

  it('POST emitir returns 422 when not MiPyME', async () => {
    const app = createApp(
      buildPrismaMock({
        paramEmpresa: {
          findUnique: vi.fn().mockResolvedValue({
            esMipyme: false,
            fcemUmbralMonto: null,
          }),
        },
      }),
    )
    const res = await request(app).post('/api/fcem/facturas/9/emitir').expect(422)
    expect(res.body.error).toBe('FCEM_NOT_REQUIRED')
  })
})
