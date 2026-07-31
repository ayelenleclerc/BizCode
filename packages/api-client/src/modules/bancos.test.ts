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

describe('createBancosAPI conciliacion (#191)', () => {
  const movimiento = {
    id: 1,
    cuentaId: 7,
    fecha: '2026-07-01T00:00:00.000Z',
    descripcion: 'Transferencia recibida',
    importe: '1000.00',
    tipo: 'credito',
    referencia: 'REF1',
    conciliadoId: null,
    conciliadoAt: null,
    conciliadoTipo: null,
    matchEstado: 'suggested' as const,
    matchScore: 65,
    matchSugerencias: [
      { tipo: 'cobro' as const, id: 5, clienteId: 3, importe: 1000, fecha: '2026-07-01T00:00:00.000Z', referencia: null },
    ],
    periodoLocked: false,
  }

  it('gets conciliacion state and summary', async () => {
    const summary = {
      total: 1,
      unmatched: 0,
      suggested: 1,
      matchedAuto: 0,
      matchedManual: 0,
      ignored: 0,
      bankFees: 0,
      openCandidates: { recibosForma: 0, cobros: 1 },
    }
    const http = {
      get: vi.fn().mockResolvedValue({
        data: { success: true, data: { movimientos: [movimiento], summary } },
      }),
    } as unknown as AxiosInstance
    const api = createBancosAPI(http)

    await expect(api.getConciliacion(7, { desde: '2026-07-01', hasta: '2026-07-31' })).resolves.toEqual({
      movimientos: [movimiento],
      summary,
    })
    expect(http.get).toHaveBeenCalledWith('/bancos/cuentas/7/conciliacion', {
      params: { desde: '2026-07-01', hasta: '2026-07-31' },
    })
  })

  it('runs matching and returns summary', async () => {
    const runSummary = { processed: 3, autoMatched: 1, suggested: 1, unmatched: 1, bankFees: 0 }
    const http = {
      post: vi.fn().mockResolvedValue({ data: { success: true, data: runSummary } }),
    } as unknown as AxiosInstance
    const api = createBancosAPI(http)

    await expect(api.runMatching(7)).resolves.toEqual(runSummary)
    expect(http.post).toHaveBeenCalledWith('/bancos/cuentas/7/conciliacion/run', {})
  })

  it('exports conciliacion excel as a blob', async () => {
    const blob = new Blob(['xlsx'])
    const http = {
      get: vi.fn().mockResolvedValue({ data: blob }),
    } as unknown as AxiosInstance
    const api = createBancosAPI(http)

    await expect(api.exportExcel(7, { desde: '2026-07-01', hasta: '2026-07-31' })).resolves.toBe(blob)
    expect(http.get).toHaveBeenCalledWith('/bancos/cuentas/7/conciliacion/export.xlsx', {
      params: { desde: '2026-07-01', hasta: '2026-07-31' },
      responseType: 'blob',
    })
  })

  it('reconciles a movement manually', async () => {
    const http = {
      post: vi.fn().mockResolvedValue({ data: { success: true, data: { ...movimiento, matchEstado: 'matched_manual' } } }),
    } as unknown as AxiosInstance
    const api = createBancosAPI(http)

    await expect(api.conciliar(1, { tipo: 'cobro', id: 5 })).resolves.toMatchObject({
      matchEstado: 'matched_manual',
    })
    expect(http.post).toHaveBeenCalledWith('/bancos/movimientos/1/conciliar', { tipo: 'cobro', id: 5 })
  })

  it('confirms a suggestion', async () => {
    const http = {
      post: vi.fn().mockResolvedValue({ data: { success: true, data: { ...movimiento, matchEstado: 'matched_manual' } } }),
    } as unknown as AxiosInstance
    const api = createBancosAPI(http)

    await expect(api.confirmarSugerencia(1)).resolves.toMatchObject({ matchEstado: 'matched_manual' })
    expect(http.post).toHaveBeenCalledWith('/bancos/movimientos/1/sugerencia/confirmar')
  })

  it('ignores a movement', async () => {
    const http = {
      post: vi.fn().mockResolvedValue({ data: { success: true, data: { ...movimiento, matchEstado: 'ignored' } } }),
    } as unknown as AxiosInstance
    const api = createBancosAPI(http)

    await expect(api.ignorar(1)).resolves.toMatchObject({ matchEstado: 'ignored' })
    expect(http.post).toHaveBeenCalledWith('/bancos/movimientos/1/ignorar')
  })

  it('marks a movement as bank fee', async () => {
    const http = {
      post: vi.fn().mockResolvedValue({ data: { success: true, data: { ...movimiento, matchEstado: 'bank_fee' } } }),
    } as unknown as AxiosInstance
    const api = createBancosAPI(http)

    await expect(api.marcarGastoBancario(1)).resolves.toMatchObject({ matchEstado: 'bank_fee' })
    expect(http.post).toHaveBeenCalledWith('/bancos/movimientos/1/gasto-bancario')
  })

  it('locks and unlocks a reconciliation period', async () => {
    const http = {
      post: vi.fn().mockResolvedValue({
        data: { success: true, data: { periodo: '2026-07', lockedAt: '2026-07-31T00:00:00.000Z' } },
      }),
      delete: vi.fn().mockResolvedValue({ data: { success: true, data: null } }),
    } as unknown as AxiosInstance
    const api = createBancosAPI(http)

    await expect(api.lockPeriodo(7, '2026-07')).resolves.toEqual({
      periodo: '2026-07',
      lockedAt: '2026-07-31T00:00:00.000Z',
    })
    expect(http.post).toHaveBeenCalledWith('/bancos/cuentas/7/periodos/2026-07/lock')

    await expect(api.unlockPeriodo(7, '2026-07')).resolves.toBeNull()
    expect(http.delete).toHaveBeenCalledWith('/bancos/cuentas/7/periodos/2026-07/lock')
  })
})
