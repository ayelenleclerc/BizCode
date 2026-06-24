import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockCreate, mockDefaults } = vi.hoisted(() => {
  const mockDefaults = {
    baseURL: '',
    timeout: 0,
    withCredentials: true,
  }
  const mockCreate = vi.fn(() => ({ defaults: { ...mockDefaults } }))
  return { mockCreate, mockDefaults }
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
    }))
    configureApiClients({ apiBaseUrl: 'https://staging.example.com/api', timeout: 12_000 })
    expect(api.defaults.baseURL).toBe('https://staging.example.com/api')
    expect(portalHttp.defaults.baseURL).toBe('https://staging.example.com/api')
    expect(api.defaults.timeout).toBe(12_000)
  })
})
