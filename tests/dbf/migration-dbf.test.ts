import { describe, expect, it } from 'vitest'
import { clienteBodySchema } from '../../apps/server/schemas/domain'
import { edgeClienteSamples, invalidClienteSamples, validClienteSamples } from '../fixtures/dbf-samples'

function mapClienteDbfToBody(row: { CODIGO: number; RSOCIAL: string; CUIT?: string; COND?: string }) {
  return {
    codigo: row.CODIGO,
    rsocial: row.RSOCIAL,
    cuit: row.CUIT ?? null,
    condIva: row.COND ?? 'RI',
    activo: true,
  }
}

describe('DBF CLIENTES fixture samples', () => {
  it('accepts valid CLIENTES-shaped rows through clienteBodySchema', () => {
    for (const row of [...validClienteSamples, ...edgeClienteSamples]) {
      const parsed = clienteBodySchema.safeParse(mapClienteDbfToBody(row))
      expect(parsed.success, JSON.stringify(parsed.success ? null : parsed.error.flatten())).toBe(true)
    }
  })

  it('rejects invalid CLIENTES-shaped rows with a reason', () => {
    for (const sample of invalidClienteSamples) {
      const row = sample.row
      if (row.CODIGO === undefined || row.RSOCIAL === undefined) {
        continue
      }
      const parsed = clienteBodySchema.safeParse(mapClienteDbfToBody({
        CODIGO: row.CODIGO,
        RSOCIAL: row.RSOCIAL,
        CUIT: row.CUIT,
        COND: row.COND,
      }))
      expect(parsed.success).toBe(false)
    }
  })
})
