import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { CategoriaArticuloService } from '../../../apps/server/services/CategoriaArticuloService'

const now = new Date('2026-07-23T12:00:00.000Z')

const CATEGORIA = {
  id: 1,
  tenantId: 1,
  nombre: 'Indumentaria',
  codigo: 'IND',
  padreId: null as number | null,
  precioDefault: null as Decimal | null,
  activo: true,
  createdAt: now,
  updatedAt: now,
  atributos: [] as unknown[],
  hijos: [] as unknown[],
}

function buildPrisma(overrides: Record<string, unknown> = {}): PrismaClient {
  return {
    categoriaArticulo: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([CATEGORIA]),
      findFirst: vi.fn().mockResolvedValue(CATEGORIA),
      create: vi.fn().mockResolvedValue(CATEGORIA),
      update: vi.fn().mockResolvedValue({ ...CATEGORIA, nombre: 'Ropa' }),
      delete: vi.fn().mockResolvedValue(CATEGORIA),
    },
    categoriaAtributo: {
      create: vi.fn().mockResolvedValue({
        id: 10,
        tenantId: 1,
        categoriaId: 1,
        nombre: 'Color',
        orden: 0,
        valores: [],
      }),
      findFirst: vi.fn().mockResolvedValue({
        id: 10,
        tenantId: 1,
        categoriaId: 1,
        nombre: 'Color',
        orden: 0,
        valores: [],
      }),
      update: vi.fn().mockResolvedValue({
        id: 10,
        tenantId: 1,
        categoriaId: 1,
        nombre: 'Talle',
        orden: 1,
        valores: [],
      }),
      delete: vi.fn().mockResolvedValue({ id: 10 }),
    },
    categoriaAtributoValor: {
      create: vi.fn().mockResolvedValue({ id: 100, atributoId: 10, valor: 'Roja', orden: 0 }),
      findFirst: vi.fn().mockResolvedValue({ id: 100 }),
      delete: vi.fn().mockResolvedValue({ id: 100 }),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('CategoriaArticuloService (#235)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists and gets categories', async () => {
    const prisma = buildPrisma()
    const svc = new CategoriaArticuloService(prisma)
    const listed = await svc.list(1, 50, 0, { padreId: null, activo: true })
    expect(listed.total).toBe(1)
    expect(listed.rows[0]?.nombre).toBe('Indumentaria')

    const got = await svc.getById(1, 1)
    expect(got.ok).toBe(true)
  })

  it('creates, updates and removes empty category', async () => {
    const prisma = buildPrisma({
      categoriaArticulo: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ id: 1 })
          .mockResolvedValueOnce({ id: 1, _count: { articulos: 0, hijos: 0 } }),
        create: vi.fn().mockResolvedValue(CATEGORIA),
        update: vi.fn().mockResolvedValue({ ...CATEGORIA, nombre: 'Ropa' }),
        delete: vi.fn().mockResolvedValue(CATEGORIA),
      },
    })
    const svc = new CategoriaArticuloService(prisma)
    const created = await svc.create(1, {
      nombre: 'Indumentaria',
      codigo: 'IND',
      padreId: null,
      precioDefault: null,
      activo: true,
    })
    expect(created.ok).toBe(true)

    const updated = await svc.update(1, 1, { nombre: 'Ropa' })
    expect(updated.ok).toBe(true)
    if (updated.ok) expect(updated.data.nombre).toBe('Ropa')

    const removed = await svc.remove(1, 1)
    expect(removed.ok).toBe(true)
  })

  it('blocks delete when category has children or articles', async () => {
    const prisma = buildPrisma({
      categoriaArticulo: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          _count: { articulos: 2, hijos: 0 },
        }),
      },
    })
    const svc = new CategoriaArticuloService(prisma)
    const removed = await svc.remove(1, 1)
    expect(removed.ok).toBe(false)
    if (!removed.ok) expect(removed.status).toBe(409)
  })

  it('manages atributos and valores', async () => {
    const prisma = buildPrisma()
    const svc = new CategoriaArticuloService(prisma)
    const attr = await svc.addAtributo(1, 1, {
      nombre: 'Color',
      orden: 0,
      valores: [{ valor: 'Roja', orden: 0 }],
    })
    expect(attr.ok).toBe(true)

    const patched = await svc.patchAtributo(1, 1, 10, { nombre: 'Talle', orden: 1 })
    expect(patched.ok).toBe(true)

    const valor = await svc.addValor(1, 1, 10, { valor: 'Azul', orden: 1 })
    expect(valor.ok).toBe(true)

    const removedValor = await svc.removeValor(1, 1, 10, 100)
    expect(removedValor.ok).toBe(true)

    const removedAttr = await svc.removeAtributo(1, 1, 10)
    expect(removedAttr.ok).toBe(true)
  })
})
