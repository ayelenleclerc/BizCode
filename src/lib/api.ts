import axios, { AxiosError } from 'axios'
import type { AuthClaims } from '@/lib/rbac'
import type { Cliente, Cobro } from '@/types'

const API_BASE = 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: true,
})

type ApiErrorPayload = { error?: string }

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

  constructor(
    message: string,
    options: {
      axiosCode?: string
      hasResponse: boolean
      httpStatus?: number
      rateLimitReset?: string
    },
  ) {
    super(message)
    this.name = 'ApiRequestFailedError'
    this.axiosCode = options.axiosCode
    this.hasResponse = options.hasResponse
    this.httpStatus = options.httpStatus
    this.rateLimitReset = options.rateLimitReset
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

export const proveedoresAPI = {
  list: async (filtro?: string) => {
    try {
      const response = await api.get('/proveedores', { params: { q: filtro } })
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

  create: async (data: JsonRecord) => {
    try {
      const response = await api.post('/proveedores', data)
      return response.data.data
    } catch (error) {
      handleError(error as AxiosError<ApiErrorPayload>)
    }
  },

  update: async (id: number, data: JsonRecord) => {
    try {
      const response = await api.put(`/proveedores/${id}`, data)
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

// ============ FACTURAS ============

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

  void: async (id: number, motivo: string) => {
    try {
      const response = await api.put(`/facturas/${id}/void`, { motivo })
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

export type OrdenEntregaEstado = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed'

export type OrdenEntrega = {
  id: number
  tenantId: number
  facturaId: number | null
  clienteId: number
  zonaId: number | null
  driverId: number | null
  fecha: string
  estado: OrdenEntregaEstado
  nota: string | null
  cliente?: { id: number; codigo: number; rsocial: string }
  zona?: { id: number; nombre: string } | null
  driver?: { id: number; username: string; role: string } | null
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
