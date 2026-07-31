import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { BancoExtractoService } from '../../../apps/server/services/BancoExtractoService'
import { DEFAULT_BANCO_CSV_MAPPINGS } from '../../../apps/server/services/bancos/defaultCsvMappings'
import { detectExtractoFormat } from '../../../apps/server/services/bancos/detectFormat'
import { parseCsvExtracto } from '../../../apps/server/services/bancos/parseCsvExtracto'
import { parseMt940Extracto } from '../../../apps/server/services/bancos/parseMt940'
import { parseOfxExtracto } from '../../../apps/server/services/bancos/parseOfx'
import { buildMovimientoDedupeKey } from '../../../apps/server/services/bancos/dedupeKey'

const fixtures = join(process.cwd(), 'tests/fixtures/bancos')

describe('bank extracto parsers (#190)', () => {
  it('detects CSV OFX and MT940', () => {
    expect(detectExtractoFormat('a.csv', 'Fecha;Importe')).toBe('csv')
    expect(detectExtractoFormat('a.ofx', 'OFXHEADER:100')).toBe('ofx')
    expect(detectExtractoFormat('a.sta', ':20:START\n:25:1\n:61:2401010101C1,00')).toBe('mt940')
  })

  it('parses Galicia and Santander CSV fixtures', () => {
    const galicia = DEFAULT_BANCO_CSV_MAPPINGS.find((m) => m.bancoCode === 'galicia')!
    const santander = DEFAULT_BANCO_CSV_MAPPINGS.find((m) => m.bancoCode === 'santander')!
    const g = parseCsvExtracto(readFileSync(join(fixtures, 'galicia-sample.csv'), 'utf8'), galicia)
    const s = parseCsvExtracto(readFileSync(join(fixtures, 'santander-sample.csv'), 'utf8'), santander)
    expect(g.ok).toBe(true)
    expect(s.ok).toBe(true)
    if (!g.ok || !s.ok) return
    expect(g.movimientos).toHaveLength(3)
    expect(g.movimientos[0]?.tipo).toBe('credito')
    expect(g.movimientos[1]?.tipo).toBe('debito')
    expect(s.movimientos[0]?.importe).toBe('85000.00')
  })

  it('parses OFX and MT940 fixtures', () => {
    const ofx = parseOfxExtracto(readFileSync(join(fixtures, 'sample.ofx'), 'utf8'))
    const mt = parseMt940Extracto(readFileSync(join(fixtures, 'sample.mt940'), 'utf8'))
    expect(ofx.ok).toBe(true)
    expect(mt.ok).toBe(true)
    if (!ofx.ok || !mt.ok) return
    expect(ofx.movimientos).toHaveLength(2)
    expect(mt.movimientos).toHaveLength(2)
    expect(mt.movimientos[0]?.descripcion).toContain('CREDIT')
  })

  it('builds stable dedupe keys', () => {
    const a = buildMovimientoDedupeKey({
      fechaIso: '2026-01-15',
      importe: '10.00',
      tipo: 'credito',
      referencia: 'R1',
      descripcion: 'x',
    })
    const b = buildMovimientoDedupeKey({
      fechaIso: '2026-01-15',
      importe: '10.00',
      tipo: 'credito',
      referencia: 'R1',
      descripcion: 'x',
    })
    expect(a).toBe(b)
    expect(a).toHaveLength(64)
  })
})

describe('BancoExtractoService (#190)', () => {
  let prisma: PrismaClient
  let service: BancoExtractoService
  const createdKeys = new Set<string>()

  beforeEach(() => {
    createdKeys.clear()
    const mappings = DEFAULT_BANCO_CSV_MAPPINGS.map((m, i) => ({
      id: i + 1,
      tenantId: 1,
      ...m,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
    prisma = {
      bancoCsvMapping: {
        upsert: vi.fn().mockResolvedValue({}),
        findMany: vi.fn().mockResolvedValue(mappings),
        findFirst: vi.fn().mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
          if (where.bancoCode) {
            return mappings.find((m) => m.bancoCode === where.bancoCode) ?? null
          }
          if (where.id) return mappings.find((m) => m.id === where.id) ?? null
          return mappings[0] ?? null
        }),
        create: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
          id: 99,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        update: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
          id: 1,
          tenantId: 1,
          bancoCode: 'galicia',
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      },
      cuentaBancaria: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue({
          id: 7,
          tenantId: 1,
          banco: 'galicia',
          tipoCuenta: 'corriente',
          cbu: '1234567890123456789012',
          alias: null,
          moneda: 'ARS',
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        create: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
          id: 1,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        update: vi.fn(),
      },
      movimientoBancario: {
        findMany: vi.fn().mockImplementation(async ({ where }: { where?: { dedupeKey?: { in: string[] } } }) => {
          const keys = where?.dedupeKey?.in ?? []
          return keys.filter((k) => createdKeys.has(k)).map((dedupeKey) => ({ dedupeKey }))
        }),
        createMany: vi.fn().mockImplementation(async ({ data }: { data: Array<{ dedupeKey: string }> }) => {
          for (const row of data) createdKeys.add(row.dedupeKey)
          return { count: data.length }
        }),
        count: vi.fn().mockResolvedValue(0),
      },
    } as unknown as PrismaClient
    service = new BancoExtractoService(prisma)
  })

  it('imports Galicia CSV and skips duplicates on re-import', async () => {
    const buffer = readFileSync(join(fixtures, 'galicia-sample.csv'))
    const first = await service.importExtracto(1, 7, { buffer, originalname: 'galicia.csv' }, { bancoCode: 'galicia' })
    expect(first.ok).toBe(true)
    if (!first.ok) return
    expect(first.data.imported).toBe(3)
    expect(first.data.skippedDuplicates).toBe(0)

    const second = await service.importExtracto(1, 7, { buffer, originalname: 'galicia.csv' }, { bancoCode: 'galicia' })
    expect(second.ok).toBe(true)
    if (!second.ok) return
    expect(second.data.imported).toBe(0)
    expect(second.data.skippedDuplicates).toBe(3)
  })

  it('rejects invalid CBU on create', async () => {
    const res = await service.createCuenta(1, {
      banco: 'Galicia',
      tipoCuenta: 'corriente',
      cbu: '123',
    })
    expect(res).toMatchObject({ ok: false, status: 400 })
  })
})
