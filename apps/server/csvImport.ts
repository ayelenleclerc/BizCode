/**
 * @en Shared limits and parsers for bulk CSV/XLSX imports (#238).
 * @es Límites y parsers compartidos para importaciones CSV/XLSX masivas (#238).
 * @pt-BR Limites e parsers compartidos para importações CSV/XLSX em massa (#238).
 */
import multer from 'multer'
import { parse } from 'csv-parse/sync'
import ExcelJS from 'exceljs'
import chardet from 'chardet'
import iconv from 'iconv-lite'

export const BULK_IMPORT_MAX_FILE_BYTES = 8 * 1024 * 1024
export const BULK_IMPORT_MAX_ROWS = 10_000

/** @deprecated Use BULK_IMPORT_MAX_FILE_BYTES — kept for legacy CSV routes. */
export const CSV_IMPORT_MAX_FILE_BYTES = BULK_IMPORT_MAX_FILE_BYTES
/** @deprecated Use BULK_IMPORT_MAX_ROWS — kept for legacy CSV routes. */
export const CSV_IMPORT_MAX_ROWS = BULK_IMPORT_MAX_ROWS

export function csvImportUploadSingle() {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: BULK_IMPORT_MAX_FILE_BYTES },
    fileFilter: (_req, file, cb) => {
      const name = file.originalname.toLowerCase()
      if (name.endsWith('.csv') || name.endsWith('.xlsx') || name.endsWith('.xls')) {
        cb(null, true)
        return
      }
      cb(null, false)
    },
  }).single('file')
}

/**
 * @en Detect buffer encoding and decode to UTF-8 string (UTF-8/BOM/Windows ANSI).
 * @es Detecta encoding del buffer y decodifica a string UTF-8 (UTF-8/BOM/ANSI Windows).
 * @pt-BR Detecta encoding do buffer e decodifica para string UTF-8 (UTF-8/BOM/ANSI Windows).
 */
export function decodeImportBuffer(buffer: Buffer): { text: string; encoding: string } {
  const detected = chardet.detect(buffer)
  const encoding =
    typeof detected === 'string' && detected.length > 0
      ? detected
      : 'UTF-8'
  const normalized = encoding.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const alias =
    normalized === 'UTF8' || normalized === 'ASCII' || normalized === 'ISO88591'
      ? encoding === 'ISO-8859-1' || normalized === 'ISO88591'
        ? 'latin1'
        : 'utf8'
      : normalized.includes('1252') || normalized.includes('WINDOWS')
        ? 'win1252'
        : iconv.encodingExists(encoding)
          ? encoding
          : 'utf8'
  if (alias === 'utf8') {
    return { text: buffer.toString('utf8'), encoding: 'UTF-8' }
  }
  try {
    return { text: iconv.decode(buffer, alias), encoding }
  } catch {
    return { text: buffer.toString('utf8'), encoding: 'UTF-8' }
  }
}

export type ParseImportResult =
  | { ok: true; records: Record<string, string>[]; format: 'csv' | 'xlsx' }
  | { ok: false; error: string }

function matchHeaders(
  actual: string[],
  expectedHeaders: readonly string[],
): boolean {
  const trimmed = actual.map((h) => String(h).trim())
  return (
    trimmed.length === expectedHeaders.length &&
    expectedHeaders.every((h, i) => trimmed[i] === h)
  )
}

export function parseCsvWithFixedHeaders(
  buffer: Buffer,
  expectedHeaders: readonly string[],
  maxRows: number = BULK_IMPORT_MAX_ROWS,
): { ok: true; records: Record<string, string>[] } | { ok: false; error: string } {
  try {
    const { text } = decodeImportBuffer(buffer)
    const records = parse(text, {
      columns: (header: string[]) => {
        const trimmed = header.map((h) => String(h).trim())
        if (!matchHeaders(trimmed, expectedHeaders)) {
          throw new Error('INVALID_CSV_HEADERS')
        }
        return expectedHeaders.map((name) => ({ name }))
      },
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true,
    }) as Record<string, string>[]
    if (records.length > maxRows) {
      return { ok: false, error: `Too many data rows (max ${maxRows})` }
    }
    return { ok: true, records }
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'INVALID_CSV_HEADERS') {
      return {
        ok: false,
        error: 'Invalid CSV headers. Download the template and keep the header row unchanged.',
      }
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

/**
 * @en Parse CSV or XLSX buffer into row records with fixed headers (#238).
 * @es Parsea buffer CSV o XLSX a registros con headers fijos (#238).
 * @pt-BR Faz parse de buffer CSV ou XLSX para registros com headers fixos (#238).
 */
export async function parseImportFile(
  buffer: Buffer,
  filename: string,
  expectedHeaders: readonly string[],
  maxRows: number = BULK_IMPORT_MAX_ROWS,
): Promise<ParseImportResult> {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
    try {
      const workbook = new ExcelJS.Workbook()
      // exceljs load accepts Buffer in Node
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- exceljs Buffer typing
      await workbook.xlsx.load(buffer as any)
      const sheet = workbook.worksheets[0]
      if (!sheet) {
        return { ok: false, error: 'Workbook has no sheets' }
      }
      const headerRow = sheet.getRow(1)
      const headers: string[] = []
      headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        headers[colNumber - 1] = String(cell.text ?? cell.value ?? '').trim()
      })
      // Trim trailing empties
      while (headers.length > 0 && headers[headers.length - 1] === '') {
        headers.pop()
      }
      if (!matchHeaders(headers, expectedHeaders)) {
        return {
          ok: false,
          error: 'Invalid XLSX headers. Download the template and keep the header row unchanged.',
        }
      }
      const records: Record<string, string>[] = []
      sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return
        // Skip description row if present (row 2 often descriptive in templates)
        if (rowNumber === 2) {
          const first = String(row.getCell(1).text ?? '').trim()
          if (first.startsWith('#') || first.toLowerCase().startsWith('descrip')) {
            return
          }
        }
        const record: Record<string, string> = {}
        let empty = true
        expectedHeaders.forEach((h, idx) => {
          const v = String(row.getCell(idx + 1).text ?? row.getCell(idx + 1).value ?? '').trim()
          record[h] = v
          if (v !== '') empty = false
        })
        if (!empty) records.push(record)
      })
      if (records.length > maxRows) {
        return { ok: false, error: `Too many data rows (max ${maxRows})` }
      }
      return { ok: true, records, format: 'xlsx' }
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    }
  }

  const csv = parseCsvWithFixedHeaders(buffer, expectedHeaders, maxRows)
  if (!csv.ok) return csv
  return { ok: true, records: csv.records, format: 'csv' }
}
