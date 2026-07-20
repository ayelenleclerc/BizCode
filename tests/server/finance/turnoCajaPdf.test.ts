import { describe, expect, it } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'
import { buildTurnoCajaPdfBuffer } from '../../../apps/server/finance/turnoCajaPdf'
import type { TurnoCajaRowDb } from '../../../apps/server/services/TurnoCajaService'

describe('buildTurnoCajaPdfBuffer', () => {
  it('returns a non-empty PDF buffer with conteo and observaciones', async () => {
    const now = new Date('2026-07-20T12:00:00.000Z')
    const turno = {
      id: 10,
      tenantId: 1,
      cajaId: 1,
      cajeroId: 2,
      estado: 'cerrado',
      montoApertura: new Decimal(1000),
      fechaApertura: now,
      fechaCierre: now,
      totalVentasEfectivo: new Decimal(100),
      totalVentasTarjeta: new Decimal(0),
      totalVentasMP: new Decimal(0),
      totalVentasTransf: new Decimal(0),
      totalEgresos: new Decimal(50),
      totalIngresosExtra: new Decimal(0),
      efectivoEsperado: new Decimal(1050),
      efectivoContado: new Decimal(1000),
      diferencia: new Decimal(-50),
      observaciones: 'Faltante',
      createdAt: now,
      updatedAt: now,
      caja: {
        id: 1,
        tenantId: 1,
        nombre: 'Caja 1',
        activa: true,
        createdAt: now,
        updatedAt: now,
      },
      cajero: { id: 2, username: 'cajero' },
      conteo: {
        id: 1,
        turnoId: 10,
        b1000: 1,
        b500: 0,
        b200: 0,
        b100: 0,
        b50: 0,
        b20: 0,
        b10: 0,
        m10: 0,
        m5: 0,
        m2: 0,
        m1: 0,
        total: new Decimal(1000),
      },
      movimientos: [],
    } as unknown as TurnoCajaRowDb

    const buf = await buildTurnoCajaPdfBuffer(turno)
    expect(Buffer.isBuffer(buf)).toBe(true)
    expect(buf.length).toBeGreaterThan(100)
    expect(buf.subarray(0, 4).toString('latin1')).toBe('%PDF')
  })
})
