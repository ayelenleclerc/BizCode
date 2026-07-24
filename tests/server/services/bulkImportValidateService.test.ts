import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { BulkImportValidateService } from '../../../apps/server/services/BulkImportValidateService'

const CLIENTE_CSV = Buffer.from(
  [
    'codigo,rsocial,condIva,activo,fantasia,cuit,domicilio,localidad,cpost,telef,email,creditLimit,creditDays,suspended,deliveryZoneId',
    '1001,Demo SA,RI,true,,,,,,,,,,,,,,',
    '1001,Dup SA,RI,true,,,,,,,,,,,,,,',
    'bad,NoCode,RI,true,,,,,,,,,,,,,,',
  ].join('\n'),
  'utf8',
)

const ARTICULO_CSV = Buffer.from(
  [
    'codigo,descripcion,rubroCodigo,condIva,umedida,precioLista1,precioLista2,costo,stock,minimo,activo',
    '100,Producto,10,1,UN,10,9,5,1,0,true',
  ].join('\n'),
  'utf8',
)

const PROVEEDOR_CSV = Buffer.from(
  [
    'codigo,rsocial,condIva,activo,fantasia,cuit,telef,email',
    '2001,Prov SA,RI,true,,,,',
  ].join('\n'),
  'utf8',
)

const SALDO_CSV = Buffer.from(
  ['codigo,clienteId,importe,fecha,concepto', '1001,,1500.5,2026-01-01,Inicial'].join('\n'),
  'utf8',
)

describe('BulkImportValidateService (#238)', () => {
  let prisma: PrismaClient
  let service: BulkImportValidateService

  beforeEach(() => {
    prisma = {
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
      },
      articulo: { findMany: vi.fn().mockResolvedValue([]) },
      proveedor: { findMany: vi.fn().mockResolvedValue([]) },
      rubro: { findMany: vi.fn().mockResolvedValue([{ id: 1, codigo: 10 }]) },
      movimientoClienteCC: { findFirst: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaClient
    service = new BulkImportValidateService(prisma)
  })

  it('returns headers per entity', () => {
    expect(service.headersFor('clientes')[0]).toBe('codigo')
    expect(service.headersFor('articulos')[0]).toBe('codigo')
    expect(service.headersFor('proveedores')[0]).toBe('codigo')
    expect(service.headersFor('saldos')).toContain('importe')
  })

  it('validates clientes with in-file duplicates and row errors', async () => {
    const result = await service.validateFile(1, 'clientes', CLIENTE_CSV, 'c.csv', 'skip')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.totalRows).toBe(3)
    expect(result.data.okCount).toBe(1)
    expect(result.data.errorCount).toBeGreaterThanOrEqual(1)
    expect(result.data.issues.some((i) => i.code === 'DUPLICATE_IN_FILE')).toBe(true)
  })

  it('marks DB duplicates for clientes when duplicateMode=skip', async () => {
    vi.mocked(prisma.cliente.findMany).mockResolvedValue([{ codigo: 1001 }] as never)
    const csv = Buffer.from(
      [
        'codigo,rsocial,condIva,activo,fantasia,cuit,domicilio,localidad,cpost,telef,email,creditLimit,creditDays,suspended,deliveryZoneId',
        '1001,Demo SA,RI,true,,,,,,,,,,,,,,',
      ].join('\n'),
      'utf8',
    )
    const result = await service.validateFile(1, 'clientes', csv, 'c.csv', 'skip')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.duplicateCount).toBe(1)
    expect(result.data.okCount).toBe(0)
  })

  it('validates articulos, proveedores and saldos happy paths', async () => {
    vi.mocked(prisma.cliente.findFirst).mockResolvedValue({ id: 9, codigo: 1001 } as never)
    const art = await service.validateFile(1, 'articulos', ARTICULO_CSV, 'a.csv', 'skip')
    const prov = await service.validateFile(1, 'proveedores', PROVEEDOR_CSV, 'p.csv', 'skip')
    const sal = await service.validateFile(1, 'saldos', SALDO_CSV, 's.csv', 'skip')
    expect(art.ok && art.data.okCount).toBe(1)
    expect(prov.ok && prov.data.okCount).toBe(1)
    expect(sal.ok && sal.data.okCount).toBe(1)
  })

  it('returns 400 on unreadable file', async () => {
    const result = await service.validateFile(1, 'clientes', Buffer.from('not-csv'), 'x.bin', 'skip')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.status).toBe(400)
  })
})
