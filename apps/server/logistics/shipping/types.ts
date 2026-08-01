/**
 * @en Normalized carrier tracking result (#193).
 * @es Resultado normalizado de tracking de transportista (#193).
 * @pt-BR Resultado normalizado de rastreio de transportadora (#193).
 */
export type CarrierTrackingEvent = {
  at: string
  status: string
  description?: string
  location?: string
}

export type CarrierTrackingResult = {
  estadoEnvio: 'pending' | 'in_transit' | 'delivered' | 'returned'
  events: CarrierTrackingEvent[]
  rawStatus?: string
}

export type ShippingCarrierCredentials = {
  username: string
  password: string
  sandboxMode: boolean
}

export type ShippingFetch = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>

export type ShippingCarrierProvider = {
  /** @en Carrier id matching OrdenEntrega.transportista. */
  id: 'andreani' | 'correo_argentino' | 'propio' | 'meli_full'
  buildPublicPortalUrl(nroSeguimiento: string): string
  /**
   * @en Live tracking when credentials exist; otherwise returns null (caller uses cache/manual).
   */
  fetchTracking(
    nroSeguimiento: string,
    credentials: ShippingCarrierCredentials | null,
    fetchImpl?: ShippingFetch,
  ): Promise<CarrierTrackingResult | null>
}
