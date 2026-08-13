import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'
import { deriveCreditNivel, deriveStockEstado } from '../../apps/server/services/SellerAlertService'

const CLIENTE = {
  id: 2,
  creditLimit: { toString: () => '1000.00' },
  creditDays: 30,
}

const ARTICULO_ROWS = [
  { id: 10, stock: { toString: () => '5' }, minimo: { toString: () => '2' } },
  { id: 11, stock: { toString: () => '0' }, minimo: { toString: () => '1' } },
]

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: {
      findFirst: vi.fn().mockResolvedValue(CLIENTE),
    },
    movimientoClienteCC: {
      findFirst: vi.fn().mockResolvedValue({
        saldoPost: { toString: () => '200.00', greaterThan: (x: { toString: () => string }) => Number(200) > Number(x.toString()) },
      }),
    },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    reciboCobroImputacion: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    articulo: {
      findMany: vi.fn().mockResolvedValue(ARTICULO_ROWS),
    },
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({
        sellerCreditOverLimitAction: 'block',
        sellerCreditOverdueAction: 'warn',
        sellerStockZeroAction: 'warn',
        sellerStockCapQtyToAvailable: true,
        sellerWhatsappTemplate: null,
      }),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('deriveCreditNivel / deriveStockEstado', () => {
  it('maps credit levels', () => {
    expect(deriveCreditNivel({ deudaTotal: 0, deudaVencida: 0, disponible: 100, excedeLimite: false })).toBe('ok')
    expect(deriveCreditNivel({ deudaTotal: 50, deudaVencida: 0, disponible: 50, excedeLimite: false })).toBe('amarillo')
    expect(deriveCreditNivel({ deudaTotal: 50, deudaVencida: 10, disponible: 50, excedeLimite: false })).toBe('naranja')
    expect(deriveCreditNivel({ deudaTotal: 120, deudaVencida: 0, disponible: -20, excedeLimite: true })).toBe('rojo')
  })

  it('maps stock estados', () => {
    expect(deriveStockEstado(5, 2)).toBe('ok')
    expect(deriveStockEstado(2, 2)).toBe('bajo')
    expect(deriveStockEstado(0, 2)).toBe('cero')
  })
})

describe('seller alert APIs (#256)', () => {
  beforeEach(() => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    process.env.BIZCODE_TEST_USER_ID = '1'
    process.env.BIZCODE_TEST_TENANT_ID = '1'
  })

  it('GET estado-credito matches OpenAPI', async () => {
    const prisma = buildPrismaMock()
    // ClienteCuentaCorrienteService.getSaldo uses Decimal-like; simplify via service path
    const Decimal = (await import('@prisma/client/runtime/library')).Decimal
    ;(prisma.cliente.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 2,
      creditLimit: new Decimal(1000),
      creditDays: 30,
    })
    ;(prisma.movimientoClienteCC.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      saldoPost: new Decimal(200),
    })

    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/2/estado-credito')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.nivel).toBe('amarillo')
    assertMatchesOpenApi('/api/clientes/{id}/estado-credito', 'get', '200', res.body)
  })

  it('GET stock-multiple matches OpenAPI', async () => {
    const Decimal = (await import('@prisma/client/runtime/library')).Decimal
    const prisma = buildPrismaMock({
      articulo: {
        findMany: vi.fn().mockResolvedValue([
          { id: 10, stock: new Decimal(5), minimo: new Decimal(2) },
          { id: 11, stock: new Decimal(0), minimo: new Decimal(1) },
        ]),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos/stock-multiple?ids=10,11')
    expect(res.status).toBe(200)
    expect(res.body.data.items).toHaveLength(2)
    assertMatchesOpenApi('/api/articulos/stock-multiple', 'get', '200', res.body)
  })

  it('GET seller-policies matches OpenAPI', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/tenant-config/seller-policies')
    expect(res.status).toBe(200)
    assertMatchesOpenApi('/api/tenant-config/seller-policies', 'get', '200', res.body)
  })

  it('PATCH seller-policies requires manager permission', async () => {
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const app = createApp(buildPrismaMock())
    const forbidden = await request(app)
      .patch('/api/tenant-config/seller-policies')
      .send({ sellerStockZeroAction: 'block' })
    expect(forbidden.status).toBe(403)

    process.env.BIZCODE_TEST_ROLE = 'owner'
    const ok = await request(app)
      .patch('/api/tenant-config/seller-policies')
      .send({ sellerStockZeroAction: 'block' })
    expect(ok.status).toBe(200)
    assertMatchesOpenApi('/api/tenant-config/seller-policies', 'patch', '200', ok.body)

    const template = await request(app)
      .patch('/api/tenant-config/seller-policies')
      .send({ sellerWhatsappTemplate: 'Hola {{numero}} {{total}}' })
    expect(template.status).toBe(200)
    assertMatchesOpenApi('/api/tenant-config/seller-policies', 'patch', '200', template.body)
  })

  it('rejects invalid stock-multiple ids', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/articulos/stock-multiple?ids=abc')
    expect(res.status).toBe(400)
  })
})
