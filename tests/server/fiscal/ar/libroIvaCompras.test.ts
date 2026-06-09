import { describe, expect, it } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'
import { mapLibroIvaCompras } from '../../../../server/fiscal/ar/libroIvaComprasMapper'

describe('libroIvaComprasMapper', () => {
  const proveedor = {
    id: 1,
    tenantId: 1,
    codigo: 1,
    rsocial: 'Proveedor SA',
    fantasia: null,
    cuit: '30123456789',
    condIva: 'RI',
    telef: null,
    email: null,
    activo: true,
    cbu: null,
    alias: null,
    banco: null,
    tipoCuenta: null,
    moneda: 'ARS',
    condicionPago: null,
    plazoHabitual: null,
    descuentoPct: null,
    limiteCredito: null,
    categoria: null,
    contactoNombre: null,
    contactoEmail: null,
    contactoTel: null,
    notas: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('maps active purchase voucher to CBTU and alicuotas', () => {
    const result = mapLibroIvaCompras([
      {
        id: 1,
        tenantId: 1,
        proveedorId: 1,
        ordenCompraId: null,
        fecha: new Date(2026, 4, 10),
        vencimiento: null,
        tipo: 'B',
        prefijo: '0001',
        numero: 7,
        neto1: new Decimal(100),
        neto2: new Decimal(0),
        neto3: new Decimal(0),
        iva1: new Decimal(21),
        iva2: new Decimal(0),
        total: new Decimal(121),
        cae: null,
        caeVto: null,
        estado: 'A',
        createdAt: new Date(),
        updatedAt: new Date(),
        proveedor,
      },
    ])
    expect(result.recordCountCbtu).toBe(1)
    expect(result.recordCountAlicuotas).toBe(1)
    expect(result.cbtuLines[0]).toContain('Proveedor SA')
    expect(result.alicuotasLines[0]).toContain('0005')
  })
})
