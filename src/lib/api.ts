import axios, { AxiosError } from 'axios'
import type { AuthClaims } from '@/lib/rbac'

const API_BASE = 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: true,
})

type ApiErrorPayload = { error?: string }

// Error handler
const handleError = (error: AxiosError<ApiErrorPayload>): never => {
  const data = error.response?.data
  if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
    throw new Error(data.error)
  }
  throw new Error(error.message || 'Unknown error')
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
