import { describe, expect, it } from 'vitest'
import { buildEstadoCuentaClientePdfBuffer } from '../../../apps/server/finance/estadoCuentaClientePdf'

describe('buildEstadoCuentaClientePdfBuffer', () => {
  it('genera un buffer PDF válido', async () => {
    const buffer = await buildEstadoCuentaClientePdfBuffer({
      cliente: { codigo: 1001, rsocial: 'ACME SA', cuit: '20-12345678-9' },
      empresa: { nombre: 'Demo Co', cuit: '30-99999999-9', domicilio: 'Calle 1' },
      desde: '01/01/2026',
      hasta: '31/01/2026',
      saldo: '150.00',
      lineas: [
        {
          fecha: '10/01/2026',
          tipo: 'factura',
          referencia: 'B-0001-42',
          debito: '150.00',
          credito: '0.00',
          saldo: '150.00',
        },
      ],
    })

    expect(buffer.length).toBeGreaterThan(100)
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF')
  })
})
