import { describe, expect, it } from 'vitest'
import { parseCsvWithFixedHeaders, BULK_IMPORT_MAX_ROWS } from '../../apps/server/csvImport'

describe('bulk import 10k limit (#238)', () => {
  it('accepts exactly 10000 data rows', () => {
    const headers = ['codigo'] as const
    const rows = Array.from({ length: BULK_IMPORT_MAX_ROWS }, (_, i) => String(i + 1))
    const csv = ['codigo', ...rows].join('\n')
    const result = parseCsvWithFixedHeaders(Buffer.from(csv, 'utf8'), headers, BULK_IMPORT_MAX_ROWS)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.records).toHaveLength(BULK_IMPORT_MAX_ROWS)
  })

  it('rejects 10001 data rows', () => {
    const headers = ['codigo'] as const
    const rows = Array.from({ length: BULK_IMPORT_MAX_ROWS + 1 }, (_, i) => String(i + 1))
    const csv = ['codigo', ...rows].join('\n')
    const result = parseCsvWithFixedHeaders(Buffer.from(csv, 'utf8'), headers, BULK_IMPORT_MAX_ROWS)
    expect(result.ok).toBe(false)
  })
})
