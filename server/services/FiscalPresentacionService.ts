import { createHash } from 'node:crypto'
import type { PrismaClient } from '@prisma/client'
import { NotFoundAppError } from '../errors/AppError'
import {
  loadPresentacionRetencionRows,
  periodToDateRange,
  type PresentacionRetencionSourceRow,
} from '../fiscal/ar/presentacionRetencionesLoader'
import { buildSicoreRetencionesExport } from '../fiscal/ar/sicoreRetencionesExport'
import { buildSifereRetencionesExport } from '../fiscal/ar/sifereRetencionesExport'
import { validateCUIT } from '../../src/lib/validators/cuit'

export type PresentacionWarningCode = 'missing_cuit' | 'invalid_cuit' | 'zero_importe_excluded'

export type PresentacionWarningDto = {
  code: PresentacionWarningCode
  retencionId: number
  message: string
}

export type PresentacionFilaDto = {
  retencionId: number
  fecha: string
  cuit: string
  denominacion: string
  regimenNombre: string
  regimenTipo: string
  operacionTipo: 'retencion' | 'percepcion'
  provincia: string | null
  baseImponible: string
  alicuota: string
  importe: string
  incluida: boolean
}

export type PresentacionTotalRegimenDto = {
  regimenNombre: string
  operaciones: number
  totalImporte: string
}

export type PresentacionPreviewDto = {
  formato: 'sicore' | 'sifere'
  periodo: string
  filas: PresentacionFilaDto[]
  totalesPorRegimen: PresentacionTotalRegimenDto[]
  warnings: PresentacionWarningDto[]
  canGenerate: boolean
}

export type PresentacionRetencionDto = {
  id: number
  formato: 'sicore' | 'sifere'
  periodo: string
  totalOperaciones: number
  totalImporte: string
  archivoHash: string | null
  presentadoAt: string | null
  createdAt: string
}

function mapWarning(
  code: PresentacionWarningCode,
  retencionId: number,
  message: string,
): PresentacionWarningDto {
  return { code, retencionId, message }
}

function buildPreviewFromRows(
  formato: 'sicore' | 'sifere',
  periodo: string,
  rows: PresentacionRetencionSourceRow[],
): PresentacionPreviewDto {
  const warnings: PresentacionWarningDto[] = []
  const filas: PresentacionFilaDto[] = []
  const totalesMap = new Map<string, { operaciones: number; total: number }>()

  for (const row of rows) {
    let incluida = true
    if (!row.cuitRetenido) {
      warnings.push(
        mapWarning('missing_cuit', row.id, `Retención ${row.id}: sin CUIT de contraparte`),
      )
      incluida = false
    } else if (!validateCUIT(row.cuitRetenido)) {
      warnings.push(
        mapWarning('invalid_cuit', row.id, `Retención ${row.id}: CUIT inválido (${row.cuitRetenido})`),
      )
      incluida = false
    }
    if (row.importe === 0) {
      warnings.push(
        mapWarning('zero_importe_excluded', row.id, `Retención ${row.id}: importe 0 excluida`),
      )
      incluida = false
    }

    filas.push({
      retencionId: row.id,
      fecha: row.fecha.toISOString(),
      cuit: row.cuitRetenido,
      denominacion: row.denominacion,
      regimenNombre: row.regimenNombre,
      regimenTipo: row.regimenTipo,
      operacionTipo: row.operacionTipo,
      provincia: row.provincia,
      baseImponible: row.baseImponible.toFixed(2),
      alicuota: row.alicuota.toFixed(4),
      importe: row.importe.toFixed(2),
      incluida,
    })

    if (incluida) {
      const key = row.regimenNombre
      const prev = totalesMap.get(key) ?? { operaciones: 0, total: 0 }
      prev.operaciones += 1
      prev.total += row.importe
      totalesMap.set(key, prev)
    }
  }

  const totalesPorRegimen = [...totalesMap.entries()].map(([regimenNombre, t]) => ({
    regimenNombre,
    operaciones: t.operaciones,
    totalImporte: t.total.toFixed(2),
  }))

  return {
    formato,
    periodo,
    filas,
    totalesPorRegimen,
    warnings,
    canGenerate: filas.some((f) => f.incluida),
  }
}

function buildTxt(
  formato: 'sicore' | 'sifere',
  rows: PresentacionRetencionSourceRow[],
): string {
  const validRows = rows.filter(
    (r) => r.importe !== 0 && r.cuitRetenido && validateCUIT(r.cuitRetenido),
  )
  if (formato === 'sicore') {
    return buildSicoreRetencionesExport(
      validRows.map((r) => ({
        fecha: r.fecha,
        cuitRetenido: r.cuitRetenido,
        denominacion: r.denominacion,
        regimenTipo: r.regimenTipo,
        regimenNombre: r.regimenNombre,
        operacionTipo: r.operacionTipo,
        baseImponible: r.baseImponible,
        importe: r.importe,
      })),
    )
  }
  return buildSifereRetencionesExport(
    validRows.map((r) => ({
      fecha: r.fecha,
      cuitRetenido: r.cuitRetenido,
      provincia: r.provincia,
      baseImponible: r.baseImponible,
      alicuota: r.alicuota,
      importe: r.importe,
    })),
  )
}

/**
 * @en Monthly SICORE/SIFERE presentation preview, generation and history (#242).
 * @es Preview, generación e historial de presentaciones SICORE/SIFERE (#242).
 * @pt-BR Preview, geração e histórico de apresentações SICORE/SIFERE (#242).
 */
export class FiscalPresentacionService {
  constructor(private readonly prisma: PrismaClient) {}

  async preview(
    tenantId: number,
    formato: 'sicore' | 'sifere',
    periodo: string,
  ): Promise<PresentacionPreviewDto> {
    const { from, to } = periodToDateRange(periodo)
    const rows = await loadPresentacionRetencionRows(this.prisma, tenantId, formato, from, to)
    return buildPreviewFromRows(formato, periodo, rows)
  }

  async generar(
    tenantId: number,
    formato: 'sicore' | 'sifere',
    periodo: string,
    createdById: number | null,
  ): Promise<PresentacionRetencionDto> {
    const { from, to } = periodToDateRange(periodo)
    const rows = await loadPresentacionRetencionRows(this.prisma, tenantId, formato, from, to)
    const preview = buildPreviewFromRows(formato, periodo, rows)
    if (!preview.canGenerate) {
      throw new Error('No hay operaciones válidas para generar el archivo')
    }
    const validRows = rows.filter(
      (r) => r.importe !== 0 && r.cuitRetenido && validateCUIT(r.cuitRetenido),
    )
    const archivoContenido = buildTxt(formato, validRows)
    const archivoHash = createHash('sha256').update(archivoContenido, 'utf8').digest('hex')
    const totalImporte = validRows.reduce((acc, r) => acc + r.importe, 0)

    const created = await this.prisma.presentacionRetencion.create({
      data: {
        tenantId,
        formato,
        periodo,
        totalOperaciones: validRows.length,
        totalImporte,
        archivoHash,
        archivoContenido,
        createdById,
      },
    })
    return this.toDto(created)
  }

  async listar(tenantId: number): Promise<PresentacionRetencionDto[]> {
    const rows = await this.prisma.presentacionRetencion.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return rows.map((r) => this.toDto(r))
  }

  async getArchivo(tenantId: number, id: number): Promise<{ contenido: string; formato: string }> {
    const row = await this.prisma.presentacionRetencion.findFirst({
      where: { tenantId, id },
    })
    if (!row) {
      throw new NotFoundAppError('Presentacion not found')
    }
    return { contenido: row.archivoContenido, formato: row.formato }
  }

  async marcarPresentado(tenantId: number, id: number): Promise<PresentacionRetencionDto> {
    const existing = await this.prisma.presentacionRetencion.findFirst({
      where: { tenantId, id },
    })
    if (!existing) {
      throw new NotFoundAppError('Presentacion not found')
    }
    const updated = await this.prisma.presentacionRetencion.update({
      where: { id },
      data: { presentadoAt: new Date() },
    })
    return this.toDto(updated)
  }

  private toDto(row: {
    id: number
    formato: string
    periodo: string
    totalOperaciones: number
    totalImporte: { toNumber(): number }
    archivoHash: string | null
    presentadoAt: Date | null
    createdAt: Date
  }): PresentacionRetencionDto {
    return {
      id: row.id,
      formato: row.formato as 'sicore' | 'sifere',
      periodo: row.periodo,
      totalOperaciones: row.totalOperaciones,
      totalImporte: row.totalImporte.toNumber().toFixed(2),
      archivoHash: row.archivoHash,
      presentadoAt: row.presentadoAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    }
  }
}
