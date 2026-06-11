import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PortalAuthProvider, usePortalAuth } from './PortalAuthContext'
import { portalAPI } from '@/lib/portalApi'

vi.mock('@/lib/portalApi', () => ({
  portalAPI: {
    getBranding: vi.fn(),
    getMe: vi.fn(),
    logout: vi.fn(),
  },
}))

function Probe() {
  const { status, me, tenantSlug } = usePortalAuth()
  return (
    <div>
      <span data-testid="portal-status">{status}</span>
      <span data-testid="portal-slug">{tenantSlug}</span>
      <span data-testid="portal-me">{me?.rsocial ?? ''}</span>
    </div>
  )
}

describe('PortalAuthProvider', () => {
  beforeEach(() => {
    vi.mocked(portalAPI.getBranding).mockResolvedValue({
      tenantName: 'Demo',
      tenantSlug: 'demo',
      enabled: true,
      showPedidos: true,
      logoUrl: null,
      primaryColor: null,
      footerText: null,
    })
    vi.mocked(portalAPI.getMe).mockResolvedValue({
      me: {
        clienteId: 1,
        codigo: 1,
        rsocial: 'Cliente SA',
        fantasia: null,
        email: 'a@b.com',
        telef: null,
        domicilio: null,
        localidad: null,
        vendedor: null,
      },
      branding: {
        tenantName: 'Demo',
        tenantSlug: 'demo',
        enabled: true,
        showPedidos: true,
        logoUrl: null,
        primaryColor: null,
        footerText: null,
      },
    })
  })

  it('loads session for tenant slug route', async () => {
    render(
      <MemoryRouter initialEntries={['/portal/demo/login']}>
        <Routes>
          <Route
            path="/portal/:tenantSlug/login"
            element={
              <PortalAuthProvider>
                <Probe />
              </PortalAuthProvider>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('portal-status')).toHaveTextContent('authenticated')
    })
    expect(screen.getByTestId('portal-slug')).toHaveTextContent('demo')
    expect(screen.getByTestId('portal-me')).toHaveTextContent('Cliente SA')
  })
})
