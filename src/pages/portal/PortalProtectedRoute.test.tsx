import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PortalProtectedRoute from './PortalProtectedRoute'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'status.loading' ? 'Cargando…' : key),
  }),
}))

const mockUsePortalAuth = vi.fn()

vi.mock('@/contexts/PortalAuthContext', () => ({
  usePortalAuth: () => mockUsePortalAuth(),
}))

describe('PortalProtectedRoute', () => {
  beforeEach(() => {
    mockUsePortalAuth.mockReset()
  })

  it('shows loading state', () => {
    mockUsePortalAuth.mockReturnValue({ status: 'loading', tenantSlug: 'demo' })

    render(
      <MemoryRouter initialEntries={['/portal/demo/facturas']}>
        <Routes>
          <Route path="/portal/:tenantSlug" element={<PortalProtectedRoute />}>
            <Route path="facturas" element={<div data-testid="protected-child" />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('portal-auth-loading')).toHaveTextContent('Cargando…')
  })

  it('renders outlet when authenticated', () => {
    mockUsePortalAuth.mockReturnValue({ status: 'authenticated', tenantSlug: 'demo' })

    render(
      <MemoryRouter initialEntries={['/portal/demo/facturas']}>
        <Routes>
          <Route path="/portal/:tenantSlug" element={<PortalProtectedRoute />}>
            <Route path="facturas" element={<div data-testid="protected-child" />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('protected-child')).toBeInTheDocument()
  })

  it('redirects to login when unauthenticated', () => {
    mockUsePortalAuth.mockReturnValue({ status: 'unauthenticated', tenantSlug: 'demo' })

    render(
      <MemoryRouter initialEntries={['/portal/demo/facturas']}>
        <Routes>
          <Route path="/portal/:tenantSlug" element={<PortalProtectedRoute />}>
            <Route path="facturas" element={<div data-testid="protected-child" />} />
          </Route>
          <Route path="/portal/:tenantSlug/login" element={<div data-testid="login-page" />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })
})
