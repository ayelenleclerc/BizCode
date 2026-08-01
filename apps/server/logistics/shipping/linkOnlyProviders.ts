import type { ShippingCarrierProvider } from './types'

/**
 * @en Manual / link-only carriers (propio, meli_full) — no live API (#193).
 * @es Transportistas solo-manual / link (#193).
 * @pt-BR Transportadoras apenas manuais / link (#193).
 */
function linkOnlyProvider(
  id: 'propio' | 'meli_full',
  buildUrl: (nro: string) => string,
): ShippingCarrierProvider {
  return {
    id,
    buildPublicPortalUrl: buildUrl,
    async fetchTracking() {
      return null
    },
  }
}

export const propioProvider = linkOnlyProvider(
  'propio',
  (nro) => `https://www.google.com/search?q=${encodeURIComponent(nro)}`,
)

export const meliFullProvider = linkOnlyProvider(
  'meli_full',
  (nro) =>
    `https://www.mercadolibre.com.ar/envios/seguimiento/${encodeURIComponent(nro.trim())}`,
)
