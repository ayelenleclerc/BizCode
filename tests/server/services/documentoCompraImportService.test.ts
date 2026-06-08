import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildArcaQrUrl } from '../../../server/fiscal/ar/arcaQrPayload'
import { DocumentoCompraImportService } from '../../../server/services/DocumentoCompraImportService'

const mockExtractPdf = vi.hoisted(() => vi.fn())
const mockPreprocess = vi.hoisted(() => vi.fn())
const mockOcr = vi.hoisted(() => vi.fn())
const mockTier4 = vi.hoisted(() => vi.fn())

vi.mock('../../../server/fiscal/ar/documentoCompraPdfText', () => ({
  extractPdfPlainText: mockExtractPdf,
}))

vi.mock('../../../server/fiscal/ar/documentoCompraImagePreprocess', () => ({
  preprocessDocumentoCompraImage: mockPreprocess,
}))

vi.mock('../../../server/fiscal/ar/documentoCompraOcr', () => ({
  runDocumentoCompraOcr: mockOcr,
}))

vi.mock('../../../server/services/documentoCompraTier4Extract', () => ({
  tryExtractDocumentoCompraTier4: mockTier4,
}))
import { DocumentoCompraStorage } from '../../../server/services/DocumentoCompraStorage'
import { createEmptyDocumentoCompraPreview } from '../../../server/lib/documentoCompraTypes'

const preview = createEmptyDocumentoCompraPreview()

function buildPrisma() {
  const docRow = {
    id: 1,
    tenantId: 1,
    usuarioId: 1,
    archivoNombre: 'factura.pdf',
    archivoMime: 'application/pdf',
    archivoPath: '',
    tipoArchivo: 'pdf',
    tier: 0,
    confianza: 0,
    estado: 'procesando',
    datosExtraidos: preview,
    comprobanteCompraId: null,
    errores: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  return {
    documentoCompraImportado: {
      create: vi.fn().mockResolvedValue(docRow),
      update: vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          ...docRow,
          ...data,
          archivoPath: data.archivoPath ?? '1/1/factura.pdf',
          estado: data.estado ?? docRow.estado,
        }),
      ),
      findFirst: vi.fn().mockResolvedValue({
        ...docRow,
        archivoPath: '1/1/factura.pdf',
        estado: 'pendiente_revision',
      }),
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    comprobanteCompra: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({
        id: 99,
        tenantId: 1,
        proveedorId: 1,
        fecha: new Date(),
        tipo: 'B',
        prefijo: '0001',
        numero: 10,
        neto1: 100,
        neto2: 0,
        neto3: 0,
        iva1: 21,
        iva2: 0,
        total: 121,
        estado: 'A',
      }),
    },
    proveedor: {
      findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1 }),
      findMany: vi.fn().mockResolvedValue([
        { id: 1, cuit: '30-71234567-8' },
      ]),
    },
    movimientoProveedorCC: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(buildPrisma())),
  }
}

describe('DocumentoCompraImportService', () => {
  let tmpDir: string

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bizcode-doc-compra-'))
    mockExtractPdf.mockReset()
    mockPreprocess.mockReset()
    mockOcr.mockReset()
    mockTier4.mockReset()
    mockPreprocess.mockResolvedValue(Buffer.from('png'))
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('procesar stores file and returns pending review document', async () => {
    const prisma = buildPrisma()
    const storage = new DocumentoCompraStorage(tmpDir)
    const service = new DocumentoCompraImportService(prisma as never, storage)
    const buffer = Buffer.from('%PDF-1.4 test')

    const result = await service.procesar(1, 1, {
      originalName: 'factura.pdf',
      mimeType: 'application/pdf',
      tipoArchivo: 'pdf',
      buffer,
    })

    expect(result.estado).toBe('pendiente_revision')
    expect(result.archivoPath).toContain('1/1/')
    const stored = await storage.readOriginal(result.archivoPath)
    expect(stored.equals(buffer)).toBe(true)
  })

  it('procesar tier 1 extracts AFIP QR from PDF buffer and matches proveedor by CUIT', async () => {
    const prisma = buildPrisma()
    const storage = new DocumentoCompraStorage(tmpDir)
    const service = new DocumentoCompraImportService(prisma as never, storage)
    const qrUrl = buildArcaQrUrl({
      fecha: new Date('2026-01-10T12:00:00.000Z'),
      cuitEmisor: '30-71234567-8',
      prefijo: '0003',
      tipo: 'B',
      numero: 157,
      importeTotal: 121,
      clienteCuit: '20-12345678-6',
      cae: '74239871234567',
    })
    const buffer = Buffer.from(`%PDF-1.4\n${qrUrl}\n`)

    const result = await service.procesar(1, 1, {
      originalName: 'factura.pdf',
      mimeType: 'application/pdf',
      tipoArchivo: 'pdf',
      buffer,
    })

    expect(result.tier).toBe(1)
    expect(Number(result.confianza)).toBe(1)
    expect(result.datosExtraidos.tipo).toBe('B')
    expect(result.datosExtraidos.numero).toBe(157)
    expect(result.datosExtraidos.proveedorId).toBe(1)
    expect(result.datosExtraidos.cae).toBe('74239871234567')
  })

  it('procesar tier 2 extracts fields from digital PDF text templates', async () => {
    mockExtractPdf.mockResolvedValue(
      'PROVEEDOR SA CUIT: 30-71234567-8 Factura B Comp. 00003-00000157 Fecha 20/11/2025 ' +
        'TOTAL $ 121.000,50 CAE 74239871234567',
    )
    const prisma = buildPrisma()
    const storage = new DocumentoCompraStorage(tmpDir)
    const service = new DocumentoCompraImportService(prisma as never, storage)

    const result = await service.procesar(1, 1, {
      originalName: 'factura-sin-qr.pdf',
      mimeType: 'application/pdf',
      tipoArchivo: 'pdf',
      buffer: Buffer.from('%PDF-1.4 digital invoice text'),
    })

    expect(result.tier).toBe(2)
    expect(Number(result.confianza)).toBeGreaterThanOrEqual(0.7)
    expect(result.datosExtraidos.tipo).toBe('B')
    expect(result.datosExtraidos.numero).toBe(157)
    expect(result.datosExtraidos.proveedorId).toBe(1)
  })

  it('procesar tier 3 extracts fields from image OCR + templates', async () => {
    mockOcr.mockResolvedValue(
      'PROVEEDOR SA CUIT: 30-71234567-8 Factura B Comp. 00003-00000157 Fecha 20/11/2025 ' +
        'TOTAL $ 121.000,50 CAE 74239871234567',
    )
    const prisma = buildPrisma()
    const storage = new DocumentoCompraStorage(tmpDir)
    const service = new DocumentoCompraImportService(prisma as never, storage)

    const result = await service.procesar(1, 1, {
      originalName: 'foto-factura.jpg',
      mimeType: 'image/jpeg',
      tipoArchivo: 'jpg',
      buffer: Buffer.from('jpeg-bytes'),
    })

    expect(result.tier).toBe(3)
    expect(Number(result.confianza)).toBeGreaterThanOrEqual(0.6)
    expect(result.datosExtraidos.tipo).toBe('B')
    expect(result.datosExtraidos.numero).toBe(157)
    expect(result.datosExtraidos.proveedorId).toBe(1)
  })

  it('procesar tier 4 uses Ollama extraction when tiers 1–3 fail', async () => {
    mockExtractPdf.mockResolvedValue('some pdf text without matches')
    mockOcr.mockResolvedValue('ocr text without matches')
    mockTier4.mockResolvedValue({
      issuer: 'ollama-local',
      matches: [],
      confidence: 0.55,
      cuitDigits: '30712345678',
      tipo: 'B',
      prefijo: '0003',
      numero: 157,
      fechaIso: '2025-11-20T12:00:00.000Z',
      total: 121,
      cae: '74239871234567',
      source: 'ollama_local',
    })
    const prisma = buildPrisma()
    const storage = new DocumentoCompraStorage(tmpDir)
    const service = new DocumentoCompraImportService(prisma as never, storage)

    const result = await service.procesar(1, 1, {
      originalName: 'scan.pdf',
      mimeType: 'application/pdf',
      tipoArchivo: 'pdf',
      buffer: Buffer.from('%PDF-1.4'),
    })

    expect(result.tier).toBe(4)
    expect(result.datosExtraidos.tipo).toBe('B')
    expect(result.datosExtraidos.proveedorId).toBe(1)
  })

  it('procesarLote processes multiple files sequentially', async () => {
    const prisma = buildPrisma()
    const storage = new DocumentoCompraStorage(tmpDir)
    const service = new DocumentoCompraImportService(prisma as never, storage)
    const results = await service.procesarLote(1, 1, [
      {
        originalName: 'a.pdf',
        mimeType: 'application/pdf',
        tipoArchivo: 'pdf',
        buffer: Buffer.from('%PDF-1.4 a'),
      },
      {
        originalName: 'b.pdf',
        mimeType: 'application/pdf',
        tipoArchivo: 'pdf',
        buffer: Buffer.from('%PDF-1.4 b'),
      },
    ])
    expect(results).toHaveLength(2)
    expect(prisma.documentoCompraImportado.create).toHaveBeenCalledTimes(2)
  })

  it('getColaEstado aggregates counts and recent documents', async () => {
    const prisma = buildPrisma()
    vi.mocked(prisma.documentoCompraImportado.count)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0)
    vi.mocked(prisma.documentoCompraImportado.findMany).mockResolvedValue([
      {
        id: 2,
        tenantId: 1,
        usuarioId: 1,
        archivoNombre: 'b.pdf',
        archivoMime: 'application/pdf',
        archivoPath: '1/2/b.pdf',
        tipoArchivo: 'pdf',
        tier: 0,
        confianza: 0,
        estado: 'pendiente_revision',
        datosExtraidos: preview,
        comprobanteCompraId: null,
        errores: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    const service = new DocumentoCompraImportService(prisma as never)
    const cola = await service.getColaEstado(1, 1)
    expect(cola.pendiente_revision).toBe(2)
    expect(cola.documentos).toHaveLength(1)
  })

  it('listTemplates and saveTemplate manage tenant YAML', async () => {
    process.env.DOCUMENTOS_COMPRA_TEMPLATES_PATH = path.join(tmpDir, 'templates')
    const prisma = buildPrisma()
    const service = new DocumentoCompraImportService(prisma as never)
    const before = service.listTemplates(1)
    expect(before.some((t) => t.issuer === 'generic-arca-ar')).toBe(true)
    const yaml =
      'issuer: tenant-test-yaml\nkeywords:\n  - FACTURA\nfields:\n  vat_id:\n    regex: "([0-9]{11})"\n'
    const saved = service.saveTemplate(1, yaml)
    expect(saved.issuer).toBe('tenant-test-yaml')
    const after = service.listTemplates(1)
    expect(after.some((t) => t.issuer === 'tenant-test-yaml' && t.source === 'custom')).toBe(true)
    delete process.env.DOCUMENTOS_COMPRA_TEMPLATES_PATH
  })

  it('confirmar creates comprobante and links document', async () => {
    const prisma = buildPrisma()
    const storage = new DocumentoCompraStorage(tmpDir)
    const service = new DocumentoCompraImportService(prisma as never, storage)

    const result = await service.confirmar(1, 1, 1, {
      fecha: '2026-05-10T12:00:00.000Z',
      tipo: 'B',
      prefijo: '0001',
      numero: 10,
      proveedorId: 1,
      neto1: 100,
      neto2: 0,
      neto3: 0,
      iva1: 21,
      iva2: 0,
      total: 121,
    })

    expect(result.comprobanteCompra.id).toBe(99)
    expect(prisma.documentoCompraImportado.update).toHaveBeenCalled()
  })
})
