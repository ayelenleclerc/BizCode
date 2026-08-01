import type {
  ShippingCarrierCredentials,
  ShippingCarrierProvider,
  ShippingFetch,
  CarrierTrackingResult,
} from './types'
import { mapCarrierStatusToEstadoEnvio } from './mapCarrierStatus'

const DEFAULT_FETCH: ShippingFetch = (input, init) => fetch(input, init)

function andreaniBaseUrl(sandbox: boolean): string {
  return sandbox
    ? 'https://apis.andreani.com'
    : 'https://apis.andreani.com'
}

/**
 * @en Andreani carrier provider — Basic Auth login + envíos trazas (#193).
 * @es Proveedor Andreani — login Basic Auth + trazas de envío (#193).
 * @pt-BR Provedor Andreani — login Basic Auth + rastros de envio (#193).
 *
 * Auth/trazas follow Andreani developer patterns (x-authorization-token after login).
 * Paths are overridable via ANDREANI_API_BASE_URL for sandbox/emulator hosts.
 */
export const andreaniProvider: ShippingCarrierProvider = {
  id: 'andreani',

  buildPublicPortalUrl(nroSeguimiento: string): string {
    const n = encodeURIComponent(nroSeguimiento.trim())
    return `https://www.andreani.com/envio/seguimiento?numero=${n}`
  },

  async fetchTracking(
    nroSeguimiento: string,
    credentials: ShippingCarrierCredentials | null,
    fetchImpl: ShippingFetch = DEFAULT_FETCH,
  ): Promise<CarrierTrackingResult | null> {
    if (!credentials) return null
    const base =
      process.env.ANDREANI_API_BASE_URL?.trim() ||
      andreaniBaseUrl(credentials.sandboxMode)
    const basic = Buffer.from(
      `${credentials.username}:${credentials.password}`,
      'utf8',
    ).toString('base64')

    const loginRes = await fetchImpl(`${base}/login`, {
      method: 'GET',
      headers: { Authorization: `Basic ${basic}` },
    })
    if (!loginRes.ok) {
      throw new Error(`Andreani login failed (${loginRes.status})`)
    }
    const token =
      loginRes.headers.get('x-authorization-token') ||
      loginRes.headers.get('X-Authorization-Token') ||
      (await loginRes.json().catch(() => null) as { token?: string } | null)?.token
    if (!token) {
      throw new Error('Andreani login missing authorization token')
    }

    const nro = encodeURIComponent(nroSeguimiento.trim())
    const trackRes = await fetchImpl(`${base}/v2/envios/${nro}/trazas`, {
      method: 'GET',
      headers: { 'x-authorization-token': token },
    })
    if (trackRes.status === 404) {
      return { estadoEnvio: 'pending', events: [], rawStatus: 'not_found' }
    }
    if (!trackRes.ok) {
      throw new Error(`Andreani tracking failed (${trackRes.status})`)
    }
    const body: unknown = await trackRes.json()
    return parseAndreaniTrazas(body)
  },
}

function parseAndreaniTrazas(body: unknown): CarrierTrackingResult {
  const events: CarrierTrackingResult['events'] = []
  const list = Array.isArray(body)
    ? body
    : body && typeof body === 'object' && Array.isArray((body as { eventList?: unknown }).eventList)
      ? (body as { eventList: unknown[] }).eventList
      : body && typeof body === 'object' && Array.isArray((body as { trazas?: unknown }).trazas)
        ? (body as { trazas: unknown[] }).trazas
        : []

  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const status = String(row.estado ?? row.status ?? row.titulo ?? row.evento ?? '')
    const at = String(
      row.fecha ?? row.date ?? row.fechaEvento ?? row.timestamp ?? new Date().toISOString(),
    )
    const description =
      typeof row.descripcion === 'string'
        ? row.descripcion
        : typeof row.description === 'string'
          ? row.description
          : typeof row.detalle === 'string'
            ? row.detalle
            : undefined
    const location =
      typeof row.sucursal === 'string'
        ? row.sucursal
        : typeof row.ubicacion === 'string'
          ? row.ubicacion
          : typeof row.location === 'string'
            ? row.location
            : undefined
    events.push({ at, status, description, location })
  }

  const last = events[0] ?? events[events.length - 1]
  const estadoEnvio = mapCarrierStatusToEstadoEnvio(last?.status)
  return { estadoEnvio, events, rawStatus: last?.status }
}
