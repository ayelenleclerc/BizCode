import { describe, expect, it } from 'vitest'
import { mapCarrierStatusToEstadoEnvio } from '../../../apps/server/logistics/shipping/mapCarrierStatus'
import { andreaniProvider } from '../../../apps/server/logistics/shipping/andreaniProvider'
import { correoArgentinoProvider } from '../../../apps/server/logistics/shipping/correoArgentinoProvider'

describe('mapCarrierStatusToEstadoEnvio', () => {
  it('maps delivered variants', () => {
    expect(mapCarrierStatusToEstadoEnvio('Entregado')).toBe('delivered')
    expect(mapCarrierStatusToEstadoEnvio('DELIVERED')).toBe('delivered')
  })

  it('maps returned and in_transit', () => {
    expect(mapCarrierStatusToEstadoEnvio('Devuelto al remitente')).toBe('returned')
    expect(mapCarrierStatusToEstadoEnvio('En tránsito')).toBe('in_transit')
  })
})

describe('andreaniProvider', () => {
  it('builds portal URL', () => {
    expect(andreaniProvider.buildPublicPortalUrl('ABC 1')).toContain('ABC%201')
  })

  it('returns null without credentials', async () => {
    await expect(andreaniProvider.fetchTracking('X', null)).resolves.toBeNull()
  })

  it('fetches login + trazas with injectable fetch', async () => {
    const calls: string[] = []
    const fetchImpl = async (input: string | URL) => {
      const url = String(input)
      calls.push(url)
      if (url.endsWith('/login')) {
        return new Response('{}', {
          status: 200,
          headers: { 'x-authorization-token': 'tok' },
        })
      }
      return new Response(
        JSON.stringify([
          { fecha: '2026-08-01T10:00:00Z', estado: 'Entregado', descripcion: 'OK' },
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }
    const result = await andreaniProvider.fetchTracking(
      'N1',
      { username: 'u', password: 'p', sandboxMode: true },
      fetchImpl,
    )
    expect(result?.estadoEnvio).toBe('delivered')
    expect(result?.events).toHaveLength(1)
    expect(calls[0]).toContain('/login')
    expect(calls[1]).toContain('/v2/envios/')
  })
})

describe('correoArgentinoProvider', () => {
  it('returns null without credentials', async () => {
    await expect(correoArgentinoProvider.fetchTracking('X', null)).resolves.toBeNull()
  })

  it('parses historial events', async () => {
    const fetchImpl = async (input: string | URL) => {
      const url = String(input)
      if (url.endsWith('/token')) {
        return new Response(JSON.stringify({ access_token: 't' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      return new Response(
        JSON.stringify({
          estado: 'En tránsito',
          historial: [{ fecha: '2026-08-01', estado: 'Admitido' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      )
    }
    const result = await correoArgentinoProvider.fetchTracking(
      'C1',
      { username: 'u', password: 'p', sandboxMode: true },
      fetchImpl,
    )
    expect(result?.estadoEnvio).toBe('in_transit')
    expect(result?.events.length).toBeGreaterThan(0)
  })
})
