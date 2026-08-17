export type UiLoadState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'empty'
  | 'error'
  | 'offline'
  | 'forbidden'
  | 'not_found'

function statusFromError(err: unknown): number | undefined {
  if (typeof err !== 'object' || err === null) return undefined
  if (!('response' in err)) return undefined
  const response = (err as { response?: { status?: unknown } }).response
  return typeof response?.status === 'number' ? response.status : undefined
}

/**
 * @en Maps network/API errors to App Driver UI load states (#160).
 * @es Mapea errores de red/API a estados de carga de App Driver (#160).
 * @pt-BR Mapeia erros de rede/API para estados de carga do App Driver (#160).
 */
export function mapApiErrorToUiState(err: unknown): Exclude<UiLoadState, 'idle' | 'loading' | 'success' | 'empty'> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'offline'
  }
  const status = statusFromError(err)
  if (status === undefined) return 'offline'
  if (status === 401 || status === 403) return 'forbidden'
  if (status === 404) return 'not_found'
  return 'error'
}
