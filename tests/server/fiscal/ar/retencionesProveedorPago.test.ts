import { Decimal } from '@prisma/client/runtime/library'
import { describe, expect, it } from 'vitest'
import { previewRetencionesProveedorPago } from '../../../../server/fiscal/ar/retencionesProveedorPago'

const regimenGanancias = {
  id: 1,
  tenantId: 1,
  tipo: 'ganancias',
  subtipo: 'retencion',
  nombre: 'Ganancias',
  alicuota: new Decimal(4.5),
  alicuotaMin: null,
  provincia: null,
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('previewRetencionesProveedorPago (#276)', () => {
  it('returns empty for monotributista supplier', () => {
    const lines = previewRetencionesProveedorPago({
      proveedor: { condIva: 'Mono' },
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

  it('suggests ganancias for RI supplier when agent enabled', () => {
    const lines = previewRetencionesProveedorPago({
      proveedor: { condIva: 'RI' },
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
