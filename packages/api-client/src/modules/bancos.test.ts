import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createBancosAPI } from './bancos'

describe('createBancosAPI (#190)', () => {
  it('covers cuentas, movimientos, mappings and import', async () => {
    const cuenta = {
      id: 1,
      tenantId: 1,
      banco: 'galicia',
      tipoCuenta: 'corriente',
      cbu: '1234567890123456789012',
      alias: null,
      moneda: 'ARS',
      activo: true,
      createdAt: '2026-07-31T00:00:00.000Z',
      updatedAt: '2026-07-31T00:00:00.000Z',
    }
    const mapping = {
      id: 2,
      tenantId: 1,
      bancoCode: 'galicia',
      columnaFecha: 'Fecha',
      columnaDescripcion: 'Descripcion',
      columnaImporte: 'Importe',
      columnaReferencia: 'Comprobante',
      columnaSaldo: 'Saldo',
      separadorDecimal: ',',
      formatoFecha: 'dd/MM/yyyy',
      delimiter: ';',
      signoDebitoCredito: 'signed_importe',
      createdAt: '2026-07-31T00:00:00.000Z',
      updatedAt: '2026-07-31T00:00:00.000Z',
    }
    const http = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ data: { success: true, data: [cuenta] } })
        .mockResolvedValueOnce({
          data: { success: true, data: [], total: 0, take: 50, skip: 0 },
        })
        .mockResolvedValueOnce({ data: { success: true, data: [mapping] } }),
      post: vi
        .fn()
        .mockResolvedValueOnce({ data: { success: true, data: cuenta } })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: { imported: 3, skippedDuplicates: 0, errors: [], format: 'csv' },
          },
        })
        .mockResolvedValueOnce({ data: { success: true, data: mapping } }),
      patch: vi
        .fn()
        .mockResolvedValueOnce({ data: { success: true, data: { ...cuenta, alias: 'Op' } } })
        .mockResolvedValueOnce({
          data: { success: true, data: { ...mapping, columnaSaldo: null } },
        }),
    } as unknown as AxiosInstance
    const api = createBancosAPI(http)

    await expect(api.listCuentas()).resolves.toEqual([cuenta])
    await expect(
      api.createCuenta({
        banco: 'galicia',
        tipoCuenta: 'corriente',
        cbu: '1234567890123456789012',
      }),
    ).resolves.toEqual(cuenta)
    await expect(api.updateCuenta(1, { alias: 'Op' })).resolves.toMatchObject({ alias: 'Op' })
    await expect(api.listMovimientos(1)).resolves.toMatchObject({ total: 0 })
    await expect(api.importar(1, new Blob(['x']), { bancoCode: 'galicia' })).resolves.toMatchObject({
      imported: 3,
      format: 'csv',
    })
    await expect(api.listMappings()).resolves.toEqual([mapping])
    await expect(
      api.createMapping({
        bancoCode: 'custom',
        columnaFecha: 'Fecha',
        columnaDescripcion: 'Desc',
        columnaImporte: 'Imp',
        columnaReferencia: null,
        columnaSaldo: null,
        separadorDecimal: ',',
        formatoFecha: 'dd/MM/yyyy',
        delimiter: ';',
        signoDebitoCredito: 'signed_importe',
      }),
    ).resolves.toEqual(mapping)
    await expect(api.updateMapping(2, { columnaSaldo: null })).resolves.toMatchObject({
      columnaSaldo: null,
    })
  })
})
