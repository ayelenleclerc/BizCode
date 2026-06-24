import { beforeEach, describe, expect, it, vi } from 'vitest'

const { configureApiClients } = vi.hoisted(() => ({
  configureApiClients: vi.fn(),
}))

vi.mock('@bizcode/api-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@bizcode/api-client')>()
  return {
    ...actual,
    configureApiClients,
  }
})

import { initApiClientFromEnv } from './api-config'

beforeEach(() => {
  configureApiClients.mockClear()
  vi.unstubAllEnvs()
})

describe('initApiClientFromEnv', () => {
  it('configures api clients from VITE_API_URL when set', () => {
    vi.stubEnv('VITE_API_URL', '  https://api.example.com/api  ')
    initApiClientFromEnv()
    expect(configureApiClients).toHaveBeenCalledWith({
      apiBaseUrl: 'https://api.example.com/api',
    })
  })

  it('passes undefined when VITE_API_URL is unset', () => {
    initApiClientFromEnv()
    expect(configureApiClients).toHaveBeenCalledWith({ apiBaseUrl: undefined })
  })
})
