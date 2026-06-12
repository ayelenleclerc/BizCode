const MP_USERS_ME_URL = 'https://api.mercadopago.com/users/me'

export type MercadoPagoUserMe = {
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
