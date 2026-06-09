import { describe, expect, it } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'
import { buildOrdenCompraPdfBuffer } from '../../../server/logistics/ordenCompraPdf'
import type { OrdenCompraRow } from '../../../server/services/CompraService'

function buildOrden(): OrdenCompraRow {
  return {
    id: 7,
    tenantId: 1,
    proveedorId: 2,
    estado: 'sent',
    total: new Decimal(121),
    fechaEstimada: new Date('2026-06-10T12:00:00.000Z'),
    nota: 'Urgente',
    createdAt: new Date('2026-06-08T12:00:00.000Z'),
    updatedAt: new Date('2026-06-08T12:00:00.000Z'),
    proveedor: { id: 2, codigo: 10, rsocial: 'Proveedor SA' },
    items: [
      {
        id: 1,
        ordenCompraId: 7,
        articuloId: 5,
        codigoProveedor: 'PROV-ACE-1L',
        descripcionProveedor: 'Aceite girasol 1L',
        cantidad: 10,
        cantidadRecibida: 0,
        costoUnitario: new Decimal(12.1),
        subtotal: new Decimal(121),
        articulo: { id: 5, codigo: 100, descripcion: 'Aceite interno' },
      },
    ],
  } as OrdenCompraRow
}

describe('ordenCompraPdf', () => {
  it('buildOrdenCompraPdfBuffer returns non-empty PDF', async () => {
    const buffer = await buildOrdenCompraPdfBuffer({
      orden: buildOrden(),
      proveedor: { rsocial: 'Proveedor SA', codigo: 10, cuit: '30-71234567-8' },
    })
    expect(buffer.length).toBeGreaterThan(500)
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF')
  })
})
