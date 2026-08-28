import type {
  DispensacionGateResult,
  LibroPsicotropicoCreateInput,
  LibroPsicotropicoMovimientoRow,
  LibroPsicotropicoTipo,
  RecetaDispensacionCreateInput,
} from '@bizcode/types'
import { LIBRO_PSICOTROPICO_TIPOS } from '@bizcode/types'
import type { ServiceResult } from './serviceResults'

/**
 * @en Field limits mirror the Prisma column widths for the pharmacy vertical (#204).
 * @es Los límites reflejan el ancho de columna Prisma del vertical farmacia (#204).
 * @pt-BR Os limites refletem a largura das colunas Prisma do vertical farmácia (#204).
 */
export const RECETA_NUMERO_MAX = 40
export const RECETA_MEDICO_MAX = 120
export const RECETA_MATRICULA_MAX = 40
export const RECETA_OBSERVACIONES_MAX = 500
export const LIBRO_REFERENCIA_MAX = 60
export const LIBRO_OBSERVACIONES_MAX = 300
export const SERIAL_UNIDAD_MAX = 60
export const CODIGO_DATAMATRIX_MAX = 200

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/

export type NormalizedRecetaInput = {
  facturaId: number | null
  clienteId: number | null
  numeroReceta: string
  medicoNombre: string
  matricula: string
  fechaReceta: Date
  observaciones: string | null
}

export type NormalizedLibroInput = {
  articuloId: number
  loteId: number | null
  recetaId: number | null
  tipo: LibroPsicotropicoTipo
  cantidad: number
  referencia: string | null
  observaciones: string | null
}

function fail(error: string, status = 400): ServiceResult<never> {
  return { ok: false, status, error }
}

/**
 * @en Parses a `YYYY-MM-DD` string into a UTC date-only value; null when malformed.
 * @es Convierte `YYYY-MM-DD` en una fecha UTC sin hora; null si está mal formada.
 * @pt-BR Converte `YYYY-MM-DD` em data UTC sem hora; null se estiver malformada.
 */
export function parsePharmacyDateOnly(value: string): Date | null {
  if (!DATE_ONLY_RE.test(value)) return null
  const parsed = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) return null
  if (parsed.toISOString().slice(0, 10) !== value) return null
  return parsed
}

function optionalId(value: number | null | undefined): number | null | 'invalid' {
  if (value === null || value === undefined) return null
  if (!Number.isInteger(value) || value < 1) return 'invalid'
  return value
}

function optionalText(value: string | null | undefined, max: number): string | null | 'invalid' {
  if (value === null || value === undefined) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.length > max) return 'invalid'
  return trimmed
}

/**
 * @en Validates and normalizes prescription input before persistence (#204).
 * @es Valida y normaliza la entrada de receta antes de persistir (#204).
 * @pt-BR Valida e normaliza a entrada de receita antes de persistir (#204).
 */
export function normalizeRecetaInput(
  input: RecetaDispensacionCreateInput,
): ServiceResult<NormalizedRecetaInput> {
  const numeroReceta = input.numeroReceta?.trim() ?? ''
  if (!numeroReceta) return fail('numeroReceta is required')
  if (numeroReceta.length > RECETA_NUMERO_MAX) {
    return fail(`numeroReceta must be at most ${RECETA_NUMERO_MAX} characters`)
  }

  const medicoNombre = input.medicoNombre?.trim() ?? ''
  if (!medicoNombre) return fail('medicoNombre is required')
  if (medicoNombre.length > RECETA_MEDICO_MAX) {
    return fail(`medicoNombre must be at most ${RECETA_MEDICO_MAX} characters`)
  }

  const matricula = input.matricula?.trim() ?? ''
  if (!matricula) return fail('matricula is required')
  if (matricula.length > RECETA_MATRICULA_MAX) {
    return fail(`matricula must be at most ${RECETA_MATRICULA_MAX} characters`)
  }

  const fechaReceta = parsePharmacyDateOnly(input.fechaReceta ?? '')
  if (!fechaReceta) return fail('fechaReceta must be a valid YYYY-MM-DD date')

  const facturaId = optionalId(input.facturaId)
  if (facturaId === 'invalid') return fail('facturaId must be a positive integer')
  const clienteId = optionalId(input.clienteId)
  if (clienteId === 'invalid') return fail('clienteId must be a positive integer')

  const observaciones = optionalText(input.observaciones, RECETA_OBSERVACIONES_MAX)
  if (observaciones === 'invalid') {
    return fail(`observaciones must be at most ${RECETA_OBSERVACIONES_MAX} characters`)
  }

  return {
    ok: true,
    data: { facturaId, clienteId, numeroReceta, medicoNombre, matricula, fechaReceta, observaciones },
  }
}

export function isLibroPsicotropicoTipo(value: string): value is LibroPsicotropicoTipo {
  return (LIBRO_PSICOTROPICO_TIPOS as readonly string[]).includes(value)
}

/**
 * @en Validates and normalizes an internal psychotropic book entry (#204).
 * @es Valida y normaliza un asiento del libro interno de psicotrópicos (#204).
 * @pt-BR Valida e normaliza um lançamento do livro interno de psicotrópicos (#204).
 */
export function normalizeLibroInput(
  input: LibroPsicotropicoCreateInput,
): ServiceResult<NormalizedLibroInput> {
  if (!Number.isInteger(input.articuloId) || input.articuloId < 1) {
    return fail('articuloId must be a positive integer')
  }
  if (!isLibroPsicotropicoTipo(input.tipo)) {
    return fail(`tipo must be one of ${LIBRO_PSICOTROPICO_TIPOS.join(' | ')}`)
  }
  if (!Number.isFinite(input.cantidad) || input.cantidad === 0) {
    return fail('cantidad must be a non-zero finite number')
  }
  if (input.tipo !== 'ajuste' && input.cantidad <= 0) {
    return fail('cantidad must be positive for ingreso and egreso entries')
  }

  const loteId = optionalId(input.loteId)
  if (loteId === 'invalid') return fail('loteId must be a positive integer')
  const recetaId = optionalId(input.recetaId)
  if (recetaId === 'invalid') return fail('recetaId must be a positive integer')

  const referencia = optionalText(input.referencia, LIBRO_REFERENCIA_MAX)
  if (referencia === 'invalid') {
    return fail(`referencia must be at most ${LIBRO_REFERENCIA_MAX} characters`)
  }
  const observaciones = optionalText(input.observaciones, LIBRO_OBSERVACIONES_MAX)
  if (observaciones === 'invalid') {
    return fail(`observaciones must be at most ${LIBRO_OBSERVACIONES_MAX} characters`)
  }

  return {
    ok: true,
    data: {
      articuloId: input.articuloId,
      loteId,
      recetaId,
      tipo: input.tipo,
      cantidad: input.cantidad,
      referencia,
      observaciones,
    },
  }
}

/**
 * @en Signed stock effect of a book entry: ingreso adds, egreso subtracts, ajuste keeps its sign.
 * @es Efecto con signo del asiento: ingreso suma, egreso resta, ajuste conserva su signo.
 * @pt-BR Efeito com sinal do lançamento: ingresso soma, egresso subtrai, ajuste mantém o sinal.
 */
export function libroSignedQuantity(tipo: LibroPsicotropicoTipo, cantidad: number): number {
  if (tipo === 'ingreso') return Math.abs(cantidad)
  if (tipo === 'egreso') return -Math.abs(cantidad)
  return cantidad
}

/**
 * @en Blocks dispensing when any sold article requires a prescription and none is linked (#204).
 * @es Bloquea la dispensación si algún artículo vendido exige receta y no hay ninguna asociada (#204).
 * @pt-BR Bloqueia a dispensação se algum artigo vendido exige receita e nenhuma está associada (#204).
 */
export function evaluateDispensacionGate(
  items: ReadonlyArray<{ articuloId: number; requiereReceta: boolean }>,
  prescriptionCount: number,
): DispensacionGateResult {
  const controlled = items.filter((item) => item.requiereReceta).map((item) => item.articuloId)
  if (controlled.length === 0 || prescriptionCount > 0) {
    return { ok: true }
  }
  return {
    ok: false,
    error: 'PRESCRIPTION_REQUIRED',
    articuloIds: [...new Set(controlled)].sort((a, b) => a - b),
  }
}

/**
 * @en Normalizes an operator-typed unit serial / DataMatrix payload; no GS1 parsing is performed.
 * @es Normaliza el serial unitario / DataMatrix tipeado; no se parsea GS1.
 * @pt-BR Normaliza o serial unitário / DataMatrix digitado; não há parsing GS1.
 */
export function normalizeSerialCapture(input: {
  serialUnidad?: string | null
  codigoDatamatrix?: string | null
}): ServiceResult<{ serialUnidad: string | null; codigoDatamatrix: string | null }> {
  const serialUnidad = optionalText(input.serialUnidad, SERIAL_UNIDAD_MAX)
  if (serialUnidad === 'invalid') {
    return fail(`serialUnidad must be at most ${SERIAL_UNIDAD_MAX} characters`)
  }
  const codigoDatamatrix = optionalText(input.codigoDatamatrix, CODIGO_DATAMATRIX_MAX)
  if (codigoDatamatrix === 'invalid') {
    return fail(`codigoDatamatrix must be at most ${CODIGO_DATAMATRIX_MAX} characters`)
  }
  return { ok: true, data: { serialUnidad, codigoDatamatrix } }
}

const CSV_HEADER = [
  'fecha',
  'tipo',
  'articuloCodigo',
  'articuloDescripcion',
  'lote',
  'cantidad',
  'referencia',
  'observaciones',
] as const

function csvCell(value: string | number | null): string {
  const raw = value === null ? '' : String(value)
  const escaped = raw.replace(/"/g, '""')
  return `"${escaped}"`
}

/**
 * @en Builds the internal book CSV export; this is not the official SEDRONAR filing format (#204).
 * @es Genera el CSV del libro interno; no es el formato oficial de presentación SEDRONAR (#204).
 * @pt-BR Gera o CSV do livro interno; não é o formato oficial de declaração do SEDRONAR (#204).
 */
export function buildLibroPsicotropicoCsv(rows: readonly LibroPsicotropicoMovimientoRow[]): string {
  const lines = [CSV_HEADER.map(csvCell).join(',')]
  for (const row of rows) {
    lines.push(
      [
        csvCell(row.createdAt),
        csvCell(row.tipo),
        csvCell(row.articulo?.codigo ?? null),
        csvCell(row.articulo?.descripcion ?? null),
        csvCell(row.lote?.nroLote ?? null),
        csvCell(row.cantidad),
        csvCell(row.referencia),
        csvCell(row.observaciones),
      ].join(','),
    )
  }
  return lines.join('\n')
}
