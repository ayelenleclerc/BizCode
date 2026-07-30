import { describe, expect, it } from 'vitest'
import {
  ANONYMIZE_CONFIRM_TOKEN,
  buildAnonymizedClienteData,
  exportDatosToCsv,
  type ClientePrivacyExport,
} from '../../../apps/server/services/ClientePrivacyService'

describe('ClientePrivacyService helpers', () => {
  it('builds irreversible PII scrub payload', () => {
    const now = new Date('2026-07-30T15:00:00.000Z')
    const data = buildAnonymizedClienteData(42, now)
    expect(data.rsocial).toBe('ANON-42')
    expect(data.fantasia).toBeNull()
    expect(data.cuit).toBeNull()
    expect(data.email).toBeNull()
    expect(data.telef).toBeNull()
    expect(data.domicilio).toBeNull()
    expect(data.activo).toBe(false)
    expect(data.suspended).toBe(true)
    expect(data.anonymizedAt).toEqual(now)
  })

  it('exports a minimal CSV package', () => {
    const payload: ClientePrivacyExport = {
      exportedAt: '2026-07-30T15:00:00.000Z',
      cliente: {
        id: 1,
        tenantId: 1,
        codigo: 100,
        rsocial: 'Acme SA',
        fantasia: null,
        cuit: '20-11111111-1',
        condIva: 'RI',
        domicilio: 'Calle 1',
        localidad: 'CABA',
        cpost: '1000',
        telef: '111',
        email: 'a@b.c',
        formaPago: null,
        activo: true,
        creditLimit: null,
        creditDays: 0,
        balance: 0 as unknown as never,
        balanceInicial: 0 as unknown as never,
        score: 50,
        suspended: false,
        deliveryZoneId: null,
        listaPrecioId: null,
        anonymizedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      facturas: [
        {
          id: 9,
          fecha: '2026-01-01T00:00:00.000Z',
          tipo: 'B',
          prefijo: '0001',
          numero: 1,
          total: '121',
          estado: 'A',
        },
      ],
      cobros: [],
      pedidos: [],
      recibosCobro: [],
    }
    const csv = exportDatosToCsv(payload)
    expect(csv).toContain('cliente,rsocial,Acme SA')
    expect(csv).toContain('factura,9,')
    expect(ANONYMIZE_CONFIRM_TOKEN).toBe('ANONYMIZE')
  })
})
