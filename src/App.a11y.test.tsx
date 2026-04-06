import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { axe } from 'jest-axe'
import '@/i18n/config'
import App from './App'

const { mockClaims } = vi.hoisted(() => ({
  mockClaims: {
    userId: 1,
    tenantId: 1,
    username: 'a11y-user',
    role: 'owner' as const,
    permissions: ['customers.read', 'customers.manage', 'products.read', 'products.manage'] as const,
    scope: {
      tenantId: 1,
      branchIds: [] as number[],
      warehouseIds: [] as number[],
      routeIds: [] as number[],
      channels: ['counter', 'field', 'backoffice', 'warehouse', 'delivery'] as const,
    },
  },
}))

vi.mock('@/lib/api', () => ({
  authAPI: {
    me: vi.fn().mockResolvedValue(mockClaims),
    login: vi.fn(),
    logout: vi.fn().mockResolvedValue({ loggedOut: true }),
  },
  clientesAPI: { list: vi.fn().mockResolvedValue([]) },
  articulosAPI: { list: vi.fn(), get: vi.fn() },
  rubrosAPI: { list: vi.fn() },
  formasPagoAPI: { list: vi.fn() },
  facturasAPI: { list: vi.fn(), create: vi.fn() },
  checkAPI: vi.fn().mockResolvedValue({ status: 'ok' }),
}))

describe('App — accesibilidad (smoke)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('no debe tener violaciones axe en la shell autenticada (tras / → /clientes)', async () => {
    const { container } = render(<App />)
    await waitFor(() => {
      expect(container.querySelector('h1')).toBeTruthy()
    })
    const results = await axe(container)
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toHaveLength(0)
  })
})
