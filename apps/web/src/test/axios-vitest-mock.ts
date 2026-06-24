import { vi } from 'vitest'

const axiosMock = vi.hoisted(() => {
  const mockGet = vi.fn()
  const mockPost = vi.fn()
  const mockPut = vi.fn()
  const mockDelete = vi.fn()
  const mockPatch = vi.fn()
  const instance = {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
    patch: mockPatch,
    defaults: {
      baseURL: 'http://localhost:3001/api',
      timeout: 10_000,
      withCredentials: true,
    },
  }
  const mockCreate = vi.fn(() => instance)
  return { mockGet, mockPost, mockPut, mockDelete, mockPatch, mockCreate, instance }
})

vi.mock('axios', () => {
  class AxiosError extends Error {
    code?: string
    response?: { status: number; data: unknown; statusText: string; headers: Record<string, string> }

    constructor(message: string, code?: string, response?: AxiosError['response']) {
      super(message)
      this.name = 'AxiosError'
      this.code = code
      this.response = response
    }
  }

  return {
    default: {
      create: axiosMock.mockCreate,
    },
    AxiosError,
  }
})

export { axiosMock }
