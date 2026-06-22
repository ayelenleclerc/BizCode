import { Decimal } from '@prisma/client/runtime/library'
import { describe, expect, it } from 'vitest'
import { previewPercepcionesClienteFactura } from '../../../../apps/server/fiscal/ar/retencionesClientePercepcion'

const regimenIibb = {
  id: 2,
  tenantId: 1,
  tipo: 'iibb',
  subtipo: 'percepcion',
  nombre: 'Percepción IIBB CABA',
  alicuota: new Decimal(1.5),
  alicuotaMin: null,
  provincia: 'CABA',
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('previewPercepcionesClienteFactura (#229)', () => {
  it('returns empty for monotributista customer', () => {
    const lines = previewPercepcionesClienteFactura({
      cliente: { condIva: 'Mono' },
      config: {
        esAgenteRetencionGanancias: false,
        esAgenteRetencionIVA: false,
        esAgenteRetencionIIBB: true,
      },
      regimenes: [regimenIibb],
      neto1: 10000,
      neto2: 0,
      neto3: 0,
    })
    expect(lines).toEqual([])
  })

  it('suggests IIBB perception for RI customer when agent enabled', () => {
    const lines = previewPercepcionesClienteFactura({
      cliente: { condIva: 'RI' },
      config: {
        esAgenteRetencionGanancias: false,
        esAgenteRetencionIVA: false,
        esAgenteRetencionIIBB: true,
      },
      regimenes: [regimenIibb],
      neto1: 10000,
      neto2: 0,
      neto3: 0,
    })
    expect(lines).toHaveLength(1)
    expect(lines[0].importe).toBe('150.00')
    expect(lines[0].baseImponible).toBe('10000.00')
  })

  it('returns empty when base below alicuotaMin', () => {
    const lines = previewPercepcionesClienteFactura({
      cliente: { condIva: 'RI' },
      config: {
        esAgenteRetencionGanancias: false,
        esAgenteRetencionIVA: false,
        esAgenteRetencionIIBB: true,
      },
      regimenes: [{ ...regimenIibb, alicuotaMin: new Decimal(50000) }],
      neto1: 1000,
      neto2: 0,
      neto3: 0,
    })
    expect(lines).toEqual([])
  })
})
