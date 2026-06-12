import { describe, expect, it } from 'vitest'
import { buildReciboCobroPdfBuffer } from '../../../server/finance/reciboCobroPdf'
import type { ReciboCobroPdfData } from '../../../server/services/ReciboCobroService'

const sampleData: ReciboCobroPdfData = {
  empresa: {
    nombre: 'Demo SA',
    cuit: '30-11111111-1',
    domicilio: 'Av. Test 123',
    logoUrl: null,
  },
  recibo: {
    id: 1,
    numero: 7,
    clienteId: 1,
    fecha: '2026-06-01T12:00:00.000Z',
    totalCobrado: '100.00',
    totalBruto: '100.00',
    concepto: 'Cobro parcial',
    estado: 'emitido',
    anulacionMotivo: null,
    usuarioId: 1,
    cliente: { id: 1, codigo: 1001, rsocial: 'Cliente PDF SA', cuit: '20-12345678-9' },
    usuario: { id: 1, username: 'owner1' },
    formas: [
      {
        id: 1,
        tipo: 'efectivo',
        importe: '100.00',
        chequeId: null,
        referencia: null,
        banco: null,
        chequeNumero: null,
        chequeBanco: null,
      },
    ],
    imputaciones: [
      {
        id: 1,
        facturaId: 10,
        facturaRef: 'B-0001-50',
        importe: '100.00',
        saldoPrevio: '242.00',
        saldoPostPago: '142.00',
      },
    ],
    retenciones: [],
    createdAt: '2026-06-01T12:00:00.000Z',
  },
}

describe('buildReciboCobroPdfBuffer (#233)', () => {
  it('returns a non-empty PDF buffer', async () => {
    const buffer = await buildReciboCobroPdfBuffer(sampleData)
    expect(Buffer.isBuffer(buffer)).toBe(true)
    expect(buffer.length).toBeGreaterThan(500)
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF')
  })
})
