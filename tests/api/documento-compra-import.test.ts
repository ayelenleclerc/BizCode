import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../../server/createApp'
import { createEmptyDocumentoCompraPreview } from '../../server/lib/documentoCompraTypes'

const preview = createEmptyDocumentoCompraPreview()

function buildPrisma() {
  const docBase = {
    id: 1,
    tenantId: 1,
    usuarioId: 1,
    archivoNombre: 'factura.pdf',
    archivoMime: 'application/pdf',
    archivoPath: '1/1/factura.pdf',
    tipoArchivo: 'pdf',
    tier: 0,
    confianza: 0,
    estado: 'pendiente_revision',
    datosExtraidos: preview,
    comprobanteCompraId: null,
    errores: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  return {
    documentoCompraImportado: {
      create: vi.fn().mockResolvedValue({ ...docBase, estado: 'procesando', archivoPath: '' }),
      update: vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({ ...docBase, ...data }),
      ),
      findFirst: vi.fn().mockResolvedValue(docBase),
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([docBase]),
    },
    comprobanteCompra: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({
        id: 42,
        tenantId: 1,
        proveedorId: 1,
        ordenCompraId: null,
        fecha: new Date('2026-05-10T12:00:00.000Z'),
        tipo: 'B',
        prefijo: '0001',
        numero: 7,
        neto1: 100,
        neto2: 0,
        neto3: 0,
        iva1: 21,
        iva2: 0,
        total: 121,
        cae: null,
        caeVto: null,
        estado: 'A',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
    proveedor: {
      findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1 }),
    },
    movimientoProveedorCC: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({}) },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(buildPrisma())),
  }
}

describe('documentos-compra API', () => {
  let tmpDir: string
  let prisma: ReturnType<typeof buildPrisma>

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bizcode-doc-api-'))
    process.env.DOCUMENTOS_COMPRA_STORAGE_PATH = tmpDir
    prisma = buildPrisma()
  })

  afterEach(async () => {
    delete process.env.DOCUMENTOS_COMPRA_STORAGE_PATH
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('POST /api/documentos-compra/procesar accepts PDF upload', async () => {
    const app = createApp(prisma as never)
    const res = await request(app)
      .post('/api/documentos-compra/procesar')
      .attach('file', Buffer.from('%PDF-1.4'), { filename: 'factura.pdf', contentType: 'application/pdf' })
      .expect(201)

    expect(res.body.success).toBe(true)
    expect(res.body.data.estado).toBe('pendiente_revision')
    expect(res.body.data.tier).toBe(0)
  })

  it('POST /api/documentos-compra/confirmar creates comprobante', async () => {
    const app = createApp(prisma as never)
    const res = await request(app)
      .post('/api/documentos-compra/confirmar')
      .send({
        documentoId: 1,
        fecha: '2026-05-10T12:00:00.000Z',
        tipo: 'B',
        prefijo: '0001',
        numero: 7,
        proveedorId: 1,
        neto1: 100,
        neto2: 0,
        neto3: 0,
        iva1: 21,
        iva2: 0,
        total: 121,
      })
      .expect(201)

    expect(res.body.data.comprobanteCompra.id).toBe(42)
    expect(res.body.data.documento.estado).toBe('confirmado')
  })

  it('GET /api/documentos-compra/cola returns queue snapshot', async () => {
    const app = createApp(prisma as never)
    const res = await request(app).get('/api/documentos-compra/cola').expect(200)
    expect(res.body.data.pendiente_revision).toBe(1)
    expect(res.body.data.documentos).toHaveLength(1)
  })

  it('POST /api/documentos-compra/procesar-lote accepts multiple files', async () => {
    const app = createApp(prisma as never)
    const res = await request(app)
      .post('/api/documentos-compra/procesar-lote')
      .attach('files', Buffer.from('%PDF-1.4'), { filename: 'a.pdf', contentType: 'application/pdf' })
      .attach('files', Buffer.from('%PDF-1.4'), { filename: 'b.pdf', contentType: 'application/pdf' })
      .expect(201)
    expect(res.body.data).toHaveLength(2)
  })

  it('GET /api/documentos-compra/templates lists bundled templates', async () => {
    const app = createApp(prisma as never)
    const res = await request(app).get('/api/documentos-compra/templates').expect(200)
    expect(res.body.data.some((t: { issuer: string }) => t.issuer === 'generic-arca-ar')).toBe(true)
  })

  it('GET /api/documentos-compra/:id/original returns file bytes', async () => {
    await fs.mkdir(path.join(tmpDir, '1', '1'), { recursive: true })
    await fs.writeFile(path.join(tmpDir, '1', '1', 'factura.pdf'), '%PDF-1.4')

    const app = createApp(prisma as never)
    const res = await request(app).get('/api/documentos-compra/1/original').expect(200)
    expect(res.headers['content-type']).toContain('application/pdf')
    expect(res.body.subarray(0, 4).toString()).toBe('%PDF')
  })
})
