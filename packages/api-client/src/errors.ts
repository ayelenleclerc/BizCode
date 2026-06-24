import type { AxiosError } from 'axios'
import type { ApiErrorPayload } from '@bizcode/types'

/**
 * @en Thrown by the API client when a request fails; preserves Axios `code` and whether a response existed (for i18n mapping on login).
 * @es Lanza el cliente API cuando falla una petición; conserva el `code` de Axios y si hubo respuesta (para mapear i18n en login).
 * @pt-BR Lançada pelo cliente da API quando a requisição falha; preserva `code` do Axios e se houve resposta (para i18n no login).
 */
export class ApiRequestFailedError extends Error {
  readonly axiosCode: string | undefined
  readonly hasResponse: boolean
  readonly httpStatus: number | undefined
  readonly rateLimitReset: string | undefined
  readonly validation: ApiErrorPayload['validation']

  constructor(
    message: string,
    options: {
      axiosCode?: string
      hasResponse: boolean
      httpStatus?: number
      rateLimitReset?: string
      validation?: ApiErrorPayload['validation']
    },
  ) {
    super(message)
    this.name = 'ApiRequestFailedError'
    this.axiosCode = options.axiosCode
    this.hasResponse = options.hasResponse
    this.httpStatus = options.httpStatus
    this.rateLimitReset = options.rateLimitReset
    this.validation = options.validation
  }
}

export const handleError = (error: AxiosError<ApiErrorPayload>): never => {
  const ax = error
  const hasResponse = !!ax.response
  const data = ax.response?.data
  const rawReset = ax.response?.headers?.['x-ratelimit-reset']
  const rateLimitReset =
    typeof rawReset === 'string' ? rawReset : Array.isArray(rawReset) ? rawReset[0] : undefined
  if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
    throw new ApiRequestFailedError(data.error, {
      axiosCode: ax.code,
      hasResponse: true,
      httpStatus: ax.response?.status,
      rateLimitReset,
      validation: data.validation,
    })
  }
  throw new ApiRequestFailedError(ax.message || 'Unknown error', {
    axiosCode: ax.code,
    hasResponse,
    httpStatus: ax.response?.status,
    rateLimitReset,
  })
}

/**
 * @en Maps a failed auth request to a `common` namespace i18n key (login UI).
 * @es Mapea un fallo de petición de auth a una clave i18n del namespace `common` (UI de login).
 * @pt-BR Mapeia falha de requisição de auth para chave i18n do namespace `common` (UI de login).
 */
export function getAuthErrorI18nKey(error: unknown): string {
  if (error instanceof ApiRequestFailedError) {
    if (error.message === 'Invalid credentials') {
      return 'auth.errors.invalidCredentials'
    }
    if (error.message === 'ACCOUNT_LOCKED') {
      return 'auth.errors.accountLocked'
    }
    if (error.httpStatus === 429 || error.message === 'Too many requests') {
      return 'auth.errors.tooManyRequests'
    }
    const msg = error.message
    const isTimeout =
      error.axiosCode === 'ECONNABORTED' ||
      error.axiosCode === 'ETIMEDOUT' ||
      /timeout/i.test(msg)
    if (isTimeout) {
      return 'auth.errors.timeout'
    }
    const isNetwork =
      !error.hasResponse &&
      (error.axiosCode === 'ERR_NETWORK' ||
        /^network error$/i.test(msg.trim()) ||
        msg === 'Failed to fetch')
    if (isNetwork) {
      return 'auth.errors.network'
    }
    if (!error.hasResponse) {
      return 'auth.errors.network'
    }
    return 'auth.errors.generic'
  }
  if (error instanceof Error && error.message === 'Invalid credentials') {
    return 'auth.errors.invalidCredentials'
  }
  return 'auth.errors.generic'
}
