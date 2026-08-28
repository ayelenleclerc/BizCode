import { describe, expect, it } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'
import {
  buildAlicuotaLine,
  buildCbtvLine,
  formatLibroIvaAmount,
  formatLibroIvaDate,
  padPuntoVenta,
} from '../../../../apps/server/fiscal/ar/libroIvaVentasFormat'
import { mapLibroIvaVentas } from '../../../../apps/server/fiscal/ar/libroIvaVentasMapper'
import { TIPO_ANULADO_ARCA } from '../../../../apps/server/fiscal/ar/libroIvaVentasConstants'

describe('libroIvaVentasFormat', () => {
  it('formats amounts with dot decimal and two decimals', () => {
    expect(formatLibroIvaAmount(1234.5)).toBe('1234.50')
    expect(formatLibroIvaAmount(0)).toBe('0.00')
  })

  it('formats date as AAAAMMDD', () => {
    expect(formatLibroIvaDate(new Date(2026, 4, 15))).toBe('20260515')
  })

  it('pads punto de venta to 5 digits', () => {
    expect(padPuntoVenta('0001')).toBe('00001')
  })

  it('builds CBTV line with comma separators', () => {
    const line = buildCbtvLine({
      fecha: new Date(2026, 4, 1),
      tipoComprobante: '006',
      puntoVenta: '00001',
      numeroComprobante: '42',
      buyerName: 'Cliente SA',
      cuit: '20123456789',
      importeTotal: 121,
      importeExento: 0,
      cantAlicuotas: 1,
    })
    expect(line.startsWith('20260501,006,00001,')).toBe(true)
    expect(line).toContain('121.00')
    expect(line.split(',').length).toBeGreaterThanOrEqual(20)
  })

  it('builds ALICUOTAS line', () => {
    const line = buildAlicuotaLine({
      tipoComprobante: '006',
      puntoVenta: '00001',
      numeroComprobante: '42',
      netoGravado: 100,
      alicuotaCode: '0005',
      impuestoLiquidado: 21,
    })
    expect(line).toBe('006,00001,00000000000000000042,100.00,0005,21.00')
  })
})

describe('libroIvaVentasMapper', () => {
  const cliente = {
    id: 1,
    tenantId: 1,
    codigo: 1,
    rsocial: 'ACME',
    cuit: '20123456789',
    condIva: 'RI',
    fantasia: null,
    domicilio: null,
    localidad: null,
    cpost: null,
    telef: null,
    email: null,
    formaPago: null,
    activo: true,
    creditLimit: null,
    creditDays: 0,
    balance: new Decimal(0),
    balanceInicial: new Decimal(0),
    score: 50,
    suspended: false,
    deliveryZoneId: null,
    listaPrecioId: null,
    latitud: null,
    longitud: null,
    anonymizedAt: null,
    cbu: null,
    alias: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('maps active invoice to CBTV and alicuotas', () => {
    const result = mapLibroIvaVentas(
      [
        {
          id: 1,
          tenantId: 1,
          fecha: new Date(2026, 4, 10),
          tipo: 'B',
          prefijo: '0001',
          numero: 7,
          clienteId: 1,
          neto1: new Decimal(100),
          neto2: new Decimal(0),
          neto3: new Decimal(0),
          iva1: new Decimal(21),
          iva2: new Decimal(0),
          total: new Decimal(121),
          formaPagoId: null,
          cae: null,
          caeVto: null,
          estadoCae: 'not_required',
          estado: 'A',
          mpPreferenceId: null,
          mpPaymentLink: null,
          mpEstado: null,
          mpPagadoAt: null,
          mpPreferenceExpiresAt: null,
          mpQrData: null,
          mpQrOrderId: null,
          mpQrExpiresAt: null,
          contratoId: null,
          depositoId: null,
          tipoCambioId: null,
          tipoCambioValor: null,
          tipoCambioMoneda: null,
          tipoCambioTipo: null,
          tipoCambioFecha: null,
          monedaOperacion: null,
          totalMonedaOperacion: null,
          incoterm: null,
          paisDestino: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          cliente,
        },
      ],
      [],
    )
    expect(result.recordCountCbtv).toBe(1)
    expect(result.recordCountAlicuotas).toBe(1)
    expect(result.cbtvLines[0]).toContain(',006,')
    expect(result.previewTotals[0]?.neto).toBe(100)
  })

  it('maps credit note with tipo 999 void line', () => {
    const facturaOrigen = {
      id: 2,
      tenantId: 1,
      fecha: new Date(2026, 3, 1),
      tipo: 'B',
      prefijo: '0001',
      numero: 9,
      clienteId: 1,
      neto1: new Decimal(50),
      neto2: new Decimal(0),
      neto3: new Decimal(0),
      iva1: new Decimal(10.5),
      iva2: new Decimal(0),
      total: new Decimal(60.5),
      formaPagoId: null,
      cae: null,
      caeVto: null,
      estadoCae: 'not_required',
      estado: 'N',
      mpPreferenceId: null,
      mpPaymentLink: null,
      mpEstado: null,
      mpPagadoAt: null,
      mpPreferenceExpiresAt: null,
      mpQrData: null,
      mpQrOrderId: null,
      mpQrExpiresAt: null,
      contratoId: null,
      depositoId: null,
      tipoCambioId: null,
      tipoCambioValor: null,
      tipoCambioMoneda: null,
      tipoCambioTipo: null,
      tipoCambioFecha: null,
      monedaOperacion: null,
      totalMonedaOperacion: null,
      incoterm: null,
      paisDestino: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      cliente,
    }
    const result = mapLibroIvaVentas([], [
      {
        id: 5,
        tenantId: 1,
        facturaOrigenId: 2,
        motivo: 'Anulacion por error',
        monto: new Decimal(60.5),
        cae: null,
        caeVto: null,
        estadoCae: 'not_required',
        createdById: null,
        createdAt: new Date(2026, 4, 20),
        facturaOrigen,
      },
    ])
    expect(result.recordCountCbtv).toBe(2)
    expect(result.cbtvLines.some((l) => l.includes(`,${TIPO_ANULADO_ARCA},`))).toBe(true)
    expect(result.cbtvLines.some((l) => l.includes(',008,'))).toBe(true)
  })
})
