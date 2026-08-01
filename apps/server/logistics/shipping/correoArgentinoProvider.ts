import type {
  ShippingCarrierCredentials,
  ShippingCarrierProvider,
  ShippingFetch,
  CarrierTrackingResult,
} from './types'
import { mapCarrierStatusToEstadoEnvio } from './mapCarrierStatus'

const DEFAULT_FETCH: ShippingFetch = (input, init) => fetch(input, init)

/**
 * @en Correo Argentino carrier provider (#193).
 * @es Proveedor Correo Argentino (#193).
 * @pt-BR Provedor Correo Argentino (#193).
 *
 * Uses MiCorreo-style login + tracking when credentials exist.
 * Base URL overridable via CORREO_ARGENTINO_API_BASE_URL (sandbox/emulator).
 * Without credentials callers use portal URL only.
 */
export const correoArgentinoProvider: ShippingCarrierProvider = {
  id: 'correo_argentino',

  buildPublicPortalUrl(nroSeguimiento: string): string {
    const n = encodeURIComponent(nroSeguimiento.trim())
    return `https://www.correoargentino.com.ar/formularios/e-commerce?id=${n}`
  },

  async fetchTracking(
    nroSeguimiento: string,
    credentials: ShippingCarrierCredentials | null,
    fetchImpl: ShippingFetch = DEFAULT_FETCH,
  ): Promise<CarrierTrackingResult | null> {
    if (!credentials) return null
    const base =
      process.env.CORREO_ARGENTINO_API_BASE_URL?.trim() ||
      'https://api.correoargentino.com.ar'

    const tokenRes = await fetchImpl(`${base}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    })
    if (!tokenRes.ok) {
      throw new Error(`Correo Argentino auth failed (${tokenRes.status})`)
    }
    const tokenBody = (await tokenRes.json()) as { access_token?: string; token?: string }
    const token = tokenBody.access_token ?? tokenBody.token
    if (!token) {
      throw new Error('Correo Argentino auth missing token')
    }

    const nro = encodeURIComponent(nroSeguimiento.trim())
    const trackRes = await fetchImpl(`${base}/shipping/tracking/${nro}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
    if (trackRes.status === 404) {
      return { estadoEnvio: 'pending', events: [], rawStatus: 'not_found' }
    }
    if (!trackRes.ok) {
      throw new Error(`Correo Argentino tracking failed (${trackRes.status})`)
    }
    const body: unknown = await trackRes.json()
    return parseCorreoTracking(body)
  },
}

function parseCorreoTracking(body: unknown): CarrierTrackingResult {
  const events: CarrierTrackingResult['events'] = []
  const list = Array.isArray(body)
    ? body
    : body && typeof body === 'object' && Array.isArray((body as { events?: unknown }).events)
      ? (body as { events: unknown[] }).events
      : body && typeof body === 'object' && Array.isArray((body as { historial?: unknown }).historial)
        ? (body as { historial: unknown[] }).historial
        : []

  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const row = item as Record<string, unknown>
    const status = String(row.estado ?? row.status ?? row.evento ?? '')
    const at = String(row.fecha ?? row.date ?? row.timestamp ?? new Date().toISOString())
    const description =
      typeof row.descripcion === 'string'
        ? row.descripcion
        : typeof row.description === 'string'
          ? row.description
          : undefined
    const location =
      typeof row.oficina === 'string'
        ? row.oficina
        : typeof row.ubicacion === 'string'
          ? row.ubicacion
          : undefined
    events.push({ at, status, description, location })
  }

  const overall =
    body && typeof body === 'object'
      ? String((body as { estado?: string; status?: string }).estado ?? (body as { status?: string }).status ?? '')
      : ''
  const last = events[events.length - 1] ?? events[0]
  const estadoEnvio = mapCarrierStatusToEstadoEnvio(overall || last?.status)
  return { estadoEnvio, events, rawStatus: overall || last?.status }
}
