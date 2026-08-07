import { isAxiosError } from 'axios'

export type UiLoadState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'empty'
  | 'error'
  | 'offline'
  | 'forbidden'
  | 'not_found'

/**
 * @en Maps network/API errors to App Seller UI load states.
 * @es Mapea errores de red/API a estados de carga de la App Seller.
 * @pt-BR Mapeia erros de rede/API para estados de carga do App Seller.
 */
export function mapApiErrorToUiState(err: unknown): Exclude<UiLoadState, 'idle' | 'loading' | 'success' | 'empty'> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'offline'
  }
  if (isAxiosError(err)) {
    if (!err.response) return 'offline'
    const status = err.response.status
    if (status === 401 || status === 403) return 'forbidden'
    if (status === 404) return 'not_found'
  }
  return 'error'
}

/**
 * @en True when API reports a tenant module is disabled.
 * @es True si la API indica módulo de tenant deshabilitado.
 * @pt-BR True se a API indica módulo do tenant desabilitado.
 */
export function isModuleNotEnabledError(err: unknown): boolean {
  if (!isAxiosError(err)) return false
  const data = err.response?.data as { error?: string } | undefined
  return data?.error === 'module_not_enabled'
}
