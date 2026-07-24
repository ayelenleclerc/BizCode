import { describe, expect, it } from 'vitest'
import { decodeImportBuffer, parseCsvWithFixedHeaders, parseImportFile } from '../../apps/server/csvImport'

describe('bulk import parse (#238)', () => {
  it('parses UTF-8 CSV with BOM', () => {
    const headers = ['codigo', 'nombre'] as const
    const csv = '\uFEFFcodigo,nombre\n1,Demo\n'
    const result = parseCsvWithFixedHeaders(Buffer.from(csv, 'utf8'), headers, 100)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.records).toHaveLength(1)
      expect(result.records[0]?.nombre).toBe('Demo')
    }
  })

  it('decodes win1252-ish latin1 content', () => {
    const buf = Buffer.from([0xc1, 0x6e, 0x61]) // Ána in latin1
    const { text } = decodeImportBuffer(buf)
    expect(text.length).toBeGreaterThan(0)
  })

  it('rejects too many rows', () => {
    const headers = ['a'] as const
    const lines = ['a', ...Array.from({ length: 5 }, (_, i) => String(i))]
    const result = parseCsvWithFixedHeaders(Buffer.from(lines.join('\n'), 'utf8'), headers, 3)
    expect(result.ok).toBe(false)
  })

  it('parseImportFile handles csv filename', async () => {
    const headers = ['codigo', 'nombre'] as const
    const csv = 'codigo,nombre\n2,X\n'
    const result = await parseImportFile(Buffer.from(csv, 'utf8'), 'demo.csv', headers, 100)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.format).toBe('csv')
  })
})
