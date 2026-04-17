import multer from 'multer'
import { parse } from 'csv-parse/sync'

/** Shared limits for bulk CSV imports (clientes, rubros, artículos, proveedores). */
export const CSV_IMPORT_MAX_FILE_BYTES = 1024 * 1024
export const CSV_IMPORT_MAX_ROWS = 2000

export function csvImportUploadSingle() {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: CSV_IMPORT_MAX_FILE_BYTES },
    fileFilter: (_req, file, cb) => {
      if (file.originalname.toLowerCase().endsWith('.csv')) {
        cb(null, true)
        return
      }
      cb(null, false)
    },
  }).single('file')
}

/**
 * Parse a UTF-8 CSV buffer with a fixed header row (order-sensitive).
 * Row 1 must match `expectedHeaders` exactly (after trim).
 */
export function parseCsvWithFixedHeaders(
  buffer: Buffer,
  expectedHeaders: readonly string[],
  maxRows: number,
): { ok: true; records: Record<string, string>[] } | { ok: false; error: string } {
  try {
    const records = parse(buffer, {
      columns: (header: string[]) => {
        const trimmed = header.map((h) => String(h).trim())
        if (
          trimmed.length !== expectedHeaders.length ||
          !expectedHeaders.every((h, i) => trimmed[i] === h)
        ) {
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
