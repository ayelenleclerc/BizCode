import type { ComprobanteCompra, DocumentoCompraImportado, Prisma, PrismaClient } from '@prisma/client'
import { ConflictAppError, NotFoundAppError, ValidationAppError } from '../errors/AppError'
import { normalizeCuitDigits } from '../fiscal/ar/arcaComprobanteCodes'
import {
  arcaQrEmisorCuitDigits,
  mapArcaQrToDocumentoCompraPreview,
} from '../fiscal/ar/arcaQrDecode'
import {
  createEmptyDocumentoCompraPreview,
  type DocumentoCompraPreviewData,
} from '../lib/documentoCompraTypes'
import type { ComprobanteCompraCreateInput } from './ComprobanteCompraService'
import { ComprobanteCompraService } from './ComprobanteCompraService'
import { DocumentoCompraStorage } from './DocumentoCompraStorage'
import { mapTemplateExtractToDocumentoCompraPreview } from '../fiscal/ar/documentoCompraTemplateEngine'
import type { DocumentoCompraTemplateExtractResult } from '../fiscal/ar/documentoCompraTemplateTypes'
import { tryExtractDocumentoCompraTier1 } from './documentoCompraTier1Extract'
import { tryExtractDocumentoCompraTier2 } from './documentoCompraTier2Extract'
import { collectDocumentoCompraRawText } from '../fiscal/ar/documentoCompraRawText'
import {
  loadDocumentoCompraTemplates,
  saveTenantDocumentoCompraTemplate,
  validateDocumentoCompraTemplate,
} from '../fiscal/ar/documentoCompraTemplateEngine'
import type { DocumentoCompraTemplate } from '../fiscal/ar/documentoCompraTemplateTypes'
import { tryExtractDocumentoCompraTier3 } from './documentoCompraTier3Extract'
import { DOCUMENTO_COMPRA_BATCH_MAX } from '../documentoCompraUpload'
import { tryExtractDocumentoCompraTier4 } from './documentoCompraTier4Extract'

export { DOCUMENTO_COMPRA_BATCH_MAX }

export type DocumentoCompraColaEstado = {
  procesando: number
  pendiente_revision: number
  confirmado: number
  descartado: number
  documentos: DocumentoCompraImportRow[]
}

export type DocumentoCompraTemplateSummary = {
  issuer: string
  keywords: string[]
  source: 'bundled' | 'custom'
}

export type DocumentoCompraProcesarInput = {
  originalName: string
  mimeType: string
  tipoArchivo: string
  buffer: Buffer
}

export type DocumentoCompraConfirmInput = ComprobanteCompraCreateInput & {
  items?: DocumentoCompraPreviewData['items']
}

export type DocumentoCompraImportRow = DocumentoCompraImportado & {
  datosExtraidos: DocumentoCompraPreviewData
}

function parsePreviewJson(value: Prisma.JsonValue): DocumentoCompraPreviewData {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return createEmptyDocumentoCompraPreview()
  }
  const raw = value as Partial<DocumentoCompraPreviewData>
  return {
    ...createEmptyDocumentoCompraPreview(),
    ...raw,
    items: Array.isArray(raw.items) ? raw.items : [],
    fieldConfidence:
      raw.fieldConfidence && typeof raw.fieldConfidence === 'object' && !Array.isArray(raw.fieldConfidence)
        ? (raw.fieldConfidence as Record<string, number>)
        : {},
  }
}

function toRow(doc: DocumentoCompraImportado): DocumentoCompraImportRow {
  return {
    ...doc,
    datosExtraidos: parsePreviewJson(doc.datosExtraidos),
  }
}

/**
 * @en Purchase document import — upload, Tier 1 QR preview, confirm (#277).
 * @es Importación de documentos de compra — subida, preview QR Tier 1, confirmación (#277).
 * @pt-BR Importação de documentos de compra — upload, preview QR Tier 1, confirmação (#277).
 */
export class DocumentoCompraImportService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly storage: DocumentoCompraStorage = DocumentoCompraStorage.fromEnv(),
  ) {}

  async resolveProveedorIdByCuit(tenantId: number, cuitDigits: string): Promise<number | null> {
    const normalized = normalizeCuitDigits(cuitDigits)
    if (normalized.length < 10) return null

    const proveedores = await this.prisma.proveedor.findMany({
      where: { tenantId, activo: true, cuit: { not: null } },
      select: { id: true, cuit: true },
    })

    const match = proveedores.find((p) => normalizeCuitDigits(p.cuit) === normalized)
    return match?.id ?? null
  }

  private async applyTemplateTierExtraction(
    tenantId: number,
    extracted: (DocumentoCompraTemplateExtractResult & { source: string }) | null,
    tierNum: 2 | 3 | 4,
    tierKey: 'tier2' | 'tier3' | 'tier4',
  ): Promise<{
    tier: number
    confianza: number
    datosExtraidos: DocumentoCompraPreviewData
    errores?: Prisma.InputJsonValue
  } | null> {
    if (!extracted) return null

    const proveedorId =
      extracted.cuitDigits != null
        ? await this.resolveProveedorIdByCuit(tenantId, extracted.cuitDigits)
        : null
    let datosExtraidos = mapTemplateExtractToDocumentoCompraPreview(extracted, proveedorId)
    if (proveedorId == null && extracted.cuitDigits != null) {
      datosExtraidos = {
        ...datosExtraidos,
        cuitExtracted: extracted.cuitDigits,
        rsocialExtracted: extracted.rsocialExtracted ?? datosExtraidos.rsocialExtracted ?? null,
      }
    }
    let errores: Prisma.InputJsonValue | undefined

    if (proveedorId == null && extracted.cuitDigits != null) {
      errores = {
        proveedorId: `No supplier matched for CUIT ${extracted.cuitDigits}`,
        [`${tierKey}Issuer`]: extracted.issuer,
        [`${tierKey}Source`]: extracted.source,
      } as Prisma.InputJsonValue
      datosExtraidos = {
        ...datosExtraidos,
        fieldConfidence: { ...datosExtraidos.fieldConfidence, proveedorId: 0 },
      }
    }

    return {
      tier: tierNum,
      confianza: extracted.confidence,
      datosExtraidos,
      errores,
    }
  }

  async procesar(
    tenantId: number,
    usuarioId: number,
    input: DocumentoCompraProcesarInput,
  ): Promise<DocumentoCompraImportRow> {
    const preview = createEmptyDocumentoCompraPreview()
    const created = await this.prisma.documentoCompraImportado.create({
      data: {
        tenantId,
        usuarioId,
        archivoNombre: input.originalName,
        archivoMime: input.mimeType,
        archivoPath: '',
        tipoArchivo: input.tipoArchivo,
        tier: 0,
        confianza: 0,
        estado: 'procesando',
        datosExtraidos: preview as unknown as Prisma.InputJsonValue,
      },
    })

    const relativePath = await this.storage.saveOriginal(
      tenantId,
      created.id,
      input.originalName,
      input.buffer,
    )

    let tier = 0
    let confianza = 0
    let datosExtraidos: DocumentoCompraPreviewData = preview
    let errores: Prisma.InputJsonValue | undefined

    const tier1 = await tryExtractDocumentoCompraTier1(
      input.buffer,
      input.mimeType,
      input.tipoArchivo,
    )
    if (tier1) {
      const cuitEmisor = arcaQrEmisorCuitDigits(tier1.payload)
      const proveedorId = await this.resolveProveedorIdByCuit(tenantId, cuitEmisor)
      datosExtraidos = mapArcaQrToDocumentoCompraPreview(tier1.payload, proveedorId)
      tier = 1
      confianza = 1
      if (proveedorId == null && cuitEmisor.length >= 10) {
        errores = {
          proveedorId: `No supplier matched for CUIT ${cuitEmisor}`,
          tier1Source: tier1.source,
        } as Prisma.InputJsonValue
        datosExtraidos = {
          ...datosExtraidos,
          cuitExtracted: cuitEmisor,
          fieldConfidence: { ...datosExtraidos.fieldConfidence, proveedorId: 0 },
        }
      }
    } else {
      const tier2 = await tryExtractDocumentoCompraTier2(
        input.buffer,
        input.mimeType,
        input.tipoArchivo,
        tenantId,
      )
      const tier2Applied = await this.applyTemplateTierExtraction(
        tenantId,
        tier2,
        2,
        'tier2',
      )
      if (tier2Applied) {
        tier = tier2Applied.tier
        confianza = tier2Applied.confianza
        datosExtraidos = tier2Applied.datosExtraidos
        errores = tier2Applied.errores
      } else {
        const tier3 = await tryExtractDocumentoCompraTier3(
          input.buffer,
          input.mimeType,
          input.tipoArchivo,
          tenantId,
        )
        const tier3Applied = await this.applyTemplateTierExtraction(
          tenantId,
          tier3,
          3,
          'tier3',
        )
        if (tier3Applied) {
          tier = tier3Applied.tier
          confianza = tier3Applied.confianza
          datosExtraidos = tier3Applied.datosExtraidos
          errores = tier3Applied.errores
        } else {
          const rawText = await collectDocumentoCompraRawText(
            input.buffer,
            input.mimeType,
            input.tipoArchivo,
          )
          const tier4 = await tryExtractDocumentoCompraTier4(
            input.buffer,
            input.mimeType,
            input.tipoArchivo,
            rawText,
          )
          const tier4Applied = await this.applyTemplateTierExtraction(
            tenantId,
            tier4,
            4,
            'tier4',
          )
          if (tier4Applied) {
            tier = tier4Applied.tier
            confianza = tier4Applied.confianza
            datosExtraidos = tier4Applied.datosExtraidos
            errores = tier4Applied.errores
          } else if (rawText && rawText.length >= 30) {
            errores = {
              tier4Skipped: 'Ollama not configured or extraction failed',
            } as Prisma.InputJsonValue
          }
        }
      }
    }

    const updated = await this.prisma.documentoCompraImportado.update({
      where: { id: created.id },
      data: {
        archivoPath: relativePath,
        estado: 'pendiente_revision',
        tier,
        confianza,
        datosExtraidos: datosExtraidos as unknown as Prisma.InputJsonValue,
        ...(errores !== undefined ? { errores } : {}),
      },
    })

    return toRow(updated)
  }

  async procesarLote(
    tenantId: number,
    usuarioId: number,
    inputs: DocumentoCompraProcesarInput[],
  ): Promise<DocumentoCompraImportRow[]> {
    if (inputs.length === 0) {
      throw new ValidationAppError('At least one file is required')
    }
    if (inputs.length > DOCUMENTO_COMPRA_BATCH_MAX) {
      throw new ValidationAppError(`Batch limit is ${DOCUMENTO_COMPRA_BATCH_MAX} files`)
    }
    const results: DocumentoCompraImportRow[] = []
    for (const input of inputs) {
      results.push(await this.procesar(tenantId, usuarioId, input))
    }
    return results
  }

  async getColaEstado(tenantId: number, usuarioId: number): Promise<DocumentoCompraColaEstado> {
    const [procesando, pendiente_revision, confirmado, descartado, documentos] =
      await Promise.all([
        this.prisma.documentoCompraImportado.count({
          where: { tenantId, usuarioId, estado: 'procesando' },
        }),
        this.prisma.documentoCompraImportado.count({
          where: { tenantId, usuarioId, estado: 'pendiente_revision' },
        }),
        this.prisma.documentoCompraImportado.count({
          where: { tenantId, usuarioId, estado: 'confirmado' },
        }),
        this.prisma.documentoCompraImportado.count({
          where: { tenantId, usuarioId, estado: 'descartado' },
        }),
        this.prisma.documentoCompraImportado.findMany({
          where: { tenantId, usuarioId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
      ])

    return {
      procesando,
      pendiente_revision,
      confirmado,
      descartado,
      documentos: documentos.map((doc) => toRow(doc)),
    }
  }

  listTemplates(tenantId: number): DocumentoCompraTemplateSummary[] {
    const bundled = loadDocumentoCompraTemplates()
    const all = loadDocumentoCompraTemplates(tenantId)
    const bundledIssuers = new Set(bundled.map((t) => t.issuer))
    return all.map((template) => ({
      issuer: template.issuer,
      keywords: template.keywords,
      source: bundledIssuers.has(template.issuer) ? 'bundled' : 'custom',
    }))
  }

  saveTemplate(tenantId: number, yamlContent: string): DocumentoCompraTemplate {
    const template = saveTenantDocumentoCompraTemplate(tenantId, yamlContent)
    validateDocumentoCompraTemplate(template)
    return template
  }

  async findById(tenantId: number, documentoId: number): Promise<DocumentoCompraImportRow | null> {
    const doc = await this.prisma.documentoCompraImportado.findFirst({
      where: { id: documentoId, tenantId },
    })
    return doc ? toRow(doc) : null
  }

  async checkDuplicateComprobante(
    tenantId: number,
    tipo: string,
    prefijo: string,
    numero: number,
  ): Promise<boolean> {
    const existing = await this.prisma.comprobanteCompra.findFirst({
      where: { tenantId, tipo, prefijo, numero, estado: 'A' },
      select: { id: true },
    })
    return existing != null
  }

  async confirmar(
    tenantId: number,
    usuarioId: number,
    documentoId: number,
    input: DocumentoCompraConfirmInput,
  ): Promise<{ documento: DocumentoCompraImportRow; comprobanteCompra: ComprobanteCompra }> {
    const doc = await this.findById(tenantId, documentoId)
    if (!doc) {
      throw new NotFoundAppError('DocumentoCompraImportado not found')
    }
    if (doc.estado !== 'pendiente_revision') {
      throw new ValidationAppError('Document is not pending review')
    }

    const isDuplicate = await this.checkDuplicateComprobante(
      tenantId,
      input.tipo,
      input.prefijo,
      input.numero,
    )
    if (isDuplicate) {
      throw new ConflictAppError('Comprobante compra already exists for tipo/prefijo/numero')
    }

    const confirmedItems = input.items ?? []
    const preview: DocumentoCompraPreviewData = {
      proveedorId: input.proveedorId,
      cuitExtracted: doc.datosExtraidos.cuitExtracted ?? null,
      rsocialExtracted: doc.datosExtraidos.rsocialExtracted ?? null,
      fecha: input.fecha,
      vencimiento: input.vencimiento ?? null,
      tipo: input.tipo as DocumentoCompraPreviewData['tipo'],
      prefijo: input.prefijo,
      numero: input.numero,
      neto1: input.neto1,
      neto2: input.neto2,
      neto3: input.neto3,
      iva1: input.iva1,
      iva2: input.iva2,
      total: input.total,
      cae: input.cae ?? null,
      caeVto: input.caeVto ?? null,
      items: confirmedItems,
      fieldConfidence: {
        proveedorId: 1,
        fecha: 1,
        tipo: 1,
        prefijo: 1,
        numero: 1,
        total: 1,
        items: confirmedItems.length > 0 ? 1 : 0.5,
      },
    }

    const comprobanteService = new ComprobanteCompraService(this.prisma)
    const comprobante = await comprobanteService.create(tenantId, input, usuarioId)

    const updated = await this.prisma.documentoCompraImportado.update({
      where: { id: documentoId },
      data: {
        estado: 'confirmado',
        confianza: 1,
        comprobanteCompraId: comprobante.id,
        datosExtraidos: preview as unknown as Prisma.InputJsonValue,
      },
    })

    return { documento: toRow(updated), comprobanteCompra: comprobante }
  }

  async readOriginalFile(
    tenantId: number,
    documentoId: number,
  ): Promise<{ buffer: Buffer; mime: string; fileName: string }> {
    const doc = await this.findById(tenantId, documentoId)
    if (!doc) {
      throw new NotFoundAppError('DocumentoCompraImportado not found')
    }
    if (!doc.archivoPath) {
      throw new NotFoundAppError('Original file not found')
    }
    const buffer = await this.storage.readOriginal(doc.archivoPath)
    return { buffer, mime: doc.archivoMime, fileName: doc.archivoNombre }
  }
}
