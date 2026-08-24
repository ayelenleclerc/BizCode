import { MercadoPagoApiError } from '../integrations/mercadopago/mercadoPagoApiClient'

const MP_PREAPPROVAL_URL = 'https://api.mercadopago.com/preapproval'

export type CreatePreapprovalInput = {
  reason: string
  payerEmail: string
  transactionAmount: number
  currencyId: string
  backUrl: string
  externalReference: string
}

export type PreapprovalResult = {
  id: string
  initPoint: string
  mock: boolean
}

/**
 * @en Creates a Mercado Pago preapproval (subscriptions) for platform SaaS billing (#182).
 * @es Crea un preapproval de Mercado Pago (suscripciones) para billing SaaS de plataforma (#182).
 * @pt-BR Cria um preapproval do Mercado Pago (assinaturas) para billing SaaS da plataforma (#182).
 */
export async function createMercadoPagoPreapproval(
  accessToken: string,
  input: CreatePreapprovalInput,
): Promise<PreapprovalResult> {
  const res = await fetch(MP_PREAPPROVAL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason: input.reason,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: input.transactionAmount,
        currency_id: input.currencyId,
      },
      back_url: input.backUrl,
      payer_email: input.payerEmail,
      external_reference: input.externalReference,
    }),
  })

  if (!res.ok) {
    throw new MercadoPagoApiError(
      res.status,
      res.status === 401 || res.status === 403
        ? 'Invalid platform Mercado Pago credentials'
        : `Mercado Pago preapproval error (${res.status})`,
    )
  }

  const body = (await res.json()) as { id?: string; init_point?: string; sandbox_init_point?: string }
  const id = typeof body.id === 'string' ? body.id : ''
  const initPoint =
    (typeof body.init_point === 'string' && body.init_point) ||
    (typeof body.sandbox_init_point === 'string' && body.sandbox_init_point) ||
    ''
  if (!id || !initPoint) {
    throw new MercadoPagoApiError(502, 'Mercado Pago preapproval response missing id or init_point')
  }
  return { id, initPoint, mock: false }
}

/**
 * @en Deterministic mock preapproval when platform MP token is not configured (#182).
 * @es Preapproval mock determinista cuando no hay token MP de plataforma (#182).
 * @pt-BR Preapproval mock determinístico quando não há token MP da plataforma (#182).
 */
export function createMockPreapproval(tenantId: number, planKey: string): PreapprovalResult {
  return {
    id: `mock-preapproval-${tenantId}-${planKey}`,
    initPoint: `/configuracion/billing?mock=authorized`,
    mock: true,
  }
}
