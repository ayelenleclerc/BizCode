import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockCreate, mockDefaults, mockUse, mockRequestUse } = vi.hoisted(() => {
  const mockDefaults = {
    baseURL: '',
    timeout: 0,
    withCredentials: true,
  }
  const mockUse = vi.fn()
  const mockRequestUse = vi.fn()
  const mockCreate = vi.fn(() => ({
    defaults: { ...mockDefaults },
    interceptors: {
      request: { use: mockRequestUse },
      response: { use: mockUse },
    },
    post: vi.fn(),
    request: vi.fn(),
  }))
  return { mockCreate, mockDefaults, mockUse, mockRequestUse }
})

vi.mock('axios', () => ({
  default: {
    create: mockCreate,
  },
}))

import {
  DEFAULT_API_BASE_URL,
  DEFAULT_API_ROOT_URL,
  resolveApiBaseUrl,
  resolveApiRootUrl,
} from './config'
import { createApiClient, createPortalApiClient } from './create-api-client'
import { api, configureApiClients, portalHttp } from './default-client'

beforeEach(() => {
  mockCreate.mockClear()
  mockUse.mockClear()
  mockRequestUse.mockClear()
  mockDefaults.baseURL = ''
  mockDefaults.timeout = 0
  mockDefaults.withCredentials = true
  api.defaults.baseURL = DEFAULT_API_BASE_URL
  api.defaults.timeout = 10_000
  portalHttp.defaults.baseURL = `${DEFAULT_API_ROOT_URL}/api`
  portalHttp.defaults.timeout = 15_000
})

describe('resolveApiBaseUrl', () => {
  it('uses default when empty', () => {
    expect(resolveApiBaseUrl()).toBe(DEFAULT_API_BASE_URL)
    expect(resolveApiBaseUrl('')).toBe(DEFAULT_API_BASE_URL)
    expect(resolveApiBaseUrl('   ')).toBe(DEFAULT_API_BASE_URL)
  })

  it('trims custom base URL', () => {
    expect(resolveApiBaseUrl('  https://api.example.com/api  ')).toBe('https://api.example.com/api')
  })
})

describe('resolveApiRootUrl', () => {
  it('strips trailing /api from base URL', () => {
    expect(resolveApiRootUrl('https://app.example.com/api')).toBe('https://app.example.com')
    expect(resolveApiRootUrl('https://app.example.com/api/')).toBe('https://app.example.com')
  })

  it('falls back to default root', () => {
    expect(resolveApiRootUrl()).toBe(DEFAULT_API_ROOT_URL)
  })
})

describe('createApiClient', () => {
  it('creates axios instance with defaults', () => {
    const client = createApiClient()
    expect(mockCreate).toHaveBeenCalledWith({
      baseURL: DEFAULT_API_BASE_URL,
      timeout: 10_000,
      withCredentials: true,
    })
    expect(client.defaults.baseURL).toBe('')
    expect(mockUse).toHaveBeenCalled()
  })

  it('registers a refresh interceptor that retries once on SESSION_EXPIRED', async () => {
    createApiClient()
    expect(mockUse).toHaveBeenCalled()
    const onRejected = mockUse.mock.calls[0]?.[1] as (error: unknown) => Promise<unknown>
    expect(typeof onRejected).toBe('function')

    const client = mockCreate.mock.results[0]?.value as {
      post: ReturnType<typeof vi.fn>
      request: ReturnType<typeof vi.fn>
    }
    client.post.mockResolvedValueOnce({ data: { success: true } })
    client.request.mockResolvedValueOnce({ data: { ok: true } })

    const original = { url: '/clientes', _retry: false }
    const result = await onRejected({
      response: { status: 401, data: { error: 'SESSION_EXPIRED' } },
      config: original,
    })
    expect(client.post).toHaveBeenCalledWith('/auth/refresh', undefined)
    expect(client.request).toHaveBeenCalledWith(original)
    expect(result).toEqual({ data: { ok: true } })
  })

  it('honors custom config', () => {
    createApiClient({
      apiBaseUrl: 'https://custom.example.com/api',
      timeout: 5_000,
      withCredentials: false,
    })
    expect(mockCreate).toHaveBeenCalledWith({
      baseURL: 'https://custom.example.com/api',
      timeout: 5_000,
      withCredentials: false,
    })
  })
  it('registers request interceptor when tokenStorage is provided', () => {
    const tokenStorage = {
      getAccessToken: vi.fn().mockResolvedValue('access-1'),
      getRefreshToken: vi.fn().mockResolvedValue('refresh-1'),
      setTokens: vi.fn(),
      clearTokens: vi.fn(),
    }
    createApiClient({ tokenStorage, defaultChannel: 'field', withCredentials: false })
    expect(mockRequestUse).toHaveBeenCalled()
    expect(mockCreate).toHaveBeenCalledWith({
      baseURL: DEFAULT_API_BASE_URL,
      timeout: 10_000,
      withCredentials: false,
    })
  })

  it('refresh interceptor persists rotated tokens via tokenStorage', async () => {
    const tokenStorage = {
      getAccessToken: vi.fn().mockResolvedValue('old-access'),
      getRefreshToken: vi.fn().mockResolvedValue('old-refresh'),
      setTokens: vi.fn().mockResolvedValue(undefined),
      clearTokens: vi.fn(),
    }
    createApiClient({ tokenStorage })
    const onRejected = mockUse.mock.calls[0]?.[1] as (error: unknown) => Promise<unknown>
    const client = mockCreate.mock.results[0]?.value as {
      post: ReturnType<typeof vi.fn>
      request: ReturnType<typeof vi.fn>
    }
    client.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          refreshed: true,
          accessToken: 'new-access',
          refreshToken: 'new-refresh',
          expiresIn: 900,
        },
      },
    })
    client.request.mockResolvedValueOnce({ data: { ok: true } })

    await onRejected({
      response: { status: 401, data: { error: 'Authentication required' } },
      config: { url: '/clientes', _retry: false },
    })

    expect(client.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'old-refresh' })
    expect(tokenStorage.setTokens).toHaveBeenCalledWith({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      expiresIn: 900,
    })
  })
})

describe('createPortalApiClient', () => {
  it('uses host root + /api as base URL', () => {
    createPortalApiClient({ apiBaseUrl: 'https://portal.example.com/api' })
    expect(mockCreate).toHaveBeenCalledWith({
      baseURL: 'https://portal.example.com/api',
      timeout: 15_000,
      withCredentials: true,
    })
  })
})

describe('configureApiClients', () => {
  it('updates shared default axios instances', () => {
    mockCreate.mockImplementation(() => ({
      defaults: {
        baseURL: 'https://staging.example.com/api',
        timeout: 12_000,
        withCredentials: true,
      },
      interceptors: {
        request: { use: mockRequestUse },
        response: { use: mockUse },
      },
      post: vi.fn(),
      request: vi.fn(),
    }))
    configureApiClients({ apiBaseUrl: 'https://staging.example.com/api', timeout: 12_000 })
    expect(api.defaults.baseURL).toBe('https://staging.example.com/api')
    expect(portalHttp.defaults.baseURL).toBe('https://staging.example.com/api')
    expect(api.defaults.timeout).toBe(12_000)
  })
})
