/**
 * Integración HTTP + Prisma real (PostgreSQL). Requiere `DATABASE_URL` y esquema aplicado (`prisma migrate deploy`).
 * En CI: ver `.github/workflows/ci.yml`. Local: mismo `DATABASE_URL` que en `.env` (p. ej. Docker Desktop).
 */
import 'dotenv/config'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import type { Application } from 'express'
import { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

async function truncateAll(prisma: PrismaClient): Promise<void> {
  // Use Prisma model operations to avoid coupling tests to physical table naming/casing.
  await prisma.$transaction([
    prisma.facturaItem.deleteMany(),
    prisma.factura.deleteMany(),
    prisma.articulo.deleteMany(),
    prisma.cliente.deleteMany(),
    prisma.rubro.deleteMany(),
    prisma.formaPago.deleteMany(),
    prisma.paramEmpresa.deleteMany(),
  ])
}

describe('API — integración PostgreSQL (Prisma real)', () => {
  let prisma: PrismaClient
  let app: Application

  beforeAll(async () => {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error(
        'DATABASE_URL no está definida. Para pruebas locales: configura .env o exporta DATABASE_URL apuntando a tu PostgreSQL (p. ej. Docker).',
      )
    }
    prisma = new PrismaClient()
    app = createApp(prisma)
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await truncateAll(prisma)
  })

  it('GET /api/health responde sin tocar la base', async () => {
    const res = await request(app).get('/api/health').expect(200)
    expect(res.body).toMatchObject({ status: 'ok' })
    expect(typeof res.body.timestamp).toBe('string')
  })

  it('GET /api/clientes con tabla vacía devuelve lista vacía', async () => {
    const res = await request(app).get('/api/clientes').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toEqual([])
  })

  it('POST /api/clientes persiste y GET /api/clientes/:id lee desde PostgreSQL', async () => {
    // `condIva` en BD es VARCHAR(1) (ver prisma/schema); el cuerpo debe caber en columna real.
    const createRes = await request(app)
      .post('/api/clientes')
      .send({
        codigo: 42,
        rsocial: 'Cliente integración SA',
        condIva: 'R',
        activo: true,
      })
      .expect(200)

    expect(createRes.body.success).toBe(true)
    const id = createRes.body.data.id as number
    expect(id).toBeGreaterThan(0)

    const getRes = await request(app).get(`/api/clientes/${id}`).expect(200)
    expect(getRes.body.success).toBe(true)
    expect(getRes.body.data).toMatchObject({
      id,
      codigo: 42,
      rsocial: 'Cliente integración SA',
      condIva: 'R',
    })
  })
})
