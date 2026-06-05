import axios, { AxiosError } from 'axios'
import type { AuthClaims } from '@/lib/rbac'
import type { Cliente, Cobro, Factura } from '@/types'

const envApiBase = import.meta.env.VITE_API_URL?.trim()
const API_BASE = envApiBase && envApiBase.length > 0 ? envApiBase : 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: true,
})

type ApiErrorPayload = {
  error?: string
  validation?: { valid: boolean; errors: Array<{ module: string; reason: string }> }
}

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

// Error handler
const handleError = (error: AxiosError<ApiErrorPayload>): never => {
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

/** Payload genérico para creación/actualización vía API REST (cuerpo JSON). */
export type JsonRecord = Record<string, unknown>

export type LoginBody = {
  tenantSlug: string
  username: string
  password: string
}

export type LoginResponseData = {
  userId: number
  tenantId: number
  username: string
  role: string
}

// ============ AUTH ============

export const authAPI = {
  login: async (body: LoginBody): Promise<LoginResponseData> => {
    try {
      const response = await api.post<{ success: boolean; data: LoginResponseData }>('/auth/login', body)
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  logout: async (): Promise<{ loggedOut: boolean }> => {
    try {
      const response = await api.post<{ success: boolean; data: { loggedOut: boolean } }>('/auth/logout')
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  me: async (): Promise<AuthClaims> => {
    try {
      const response = await api.get<{ success: boolean; data: AuthClaims }>('/auth/me')
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ FEATURE FLAGS (TENANT) ============

export type TenantFeaturesData = {
  modules: string[]
  integrations: string[]
}

export const featuresAPI = {
  get: async (): Promise<TenantFeaturesData> => {
    try {
      const response = await api.get<{ success: boolean; data: TenantFeaturesData }>('/me/features')
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

export type PublicPlanDTO = {
  key: string
  name: string
  monthlyPrice: number
  currency: string
  maxUsers: number | null
  maxInvoicesPerMonth: number | null
  features: string[]
}

export type TenantPlanSnapshotDTO = {
  planKey: string
  planName: string
  monthlyPrice: number
  currency: string
  maxUsers: number | null
  maxInvoicesPerMonth: number | null
  features: string[]
  status: string
  usage: {
    usersUsed: number
    invoicesUsed: number
  }
}

export const planAPI = {
  list: async (): Promise<PublicPlanDTO[]> => {
    try {
      const response = await api.get<{ success: boolean; data: PublicPlanDTO[] }>('/planes')
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  getMe: async (): Promise<TenantPlanSnapshotDTO> => {
    try {
      const response = await api.get<{ success: boolean; data: TenantPlanSnapshotDTO }>('/me/plan')
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ SUPERADMIN (PLATFORM) ============

export type SuperadminTenantListRow = {
  id: number
  name: string
  slug: string
  active: boolean
  plan: string | null
  userCount: number
  facturaCount: number
  createdAt: string
}

export type SuperadminTenantDetail = {
  id: number
  name: string
  slug: string
  active: boolean
  createdAt: string
  updatedAt: string
  plan: string | null
  modulesCount: number
  configUpdatedAt: string | null
  stats: {
    userCount: number
    facturaCount: number
    pedidoCount: number
    clienteCount: number
  }
  lastActivityAt: string | null
}

export type SuperadminGlobalStats = {
  activeTenants: number
  totalTenants: number
  inactiveTenants: number
  facturasToday: number
  totalUsers: number
}

export type SuperadminTenantCreateInput = {
  name: string
  slug: string
  plan?: string
  ownerUsername?: string
  ownerPassword?: string
}

export const superadminAPI = {
  getStats: async (): Promise<SuperadminGlobalStats> => {
    try {
      const response = await api.get<{ success: boolean; data: SuperadminGlobalStats }>(
        '/superadmin/stats',
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  listTenants: async (q?: string): Promise<SuperadminTenantListRow[]> => {
    try {
      const response = await api.get<{ success: boolean; data: SuperadminTenantListRow[] }>(
        '/superadmin/tenants',
        { params: q ? { q } : undefined },
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  getTenant: async (tenantId: number): Promise<SuperadminTenantDetail> => {
    try {
      const response = await api.get<{ success: boolean; data: SuperadminTenantDetail }>(
        `/superadmin/tenants/${tenantId}`,
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  createTenant: async (
    input: SuperadminTenantCreateInput,
  ): Promise<{ tenantId: number; ownerUserId: number | null }> => {
    try {
      const response = await api.post<{
        success: boolean
        data: { tenantId: number; ownerUserId: number | null }
      }>('/superadmin/tenants', input)
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  patchTenant: async (tenantId: number, active: boolean): Promise<SuperadminTenantDetail> => {
    try {
      const response = await api.patch<{ success: boolean; data: SuperadminTenantDetail }>(
        `/superadmin/tenants/${tenantId}`,
        { active },
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  changeTenantPlan: async (
    tenantId: number,
    body: { planKey: string; reason: string },
  ): Promise<TenantPlanSnapshotDTO> => {
    try {
      const response = await api.post<{ success: boolean; data: TenantPlanSnapshotDTO }>(
        `/superadmin/tenants/${tenantId}/plan`,
        body,
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  getConfig: async (tenantId: number): Promise<TenantConfigDTO> => {
    try {
      const response = await api.get<{ success: boolean; data: TenantConfigDTO }>(
        `/superadmin/tenants/${tenantId}/config`,
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  putConfig: async (tenantId: number, body: TenantConfigUpsertInput): Promise<TenantConfigDTO> => {
    try {
      const response = await api.put<{ success: boolean; data: TenantConfigDTO }>(
        `/superadmin/tenants/${tenantId}/config`,
        body,
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  getConfigHistory: async (
    tenantId: number,
    params?: { take?: number; skip?: number },
  ): Promise<TenantConfigHistoryData> => {
    try {
      const response = await api.get<{ success: boolean; data: TenantConfigHistoryData }>(
        `/superadmin/tenants/${tenantId}/config/history`,
        { params },
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  applyConfigTemplate: async (
    tenantId: number,
    body: TenantConfigApplyTemplateInput,
  ): Promise<TenantConfigDTO> => {
    try {
      const response = await api.post<{ success: boolean; data: TenantConfigDTO }>(
        `/superadmin/tenants/${tenantId}/config/apply-template`,
        body,
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  getPricing: async (
    tenantId: number,
    params?: { modules?: string[] },
  ): Promise<TenantPricingData> => {
    try {
      const modulesCsv = params?.modules?.length ? params.modules.join(',') : undefined
      const response = await api.get<{ success: boolean; data: TenantPricingData }>(
        `/superadmin/tenants/${tenantId}/pricing`,
        { params: modulesCsv ? { modules: modulesCsv } : undefined },
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  listTrials: async (tenantId: number): Promise<TenantModuleTrialDTO[]> => {
    try {
      const response = await api.get<{ success: boolean; data: TenantModuleTrialDTO[] }>(
        `/superadmin/tenants/${tenantId}/trials`,
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  activateTrial: async (
    tenantId: number,
    body: TenantModuleTrialActivateInput,
  ): Promise<TenantModuleTrialDTO> => {
    try {
      const response = await api.post<{ success: boolean; data: TenantModuleTrialDTO }>(
        `/superadmin/tenants/${tenantId}/trials`,
        body,
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  deactivateTrial: async (
    tenantId: number,
    moduleKey: string,
  ): Promise<TenantModuleTrialDTO> => {
    try {
      const response = await api.delete<{ success: boolean; data: TenantModuleTrialDTO }>(
        `/superadmin/tenants/${tenantId}/trials/${encodeURIComponent(moduleKey)}`,
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

export type TenantPricingAddon = {
  moduleKey: string
  price: number
}

export type TenantPricingData = {
  plan: string
  basePrice: number
  addons: TenantPricingAddon[]
  totalMonthly: number
}

export type TenantModuleTrialDTO = {
  id: number
  tenantId: number
  moduleKey: string
  expiresAt: string
  active: boolean
  daysRemaining: number
  createdAt: string
}

export type TenantModuleTrialActivateInput = {
  moduleKey: string
  days?: number
  reason?: string
}

export type TenantConfigDTO = {
  tenantId: number
  businessType: string
  rubros: string[]
  plan: string
  modules: string[]
  integrations: string[]
  updatedAt: string
}

export type TenantConfigUpsertInput = {
  modules: string[]
  reason: string
  businessType?: string
  rubros?: string[]
  plan?: string
  integrations?: string[]
}

export type TenantConfigApplyTemplateInput = {
  preset: string
  reason?: string
}

export type TenantConfigHistoryEntry = {
  id: number
  changedById: number
  before: Record<string, unknown>
  after: Record<string, unknown>
  reason: string | null
  createdAt: string
}

export type TenantConfigHistoryData = {
  total: number
  items: TenantConfigHistoryEntry[]
}

export type ModuleCatalogEntryDTO = {
  key: string
  label: string
  required: boolean
  requiredInProd: boolean
  dependencies: string[]
  plan: string
  price: number
  canDeactivate: boolean
}

export type ModuleCatalogDataDTO = {
  deploymentEnv: 'dev' | 'prod'
  modules: ModuleCatalogEntryDTO[]
  presets: Record<string, { modules: string[] }>
}

export const modulesCatalogAPI = {
  get: async (): Promise<ModuleCatalogDataDTO> => {
    try {
      const response = await api.get<{ success: boolean; data: ModuleCatalogDataDTO }>(
        '/modules/catalog',
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ CLIENTES ============

export type ClienteImportRowError = { row: number; message: string }

export type ClienteImportResult = {
  created: number
  skipped: number
  errors: ClienteImportRowError[]
}

/** Same shape as customer CSV import summary (reused for rubros, artículos, proveedores). */
export type CsvBulkImportResult = ClienteImportResult

export const clientesAPI = {
  list: async (filtro?: string) => {
    try {
      const response = await api.get('/clientes', { params: { q: filtro } })
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  get: async (id: number) => {
    try {
      const response = await api.get(`/clientes/${id}`)
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  create: async (data: JsonRecord) => {
    try {
      const response = await api.post('/clientes', data)
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  update: async (id: number, data: JsonRecord) => {
    try {
      const response = await api.put(`/clientes/${id}`, data)
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  downloadImportTemplate: async (): Promise<Blob> => {
    try {
      const response = await api.get<Blob>('/clientes/import/template', { responseType: 'blob' })
      return response.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  importFromCsv: async (file: File): Promise<ClienteImportResult> => {
    try {
      const body = new FormData()
      body.append('file', file)
      const response = await api.post<{ success: boolean; data: ClienteImportResult }>(
        '/clientes/import',
        body,
        { timeout: 120000 },
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ ARTICULOS ============

export const articulosAPI = {
  downloadImportTemplate: async (): Promise<Blob> => {
    try {
      const response = await api.get<Blob>('/articulos/import/template', { responseType: 'blob' })
      return response.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  importFromCsv: async (file: File): Promise<CsvBulkImportResult> => {
    try {
      const body = new FormData()
      body.append('file', file)
      const response = await api.post<{ success: boolean; data: CsvBulkImportResult }>(
        '/articulos/import',
        body,
        { timeout: 120000 },
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  list: async (filtro?: string) => {
    try {
      const response = await api.get('/articulos', { params: { q: filtro } })
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  get: async (id: number) => {
    try {
      const response = await api.get(`/articulos/${id}`)
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  create: async (data: JsonRecord) => {
    try {
      const response = await api.post('/articulos', data)
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  update: async (id: number, data: JsonRecord) => {
    try {
      const response = await api.put(`/articulos/${id}`, data)
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  stockAjuste: async (id: number, body: { cantidad: number; motivo: string }) => {
    try {
      const response = await api.post<{ success: boolean; data: StockAdjustResult }>(
        `/articulos/${id}/stock-ajuste`,
        body,
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  stockHistorial: async (id: number, params?: { limit?: number; offset?: number }) => {
    try {
      const response = await api.get<{
        success: boolean
        data: StockAjusteHistorialRow[]
        total: number
        limit: number
        offset: number
      }>(`/articulos/${id}/stock-historial`, { params })
      return response.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

export type StockAjusteHistorialRow = {
  id: number
  cantidad: number
  motivo: string
  createdAt: string
  user: { id: number; username: string }
}

export type StockAdjustResult = {
  stockBefore: number
  stockAfter: number
  articulo: { id: number; codigo: number; descripcion: string; stock: number; minimo: number }
  ajuste: StockAjusteHistorialRow
}

// ============ RUBROS ============

export const rubrosAPI = {
  downloadImportTemplate: async (): Promise<Blob> => {
    try {
      const response = await api.get<Blob>('/rubros/import/template', { responseType: 'blob' })
      return response.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  importFromCsv: async (file: File): Promise<CsvBulkImportResult> => {
    try {
      const body = new FormData()
      body.append('file', file)
      const response = await api.post<{ success: boolean; data: CsvBulkImportResult }>(
        '/rubros/import',
        body,
        { timeout: 120000 },
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  list: async () => {
    try {
      const response = await api.get('/rubros')
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  create: async (data: JsonRecord) => {
    try {
      const response = await api.post('/rubros', data)
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ PROVEEDORES ============

export type OrdenCompraItemRow = {
  id: number
  articuloId: number
  cantidad: number
  cantidadRecibida: number
  costoUnitario: string
  subtotal: string
  articulo?: { id: number; codigo: number; descripcion: string }
}

export type OrdenCompra = {
  id: number
  proveedorId: number
  estado: string
  total: string
  fechaEstimada?: string | null
  nota?: string | null
  proveedor?: { id: number; codigo: number; rsocial: string }
  items: OrdenCompraItemRow[]
}

export type RecuentoItemRow = {
  id: number
  articuloId: number
  cantSistema: number
  cantFisica: number | null
  articulo?: { id: number; codigo: number; descripcion: string }
}

export type Recuento = {
  id: number
  operadorId: number
  estado: 'in_progress' | 'closed'
  fecha: string
  closedAt?: string | null
  operador?: { id: number; username: string }
  items: RecuentoItemRow[]
}

export const recuentosAPI = {
  list: async (params?: { limit?: number; offset?: number }) => {
    try {
      const response = await api.get('/recuentos', { params })
      return response.data as {
        success: true
        data: Recuento[]
        total: number
        limit: number
        offset: number
      }
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  get: async (id: number) => {
    try {
      const response = await api.get(`/recuentos/${id}`)
      return response.data.data as Recuento
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  start: async () => {
    try {
      const response = await api.post('/recuentos')
      return response.data.data as Recuento
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  updateItems: async (id: number, lines: { articuloId: number; cantFisica: number }[]) => {
    try {
      const response = await api.put(`/recuentos/${id}/items`, { lines })
      return response.data.data as Recuento
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  close: async (id: number) => {
    try {
      const response = await api.post(`/recuentos/${id}/close`)
      return response.data.data as Recuento
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  downloadPdf: async (id: number): Promise<Blob> => {
    try {
      const response = await api.get(`/recuentos/${id}/pdf`, { responseType: 'blob' })
      return response.data as Blob
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

export const comprasAPI = {
  list: async (params?: { estado?: string; proveedorId?: number; limit?: number; offset?: number }) => {
    try {
      const response = await api.get('/compras', { params })
      return response.data as {
        success: true
        data: OrdenCompra[]
        total: number
        limit: number
        offset: number
      }
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  get: async (id: number) => {
    try {
      const response = await api.get(`/compras/${id}`)
      return response.data.data as OrdenCompra
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  create: async (body: {
    proveedorId: number
    fechaEstimada?: string | null
    nota?: string | null
    items: { articuloId: number; cantidad: number; costoUnitario: number }[]
  }) => {
    try {
      const response = await api.post('/compras', body)
      return response.data.data as OrdenCompra
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  send: async (id: number) => {
    try {
      const response = await api.post(`/compras/${id}/send`)
      return response.data.data as OrdenCompra
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  cancel: async (id: number) => {
    try {
      const response = await api.post(`/compras/${id}/cancel`)
      return response.data.data as OrdenCompra
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  receive: async (id: number, lines: { itemId: number; cantidad: number }[]) => {
    try {
      const response = await api.post(`/compras/${id}/receive`, { lines })
      return response.data.data as OrdenCompra
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

export type ProveedorInputDTO = {
  codigo: number
  rsocial: string
  condIva: 'RI' | 'Mono' | 'CF' | 'Exento'
  activo: boolean
  fantasia?: string | null
  cuit?: string | null
  telef?: string | null
  email?: string | null
  cbu?: string | null
  alias?: string | null
  banco?: string | null
  tipoCuenta?: 'cc' | 'ca' | null
  moneda?: string
  condicionPago?: 'contado' | '15dias' | '30dias' | '60dias' | 'otro' | null
  plazoHabitual?: number | null
  descuentoPct?: number | null
  limiteCredito?: number | null
  categoria?: 'materia_prima' | 'insumos' | 'servicios' | 'logistica' | null
  contactoNombre?: string | null
  contactoEmail?: string | null
  contactoTel?: string | null
  notas?: string | null
}

export type ProveedorListParams = {
  q?: string
  activo?: boolean
  categoria?: ProveedorInputDTO['categoria']
}

export const proveedoresAPI = {
  list: async (params?: string | ProveedorListParams) => {
    try {
      const query =
        typeof params === 'string' || params === undefined
          ? { q: typeof params === 'string' ? params : undefined }
          : {
              ...(params.q ? { q: params.q } : {}),
              ...(params.activo !== undefined ? { activo: String(params.activo) } : {}),
              ...(params.categoria ? { categoria: params.categoria } : {}),
            }
      const response = await api.get('/proveedores', { params: query })
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  get: async (id: number) => {
    try {
      const response = await api.get(`/proveedores/${id}`)
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  create: async (data: ProveedorInputDTO) => {
    try {
      const response = await api.post('/proveedores', data)
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  update: async (id: number, data: ProveedorInputDTO) => {
    try {
      const response = await api.put(`/proveedores/${id}`, data)
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  delete: async (id: number) => {
    try {
      const response = await api.delete(`/proveedores/${id}`)
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  cuentaCorriente: async (
    id: number,
    params?: { tipo?: string; from?: string; to?: string },
  ) => {
    try {
      const response = await api.get(`/proveedores/${id}/cuenta-corriente`, { params })
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  cuentaCorrienteSaldo: async (id: number) => {
    try {
      const response = await api.get(`/proveedores/${id}/cuenta-corriente/saldo`)
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  cuentaCorrienteAjuste: async (id: number, body: { monto: number; motivo: string }) => {
    try {
      const response = await api.post(`/proveedores/${id}/cuenta-corriente/ajuste`, body)
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  downloadImportTemplate: async (): Promise<Blob> => {
    try {
      const response = await api.get<Blob>('/proveedores/import/template', { responseType: 'blob' })
      return response.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  importFromCsv: async (file: File): Promise<CsvBulkImportResult> => {
    try {
      const body = new FormData()
      body.append('file', file)
      const response = await api.post<{ success: boolean; data: CsvBulkImportResult }>(
        '/proveedores/import',
        body,
        { timeout: 120000 },
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ FORMAS DE PAGO ============

export const formasPagoAPI = {
  list: async () => {
    try {
      const response = await api.get('/formas-pago')
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ COBROS ============

export type CobroListParams = {
  clienteId?: number
  desde?: string
  hasta?: string
  limit?: number
  offset?: number
}

export type CobroCreateBody = {
  clienteId: number
  fecha: string
  monto: number
  formaPagoId?: number | null
  referencia?: string | null
  nota?: string | null
}

export const cobrosAPI = {
  list: async (params?: CobroListParams) => {
    try {
      const response = await api.get('/cobros', { params })
      return response.data as {
        success: true
        data: Cobro[]
        total: number
        limit: number
        offset: number
      }
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  get: async (id: number) => {
    try {
      const response = await api.get(`/cobros/${id}`)
      return response.data.data as Cobro
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  create: async (data: CobroCreateBody) => {
    try {
      const response = await api.post('/cobros', data)
      return response.data.data as {
        cobro: Cobro
        updatedCliente: Pick<Cliente, 'id' | 'rsocial' | 'balance' | 'creditLimit' | 'score'>
      }
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ REPORTES ============

export type AgingBucket = {
  label: '0-30d' | '31-60d' | '61-90d' | '>90d'
  count: number
  total: string
}

export type AgingArData = {
  buckets: AgingBucket[]
  totalDeuda: string
  resumen: {
    deudaVencida: string
    deudaPorVencer: string
    porcentajeMora: string
    clientesSuspendidos: number
  }
}

export type CuentaCorrienteLine = {
  tipo: 'factura' | 'cobro' | 'saldo_inicial'
  fecha: string
  referencia: string
  debito: string
  credito: string
  saldo: string
  facturaId?: number
  cobroId?: number
}

export type CuentaCorrienteData = {
  clienteId: number
  codigo: number
  rsocial: string
  balanceActual: string
  lineas: CuentaCorrienteLine[]
}

export type ReporteVentasRow = {
  periodo: string
  count: number
  total: string
  neto1: string
  neto2: string
  iva1: string
  iva2: string
}

export type StockCriticoRow = {
  articulo: { id: number; codigo: number; descripcion: string }
  stock: number
  minimo: number
  deficit: number
}

export type CobranzasPorFormaPago = {
  formaPagoId: number | null
  descripcion: string
  total: string
}

export type ReporteCobranzasRow = {
  fecha: string
  count: number
  total: string
  porFormaPago: CobranzasPorFormaPago[]
}

export type ReportesPeriodParams = {
  from: string
  to: string
  agrupar?: 'dia' | 'semana' | 'mes'
}

export type FacturaVencidaRow = {
  facturaId: number
  clienteId: number
  rsocial: string
  total: string
  fecha: string
  diasMora: number
}

export const cobranzasAPI = {
  listVencidas: async () => {
    try {
      const response = await api.get('/cobranzas/vencidas')
      return response.data.data as FacturaVencidaRow[]
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  sendRecordatorio: async (facturaId: number, canal = 'email') => {
    try {
      const response = await api.post('/cobranzas/recordatorios', { facturaId, canal })
      return response.data.data as { id: number }
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

export const reportesAPI = {
  aging: async () => {
    try {
      const response = await api.get('/reportes/aging')
      return response.data.data as AgingArData
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  cuentaCorriente: async (clienteId: number) => {
    try {
      const response = await api.get(`/reportes/cuenta-corriente/${clienteId}`)
      return response.data.data as CuentaCorrienteData
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  ventas: async (params: ReportesPeriodParams) => {
    try {
      const response = await api.get('/reportes/ventas', { params })
      return response.data.data as ReporteVentasRow[]
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  stockCritico: async () => {
    try {
      const response = await api.get('/reportes/stock-critico')
      return response.data.data as StockCriticoRow[]
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  cobranzas: async (params: Pick<ReportesPeriodParams, 'from' | 'to'>) => {
    try {
      const response = await api.get('/reportes/cobranzas', { params })
      return response.data.data as ReporteCobranzasRow[]
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  exportCsv: async (path: string, params?: Record<string, string>) => {
    try {
      const response = await api.get(path, {
        params,
        headers: { Accept: 'text/csv' },
        responseType: 'blob',
      })
      return response.data as Blob
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ PEDIDOS ============

export type PedidoEstado = 'draft' | 'confirmed' | 'invoiced' | 'cancelled'

export type PedidoRow = {
  id: number
  clienteId: number
  vendedorId: number | null
  estado: PedidoEstado
  total: number | string
  validUntil: string | null
  facturaId: number | null
  createdAt: string
  updatedAt: string
  cliente?: { id: number; codigo: number; rsocial: string }
  items?: unknown[]
}

export type PedidoListResponse = {
  success: boolean
  data: PedidoRow[]
  total: number
  take: number
  skip: number
}

export const pedidosAPI = {
  list: async (params?: { estado?: string; clienteId?: number }): Promise<PedidoListResponse> => {
    try {
      const response = await api.get<PedidoListResponse>('/pedidos', { params })
      return response.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  get: async (id: number): Promise<PedidoRow> => {
    try {
      const response = await api.get<{ success: boolean; data: PedidoRow }>(`/pedidos/${id}`)
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  create: async (body: JsonRecord): Promise<PedidoRow> => {
    try {
      const response = await api.post<{ success: boolean; data: PedidoRow }>('/pedidos', body)
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  update: async (id: number, body: JsonRecord): Promise<PedidoRow> => {
    try {
      const response = await api.put<{ success: boolean; data: PedidoRow }>(`/pedidos/${id}`, body)
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  confirm: async (id: number): Promise<PedidoRow> => {
    try {
      const response = await api.post<{ success: boolean; data: PedidoRow }>(`/pedidos/${id}/confirm`)
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  invoice: async (id: number, body: JsonRecord): Promise<PedidoRow> => {
    try {
      const response = await api.post<{ success: boolean; data: PedidoRow }>(`/pedidos/${id}/invoice`, body)
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  cancel: async (id: number): Promise<PedidoRow> => {
    try {
      const response = await api.delete<{ success: boolean; data: PedidoRow }>(`/pedidos/${id}`)
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ FACTURAS / NOTAS DE CRÉDITO (#146) ============

export type NotaCreditoEstadoCae = 'pending' | 'issued' | 'failed' | 'not_required'

export type NotaCreditoFacturaOrigenDTO = {
  id: number
  tipo: string
  prefijo: string
  numero: number
  clienteId: number
  fecha: string
  total: number | string
  estado: string
}

export type NotaCreditoSnippetDTO = {
  id: number
  tenantId: number
  facturaOrigenId: number
  motivo: string
  monto: number | string
  cae: string | null
  caeVto: string | null
  estadoCae: NotaCreditoEstadoCae
  createdById: number | null
  createdAt: string
}

export type NotaCreditoRowDTO = NotaCreditoSnippetDTO & {
  facturaOrigen: NotaCreditoFacturaOrigenDTO
}

export type FacturaVoidBalanceClienteDTO = {
  id: number
  rsocial: string
  balance: number | string
  creditLimit: number | null
}

export type FacturaVoidResultDTO = {
  factura: Factura
  notaCredito: NotaCreditoSnippetDTO
  updatedCliente: FacturaVoidBalanceClienteDTO
}

export type NotasCreditoListParams = {
  from: string
  to: string
  clienteId?: number
  limit?: number
  offset?: number
}

export type NotasCreditoListResult = {
  data: NotaCreditoRowDTO[]
  total: number
  limit: number
  offset: number
}

export const facturasAPI = {
  list: async () => {
    try {
      const response = await api.get('/facturas')
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  create: async (data: JsonRecord) => {
    try {
      const response = await api.post('/facturas', data)
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  void: async (id: number, motivo: string): Promise<FacturaVoidResultDTO> => {
    try {
      const response = await api.put<{ success: boolean; data: FacturaVoidResultDTO }>(
        `/facturas/${id}/void`,
        { motivo },
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  downloadPdf: async (id: number): Promise<Blob> => {
    try {
      const response = await api.get(`/facturas/${id}/pdf`, { responseType: 'blob' })
      return response.data as Blob
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  downloadPdfPreview: async (id: number): Promise<Blob> => {
    try {
      const response = await api.get(`/facturas/${id}/pdf/preview`, { responseType: 'blob' })
      return response.data as Blob
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  downloadTicket: async (id: number): Promise<Blob> => {
    try {
      const response = await api.get(`/facturas/${id}/ticket`, { responseType: 'blob' })
      return response.data as Blob
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  print: async (
    id: number,
    device: 'pdf' | 'fiscal' | 'thermal',
  ): Promise<{
    device: 'pdf' | 'fiscal' | 'thermal'
    channel: 'pdf' | 'fiscal_mock' | 'thermal_mock'
    fallbackToPdf: boolean
    downloadPath?: string
    jobId?: string
    transport?: 'mock-serial'
  }> => {
    try {
      const response = await api.post<{
        success: boolean
        data: {
          device: 'pdf' | 'fiscal' | 'thermal'
          channel: 'pdf' | 'fiscal_mock' | 'thermal_mock'
          fallbackToPdf: boolean
          downloadPath?: string
          jobId?: string
          transport?: 'mock-serial'
        }
      }>(`/facturas/${id}/print`, { device })
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

export const notasCreditoAPI = {
  list: async (params: NotasCreditoListParams): Promise<NotasCreditoListResult> => {
    try {
      const response = await api.get<{
        success: boolean
        data: NotaCreditoRowDTO[]
        total: number
        limit: number
        offset: number
      }>('/notas-credito', { params })
      return {
        data: response.data.data,
        total: response.data.total,
        limit: response.data.limit,
        offset: response.data.offset,
      }
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  getById: async (id: number): Promise<NotaCreditoRowDTO> => {
    try {
      const response = await api.get<{ success: boolean; data: NotaCreditoRowDTO }>(
        `/notas-credito/${id}`,
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

export type LibroIvaVentasPreviewDTO = {
  periodo: string
  recordCountCbtv: number
  recordCountAlicuotas: number
  totalsByAlicuota: { alicuotaCode: string; neto: number; iva: number }[]
  totalNeto: number
  totalIva: number
  totalExento: number
  totalGeneral: number
  arcaValidationPending: true
}

export type LibroIvaComprasPreviewDTO = {
  periodo: string
  recordCountCbtu: number
  recordCountAlicuotas: number
  totalsByAlicuota: { alicuotaCode: string; neto: number; iva: number }[]
  totalNeto: number
  totalIva: number
  totalExento: number
  totalGeneral: number
  arcaValidationPending: true
}

export type ComprobanteCompraInputDTO = {
  fecha: string
  tipo: 'A' | 'B' | 'C'
  prefijo: string
  numero: number
  proveedorId: number
  ordenCompraId?: number
  neto1: number
  neto2: number
  neto3: number
  iva1: number
  iva2: number
  total: number
  cae?: string
  caeVto?: string
}

export const contabilidadAPI = {
  libroIvaVentasPreview: async (periodo: string): Promise<LibroIvaVentasPreviewDTO> => {
    try {
      const response = await api.get<{ success: boolean; data: LibroIvaVentasPreviewDTO }>(
        '/contabilidad/libro-iva-ventas',
        { params: { periodo, format: 'preview' } },
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  downloadLibroIvaVentas: async (
    periodo: string,
    format: 'txt' | 'xlsx',
  ): Promise<Blob> => {
    try {
      const response = await api.get('/contabilidad/libro-iva-ventas', {
        params: { periodo, format },
        responseType: 'blob',
      })
      return response.data as Blob
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  libroIvaComprasPreview: async (periodo: string): Promise<LibroIvaComprasPreviewDTO> => {
    try {
      const response = await api.get<{ success: boolean; data: LibroIvaComprasPreviewDTO }>(
        '/contabilidad/libro-iva-compras',
        { params: { periodo, format: 'preview' } },
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  downloadLibroIvaCompras: async (
    periodo: string,
    format: 'txt' | 'xlsx',
  ): Promise<Blob> => {
    try {
      const response = await api.get('/contabilidad/libro-iva-compras', {
        params: { periodo, format },
        responseType: 'blob',
      })
      return response.data as Blob
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  createComprobanteCompra: async (
    body: ComprobanteCompraInputDTO,
  ): Promise<{ id: number }> => {
    try {
      const response = await api.post<{ success: boolean; data: { id: number } }>(
        '/comprobantes-compra',
        body,
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

export type AfipConfigStatus = {
  configured: boolean
  cuit?: string
  ambiente?: string
}

export type AfipConfigInput = {
  cuit: string
  certificate: string
  privateKey: string
  ambiente?: 'homologacion' | 'produccion'
}

export const afipAPI = {
  getConfig: async (): Promise<AfipConfigStatus> => {
    try {
      const response = await api.get<{ success: boolean; data: AfipConfigStatus }>('/afip/config')
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  putConfig: async (body: AfipConfigInput): Promise<{ configured: boolean }> => {
    try {
      const response = await api.put<{ success: boolean; data: { configured: boolean } }>(
        '/afip/config',
        body,
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  auth: async (): Promise<{ token: string; sign: string; expiration: string }> => {
    try {
      const response = await api.post<{
        success: boolean
        data: { token: string; sign: string; expiration: string }
      }>('/afip/auth')
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  requestCae: async (facturaId: number): Promise<{ cae: string; caeVto: string }> => {
    try {
      const response = await api.post<{
        success: boolean
        data: { cae: string; caeVto: string }
      }>('/afip/cae', { facturaId })
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ USERS ============

export type AppUserDTO = {
  id: number
  username: string
  role: string
  active: boolean
  scopeChannels: string[]
  scopeBranchIds: number[]
  scopeWarehouseIds: number[]
  scopeRouteIds: number[]
  createdAt: string
  updatedAt?: string
}

export type CreateUserBody = {
  username: string
  password: string
  role: string
  active?: boolean
  scopeChannels?: string[]
  scopeBranchIds?: number[]
  scopeWarehouseIds?: number[]
  scopeRouteIds?: number[]
}

export type UpdateUserBody = {
  role?: string
  active?: boolean
  scopeChannels?: string[]
  scopeBranchIds?: number[]
  scopeWarehouseIds?: number[]
  scopeRouteIds?: number[]
}

export const usersAPI = {
  list: async (): Promise<AppUserDTO[]> => {
    try {
      const response = await api.get<{ success: boolean; data: AppUserDTO[] }>('/users')
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  create: async (body: CreateUserBody): Promise<AppUserDTO> => {
    try {
      const response = await api.post<{ success: boolean; data: AppUserDTO }>('/users', body)
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  update: async (id: number, body: UpdateUserBody): Promise<AppUserDTO> => {
    try {
      const response = await api.put<{ success: boolean; data: AppUserDTO }>(`/users/${id}`, body)
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword })
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ DASHBOARD ============

export type DashboardWidget = { count: number; total: string }

export type DashboardSummaryDTO = {
  ventasHoy: DashboardWidget
  facturasVencidas: DashboardWidget
  cobrosHoy: DashboardWidget
  alertasActivas: number
}

export type DashboardVentasGroupBy = 'day' | 'week' | 'month'

export type DashboardVentasSeriesRow = {
  period: string
  count: number
  total: string
}

export type DashboardTopArticuloRow = {
  articuloId: number
  codigo: number
  descripcion: string
  quantity: number
  total: string
}

export type DashboardVentasBySellerRow = {
  vendedorId: number | null
  username: string | null
  count: number
  total: string
}

export type DashboardVentasHistoricoDTO = {
  series: DashboardVentasSeriesRow[]
  topArticles: DashboardTopArticuloRow[]
  bySeller: DashboardVentasBySellerRow[]
}

export type DashboardVentasHistoricoParams = {
  from: string
  to: string
  groupBy: DashboardVentasGroupBy
  vendedorId?: number
  deliveryZoneId?: number
}

export const dashboardAPI = {
  summary: async (): Promise<DashboardSummaryDTO> => {
    try {
      const response = await api.get<{ success: boolean; data: DashboardSummaryDTO }>(
        '/dashboard/summary',
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  ventasHistorico: async (
    params: DashboardVentasHistoricoParams,
  ): Promise<DashboardVentasHistoricoDTO> => {
    try {
      const response = await api.get<{ success: boolean; data: DashboardVentasHistoricoDTO }>(
        '/dashboard/ventas-historico',
        { params },
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  exportVentasHistoricoCsv: async (params: DashboardVentasHistoricoParams): Promise<Blob> => {
    try {
      const response = await api.get<Blob>('/dashboard/ventas-historico', {
        params,
        headers: { Accept: 'text/csv' },
        responseType: 'blob',
      })
      return response.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ NOTIFICATIONS ============

export type AppNotification = {
  id: number
  tenantId: number
  userId: number
  type: string
  payload: Record<string, unknown>
  readAt: string | null
  createdAt: string
}

export const notificationsAPI = {
  list: async (): Promise<AppNotification[]> => {
    try {
      const response = await api.get<{ success: boolean; data: AppNotification[] }>('/notifications')
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  markRead: async (id: number): Promise<AppNotification> => {
    try {
      const response = await api.put<{ success: boolean; data: AppNotification }>(
        `/notifications/${id}/read`,
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  markAllRead: async (): Promise<{ updated: number }> => {
    try {
      const response = await api.put<{ success: boolean; data: { updated: number } }>(
        '/notifications/read-all',
      )
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ NOTIFICATION CHANNELS ============

export const notifChannelsAPI = {
  status: async (): Promise<{ inApp: boolean; email: boolean; whatsapp: boolean }> => {
    try {
      const response = await api.get<{ success: boolean; data: { inApp: boolean; email: boolean; whatsapp: boolean } }>('/notifications/channels')
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ CHAT ============

export type ChatConversation = {
  user: {
    id: number
    username: string
    role: string
  }
  unreadCount: number
  lastMessage: {
    id: number
    fromUserId: number
    toUserId: number
    preview: string
    createdAt: string
  } | null
}

export type ChatMessageDTO = {
  id: number
  tenantId: number
  fromUserId: number
  toUserId: number
  content: string
  createdAt: string
}

export const chatAPI = {
  conversations: async (limit = 20): Promise<ChatConversation[]> => {
    try {
      const response = await api.get<{ success: boolean; data: ChatConversation[] }>('/chat/conversations', {
        params: { limit },
      })
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
  messages: async (userId: number, params?: { limit?: number; before?: number }): Promise<ChatMessageDTO[]> => {
    try {
      const response = await api.get<{ success: boolean; data: ChatMessageDTO[] }>(`/chat/messages/${userId}`, {
        params,
      })
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
  send: async (toUserId: number, content: string): Promise<ChatMessageDTO> => {
    try {
      const response = await api.post<{ success: boolean; data: ChatMessageDTO }>('/chat/messages', {
        toUserId,
        content,
      })
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ AUDIT EVENTS ============

export type AuditEventDTO = {
  id: number
  tenantId: number
  userId: number | null
  username: string | null
  action: string
  resource: string
  resourceId: string | null
  ipAddress: string | null
  metadata: JsonRecord | null
  createdAt: string
}

export type AuditEventsListParams = {
  userId?: number
  action?: string
  resource?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export type AuditEventListResult = {
  data: AuditEventDTO[]
  total: number
  limit: number
  offset: number
}

export const auditEventsAPI = {
  list: async (params?: AuditEventsListParams): Promise<AuditEventListResult> => {
    try {
      const response = await api.get<{
        success: boolean
        data: AuditEventDTO[]
        total: number
        limit: number
        offset: number
      }>('/audit-events', { params })
      const { data, total, limit, offset } = response.data
      return { data, total, limit, offset }
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ ZONAS DE ENTREGA ============

export type OrdenEntregaEstado =
  | 'pending'
  | 'picking'
  | 'ready'
  | 'assigned'
  | 'in_transit'
  | 'delivered'
  | 'failed'
  | 'cancelled'

export type OrdenEntregaLineItem = {
  id: number
  cantidad: number
  articulo: { id: number; codigo: number; descripcion: string }
}

export type OrdenEntrega = {
  id: number
  tenantId: number
  facturaId: number | null
  clienteId: number
  zonaId: number | null
  driverId: number | null
  pickerUserId: number | null
  pickingIniciadoAt: string | null
  pickingListoAt: string | null
  fecha: string
  estado: OrdenEntregaEstado
  nota: string | null
  items: OrdenEntregaLineItem[]
  cliente?: { id: number; codigo: number; rsocial: string }
  zona?: { id: number; nombre: string; horario?: string | null } | null
  driver?: { id: number; username: string; role: string } | null
  picker?: { id: number; username: string; role: string } | null
  factura?: { id: number; tipo: string; prefijo: string; numero: number } | null
}

export type OrdenEntregaListParams = {
  estado?: OrdenEntregaEstado
  zonaId?: number
  driverId?: number
  fecha?: string
  limit?: number
  offset?: number
}

export type RepartoEstado = 'planned' | 'on_route' | 'completed' | 'cancelled'

export type RepartoItemEstado = 'pending' | 'delivered' | 'not_delivered' | 'returned'

export type MotivoNoEntrega =
  | 'ausente'
  | 'rechazo'
  | 'domicilio_incorrecto'
  | 'producto_dañado'
  | 'otro'

export type RepartoItemRow = {
  id: number
  ordenEntregaId: number
  secuencia: number
  estado: RepartoItemEstado
  entregadoAt: string | null
  motivoNoEntrega: MotivoNoEntrega | null
  receptorNombre: string | null
  receptorDni: string | null
  notasEntrega: string | null
  hasPod: boolean
  ordenEntrega: OrdenEntrega
}

export type RepartoItemPodDetail = RepartoItemRow & {
  podMedia: { firmaBase64?: string; fotoBase64?: string } | null
}

export type RepartoItemPodInput = {
  outcome: 'delivered' | 'not_delivered'
  receptorNombre?: string | null
  receptorDni?: string | null
  firmaBase64?: string | null
  fotoBase64?: string | null
  notasEntrega?: string | null
  motivoNoEntrega?: MotivoNoEntrega | null
}

export type Reparto = {
  id: number
  tenantId: number
  fecha: string
  choferId: number
  estado: RepartoEstado
  vehiculo: string | null
  observaciones: string | null
  closedAt: string | null
  chofer: { id: number; username: string; role: string }
  items: RepartoItemRow[]
  progress: { total: number; delivered: number; pending: number }
}

export type RepartoCloseSummary = {
  pendingClosed: number
  delivered: number
  notDelivered: number
  returned: number
}

export type RepartoUbicacionPoint = {
  lat: number
  lng: number
  recordedAt: string
}

export type RepartoActivo = {
  id: number
  tenantId: number
  fecha: string
  choferId: number
  estado: RepartoEstado
  vehiculo: string | null
  observaciones: string | null
  chofer: { id: number; username: string; role: string }
  progress: { total: number; delivered: number; pending: number }
  ultimaUbicacion: RepartoUbicacionPoint | null
  currentStop: {
    secuencia: number
    cliente: { id: number; codigo: number; rsocial: string; domicilio: string | null }
    zona: { id: number; nombre: string } | null
  } | null
}

export type LogisticaKpis = {
  dispatchedCount: number
  firstVisitDeliveredCount: number
  firstVisitRate: number | null
  avgDeliveryMinutes: number | null
  returnsByReason: { motivo: string; count: number }[]
  overdueCount: number
}

export type LogisticaChoferRow = {
  choferId: number
  choferUsername: string
  day: string
  dispatched: number
  delivered: number
  notDelivered: number
}

export type LogisticaZonaRow = {
  zonaId: number | null
  zonaNombre: string
  dispatched: number
  delivered: number
  notDelivered: number
}

export type LogisticaReportesParams = {
  from: string
  to: string
  choferId?: number
}

export const logisticaReportesAPI = {
  kpis: async (params: LogisticaReportesParams) => {
    try {
      const response = await api.get('/logistica/kpis', { params })
      return response.data.data as LogisticaKpis
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  reporteChoferes: async (params: LogisticaReportesParams) => {
    try {
      const response = await api.get('/logistica/reporte-choferes', { params })
      return response.data.data as LogisticaChoferRow[]
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  reporteZonas: async (params: LogisticaReportesParams) => {
    try {
      const response = await api.get('/logistica/reporte-zonas', { params })
      return response.data.data as LogisticaZonaRow[]
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  exportChoferesCsv: async (params: LogisticaReportesParams) => {
    try {
      const response = await api.get('/logistica/reporte-choferes', {
        params,
        headers: { Accept: 'text/csv' },
        responseType: 'blob',
      })
      return response.data as Blob
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  exportZonasCsv: async (params: LogisticaReportesParams) => {
    try {
      const response = await api.get('/logistica/reporte-zonas', {
        params,
        headers: { Accept: 'text/csv' },
        responseType: 'blob',
      })
      return response.data as Blob
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

export const repartosAPI = {
  list: async (params?: {
    fecha?: string
    choferId?: number
    estado?: RepartoEstado
    limit?: number
    offset?: number
  }) => {
    try {
      const response = await api.get('/repartos', { params })
      return response.data as {
        success: true
        data: Reparto[]
        total: number
        limit: number
        offset: number
      }
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  get: async (id: number) => {
    try {
      const response = await api.get(`/repartos/${id}`)
      return response.data.data as Reparto
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  create: async (body: {
    fecha: string
    choferId: number
    vehiculo?: string | null
    observaciones?: string | null
    ordenEntregaIds: number[]
  }) => {
    try {
      const response = await api.post('/repartos', body)
      return response.data.data as Reparto
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  iniciar: async (id: number) => {
    try {
      const response = await api.post(`/repartos/${id}/iniciar`)
      return response.data.data as Reparto
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  cerrar: async (id: number) => {
    try {
      const response = await api.post(`/repartos/${id}/cerrar`)
      return {
        reparto: response.data.data as Reparto,
        summary: response.data.summary as RepartoCloseSummary,
      }
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  updateItemPod: async (repartoId: number, itemId: number, body: RepartoItemPodInput) => {
    try {
      const response = await api.put(`/repartos/${repartoId}/items/${itemId}`, body)
      return response.data.data as RepartoItemRow
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  getItemPod: async (repartoId: number, itemId: number) => {
    try {
      const response = await api.get(`/repartos/${repartoId}/items/${itemId}/pod`)
      return response.data.data as RepartoItemPodDetail
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  recordUbicacion: async (repartoId: number, body: { lat: number; lng: number }) => {
    try {
      const response = await api.post(`/repartos/${repartoId}/ubicacion`, body)
      return response.data.data as RepartoUbicacionPoint
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  getUltimaUbicacion: async (repartoId: number) => {
    try {
      const response = await api.get(`/repartos/${repartoId}/ubicacion/ultima`)
      return response.data.data as RepartoUbicacionPoint | null
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  listActivos: async () => {
    try {
      const response = await api.get('/repartos/activos')
      return response.data.data as RepartoActivo[]
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

export const ordenesEntregaAPI = {
  list: async (params?: OrdenEntregaListParams) => {
    try {
      const response = await api.get('/ordenes-entrega', { params })
      return response.data as {
        success: true
        data: OrdenEntrega[]
        total: number
        limit: number
        offset: number
      }
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  create: async (body: {
    clienteId: number
    fecha: string
    facturaId?: number | null
    zonaId?: number | null
    driverId?: number | null
    nota?: string | null
  }) => {
    try {
      const response = await api.post('/ordenes-entrega', body)
      return response.data.data as OrdenEntrega
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  update: async (
    id: number,
    body: {
      estado: OrdenEntregaEstado
      driverId?: number | null
      zonaId?: number | null
      nota?: string | null
    },
  ) => {
    try {
      const response = await api.put(`/ordenes-entrega/${id}`, body)
      return response.data.data as OrdenEntrega
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  iniciarPicking: async (id: number) => {
    try {
      const response = await api.post(`/ordenes-entrega/${id}/iniciar-picking`)
      return response.data.data as OrdenEntrega
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  marcarLista: async (id: number) => {
    try {
      const response = await api.post(`/ordenes-entrega/${id}/lista`)
      return response.data.data as OrdenEntrega
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

export const printingAPI = {
  status: async (): Promise<{
    fiscalPrinterEnabled: boolean
    thermalPrinterEnabled: boolean
    fiscalMode: 'mock'
    thermalMode: 'mock'
  }> => {
    try {
      const response = await api.get<{
        success: boolean
        data: {
          fiscalPrinterEnabled: boolean
          thermalPrinterEnabled: boolean
          fiscalMode: 'mock'
          thermalMode: 'mock'
        }
      }>('/printing/status')
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
  test: async (
    device: 'fiscal' | 'thermal',
  ): Promise<{
    device: 'fiscal' | 'thermal'
    channel: 'pdf' | 'fiscal_mock' | 'thermal_mock'
    fallbackToPdf: boolean
    jobId?: string
    transport?: 'mock-serial'
  }> => {
    try {
      const response = await api.post<{
        success: boolean
        data: {
          device: 'fiscal' | 'thermal'
          channel: 'pdf' | 'fiscal_mock' | 'thermal_mock'
          fallbackToPdf: boolean
          jobId?: string
          transport?: 'mock-serial'
        }
      }>('/printing/test', { device })
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

export const empresaAPI = {
  get: async () => {
    try {
      const response = await api.get<{ success: boolean; data: import('@/types').EmpresaConfig }>('/empresa')
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
  update: async (body: {
    nombre: string
    cuit: string
    domicilio?: string | null
    puntoVenta: number
    tipoFactura: 'A' | 'B' | 'C'
    logoUrl?: string | null
    recordatorioDiasGracia?: number
    timezone?: string
    recordatorioHoraInicio?: number
    recordatorioHoraFin?: number
    condicionIva?: 'RI' | 'Mono' | 'CF' | 'Exento'
    ingresosBrutos?: string | null
    fechaInicioActividades?: string | null
  }) => {
    try {
      const response = await api.put<{ success: boolean; data: import('@/types').EmpresaConfig }>('/empresa', body)
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

export const zonasEntregaAPI = {
  list: async () => {
    try {
      const response = await api.get<{ success: boolean; data: import('@/types').DeliveryZone[] }>('/zonas-entrega')
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
  create: async (body: { nombre: string; tipo?: string; diasEntrega?: string; horario?: string }) => {
    try {
      const response = await api.post<{ success: boolean; data: import('@/types').DeliveryZone }>('/zonas-entrega', body)
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
  update: async (id: number, body: Partial<{ nombre: string; tipo: string; diasEntrega: string; horario: string; activo: boolean }>) => {
    try {
      const response = await api.put<{ success: boolean; data: import('@/types').DeliveryZone }>(`/zonas-entrega/${id}`, body)
      return response.data.data
    } catch (error) {
      return handleError(error as AxiosError<ApiErrorPayload>)
    }
  },
}

// ============ HEALTH CHECK ============

export const checkAPI = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (_error) {
    return null
  }
}
