const MP_USERS_ME_URL = 'https://api.mercadopago.com/users/me'
const MP_PREFERENCES_URL = 'https://api.mercadopago.com/checkout/preferences'
const MP_PAYMENTS_URL = 'https://api.mercadopago.com/v1/payments'

export type MercadoPagoUserMe = {
  id?: number
  nickname?: string
  email?: string
  first_name?: string
  last_name?: string
}

export class MercadoPagoApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'MercadoPagoApiError'
  }
}

/**
 * @en Validates Mercado Pago access token against the users/me endpoint (#174).
 * @es Valida el access token de Mercado Pago contra users/me (#174).
 * @pt-BR Valida o access token do Mercado Pago contra users/me (#174).
 */
export async function fetchMercadoPagoUserMe(accessToken: string): Promise<MercadoPagoUserMe> {
  const res = await fetch(MP_USERS_ME_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    throw new MercadoPagoApiError(
      res.status,
      res.status === 401 || res.status === 403
        ? 'Invalid Mercado Pago credentials'
        : `Mercado Pago API error (${res.status})`,
    )
  }

  return (await res.json()) as MercadoPagoUserMe
}

/**
 * @en Builds a display name from Mercado Pago user profile (#174).
 * @es Arma un nombre visible desde el perfil de Mercado Pago (#174).
 * @pt-BR Monta um nome de exibição a partir do perfil Mercado Pago (#174).
 */
export function mercadoPagoAccountDisplayName(profile: MercadoPagoUserMe): string {
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim()
  if (fullName) return fullName
  if (profile.nickname?.trim()) return profile.nickname.trim()
  if (profile.email?.trim()) return profile.email.trim()
  return 'Mercado Pago account'
}

export type MercadoPagoPreferenceItem = {
  title: string
  quantity: number
  unit_price: number
  currency_id: string
}

export type MercadoPagoPreferenceInput = {
  items: MercadoPagoPreferenceItem[]
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  notification_url: string
  expires: boolean
  expiration_date_from: string
  expiration_date_to: string
  external_reference: string
}

export type MercadoPagoPreferenceResult = {
  id: string
  init_point: string
  sandbox_init_point?: string
}

/**
 * @en Creates a Mercado Pago Checkout preference (#175).
 * @es Crea una preference de Checkout Mercado Pago (#175).
 * @pt-BR Cria uma preference de Checkout Mercado Pago (#175).
 */
export async function createMercadoPagoPreference(
  accessToken: string,
  input: MercadoPagoPreferenceInput,
): Promise<MercadoPagoPreferenceResult> {
  const res = await fetch(MP_PREFERENCES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    throw new MercadoPagoApiError(
      res.status,
      res.status === 401 || res.status === 403
        ? 'Invalid Mercado Pago credentials'
        : `Mercado Pago API error (${res.status})`,
    )
  }

  const body = (await res.json()) as MercadoPagoPreferenceResult
  if (!body.id || !body.init_point) {
    throw new MercadoPagoApiError(502, 'Invalid Mercado Pago preference response')
  }
  return body
}

export type MercadoPagoPaymentPayer = {
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  identification?: { type?: string | null; number?: string | null } | null
}

export type MercadoPagoPaymentResult = {
  id: number
  status: string
  external_reference?: string | null
  transaction_amount?: number
  preference_id?: string | null
  currency_id?: string | null
  date_created?: string | null
  payer?: MercadoPagoPaymentPayer | null
}

export type MercadoPagoPaymentSearchPage = {
  paging: { total: number; limit: number; offset: number }
  results: MercadoPagoPaymentResult[]
}

/**
 * @en Fetches a Mercado Pago payment by id (#176).
 * @es Obtiene un pago de Mercado Pago por id (#176).
 * @pt-BR Busca um pagamento do Mercado Pago por id (#176).
 */
export async function fetchMercadoPagoPayment(
  accessToken: string,
  paymentId: string,
): Promise<MercadoPagoPaymentResult> {
  const res = await fetch(`${MP_PAYMENTS_URL}/${encodeURIComponent(paymentId)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    throw new MercadoPagoApiError(
      res.status,
      res.status === 404
        ? 'Mercado Pago payment not found'
        : `Mercado Pago API error (${res.status})`,
    )
  }

  const body = (await res.json()) as MercadoPagoPaymentResult
  if (body.id == null || !body.status) {
    throw new MercadoPagoApiError(502, 'Invalid Mercado Pago payment response')
  }
  return body
}

export type MercadoPagoPaymentSearchInput = {
  beginDate: string
  endDate: string
  offset?: number
  limit?: number
}

/**
 * @en Searches Mercado Pago payments in a date range (#178).
 * @es Busca pagos de Mercado Pago en un rango de fechas (#178).
 * @pt-BR Busca pagamentos do Mercado Pago em um intervalo de datas (#178).
 */
export async function searchMercadoPagoPayments(
  accessToken: string,
  input: MercadoPagoPaymentSearchInput,
): Promise<MercadoPagoPaymentSearchPage> {
  const params = new URLSearchParams({
    sort: 'date_created',
    criteria: 'desc',
    range: 'date_created',
    begin_date: input.beginDate,
    end_date: input.endDate,
    status: 'approved',
    limit: String(input.limit ?? 50),
    offset: String(input.offset ?? 0),
  })
  const res = await fetch(`${MP_PAYMENTS_URL}/search?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    throw new MercadoPagoApiError(
      res.status,
      res.status === 401 || res.status === 403
        ? 'Invalid Mercado Pago credentials'
        : `Mercado Pago API error (${res.status})`,
    )
  }

  const body = (await res.json()) as MercadoPagoPaymentSearchPage
  if (!Array.isArray(body.results) || !body.paging) {
    throw new MercadoPagoApiError(502, 'Invalid Mercado Pago payment search response')
  }
  return body
}

export type MercadoPagoRefundResult = {
  id: number
  payment_id: number
  amount: number
  status: string
}

/**
 * @en Creates a Mercado Pago payment refund (#179).
 * @es Crea un reembolso de pago Mercado Pago (#179).
 * @pt-BR Cria um reembolso de pagamento Mercado Pago (#179).
 */
export async function createMercadoPagoRefund(
  accessToken: string,
  paymentId: string,
  input?: { amount?: number },
): Promise<MercadoPagoRefundResult> {
  const body: { amount?: number } = {}
  if (input?.amount != null) {
    body.amount = input.amount
  }
  const res = await fetch(`${MP_PAYMENTS_URL}/${encodeURIComponent(paymentId)}/refunds`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new MercadoPagoApiError(
      res.status,
      res.status === 401 || res.status === 403
        ? 'Invalid Mercado Pago credentials'
        : `Mercado Pago refund error (${res.status})`,
    )
  }

  const parsed = (await res.json()) as MercadoPagoRefundResult
  if (parsed.id == null || parsed.payment_id == null) {
    throw new MercadoPagoApiError(502, 'Invalid Mercado Pago refund response')
  }
  return parsed
}

export type MercadoPagoInstoreQrItem = {
  sku_number?: string
  category?: string
  title: string
  description?: string
  unit_price: number
  quantity: number
  unit_measure?: string
  total_amount: number
}

export type MercadoPagoInstoreQrInput = {
  external_reference: string
  title: string
  description: string
  notification_url: string
  total_amount: number
  items: MercadoPagoInstoreQrItem[]
}

export type MercadoPagoInstoreQrResult = {
  qr_data: string
  in_store_order_id: string
}

/**
 * @en Creates a Mercado Pago instore dynamic QR for a POS (#177).
 * @es Crea un QR dinámico instore de Mercado Pago para un POS (#177).
 * @pt-BR Cria um QR dinâmico instore do Mercado Pago para um POS (#177).
 */
export async function createMercadoPagoInstoreQr(
  accessToken: string,
  collectorUserId: string,
  externalPosId: string,
  input: MercadoPagoInstoreQrInput,
): Promise<MercadoPagoInstoreQrResult> {
  const url = `https://api.mercadopago.com/instore/orders/qr/seller/collectors/${encodeURIComponent(collectorUserId)}/pos/${encodeURIComponent(externalPosId)}/qrs`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...input,
      cash_out: { amount: 0 },
    }),
  })

  if (!res.ok) {
    throw new MercadoPagoApiError(
      res.status,
      res.status === 401 || res.status === 403
        ? 'Invalid Mercado Pago credentials'
        : `Mercado Pago API error (${res.status})`,
    )
  }

  const body = (await res.json()) as MercadoPagoInstoreQrResult
  if (!body.qr_data?.trim() || !body.in_store_order_id?.trim()) {
    throw new MercadoPagoApiError(502, 'Invalid Mercado Pago instore QR response')
  }
  return body
}
