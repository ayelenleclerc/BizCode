import axios, { AxiosError } from 'axios'
import type { AuthClaims } from '@/lib/rbac'

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

  constructor(
    message: string,
    options: { axiosCode?: string; hasResponse: boolean },
  ) {
    super(message)
    this.name = 'ApiRequestFailedError'
    this.axiosCode = options.axiosCode
    this.hasResponse = options.hasResponse
  }
}

// Error handler
const handleError = (error: AxiosError<ApiErrorPayload>): never => {
  const ax = error
  const hasResponse = !!ax.response
  const data = ax.response?.data
  if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
    throw new ApiRequestFailedError(data.error, { axiosCode: ax.code, hasResponse: true })
  }
  throw new ApiRequestFailedError(ax.message || 'Unknown error', {
    axiosCode: ax.code,
    hasResponse,
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
}

// ============ ARTICULOS ============

export const articulosAPI = {
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
}

// ============ RUBROS ============

export const rubrosAPI = {
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

// ============ ZONAS DE ENTREGA ============

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
