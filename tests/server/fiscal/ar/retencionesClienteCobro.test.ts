import { Decimal } from '@prisma/client/runtime/library'
import { describe, expect, it } from 'vitest'
import { previewRetencionesClienteCobro } from '../../../../server/fiscal/ar/retencionesClienteCobro'

const regimenGanancias = {
  id: 1,
  tenantId: 1,
  tipo: 'ganancias',
  subtipo: 'retencion',
  nombre: 'Retención Ganancias',
  alicuota: new Decimal(4.5),
  alicuotaMin: null,
  provincia: null,
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('previewRetencionesClienteCobro (#229)', () => {
  it('returns empty for monotributista customer', () => {
    const lines = previewRetencionesClienteCobro({
      cliente: { condIva: 'Mono' },
      config: {
        esAgenteRetencionGanancias: true,
        esAgenteRetencionIVA: false,
        esAgenteRetencionIIBB: false,
      },
      regimenes: [regimenGanancias],
      montoBruto: 100000,
    })
    expect(lines).toEqual([])
  })

  it('suggests ganancias for RI customer when agent enabled', () => {
    const lines = previewRetencionesClienteCobro({
      cliente: { condIva: 'RI' },
      config: {
        esAgenteRetencionGanancias: true,
        esAgenteRetencionIVA: false,
        esAgenteRetencionIIBB: false,
      },
      regimenes: [regimenGanancias],
      montoBruto: 1000,
    })
    expect(lines).toHaveLength(1)
    expect(lines[0].importe).toBe('45.00')
  })
})
