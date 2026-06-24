import { configureApiClients } from '@bizcode/api-client'

/**
 * @en Binds `@bizcode/api-client` to Vite env (`VITE_API_URL`) before the app renders.
 * @es Vincula `@bizcode/api-client` al entorno Vite (`VITE_API_URL`) antes de renderizar la app.
 * @pt-BR Vincula `@bizcode/api-client` ao ambiente Vite (`VITE_API_URL`) antes de renderizar o app.
 */
export function initApiClientFromEnv(): void {
  const envApiBase = import.meta.env.VITE_API_URL?.trim()
  configureApiClients({ apiBaseUrl: envApiBase })
}
