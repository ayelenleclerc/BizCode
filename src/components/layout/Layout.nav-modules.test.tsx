import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import '@/i18n/config'
import Layout from '@/components/layout/Layout'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    status: 'authenticated',
    claims: { username: 'owner1', role: 'owner' },
    logout: vi.fn(),
  }),
}))

vi.mock('@/contexts/FeatureFlagsContext', () => ({
  useFeatureFlags: () => ({
    status: 'ready',
    modules: [],
    integrations: [],
    hasModule: (key: string) => key !== 'billing.orders',
    hasIntegration: () => false,
    refreshFeatures: vi.fn(),
  }),
}))

vi.mock('@/lib/api', () => ({
  notificationsAPI: {
    unreadCount: vi.fn().mockResolvedValue(0),
    list: vi.fn().mockResolvedValue([]),
    markRead: vi.fn(),
  },
}))

describe('Layout nav module gating', () => {
  it('hides pedidos nav link when billing.orders is disabled', () => {
    render(
      <MemoryRouter>
        <Layout>
          <p>child</p>
        </Layout>
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: /pedidos/i })).not.toBeInTheDocument()
  })
})
